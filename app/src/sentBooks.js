const uuidv4 = require('uuid/v4');
const env = require('../env');
var helper = require('./helperFunctions');
var globalVars = require('./globalVars.js');

/**
 * Takes the current book JSON data and adds it to the page.
 */
function displayBook() {
  // TODO: For coupon previews, when one gets too long, have it displayed
  // in rows so the other one is pushed down just as much instead of removing
  // float left and having the columns uneven
  var bookContent = helper.getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = '<button id="plus">+</button>';

  // Create preview of book at top of display
  /* Can have bold display with image and title and everything, then as you scroll
    down it collapses to a fixed nav with image on left and title right and on click
    it scrolls back up to the big info. */
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += `<img id='miniPreviewImage' onerror='imageError(this)' src='${globalVars.book.image}' />`;

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += `<h4 id='bookNamePreview'>${globalVars.book.name}</h4>`;

  // Sets receiver text based on the current state of the book
  if (globalVars.book.receiver) {
    // Book has been sent and code redeemed
    var receiver = `<p class='receiverText'>Sent to ${globalVars.book.receiver}</p>`;
    previewText.innerHTML += receiver;
  } else if (globalVars.book.shareCode) {
    // Code generated but not yet redeemed
    var receiver = `<p id='shareCodePreview'>Share code: <span>${globalVars.book.shareCode}</span></p>`;
    previewText.innerHTML += receiver;
  } else if (globalVars.book.bookId) {
    // No share code generated and not sent; only if book has already been
    // saved and bookId has been generated
    var stripeButton = helper.getById("checkoutFormContainer");
    $(stripeButton).attr('class', '');
    previewText.appendChild(stripeButton);
  } else {
    // For when a template is first loaded in; not yet saved
    var receiver = "<p class='receiverText'>Save to share!</p>";
    previewText.innerHTML += receiver;
  }
  
  previewText.innerHTML += `<p id='bookDescriptionPreview'>${globalVars.book.description}</p>`;
  miniPreview.appendChild(previewText);

  // https://stackoverflow.com/a/16270807/6456163
  var moreOptions = helper.getById("moreOptions").innerHTML;
  if (device.platform == "iOS") {
    // Changes icons based on platform
    $('#editBook').attr('src', "images/ios-edit.svg");
    $('#deleteBook').attr('src', "images/ios-trash.svg");
  }
  miniPreview.innerHTML += moreOptions;

  bookContent.appendChild(miniPreview);
  bookContent.innerHTML += "<hr>";

  if (globalVars.book.description != "") {
    // TODO: Test why this looks fine with shareCode and crowded with .receiverText
    helper.getById("bookNamePreview").style.marginBottom = "0px";
  }

  addDeleteListeners();
  addListeners();
}

/**
 * Needed to include the bookId for SQL purposes once the POST
 * request for payment goes through, and this is called right when the 
 * form is pulled up, so it's the perfect way to sneak that data into
 * the request for PHP access via $_POST.
 */
function sneakFormData() {
  // https://stripe.com/docs/payments/accept-a-payment-charges#web-submit-payment
  var form = helper.getById('checkoutForm');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'bookId');
  hiddenInput.setAttribute('value', globalVars.book.bookId);
  form.appendChild(hiddenInput);

  localStorage.setItem('book', JSON.stringify(globalVars.book));
}

/** 
 * Changes the current page to the target assigned in
 * backButtonTarget.
 */
function goBack() {
  globalVars.previousBook = null;
  globalVars.book = null;
  globalVars._this.redirectTo(globalVars.backButtonTarget);
}

// TODO: Make it so pressing home button when there are unsaved
// changes also asks the user to confirm beforehand
/**
 * Returns you to your previous location; asks for confirmation
 * if you have unsaved changes.
 */
function backButton() {
  $('#backArrow').unbind().click(function() {
    // If not yet saved, just discards without secondary confirmation.
    if (!helper.isSameObject(globalVars.book, globalVars.previousBook) && globalVars.book.bookId) {
      function onConfirm(buttonIndex) {
        // 1 is "Discard them"
        if (buttonIndex == 1) {
          goBack();
        }
      }
      
      navigator.notification.confirm(
          'Are you sure you want to discard your changes?',
          onConfirm,
          'Discard all changes',
          ["Discard them","Wait, no!"]
      );
    } else {
      // Book hasn't been modified
      goBack();
    }
  });
}

/**
 * Calls functions to create or update book and templates accordingly.
 */
