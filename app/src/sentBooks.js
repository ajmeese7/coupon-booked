const uuidv4 = require('uuid/v4');
const env = require('../env');
var helper = require('./helperFunctions');
var globalVars = require('./globalVars.js');

/**
 * Takes the current book JSON data and adds it to the page.
 * @param {boolean} funky - true if called from a place where
 * weird things happen, and the app gets *funky*
 */
function displayBook(funky) {
  // Override the default nav listener code
  var mobile = helper.getBySelector("#mobile");
  $(mobile).unbind().click(function() {
    bookBackButtonListener(false, true);
    $('#backArrow').click();
  });

  showProperButton(funky ? "funky" : "home");
  var bookContent = helper.getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = '<button id="plus">+</button>';

  // Create preview of book at top of display
  /* IDEA: Can have bold display with image and title and everything, then as you scroll
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
  } else if (!globalVars.book.bookId) {
    // For when a template is first loaded in; not yet created
    var receiver = "<p class='receiverText'>Create to share!</p>";
    previewText.innerHTML += receiver;
  }
  
  previewText.innerHTML += `<p id='bookDescriptionPreview'>${globalVars.book.description}</p>`;
  previewText.innerHTML += "<p id='bookDescriptionShortcut'>Click for description</p>";
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

  addDeleteListeners();
  addListeners();
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

/** To store the changes made on the edit page for comparison next time it is opened. */
var newPreviousBook = null;

/**
 * Returns you to your previous location; asks for confirmation
 * if you have unsaved changes.
 * @param {boolean} editPage - true if edit page, false if preview page
 * @param {boolean} homeButtonClicked - true if home button clicked, false if not
 */
function bookBackButtonListener(editPage, homeButtonClicked) {
  $('#backArrow').unbind().click(function() {
    // Get latest book info
    var tempBook = helper.clone(globalVars.book);
    var bookToCompareTo = editPage ? newPreviousBook : globalVars.previousBook;
    
    // image already saved to server, so ignore that part of object
    tempBook.image = bookToCompareTo.image;
    tempBook.name  = helper.getById("bookName").value;
    tempBook.description = helper.getById("bookDescription").value;
    bookToCompareTo.bookId = globalVars.book.bookId;

    // If not yet saved, just discards without secondary confirmation.
    if (!helper.isSameObject(tempBook, bookToCompareTo) && globalVars.book.bookId) {
      $( "#discardBookEditsConfirm" ).dialog({
        draggable: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Discard them": function() {
            $( this ).dialog( "close" );
            window.ga.trackEvent('Book Modification', 'Book Changes Discarded');
            confirmFunction();
          },
          Cancel: function() {
            // TODO: "Wait, no!"
            $( this ).dialog( "close" );
          }
        }
      });
    } else {
      // Book hasn't been modified
      confirmFunction();
    }

    function confirmFunction() {
      if (homeButtonClicked) {
        globalVars._this.redirectTo("/dashboard");
      } else {
        editPage ? fadeToBookContent() : goBack();
      }
    }
  });
}

/** 
 * Calls functions to create books and templates accordingly.
 */
function createBookButton() {
  $("#createButton").unbind().click(function() {
    // Replace Android full URL with a cross-platform local one
    var imageSrc = helper.getById("bookImage").src;
    globalVars.book.image = imageSrc.includes("ticket.png") ? "images/ticket.png" : imageSrc;

    console.warn("Creating book...", globalVars.book);
    createBook();
  });
}

/**
 * Switches from either the book or coupon form to the book display.
 */
function fadeToBookContent() {
  helper.fadeBetweenElements("#couponForm, #bookForm", "#bookContent");
  addListeners();
  displayBook();
}

/**
 * Shows user UI to create a new coupon to add to the book.
 */