function saveButton() {
  $('#save').unbind().click(function() {
    if (globalVars.development) {
        if (!helper.isSameObject(globalVars.book, globalVars.previousBook)) {
          console.warn("Updating template...", globalVars.book);
          updateTemplate();
        } else {
          // Template hasn't been modified
          SimpleNotification.info({
            title: 'Development mode',
          text: 'You haven\'t changed anything!'
        }, globalVars.notificationOptions);
      }
    } else {
        if (globalVars.book.bookId) {
          if (!helper.isSameObject(globalVars.book, globalVars.previousBook)) {
            console.warn("Updating book...", globalVars.book);
            updateBook();
          } else {
            // Book hasn't been modified
            SimpleNotification.info({
              text: 'You haven\'t changed anything!'
            }, globalVars.notificationOptions);
          }
        } else {
          console.warn("Creating book...", globalVars.book);
          createBook();
        }
    }
  });
}

/**
 * Shows user UI to create a new coupon to add to the book.
 */
function plusButton() {
  /** Decomposes things slightly since the same code is needed twice. */
  function fadeToBookContent() {
    //console.warn("Fading to book content...");
    helper.fadeBetweenElements("#couponForm", "#bookContent");
    listeners();
    displayBook();
  }

  $('#plus').unbind().click(function() {
    //console.log("Plus button pressed!");
    helper.fadeBetweenElements("#bookContent", "#couponForm");
    helper.fadeBetweenElements("#couponOpenPhoto, #couponTakePhoto", "#saveForImage");

    // Reset form to blank in case it is clicked after editing a coupon
    // TODO: Change this now that image upload is working
    helper.getById("couponImage").src = "images/gift.png";
    helper.getById("name").value      = "";
    if (helper.getById("couponDescription")) { helper.getById("couponDescription").value = ""; }
    if (helper.getById("count")) { helper.getById("count").value = ""; }

    limitDescriptionLength();
    preventInvalidNumberInput();

    // Set edit icon based on platform (iOS or not iOS); default is not iOS icon
    if (device.platform == "iOS") {
      $('#edit img').attr('src', "images/ios-edit.svg");
    }

    // Set back button to take you back to coupon list
    $('#backArrow').unbind().click(function() {
      fadeToBookContent();
      helper.fadeBetweenElements("#saveForImage", "#couponOpenPhoto, #couponTakePhoto");
    });

    $('#save').unbind().click(function() {
          var name = helper.getById("name").value;
          if (nameAlreadyExists(name)) {
            newNameWarning();
        } else if (couponFormIsValid()) {
          // Form is properly filled out
          createCoupon();
          fadeToBookContent();

          SimpleNotification.success({
            text: 'Created coupon'
          }, globalVars.notificationOptions);
        }
    });
  });
}

/**
 * Modified plusButton() function for editing the book's details.
 */
function editBookButton() {
  function fadeToBookContent() {
    helper.fadeBetweenElements("#bookForm", "#bookContent");
    addListeners();
    displayBook();
  }

  $("#editBook").unbind().click(function() {
    //console.log("Edit BOOK button pressed!");
    helper.fadeBetweenElements("#bookContent", "#bookForm");

    helper.getById("bookImage").src         = globalVars.book.image;
    helper.getById("bookName").value        = globalVars.book.name;
    helper.getById("bookDescription").value = globalVars.book.description;

    // Below the above setters so previous value doesn't change descLength
    limitDescriptionLength(true);
    imageUploadListeners();

    $('#backArrow').unbind().click(function() {
      // TODO: Do the check if content has changed like when leaving preview page
      fadeToBookContent();
    });

    $('#save').unbind().click(function() {
      if (bookFormIsValid() && editBookDetails()) {
        fadeToBookContent();
      }
    });

    $("#bookImage").unbind().click(function() {
      // TODO: Just click 'Choose Image' or something here?
    });
  });
}

/**
 * Everything dealing with image preparation for upload.
 * @param {object} coupon - exists if for the coupon image, so if for
 * book it'll be null, allowing it to serve as a Boolean detector for 
 * which purpose the function is being called for.
 * TODO: maybe also allow users to search through (browse) all the templated images
 */
function imageUploadListeners(coupon) {
  // TODO: Add option to reset image to present
  var imageToUpdate = !!coupon ? helper.getById("couponImage") : helper.getById("bookImage");
  var bytes = require('bytes');
  var args = {
      'selectMode': 100,
      'maxSelectCount': 1,
      'maxSelectSize': (bytes.parse("5mb") * 8) // Megabytes to bytes to bits
  };

  // Error in Success callbackId: MediaPicker1340867104 : TypeError: Cannot read property 'uri' of undefined ??
  $('#bookOpenPhoto, #couponOpenPhoto').unbind().click(function() {
    // TODO: Get uniform cropping; the take photo one is better so try to expand usage
    MediaPicker.getMedias(args, function(image) {
      // Lets the user crop the selected image in a square shape;
      // TODO: Eventually try to make the initial sizing better (100% width)
      // TODO: resize to uniform, i.e. 512x512?
      plugins.crop.promise(image[0].uri, { quality: 100 })
        .then(function success(newPath) {
          // https://riptutorial.com/cordova/example/23783/crop-image-after-clicking-using-camera-or-selecting-image-
          console.log("Cropped image data:", newPath);

          // TODO: Decide if I still want to do this here or somewhere else
          imageToUpdate.src = newPath;

          // TODO: Make sure PNGs are able to retain their transparency! If not might
          // need to consider switching plugins, or just using Cloudinary

          // Should I wait until save for this or just roll with it?
          uploadImage(newPath, coupon);
        })
        .catch(function fail(err) {
          console.error("Problem cropping image ->", err);
        });
    }, function(e) { console.error("Problem in selecting media ->", e) })
  });

  /** Shows a loading circle when waiting for the image to upload */
  function loadingUI() {
    // TODO - because when uploading a photo you take it can take a second to load
  }

  $('#bookTakePhoto, #couponTakePhoto').unbind().click(function() {
    // https://stackoverflow.com/a/35133183/6456163;
    // is it possible to add a circular option or would that have to be after the fact?
    var cameraOptions = {
      quality: 75,
      allowEdit: true,
      targetWidth: 512,
      targetHeight: 512,
      mediaType: Camera.MediaType.PICTURE
    };

    MediaPicker.takePhoto(cameraOptions, function(media) {
      loadingUI();

      // Need to call this in a function for some reason otherwise media isn't ready yet
      handlePreparedPhoto(media);
    }, function(e) { console.error("Error in takePhoto ->", e) });
  });

  /** Literally just a handler function to wait until a variable is ready */
  function handlePreparedPhoto(media) {
    //console.log("handlePreparedPhoto media:", media);
    imageToUpdate.src = media.uri;
    uploadImage(media.uri, coupon);
  }
  
  function compressImage(compressedImage) {
    compressedImage.quality = 80; // when the value is 100, return original image
    MediaPicker.compressImage(compressedImage, function(compressData) {
        // https://stackoverflow.com/a/40360666/6456163
        console.log("Compressed image path:", compressData.path);
    }, function(e) { console.error("Error in compressImage ->", e) });
  }
}

/**
 * Compresses the image and sends it to Cloudinary.
 * @param {string} filePath - the src for the image being uploaded
 * @param {object} coupon - coupon object if not called for book.
 * If for book, it will be null.
 */
function uploadImage(filePath, coupon) {
  // NOTE: !!coupon == (isCoupon && !isBook), for reference
  console.warn("Uploading image...");

  // https://github.com/collectmeaustralia/cordova-cloudinary-upload/issues/1
  var Hashes = require('jshashes');
  var uri = encodeURI('https://api.cloudinary.com/v1_1/couponbooked/image/upload');
  var fileToUploadPath = filePath;

  var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileToUploadPath.substr(fileToUploadPath.lastIndexOf('/') + 1);
  var timestamp = Math.floor(Date.now() / 1000);

  // https://support.cloudinary.com/hc/en-us/community/posts/360030104392/comments/360002948811
  if (globalVars.development) {
    // TODO: Figure out how to view all images in parent folder, so it's essentially
    // metadata but in the location name;
    // TODO: Make this only be called if on a TEMPLATE in development mode, not user books
    var folder = "templates/" + (!!coupon ? "coupons" : "books") + "/" + globalVars.book.name;
  } else {
    var folder = "users/" + localStorage.getItem('user_id') + "/" + (!!coupon ? "coupons" : "books") + "/" + globalVars.book.bookId;
  }

  // Add in the params required for Cloudinary
  options.params = {
      api_key: env.CLOUDINARY_KEY,
      folder: folder,
      timestamp: timestamp,
      signature: new Hashes.SHA1().hex(`folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_SECRET}`)
  };

  var ft = new FileTransfer();

  // Leaving this here in case I ever need it
  ft.onprogress = (function(progressEvent) {
    try {
        if (progressEvent.lengthComputable) {
            // if we can calculate the length of the upload ...
            var percentageComplete = ((progressEvent.loaded / progressEvent.total) * 100);
            console.log("Percentage complete:", percentageComplete)
        } else {
          // otherwise increment some counter by 1
        }

        // do something with the latest progress...
    } catch(err) {
      console.error("Problem computing progress:", err);
    }
  });

  ft.upload(fileToUploadPath, uri, 
    function(result) {
      var response = JSON.parse(result.response);
      console.log("Upload response:", response);

      if (coupon) {
        coupon.image = response.secure_url;
      } else {
        // TODO: Test again for when leaving edit page if it'll load in quickly
        globalVars.book.image = response.secure_url;
      }
    }, 
    function(error) {
      console.error("Problem in image upload:", error);
      if (!!error.body) {
        // Saves me a couple annoying seconds of scrolling through the message
        console.error("Error body:", JSON.parse(error.body));
      }
    },
    options
  );
};