function plusButton() {
  $('#plus').unbind().click(function() {
    helper.fadeBetweenElements("#bookContent", "#couponForm");
    showProperButton("newCoupon");

    // Reset form to blank in case it is clicked after editing a coupon
    helper.getById("couponImage").src = "images/ticket.png";
    helper.getById("name").value      = "";
    if (helper.getById("couponDescription")) { helper.getById("couponDescription").value = ""; }
    if (helper.getById("count")) { helper.getById("count").value = ""; }

    imageUploadListeners(true);
    limitDescriptionLength();
    preventInvalidNumberInput();

    // Set edit icon based on platform (iOS or not iOS); default is not iOS icon
    if (device.platform == "iOS") {
      $("#edit img").attr("src", "images/ios-edit.svg");
    }

    // Set back button to take you back to coupon list
    $("#backArrow").unbind().click(function() {
      var blankCoupon = { image: "ticket.png", name: "", desc: "", count: "" };
      var newCoupon = {};

      // https://stackoverflow.com/a/29182327/6456163
      newCoupon.image = helper.getById("couponImage").src.replace(/^.*[\\\/]/, '');
      newCoupon.name  = helper.getById("name").value;
      newCoupon.desc  = helper.getById("couponDescription").value;
      newCoupon.count = helper.getById("count").value;

      // If not yet saved, just discards without secondary confirmation.
      if (!helper.isSameObject(blankCoupon, newCoupon)) {
        // NOTE: This is copied in showCouponEditPage()
        $( "#discardCouponConfirm" ).dialog({
          draggable: false,
          resizable: false,
          height: "auto",
          width: 400,
          modal: true,
          buttons: {
            "Discard them": function() {
              fadeToBookContent();
              window.ga.trackEvent('Book Modification', 'New Coupon Discarded');
              $( this ).dialog( "close" );
            },
            Cancel: function() {
              $( this ).dialog( "close" );
            }
          }
        });
      } else {
        // Coupon hasn't been modified
        fadeToBookContent();
      }
    });

    $("#createButton").unbind().click(function() {
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
function editBook() {
  helper.fadeBetweenElements("#bookContent, #dataPreview", "#bookForm");
  newPreviousBook = helper.clone(globalVars.book);
  showProperButton("editBook");

  // Below the above setters so previous value doesn't change descLength
  limitDescriptionLength(true);
  imageUploadListeners();
  bookBackButtonListener(true);

  $('#save').unbind().click(function() {
    if (bookFormIsValid() && editBookDetails()) {
      // Update the global book with the data in the fields
      globalVars.book.image       = helper.getById("bookImage").src;
      globalVars.book.name        = helper.getById("bookName").value;
      globalVars.book.description = helper.getById("bookDescription").value;

      // Saves the edits from the page immediately
      updateBook(true);
      fadeToBookContent();
    }
  });

  $("#bookImage").unbind().click(function() {
    $(".cloudinary-button").click();
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
  var imageToUpdate = !!coupon ? helper.getById("couponImage") : helper.getById("bookImage");
  var bytes = require('bytes');
  var args = {
    'selectMode': 100,
    'maxSelectCount': 1,
    'maxSelectSize': (bytes.parse("5mb") * 8) // Megabytes to bytes to bits
  };

  // TODO: Make sure the image isn't rotated for some users somehow

  // Error in Success callbackId: MediaPicker1340867104 : TypeError: Cannot read property 'uri' of undefined ??
  $('#bookOpenPhoto, #couponOpenPhoto').unbind().click(function() {
    // TODO: Get uniform cropping; the take photo one is better so try to expand usage
    MediaPicker.getMedias(args, function(image) {
      // TODO: Eventually try to make the initial sizing better (100% width)
      // TODO: resize to uniform, i.e. 512x512?
      var uncroppedImage = image[0].uri;
      if (uncroppedImage.includes(".png")) {
        // Temporary fix that ignores the cropping of PNG images so they retain their
        // transparency. The logs for this issue are located here:
        // https://github.com/DmcSDK/cordova-plugin-mediaPicker/issues/102
        // https://github.com/jeduan/cordova-plugin-crop/issues/78
        console.warn("Not cropping PNG due to transparency loss...");
        imageToUpdate.src = uncroppedImage;
        uploadImage(imageToUpdate, coupon);
      } else {
          // Lets the user crop the selected image in a square shape
          plugins.crop.promise(image[0].uri, { quality: 100 })
          .then(function success(newPath) {
              // https://riptutorial.com/cordova/example/23783/crop-image-after-clicking-using-camera-or-selecting-image-
              console.warn("Cropped image data:", newPath);
              imageToUpdate.src = newPath;
              uploadImage(imageToUpdate, coupon);
          })
          .catch(function fail(err) {
            console.error("Problem cropping image ->", err);
          });
      }
    }, function(e) { console.error("Problem in selecting media ->", e) })
  });
}

/**
 * Compresses the image and sends it to Cloudinary.
 * @param {string} updatedImage - the image with the new src
 * @param {object} coupon - coupon object if not called for book.
 * If for book, it will be null.
 */
function uploadImage(updatedImage, coupon) {
  // NOTE: !!coupon == (isCoupon && !isBook), for reference
  let filePath = updatedImage.src;
  updatedImage.src = "images/loading.gif";
  console.warn("Uploading image...");
  
  // https://github.com/collectmeaustralia/cordova-cloudinary-upload/issues/1
  const Hashes = require('jshashes');
  let uri = encodeURI('https://api.cloudinary.com/v1_1/couponbooked/image/upload');
  let fileToUploadPath = filePath;

  let options = new FileUploadOptions();
      options.fileKey = "file";
      options.fileName = fileToUploadPath.substr(fileToUploadPath.lastIndexOf('/') + 1);
  let timestamp = Math.floor(Date.now() / 1000);

  // https://support.cloudinary.com/hc/en-us/community/posts/360030104392/comments/360002948811
  let folder = "users/" + localStorage.getItem('user_id') + "/" + (!!coupon ? "coupons" : "books") + "/" + globalVars.book.bookId;

  // Add in the params required for Cloudinary
  options.params = {
    api_key: env.CLOUDINARY_KEY,
    folder: folder,
    timestamp: timestamp,
    signature: new Hashes.SHA1().hex(`folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_SECRET}`)
  };

  // Leaving this here in case I ever need it
  let ft = new FileTransfer();
  ft.onprogress = (function(progressEvent) {
    try {
      if (progressEvent.lengthComputable) {
        // if we can calculate the length of the upload ...
        var percentageComplete = ((progressEvent.loaded / progressEvent.total) * 100);
        console.log("Percentage complete:", percentageComplete)
      }
    } catch(err) {
      console.error("Problem computing progress:", err);
    }
  });

  ft.upload(fileToUploadPath, uri, 
    function(result) {
      let response = JSON.parse(result.response);
      console.log("Upload response:", response);
      updatedImage.src = response.secure_url;

      // TODO: try to save the image uploading for the save button
      if (!coupon) {
        globalVars.book.image = response.secure_url;
        updateBook(true);
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
  $("#bookDescriptionPreview, #bookDescriptionShortcut, #miniPreviewImage").unbind().click(function() {
    openBookPreview();
  });

  // Will give users the chance again to share their code
  $("#shareCodePreview").unbind().click(function() {
    globalVars._this.redirectTo('/shareCode');
  });

  // Populate the fields for editing and to help with bookBackButtonListener
  helper.getById("bookImage").src         = globalVars.book.image;
  helper.getById("bookName").value        = globalVars.book.name;
  helper.getById("bookDescription").value = globalVars.book.description;
  
  $("#editBook").unbind().click(function() { editBook() });
  bookBackButtonListener();
  createBookButton();
  plusButton();
  createCouponElements();
}

/**
 * Adds coupon data to div and inserts it to page.
 * @param {integer} couponNumber - the location of the current coupon in the array
 * @param {object} coupon - the data for the current coupon
 * NOTE: This is duplicated for sent books until I find a way to share it
 */
function createCouponElements() {
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  var couponContainer = document.createElement('div');
  couponContainer.setAttribute("id", "couponContainer");
  $.each(globalVars.book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      couponContainer.appendChild(node);

      addCouponListeners(node);
  });

  helper.getById("bookContent").appendChild(couponContainer);
}

/**
 * Adds click listeners to the specified sent coupon element.
 * @param {node} node - the coupon element
 */
function addCouponListeners(node) {
  $(node).unbind().click(function() {
    /** Allows coupon node to be passed as parameter to functions */
    var $this = this;
    showCouponPreview($this);

    $("#edit").unbind().click(function() {
      showCouponEditPage($this);
    });
  });
}

/**
 * Hides the `/sentBook` route and shows the preview of the coupon 
 * that was selected. Also adds listeners for going back to `/sentBook`.
 */
function showCouponPreview($this) {
  helper.fadeBetweenElements("#bookContent, #couponForm", "#dataPreview");
  showProperButton("couponPreview");

  window.ga.trackView('Coupon Preview');

  $('#backArrow').unbind().click(function() {
    helper.fadeBetweenElements("#dataPreview", "#bookContent");

    // Calls this again in case data was updated and needs to be redisplayed
    displayBook();
  });

  $('#delete').unbind().click(function() {
    $( "#deleteCouponConfirm" ).dialog({
      draggable: false,
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Delete it": function() {
          $( this ).dialog( "close" );

          // TODO: Fix this not working immediately after displaying a 
          // new template. Error message: "Failed to execute 'appendChild' on 
          // 'Node': parameter 1 is not of type 'Node'.
          var couponNumber = $($this).data("couponNumber");
          globalVars.book.coupons.splice(couponNumber, 1);
          updateBook();
          
          displayBook();
          helper.fadeBetweenElements("#couponForm, #dataPreview", "#bookContent");
          window.ga.trackEvent('Book Modification', 'Coupon Deleted');
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
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
  helper.fadeBetweenElements("#dataPreview", "#couponForm");
  preventInvalidNumberInput();

  window.ga.trackView('Edit Coupon');

  var coupon = $($this).data("coupon");
  helper.getById("couponImage").src         = coupon.image;
  helper.getById("name").value              = coupon.name;
  helper.getById("couponDescription").value = coupon.description;
  helper.getById("count").value             = coupon.count;

  imageUploadListeners(coupon);
  limitDescriptionLength();

  // Override the default nav listener code
  var homeButtonClicked = false;
  var mobile = helper.getBySelector("#mobile");
  $(mobile).unbind().click(function() {
    homeButtonClicked = true;
    $('#backArrow').click();
  });

  $('#backArrow').unbind().click(function() {
    // For comments, see function in plusButton()
    var newCoupon = {};
    newCoupon.image = helper.getById("couponImage").src;
    newCoupon.name = helper.getById("name").value;
    newCoupon.description = helper.getById("couponDescription").value;
    newCoupon.count = parseInt(helper.getById("count").value);

    if (!helper.isSameObject(coupon, newCoupon)) {
      $( "#discardCouponConfirm" ).dialog({
        draggable: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Discard them": function() {
            fadeToBookContent();
            $( this ).dialog( "close" );
            window.ga.trackEvent('Book Modification', 'Coupon Changes Discarded');
          },
          Cancel: function() {
            $( this ).dialog( "close" );
          }
        }
      });
    } else {
      // Coupon hasn't been modified
      confirmFunction();
    }

    function confirmFunction() {
      // If the user hits the home button, it's treated as a back button press
      // but sends them to the dashboard. If not, it sends them back to the preview.
      homeButtonClicked ? globalVars._this.redirectTo('/dashboard') : showCouponPreview($this);
    }
  });

  showProperButton("editCoupon");
  $('#save').unbind().click(function() {
    if (couponFormIsValid()) {
      updateCoupon(coupon, $this);
      updateBook(true);
      showCouponPreview($this);
    }
  });

  $("#couponImage").unbind().click(function() {
    $(".cloudinary-button").click();
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

      setTimeout(function() {
        if (initial) console.log("Initial text update, adding small delay to height update...");
        updateHeight(isBook);
      }, initial ? 250 : 1);
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
  helper.fadeBetweenElements("#bookContent", "#dataPreview");
  window.ga.trackView('Sent Book Preview');
  $("#edit").unbind().click(function() { editBook() });

  $('#backArrow').unbind().click(function() {
    helper.fadeBetweenElements("#dataPreview", "#bookContent");
    bookBackButtonListener(false, false);
  });

  helper.getById("imgPreview").src        = globalVars.book.image;
  helper.getById("namePreview").innerText = globalVars.book.name;
  helper.getById("descPreview").innerText = globalVars.book.description;
}

/**
 * Adds click listener to trash can icon in miniPreview.
 */
function addDeleteListeners() {
  $('#deleteBook').unbind().click(function(event) {
    // Stop page from scrolling when clicking delete button;
    // https://stackoverflow.com/a/21876609/6456163
    event.preventDefault();

    $( "#deleteBookConfirm" ).dialog({
      draggable: false,
      resizable: false,
      height: "auto",
      width: 400,
      modal: true,
      buttons: {
        "Delete it": function() {
          $( this ).dialog( "close" );
          deleteBook();

          // NOTE: This used to not always pull the new data in time for when the
          // user sees the dashboard so the deleted book would still show up, but it's
          // hard to replicate so I don't know if the problem still exists. If noticed 
          // again in the future I'll look further into how to prevent it. Possibly with
          // waiting for a promise or asynchronously running a function or something. 
          goBack();
        },
        "Wait, stop!": function() {
          $( this ).dialog( "close" );
        }
      }
    });
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
      url: "https://www.couponbooked.com/scripts/deleteBook",
      data: { bookId: globalVars.book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Update Google Analytics with book deletion
        window.ga.trackEvent('Book Modification', 'Book Deleted', 'Success');

        // TODO: Ensure display is refreshed once this is completed
        SimpleNotification.success({
          text: "Successfully deleted book"
        }, globalVars.notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in deleteBook: ", XMLHttpRequest.responseText);
        window.ga.trackEvent('Book Modification', 'Book Deleted', 'Error');

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

  // Replace Android full URL with a cross-platform local one
  var imageSrc = helper.getById("couponImage").src;
  coupon.image = imageSrc.includes("ticket.png") ? "images/ticket.png" : imageSrc;

  // Update Google Analytics with coupon creation
  window.ga.trackEvent('Book Modification', 'Coupon Created');

  // Name already validated before this function is called so
  // no need to do it again.
  globalVars.book.coupons.push(coupon);
  updateBook(true);
  displayBook(true);
}

/**
 * Replace the old coupon with the updated one in `book.coupons`,
 * if there is not already a coupon by that name.
 * @param {Object} oldCoupon - the JSON of previous coupon
 * @param {Object} $this - reference to the applicable couponPreview node
 */
function updateCoupon(oldCoupon, $this) {
  // TODO: Make choosing image not be automatic and they still have to save it or
  // choose to discard changes.
  var form = $('#couponForm').serializeArray();

  var newCoupon = {};
  newCoupon.image = helper.getById("couponImage").src;
  for (var i = 0; i < form.length; i++) {
    newCoupon[form[i].name] = form[i].value;
  }

  // Convert from string to number
  newCoupon.count = parseInt(newCoupon.count);
  
  // Replace Android full URL with a cross-platform local one
  var imageSrc = helper.getById("couponImage").src;
  newCoupon.image = imageSrc.includes("ticket.png") ? "images/ticket.png" : imageSrc;

  // TODO: Consider decomposing
  if (!helper.isSameObject(oldCoupon, newCoupon)) {
      var oldName = oldCoupon.name;
      var newName = newCoupon.name;
      if (newName != oldName && nameAlreadyExists(newName)) {
        newNameWarning();
      } else {
        // Iterate over coupons until the one with the previous name is found
        $.each(globalVars.book.coupons, function(couponNumber, coupon) {
          if (coupon.name == oldName) {
            coupon = newCoupon;
            globalVars.book.coupons[couponNumber] = newCoupon;
      
            $($this).data("coupon", newCoupon);
            displayBook(true);
      
            // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            // I'm honestly not 100% sure what this line does, but don't touch it
            $(`#bookContent p:contains('${newName}')`).parent()[0].click();
            
            console.warn("Coupon updated!");
            showCouponPreview($this);

            // Update Google Analytics with coupon update
            window.ga.trackEvent('Book Modification', 'Coupon Updated');

            SimpleNotification.success({
              text: "Updated coupon"
            }, globalVars.notificationOptions);
          }
        });
      }
  } else {
    // Coupon hasn't been modified
    console.warn("Coupon not modified. Returning...");

    // Lie to user so they don't get confused
    SimpleNotification.success({
      text: "Updated coupon"
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
    // Name too long
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
  var name = helper.getById("bookName").value;
  var desc = helper.getById("bookDescription").value;

  // Validate that form is filled out properly
  if (name.length < 1) {
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
 * Shows whichever element is appropriate to each individual
 * page, like delete for preview and save for edit.
 * @param {string} currentPage - the page for which the display needs to be updated
 */
function showProperButton(currentPage) {
  if ((currentPage == "home" && !globalVars.book.bookId) || currentPage == "newCoupon") {
    // displayBook called last and book not yet created, or a new coupon
    // is being created by the user
    helper.fadeBetweenElements("#save, #delete, #share", "#createButton", true);
  } else if (currentPage == "home") {
    // Book already created but still on displayBook page
    var showShareButton = !globalVars.book.receiver && !globalVars.book.shareCode && globalVars.book.bookId;
    helper.fadeBetweenElements("#createButton, #save, #delete", showShareButton ? "#share" : null, true);
  } else if (currentPage == "funky") {
    // I *FINALLY* fixed the share button issue with this
    helper.fadeBetweenElements("#createButton, #save, #delete", null, true);
  } else if (currentPage == "editBook" || currentPage == "editCoupon") {
    // Save edits to book or coupon
    helper.fadeBetweenElements("#createButton, #delete, #share", "#save", true);
  } else if (currentPage == "couponPreview") {
    // For if they want to delete a coupon
    helper.fadeBetweenElements("#createButton, #save, #share", "#delete", true);
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
  var senderName = helper.getUserName();
  globalVars.book.bookId = uuid;

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, senderName: senderName, bookData: JSON.stringify(globalVars.book) },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      if (success.includes("bookId in use")) {
        console.warn("bookId in use. Generating new one and trying again...");
        createBook();
      } else {
        var stats = JSON.parse(localStorage.getItem("stats"));
        stats.createdBooks++;
        localStorage.setItem("stats", JSON.stringify(stats));
        helper.updateStats();

        // Update Google Analytics with book creation
        window.ga.trackEvent('Book Modification', 'Book Creation', 'Success');

        // Updates the "Create to share" text to the Stripe button on first save 
        globalVars._this.redirectTo('/sentBook');
        
        SimpleNotification.success({
          text: "Successfully created book"
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createBook:", XMLHttpRequest.responseText);
      window.ga.trackEvent('Book Modification', 'Book Creation', 'Error');

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
  var oldBook = helper.clone(globalVars.book);

  // Replace Android full URL with a cross-platform local one
  var imageSrc = helper.getById("bookImage").src;
  oldBook.image = imageSrc.includes("ticket.png") ? "images/ticket.png" : imageSrc;

  oldBook.name        = helper.getById("bookName").value;
  oldBook.description = helper.getById("bookDescription").value;

  // Even if nothing is changed, we lie to the user so they don't get confused
  SimpleNotification.success({
    text: "Updated book"
  }, globalVars.notificationOptions);

  if (!helper.isSameObject(globalVars.book, oldBook)) {
    // Update Google Analytics with book details edited
    window.ga.trackEvent('Book Modification', 'Book Details Edited');

    return true;
  } else {
    console.warn("Book info not modified. Returning...");
    globalVars.book = helper.clone(oldBook); // Restore to previous state

    return false;
  }
}

/**
 * Update book, whether by adding more coupons or changing the counts.
 * @param {boolean} silent - whether or not a notification should be 
 * displayed on the screen if the function is successful.
 * 
 * When no parameter is passed the variable is undefined, which resolves
 * to false. For more info on parameter look here: https://stackoverflow.com/a/1846715/6456163
 */
function updateBook(silent) {
  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/updateData",
    data: { bookId: globalVars.book.bookId, bookData: JSON.stringify(globalVars.book) },
    crossDomain: true,
    cache: false,
    success: function(success) {
      globalVars.previousBook = helper.clone(globalVars.book);
      console.warn("Successfully updated coupon book.");

      // Update Google Analytics with book update
      window.ga.trackEvent('Book Modification', 'Book Updated', 'Success');

      if (!silent) {
        SimpleNotification.success({
          text: "Successfully updated coupon book"
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in updateCouponBook:", XMLHttpRequest.responseText);
      window.ga.trackEvent('Book Modification', 'Book Updated', 'Error');

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
 * Shows a warning notification that a unique name is required.
 */
function newNameWarning() {
  SimpleNotification.warning({
    title: "Already used this name",
    text: "Please enter a unique name."
  }, globalVars.notificationOptions);
}

// NOTE: Functions needed outside this file are listed here.
module.exports = Object.assign({
  displayBook,
  addCouponListeners,
  updateBook
});