/**
 * The normal listeners for the /sentBook route.
 * TODO: Come up with a better function name.
 */
function addListeners() {
  //console.log("sentBookListeners...");
  $("#bookDescriptionPreview").unbind().click(function() {
    // IDEA: Add this to the image too, or just view the image in
    // its entirety? Do that option once the preview is opened from here?
    openBookPreview();
  });

  // Will give users the chance again to share their code
  $("#shareCodePreview").unbind().click(function() {
    globalVars._this.redirectTo('/shareCode');
  });

  // Allows listener to apply to dynamically added elements, such as Stripe button
  $("body").unbind().click(function() {
    if (event) {
      var target = event.target;
      if (target.className === 'stripe-button-el' || 
          target.parentElement.className === 'stripe-button-el')
      {
        sneakFormData();
      }
    }
  });

  backButton();
  saveButton();
  plusButton();
  editBookButton();
  createCouponElements();
}

/**
 * Adds coupon data to div and inserts it to page.
 * @param {integer} couponNumber - the location of the current coupon in the array
 * @param {object} coupon - the data for the current coupon
 * NOTE: This is duplicated for sent books until I find a way to share it
 */
function createCouponElements() {
  // TODO: Figure out how to display image licenses if not paying for yearly subscription
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  $.each(globalVars.book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      helper.getById("bookContent").appendChild(node);

      addCouponListeners(node);
  });
}

/**
 * Adds click listeners to the specified sent coupon element.
 * @param {node} node - the coupon element
 */
function addCouponListeners(node) {
  //console.log("addSentCouponListeners...");
  $(node).unbind().click(function() {
    /** Allows coupon node to be passed as parameter to functions */
    var $this = this;
    showCouponPreview($this);

    $("#edit").unbind().click(function() {
      console.log("Edit button pressed!");
      showCouponEditPage($this);
    });
  });
}

/**
 * Hides the `/sentBook` route and shows the preview of the coupon 
 * that was selected. Also adds listeners for going back to `/sentBook`.
 */
function showCouponPreview($this) {
  //console.log("showSentCouponPreview...");
  saveAndDeleteToggle();
  helper.fadeBetweenElements("#bookContent, #couponForm", "#couponPreview");

  $('#backArrow').unbind().click(function() {
    saveAndDeleteToggle();
    helper.fadeBetweenElements("#couponPreview", "#bookContent");

    // Calls this again in case data was updated and needs to be redisplayed
    displayBook();
  });

  $('#delete').unbind().click(function() {
    function onConfirm(buttonIndex) {
      if (buttonIndex == 1) {
        // TODO: Fix this not working immediately after displaying a 
        // new template. Error message: "Failed to execute 'appendChild' on 
        // 'Node': parameter 1 is not of type 'Node'.
        var couponNumber = $($this).data("couponNumber");
        globalVars.book.coupons.splice(couponNumber, 1);
        
        displayBook();
        saveAndDeleteToggle();
        helper.fadeBetweenElements("#couponForm, #couponPreview", "#bookContent");
      }
    }
    
    navigator.notification.confirm(
        'Are you sure you want to delete this coupon?',
        onConfirm,
        'Delete coupon confirmation',
        ['Delete it', 'Cancel']
    );
  });

  // Updates preview fields with actual coupon's data
  var coupon = $($this).data("coupon");
  helper.getById("imgPreview").src        = coupon.image;
  helper.getById("namePreview").innerText = `${coupon.name}: ${coupon.count}`;
  helper.getById("descPreview").innerText = coupon.description;
}

/**
 * Updates edit page's form with the current coupon data and
 * displays the edit page.
 */
function showCouponEditPage($this) {
  //console.log("showCouponEditPage...");
  saveAndDeleteToggle();
  helper.fadeBetweenElements("#couponPreview", "#couponForm");
  preventInvalidNumberInput();

  var coupon = $($this).data("coupon");
  helper.getById("couponImage").src         = coupon.image;
  helper.getById("name").value              = coupon.name;
  helper.getById("couponDescription").value = coupon.description;
  helper.getById("count").value             = coupon.count;

  imageUploadListeners(coupon);
  limitDescriptionLength();

  // NOTE: On press, error for reading `image` of undefined... why?;
    // TODO: See if this error can still be replicated
  $('#backArrow').unbind().click(function() {
    // Will show the new data
    showCouponPreview($this);
  });

  $('#save').unbind().click(function() {
    if (couponFormIsValid()) {
      updateCoupon(coupon, $this);
      showCouponPreview($this);
    }
  });
}

/**
 * Prevents users from entering more than the maximum length assigned
 * in the HTML. Also updates the displayed div that shows the current
 * character count in comparison to the maximum count.
 * @param {boolean} isBook - true for book, false for coupon
 */
function limitDescriptionLength(isBook) {
  var desc = isBook ? helper.getById("bookDescription") : helper.getById("couponDescription");
  var descLength = isBook ? $("#bookDescLength") : $("#couponDescLength");
  var maxlen = desc.getAttribute('maxlength');

  // To initialize with book's current description
  updateText(true);

  // http://form.guide/html-form/html-textarea-maxlength.html
  desc.oninput = function(event) {
    updateText(false, event);
  };

  /** 
   * Does the actual limiting, just needed to call it twice.
   * @param {boolean} initial - true if called outside desc input
   * @param {object} event - if not initial, then the keypress or paste event
   */
  function updateText(initial, event) {
    // https://stackoverflow.com/a/5371115/6456163
    var length = desc.value.length;
    
    if (length >= maxlen) {
      event.preventDefault();

      descLength.text("Max number of characters reached!");
      desc.value = desc.value.substring(0, maxlen);
      length = maxlen;
    } else {
      // Example: 146/180
      descLength.text(`${length}/${maxlen}`);

      if (!initial) {
        updateHeight(isBook);
      } else {
        console.log("Initial text update, leaving height alone...");
      }
    }
  }
}

/**
 * Automatically adjusts the number of rows to be one greater than
 * the current row the user is typing on whenever the user enters
 * a character.
 * @param {boolean} isBook - true for book, false for coupon
 */
function updateHeight(isBook) {
  // https://gomakethings.com/automatically-expand-a-textarea-as-the-user-types-using-vanilla-javascript/
  var field = isBook ? helper.getById("bookDescription") : helper.getById("couponDescription");

  // Reset field height
  field.style.height = 'inherit';

  // Get the computed styles for the element
  var computed = window.getComputedStyle(field);

  // Calculate the height
  var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                + parseInt(computed.getPropertyValue('padding-top'), 10)
                + field.scrollHeight
                + parseInt(computed.getPropertyValue('padding-bottom'), 10)
                + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

  field.style.height = `${height}px`;

  // NOTE: This works because you can't scroll past the end of the document.
  // Otherwise I'd have to have a variable checking the previous height of the
  // field and if it's different then run this code.
  var lineHeight = parseInt($(field).css('line-height'));
  var y = $(window).scrollTop();
  $(window).scrollTop(y + lineHeight);
}

/**
 * Is SUPPOSED to stop the user from entering decimals and
 * negative numbers, but right now that is still being handled
 * in a not-so-elegant manner by couponFormIsValid. It does, however,
 * stop numbers >99 from being entered.
 */
function preventInvalidNumberInput() {
  // Select your input element.
  var count = helper.getById("count");

  // https://stackoverflow.com/a/24271309/6456163
  $('#count').on('keyup', function(e) {
    if (e.key == "Undefined" || e.key == "Unidentified") {
      // TODO: Make this run AFTER the new key is added to the field
      //count.value = count.value.slice(0, -1);
    } else if ($(this).val() > 99 
        && e.keyCode !== 46 // keycode for delete
        && e.keyCode !== 8 // keycode for backspace
       ) {
       e.preventDefault();
       console.log("Preventing count from going too high. Setting to 99...");
       $(this).val(99);
    }
  });
}

/**
 * Shows the entire uncut book description, name, and image.
 * Like a coupon preview but a popup instead of an entire page change.
 * TODO: Switch coupon previews to something similar?
 */
function openBookPreview() {
  // IDEA: Also add click listener to image on edit page that
  // shows the image fullscreen with a nav bar or sumn?

}

/**
 * Adds click listener to trash can icon in miniPreview.
 */
function addDeleteListeners() {
  //console.warn("addDeleteListeners...");
  $("#deleteBook").unbind().click(function() {
    function onConfirm(buttonIndex) {
      // NOTE: Button 0 is clicking out of confirmation box;
      // 1 is delete and 2 is cancel
      if (buttonIndex == 1) {
        deleteBook();

        // NOTE: This used to not always pull the new data in time for when the
        // user sees the dashboard so the deleted book would still show up, but it's
        // hard to replicate so I don't know if the problem still exists. If noticed 
        // again in the future I'll look further into how to prevent it. Possibly with
        // waiting for a promise or asynchronously running a function or something.
        goBack();
      }
    }
    
    navigator.notification.confirm(
        'Are you sure you want to delete this book?', // message
        onConfirm, // callback function
        'Delete book confirmation', // title
        ['Delete it', 'Wait, stop!'] // buttonLabels; added to page from right to left
    );
  });
}

/**
 * Sets the deleted column in the database to true, which will remove
 * it from all user searches but not delete it entirely so it can still
 * be used for analytics.
 */
function deleteBook() {
  var bookId = globalVars.book.bookId;
  if (bookId) {
    console.warn("Deleting book...");
    $.ajax({
      type: "POST",
      url: "http://www.couponbooked.com/scripts/deleteBook",
      data: { bookId: globalVars.book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Uncomment to debug deleting books
        //console.warn("deleteBook success: ", success);

        SimpleNotification.success({
          text: "Successfully deleted book"
        }, globalVars.notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in deleteBook: ", XMLHttpRequest.responseText);

        SimpleNotification.error({
          title: "Error deleting coupon book!",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    });
  } else {
    // In case someone tries to delete the template without saving it first
    console.warn("Can't delete book that hasn't been saved yet! Going back...");
    $("#backArrow").click();
  }
}

/**
 * Take data from form fields and add it to `book.coupons`.
 * NOTE: The data is already validated when this function is
 * called, so you know all the inputs are filled out.
 */
function createCoupon() {
  var form = $('#couponForm').serializeArray();

  // https://stackoverflow.com/a/51175100/6456163
  var coupon = {};
  for (var i = 0; i < form.length; i++) {
    coupon[form[i].name] = form[i].value;
  }

  // Convert from string to number
  coupon.count = parseInt(coupon.count);

  // TODO: This is what the problem was before!!!
    // Can easily fix the image upload issue by removing this I bet
  coupon.image = "images/gift.png";

  // Uncomment for debugging coupon creation
  // console.warn("New coupon:", coupon);

  // Name already validated before this function is called so
  // no need to do it again.
  globalVars.book.coupons.push(coupon);
  displayBook();
}

/**
 * Replace the old coupon with the updated one in `book.coupons`,
 * if there is not already a coupon by that name.
 * @param {Object} oldCoupon - the JSON of previous coupon
 * @param {Object} $this - reference to the applicable couponPreview node
 */
function updateCoupon(oldCoupon, $this) {
  console.warn("Attempting to update coupon...");
  var form = $('#couponForm').serializeArray();
  // TODO: Get new image or something; what's the issue?

  var newCoupon = {};
  newCoupon.image = oldCoupon.image;
  for (var i = 0; i < form.length; i++) {
    newCoupon[form[i].name] = form[i].value;
  }

  // Convert from string to number
  newCoupon.count = parseInt(newCoupon.count);

  if (!helper.isSameObject(oldCoupon, newCoupon)) {
      // TODO: Consider decomposing
      var oldName = oldCoupon.name;
      var newName = newCoupon.name;
      if (newName != oldName && nameAlreadyExists(newName)) {
        newNameWarning();
      } else {
        // Iterate over coupons until the one with the previous name is found
        $.each(globalVars.book.coupons, function(couponNumber, coupon) {
          if (coupon.name == oldName) {
            // Uncomment for debugging coupon updating
            /*console.warn("Old coupon:", oldCoupon);
            console.warn("New coupon:", newCoupon);*/

            // TODO: Check for special character support, i.e. other languages;
              // also in editBookDetails
            coupon = newCoupon;
            globalVars.book.coupons[couponNumber] = newCoupon;
      
            $($this).data("coupon", newCoupon);
            displayBook();
      
            // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            // TODO: Explain this line, and also test the new version
            $(`#bookContent p:contains('${newName}')`).parent()[0].click();
            
            console.warn("Coupon updated!");
            showCouponPreview($this);

            SimpleNotification.success({
              text: "Updated coupon"
            }, globalVars.notificationOptions);
          }
        });
      }
  } else {
    // Coupon hasn't been modified
    console.warn("Coupon not modified. Returning...");

    SimpleNotification.info({
      text: 'You haven\'t changed anything!'
    }, globalVars.notificationOptions);
  }
}

/**
 * Ensure all the conditions for a valid coupon are met.
 * @returns {boolean} whether or not the form is valid
 */
function couponFormIsValid() {
  var name = helper.getById("name").value;
  var count = helper.getById("count").value;

  // Validate that form is filled out properly
  if (name.length < 1) {
    // No name
    SimpleNotification.warning({
      text: "Please enter a name"
    }, globalVars.notificationOptions);
  } else if (name.length > 99) {
    // Name too long;
    // IDEA: Switch this to textArea-style validation like in book
    SimpleNotification.warning({
      title: "Name too long",
      text: "Please enter a shorter name"
    }, globalVars.notificationOptions);
  } else if (isNaN(count) || count < 1 || count > 99) {
    // NOTE: This is legacy code that shouldn't ever run, but leaving
    // it here in case it solves some edge case issue.
    SimpleNotification.warning({
      title: "Invalid count entered",
      text: "Please enter a number between 1 and 99"
    }, globalVars.notificationOptions);
  } else {
    return true;
  }

  return false;
}

/**
 * This is couponFormIsValid() adapted for the book form, so essentially
 * just without the count validation. Could probably combine the two with
 * the use of a parameter like createCouponElements(), but I'll worry about
 * that later once everything is nice and working.
 * @returns {boolean} whether or not the form is valid
 */
function bookFormIsValid() {
  var image = helper.getById("bookImage");
  var name = helper.getById("bookName").value;
  var desc = helper.getById("bookDescription").value;

  // Validate that form is filled out properly
  if (!image) {
    // image input
    // TODO: Add proper if conditions after creating input field
  } else if (name.length < 1) {
    SimpleNotification.warning({
      text: "Please enter a name"
    }, globalVars.notificationOptions);
  } else if (name.length > 99) {
    SimpleNotification.warning({
      title: "Name too long",
      text: "Please enter a shorter name"
    }, globalVars.notificationOptions);
  } else if (desc.length > 280) {
    // TODO: Give an indication of characters used 
    // out of total allowed, like a textArea. Switch?
    SimpleNotification.warning({
      text: "Please enter a shorter description"
    }, globalVars.notificationOptions);
  } else {
    return true;
  }

  return false;
}

/**
 * If save element is visible, it fades out and the delete
 * element fades in. If not, then the reverse happens.
 */
function saveAndDeleteToggle() {
  var saveShowing = $("#save").is(':visible');
  if (saveShowing) {
    helper.fadeBetweenElements("#save", "#delete");
  } else {
    helper.fadeBetweenElements("#delete", "#save");
  }
}

/**
 * Create a new Coupon Book and upload it to the database.
 */
function createBook() {
  var uuid = uuidv4();
  var sender = localStorage.getItem('user_id');

  // IDEA: Option to update sender name before sharing; allows
  // for another level of personalization with nicknames.
  var senderName = getUserName();
  globalVars.book.bookId = uuid;
  globalVars.book.hide = 0;

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, senderName: senderName, bookData: JSON.stringify(globalVars.book) },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      // Uncomment to debug book creation
      //console.warn("createBook success:", success);

      if (success.includes("bookId in use")) {
        console.warn("bookId in use. Generating new one and trying again...");
        createBook();
      } else {
        // Updates the "Save to share" text to the Stripe button on first save
        globalVars._this.redirectTo('/sentBook');
        
        SimpleNotification.success({
          text: "Successfully created book"
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createBook:", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: "Error creating book!",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  });
}

/**
 * Changes book data, meaning name, description, and image.
 * @returns {boolean} whether or not the editing completed successfully.
 * Not the best function name, so sorry, but it is what it is.
 */
function editBookDetails() {
  var form = $('#bookForm').serializeArray();

 // Can't use previousBook because that's storing it for exiting the page to 
 // check if it has been saved or not. Sorry for the confusion.
  var oldBook = helper.clone(globalVars.book);
  for (var i = 0; i < form.length; i++) {
    globalVars.book[form[i].name] = form[i].value;
  }

  if (!helper.isSameObject(globalVars.book, oldBook)) {
      SimpleNotification.success({
        text: "Updated book"
      }, globalVars.notificationOptions);

      return true;
  } else {
    console.warn("Book info not modified. Returning...");
    globalVars.book = helper.clone(oldBook); // Restore to previous state

    SimpleNotification.info({
      text: 'You haven\'t changed anything!'
    }, globalVars.notificationOptions);

    return false;
  }
}

/**
 * Update book, whether by adding more coupons or changing the counts.
 * @param {Boolean} silent - whether or not a notification should be 
 * displayed on the screen if the function is successful.
 * 
 * When no parameter is passed the variable is undefined, which resolves
 * to false. For more info on parameter look here: https://stackoverflow.com/a/1846715/6456163
 */
function updateBook(silent) {
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateData",
    data: { bookId: globalVars.book.bookId, bookData: JSON.stringify(globalVars.book) },
    crossDomain: true,
    cache: false,
    success: function(success) {
      globalVars.previousBook = helper.clone(globalVars.book);
      console.warn("Successfully updated coupon book.");

      if (!silent) {
        SimpleNotification.success({
          text: "Successfully updated coupon book"
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in updateCouponBook:", XMLHttpRequest.responseText);

      // TODO: Think of a good way to resolve bugs for users; some log data saved?
      // IDEA: Have a 'report bug' thing somewhere that includes logs in report; send it where?
        // Theoretically could be one SQL table for bug logs and one for security violations
      SimpleNotification.error({
        // IDEA: Something in error messages about 'sorry for the inconvenience'?
        // Would make them awfully long but seems like a professional thing to do.
        title: "Error updating coupon book!",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  });
}

/**
 * Checks if the new name already exists in the book.
 * @param {string} name - name of the new coupon
 */
function nameAlreadyExists(name) {
  // Makes sure new name doesn't already exist
  var nameAlreadyExists = false;
  $.each(globalVars.book.coupons, function(couponNumber, coupon) {
    if (coupon.name == name) {
      nameAlreadyExists = true;
    }
  });

  return nameAlreadyExists;
}

/**
 * Development-only function. Same as updateBook, but for templates.
 */
function updateTemplate() {
  var userId = localStorage.getItem("user_id");

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateTemplate",
    data: { name: globalVars.book.name.toLowerCase(), templateData: JSON.stringify(globalVars.book), userId: userId },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      if (success) {
        console.warn("updateTemplate success:", success);
      }

      globalVars.previousBook = helper.clone(globalVars.book);

      SimpleNotification.success({
        text: "Successfully updated template"
      }, globalVars.notificationOptions);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      var responseText = XMLHttpRequest.responseText;
      console.error("Error in updateTemplate:", responseText);

      if (responseText.includes("not allowed")) {
        // Unauthorized user trying to update a template
        SimpleNotification.error({
          title: "Unauthorized template update",
          text: "Your violation has been logged."
        }, globalVars.notificationOptions);
      } else {
        // Generic error
        SimpleNotification.error({
          title: "Error updating template",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    }
  });
}


/**
 * Shows a warning notification that a unique name is required.
 */
function newNameWarning() {
  SimpleNotification.warning({
    title: "Already used this name",
    text: "Please enter a unique name."
  }, globalVars.notificationOptions);
}

/**
 * Development-only function. Meant to aid in the process of creating
 * templates and adding them to the template table in the database.
 * @param {string} name - the name of the template to be created
 */
function createTemplate(name) {
  console.warn(`Creating template ${name}...`);
  // TODO: https://www.flaticon.com/free-icon/gift_214305#term=gift&page=1&position=5
  var emptyTemplate = { name:name, description:"", image:"images/gift.png", bookId:null, shareCode:null, coupons:[] };
  emptyTemplate = JSON.stringify(emptyTemplate);
  var userId = localStorage.getItem("user_id");

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createTemplate",
    data: { name: name, templateData: emptyTemplate, userId: userId },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      // PHP echos a message if name already exists; if it doesn't, PHP is silent
      if (success) {
        console.warn("createTemplate success:", success);
        newNameWarning();
      } else {
        getTemplate(name);

        SimpleNotification.success({
          title: "Successfully created template!",
          text: "Good for you. Keep up the great work!"
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      var responseText = XMLHttpRequest.responseText;
      console.error("Error in createTemplate:", responseText);

      if (responseText.includes("not allowed")) {
        // Unauthorized user trying to create a template
        SimpleNotification.error({
          title: "Unauthorized template creation",
          text: "Your violation has been logged."
        }, globalVars.notificationOptions);
      } else {
        // Generic error
        SimpleNotification.error({
          title: "Error creating template",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    }
  });
}

// NOTE: All the functions in this file are listed here.
// If they are commented out, they aren't currently needed
// outside this file. Please keep this list in order :)
module.exports = Object.assign({
  displayBook,
  //sneakFormData,
  //goBack,
  //backButton,
  //saveButton,
  //plusButton,
  //editBookButton,
  //imageUploadListeners,
  //uploadImage,
  //addListeners,
  //createCouponElements,
  addCouponListeners,
  //showCouponPreview,
  //showCouponEditPage,
  //limitDescriptionLength,
  //updateHeight,
  //preventInvalidNumberInput,
  //openBookPreview,
  //addDeleteListeners,
  //deleteBook,
  //createCoupon,
  //updateCoupon,
  //couponFormIsValid,
  //bookFormIsValid,
  //saveAndDeleteToggle,
  //createBook,
  //editBookDetails,
  updateBook,
  //nameAlreadyExists,
  //updateTemplate,
  //newNameWarning,
  //createTemplate
});