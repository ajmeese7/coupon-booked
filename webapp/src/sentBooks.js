/** True means book will be published to template database; false is normal */
var development = false;

// https://stackoverflow.com/a/58065241/6456163
var isIOS = /iPad|iPhone|iPod/.test(navigator.platform)
|| (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Takes the current book JSON data and adds it to the page.
 */
function displaySentBook() {
  // Override the default nav listener code
  var mobile = getBySelector("#mobile");
  $(mobile).unbind().click(function() {
    bookBackButtonListener(false, true);
    $('#backArrow').click();
  });

  showProperButton("home");
  var bookContent = getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = '<button id="plus">+</button>';

  // Create preview of book at top of display
  /* IDEA: Can have bold display with image and title and everything, then as you scroll
    down it collapses to a fixed nav with image on left and title right and on click
    it scrolls back up to the big info. */
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += `<img id='miniPreviewImage' onerror='imageError(this)' src='${book.image}' />`;

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += `<h4 id='bookNamePreview'>${book.name}</h4>`;

  // Sets receiver text based on the current state of the book
  if (book.receiver) {
    // Book has been sent and code redeemed
    var receiver = `<p class='receiverText'>Sent to ${book.receiver}</p>`;
    previewText.innerHTML += receiver;
  } else if (book.shareCode) {
    // Code generated but not yet redeemed
    var receiver = `<p id='shareCodePreview'>Share code: <span>${book.shareCode}</span></p>`;
    previewText.innerHTML += receiver;
  } else if (!book.bookId) {
    // For when a template is first loaded in; not yet created
    var receiver = "<p class='receiverText'>Create to share!</p>";
    previewText.innerHTML += receiver;
  }
  
  previewText.innerHTML += `<p id='bookDescriptionPreview'>${book.description}</p>`;
  previewText.innerHTML += "<p id='bookDescriptionShortcut'>Click for description</p>";
  miniPreview.appendChild(previewText);

  // https://stackoverflow.com/a/16270807/6456163
  var moreOptions = getById("moreOptions").innerHTML;
  if (isIOS) {
    // Changes icons based on platform
    $('#editBook').attr('src', "./images/ios-edit.svg");
    $('#deleteBook').attr('src', "./images/ios-trash.svg");
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
  previousBook = null;
  book = null;
  _this.redirectTo(backButtonTarget);
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
    var tempBook = clone(book);
    var bookToCompareTo = editPage ? newPreviousBook : previousBook;
    var tempBookImage = getById("bookImage").src;
    
    // If image invalid, replaced with ticket.png, so have to ignore that for comparison
    tempBook.image = tempBookImage.includes("ticket.png") ? bookToCompareTo.image : tempBookImage;
    tempBook.name  = getById("bookName").value;
    tempBook.description = getById("bookDescription").value;
    bookToCompareTo.bookId = book.bookId;
    bookToCompareTo.hide = 0;

    // If not yet saved, just discards without secondary confirmation.
    if (!isSameObject(tempBook, bookToCompareTo) && book.bookId) {
      $( "#discardBookEditsConfirm" ).dialog({
        draggable: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          "Discard them": function() {
            $( this ).dialog( "close" );
            gtag('event', 'Book Changes Discarded', { 'event_category' : 'Book Modification' });
            confirmFunction();
          },
          Cancel: function() {
            // "Wait, no!"
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
        _this.redirectTo('/home');
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
    var imageSrc = getById("bookImage").src;
    book.image = imageSrc.includes("ticket.png") ? "./images/ticket.png" : imageSrc;

    if (development) {
      // TODO: Renovate createTemplate with new stuff for here
      createTemplate();
    } else {
      // TODO: Make leaving edited template page out of dev mode ask to confirm

      console.warn("Creating book...", book);
      createBook();
    }
  });
}

// TODO: Remove automatic saving for image upload to coupon so it is checked
// on back button, and also wait to upload until the new image is saved.
// Keep the local preview until they leave that page 

/**
 * Switches from either the book or coupon form to the book display.
 */
function fadeToBookContent() {
  fadeBetweenElements("#couponForm, #bookForm", "#bookContent");
  addListeners();
  displaySentBook();
}

/**
 * Shows user UI to create a new coupon to add to the book.
 */
function plusButton() {
  $('#plus').unbind().click(function() {
    fadeBetweenElements("#bookContent", "#couponForm");
    showProperButton("newCoupon");

    // Reset form to blank in case it is clicked after editing a coupon
    getById("couponImage").src = "./images/ticket.png";
    getById("name").value      = "";
    if (getById("couponDescription")) { getById("couponDescription").value = ""; }
    if (getById("count")) { getById("count").value = ""; }

    imageUploadListeners(true);
    limitDescriptionLength();
    preventInvalidNumberInput();

    // Set edit icon based on platform (iOS or not iOS); default is not iOS icon
    if (isIOS) {
      $("#edit img").attr("src", "./images/ios-edit.svg");
    }

    // Set back button to take you back to coupon list
    $("#backArrow").unbind().click(function() {
      var blankCoupon = { image: "ticket.png", name: "", desc: "", count: "" };
      var newCoupon = {};

      // https://stackoverflow.com/a/29182327/6456163
      newCoupon.image = getById("couponImage").src.replace(/^.*[\\\/]/, '');
      newCoupon.name = getById("name").value;
      newCoupon.desc = getById("couponDescription").value;
      newCoupon.count = getById("count").value;

      // If not yet saved, just discards without secondary confirmation.
      if (!isSameObject(blankCoupon, newCoupon)) {
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
              gtag('event', 'New Coupon Discarded', { 'event_category' : 'Book Modification' });
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

    // For creating coupons
    $("#createButton").unbind().click(function() {
        var name = getById("name").value;
        if (nameAlreadyExists(name)) {
          newNameWarning();
        } else if (couponFormIsValid()) {
          // Form is properly filled out
          createCoupon();
          fadeToBookContent();

          SimpleNotification.success({
            text: 'Created coupon'
          }, notificationOptions);
        }
    });
  });
}

/**
 * Modified plusButton() function for editing the book's details.
 */
function editBook() {
  fadeBetweenElements("#bookContent, #dataPreview", "#bookForm");
  newPreviousBook = clone(book);
  showProperButton("editBook");

  // Below the above setters so previous value doesn't change descLength
  limitDescriptionLength(true);
  imageUploadListeners();
  bookBackButtonListener(true);

  $('#save').unbind().click(function() {
    if (bookFormIsValid() && editBookDetails()) {
      // Update the global book with the data in the fields
      book.image       = getById("bookImage").src;
      book.name        = getById("bookName").value;
      book.description = getById("bookDescription").value;

      // Saves the edits from the page immediately
      development ? updateTemplate(true) : updateBook(true);
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
 * TODO: Fix problem with pay button showing up after saving
 */
function imageUploadListeners(coupon) {
  //var timestamp = Math.floor(Date.now() / 1000);
  var folder = "users/" + localStorage.getItem('user_id') + "/" + (!!coupon ? "coupons" : "books") + "/" + book.bookId;

  // TODO: Have some unused bit or way to delete images of books that are old
  // TODO: Add our images to Dropbox or something to display that; https://cloudinary.com/documentation/media_library_widget?
  var uploadWidget = cloudinary.createUploadWidget({
    // IDEA: https://demo.cloudinary.com/uw/#/
    // NOTE: maxImageWidth/Height really ruin the photo quality since they are applied before cropping,
    // so it might be worth looking into eventually for a replacement after cropping
    cloudName: "couponbooked", uploadPreset: "default_unsigned", cropping: true, maxFileSize: 1500000, 
    resourceType: "image", maxImageWidth: 512, maxImageHeight: 512, apiKey: "363493359893521", folder: folder, 
    multiple: false, croppingAspectRatio: 1}, (error, result) => {
      if (!error && result && result.event === "success") {
        var imageToUpdate = !!coupon ? getById("couponImage") : getById("bookImage");
        imageToUpdate.src = result.info.secure_url;

        gtag('event', 'Image Uploaded', {
          'event_category' : 'Images',
          'event_label' : (!!coupon ? "Coupon" : "Book")
        });
      }
    }
  )
  
  $(".cloudinary-button").unbind().click(function() {
    if (uploadWidget.isMinimized()) {
      uploadWidget.show();
    } else {
      uploadWidget.open();
    }
  });
}

// TODO: Update notifications to be centered on the preview on desktop too
// TODO: Eventually have this signed with PHP sending back hash with secret
// https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
// signature: new Hashes.SHA1().hex(`folder=${folder}&timestamp=${timestamp}${env.CLOUDINARY_SECRET}`)

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
    _this.redirectTo('/shareCode');
  });

  // Populate the fields for editing and to help with bookBackButtonListener
  getById("bookImage").src         = book.image;
  getById("bookName").value        = book.name;
  getById("bookDescription").value = book.description;
  
  $("#editBook").unbind().click(function() { editBook() });
  bookBackButtonListener();
  createBookButton();
  plusButton();
  createSentCouponElements();
}

/**
 * Adds coupon data to div and inserts it to page.
 * @param {integer} couponNumber - the location of the current coupon in the array
 * @param {object} coupon - the data for the current coupon
 * NOTE: This is duplicated for sent books until I find a way to share it
 */
function createSentCouponElements() {
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row 

  var couponContainer = document.createElement('div');
  couponContainer.setAttribute("id", "couponContainer");
  $.each(book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      couponContainer.appendChild(node);

      sentCouponListeners(node);
  });

  getById("bookContent").appendChild(couponContainer);
}

/**
 * Adds click listeners to the specified sent coupon element.
 * @param {node} node - the coupon element
 */
function sentCouponListeners(node) {
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
  fadeBetweenElements("#bookContent, #couponForm", "#dataPreview");
  showProperButton("couponPreview");

  gtag('config', googleID, { 'page_title' : 'Coupon Preview' });

  $('#backArrow').unbind().click(function() {
    fadeBetweenElements("#dataPreview", "#bookContent");

    // Calls this again in case data was updated and needs to be redisplayed
    displaySentBook();
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
          book.coupons.splice(couponNumber, 1);
          development ? updateTemplate() : updateBook();
          
          displaySentBook();
          fadeBetweenElements("#couponForm, #dataPreview", "#bookContent");
          gtag('event', 'Coupon Deleted', { 'event_category' : 'Book Modification' });
        },
        Cancel: function() {
          $( this ).dialog( "close" );
        }
      }
    });
  });

  // Updates preview fields with actual coupon's data
  var coupon = $($this).data("coupon");
  getById("imgPreview").src        = coupon.image;
  getById("namePreview").innerText = `${coupon.name}: ${coupon.count}`;
  getById("descPreview").innerText = coupon.description;
}

/**
 * Updates edit page's form with the current coupon data and
 * displays the edit page.
 */
function showCouponEditPage($this) {
  // TODO: Reset scrollbar to the top of the page to prevent the weird bugs
  fadeBetweenElements("#dataPreview", "#couponForm");
  preventInvalidNumberInput();

  gtag('config', googleID, { 'page_title' : 'Edit Coupon' });

  var coupon = $($this).data("coupon");
  getById("couponImage").src         = coupon.image;
  getById("name").value              = coupon.name;
  getById("couponDescription").value = coupon.description;
  getById("count").value             = coupon.count;

  imageUploadListeners(coupon);
  limitDescriptionLength();

  // Override the default nav listener code
  var homeButtonClicked = false;
  var mobile = getBySelector("#mobile");
  $(mobile).unbind().click(function() {
    homeButtonClicked = true;
    $('#backArrow').click();
  });

  $('#backArrow').unbind().click(function() {
    // For comments, see function in plusButton()
    var newCoupon = {};
    newCoupon.image = getById("couponImage").src;
    newCoupon.name = getById("name").value;
    newCoupon.description = getById("couponDescription").value;
    newCoupon.count = parseInt(getById("count").value);

    if (!isSameObject(coupon, newCoupon)) {
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
            gtag('event', 'Coupon Changes Discarded', { 'event_category' : 'Book Modification' });
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
      homeButtonClicked ? _this.redirectTo('/dashboard') : showCouponPreview($this);
    }
  });

  showProperButton("editCoupon");
  $('#save').unbind().click(function() {
    if (couponFormIsValid()) {
      updateCoupon(coupon, $this);
      development ? updateTemplate(true) : updateBook(true);
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
  var desc = isBook ? getById("bookDescription") : getById("couponDescription");
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
        if (initial) console.warn("Initial text update, adding small delay to height update...");
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
  var field = isBook ? getById("bookDescription") : getById("couponDescription");

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
  var count = getById("count");

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
       console.warn("Preventing count from going too high. Setting to 99...");
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
  fadeBetweenElements("#bookContent", "#dataPreview");
  gtag('config', googleID, { 'page_title' : 'Book Preview' });
  $("#edit").unbind().click(function() { editBook() });

  $('#backArrow').unbind().click(function() {
    fadeBetweenElements("#dataPreview", "#bookContent");
  });

  getById("imgPreview").src        = book.image;
  getById("namePreview").innerText = book.name;
  getById("descPreview").innerText = book.description;
}

/**
 * Adds click listener to trash can icon in miniPreview.
 */
function addDeleteListeners() {
    // TODO: 'Wait, stop!'

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

            // TODO: Fix the below stuff after moving to separate HTML flow
            // NOTE: This used to not always pull the new data in time for when the
            // user sees the dashboard so the deleted book would still show up, but it's
            // hard to replicate so I don't know if the problem still exists. If noticed 
            // again in the future I'll look further into how to prevent it. Possibly with
            // waiting for a promise or asynchronously running a function or something. 
            goBack();
          },
          Cancel: function() {
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
  var bookId = book.bookId;
  if (bookId) {
    console.warn("Deleting book...");
    $.ajax({
      type: "POST",
      url: "https://www.couponbooked.com/scripts/deleteBook",
      data: { bookId: book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Update Google Analytics with book deletion
        gtag('event', 'Book Deleted', {
          'event_category' : 'Book Modification',
          'event_label' : 'Success'
        });

        SimpleNotification.success({
          text: "Successfully deleted book"
        }, notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in deleteBook:", XMLHttpRequest.responseText);
        gtag('event', 'Book Deleted', {
          'event_category' : 'Book Modification',
          'event_label' : 'Error'
        });

        SimpleNotification.error({
          title: "Error deleting coupon book!",
          text: "Please try again later."
        }, notificationOptions);
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
  var imageSrc = getById("couponImage").src;
  coupon.image = imageSrc.includes("ticket.png") ? "https://couponbooked.com/webapp/images/ticket.png" : imageSrc;

  // Update Google Analytics with coupon creation
  gtag('event', 'Coupon Created', { 'event_category' : 'Book Modification' });

  // Name already validated before this function is called so
  // no need to do it again.
  book.coupons.push(coupon);
  development ? updateTemplate(true) : updateBook(true);
  displaySentBook();
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
  newCoupon.image = getById("couponImage").src;
  for (var i = 0; i < form.length; i++) {
    newCoupon[form[i].name] = form[i].value;
  }

  // Convert from string to number
  newCoupon.count = parseInt(newCoupon.count);

  // Replace Android full URL with a cross-platform local one
  var imageSrc = getById("couponImage").src;
  newCoupon.image = imageSrc.includes("ticket.png") ? "./images/ticket.png" : imageSrc;

  //uploadImage(newCoupon.image, newCoupon);

  // TODO: Consider decomposing
  if (!isSameObject(oldCoupon, newCoupon)) {
      var oldName = oldCoupon.name;
      var newName = newCoupon.name;
      if (newName != oldName && nameAlreadyExists(newName)) {
        newNameWarning();
      } else {
        // Iterate over coupons until the one with the previous name is found
        $.each(book.coupons, function(couponNumber, coupon) {
          if (coupon.name == oldName) {
            coupon = newCoupon;
            book.coupons[couponNumber] = newCoupon;

            $($this).data("coupon", newCoupon);
            displaySentBook();

            // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            // I'm honestly not 100% sure what this line does, but don't touch it
            $(`#bookContent p:contains('${newName}')`).parent()[0].click();

            console.warn("Coupon updated!");
            showCouponPreview($this);

            // Update Google Analytics with coupon update
            gtag('event', 'Coupon Updated', { 'event_category' : 'Book Modification' });

            SimpleNotification.success({
              text: "Updated coupon"
            }, notificationOptions);
          }
        });
      }
  } else {
    // Coupon hasn't been modified
    console.warn("Coupon not modified. Returning...");

    // Lie to the user so they don't get confused
    SimpleNotification.success({
      text: "Updated coupon"
    }, notificationOptions);
  }
}

/**
 * Ensure all the conditions for a valid coupon are met.
 * @returns {boolean} whether or not the form is valid
 */
function couponFormIsValid() {
  var name = getById("name").value;
  var count = getById("count").value;

  // Validate that form is filled out properly
  if (name.length < 1) {
    // No name
    SimpleNotification.warning({
      text: "Please enter a name"
    }, notificationOptions);
  } else if (name.length > 99) {
    // Name too long
    SimpleNotification.warning({
      title: "Name too long",
      text: "Please enter a shorter name"
    }, notificationOptions);
  } else if (isNaN(count) || count < 1 || count > 99) {
    // NOTE: This is legacy code that shouldn't ever run, but leaving
    // it here in case it solves some edge case issue.
    SimpleNotification.warning({
      title: "Invalid count entered",
      text: "Please enter a number between 1 and 99"
    }, notificationOptions);
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
  var image = getById("bookImage");
  var name = getById("bookName").value;
  var desc = getById("bookDescription").value;

  // Validate that form is filled out properly
  if (!image) {
    // image input
    // TODO: Add proper if conditions after creating input field
  } else if (name.length < 1) {
    SimpleNotification.warning({
      text: "Please enter a name"
    }, notificationOptions);
  } else if (name.length > 99) {
    SimpleNotification.warning({
      title: "Name too long",
      text: "Please enter a shorter name"
    }, notificationOptions);
  } else if (desc.length > 280) {
    // TODO: Give an indication of characters used 
    // out of total allowed, like a textArea. Switch?
    SimpleNotification.warning({
      text: "Please enter a shorter description"
    }, notificationOptions);
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
  //console.warn(`showProperButton for ${currentPage}`);

  if ((currentPage == "home" && !book.bookId && !development) || currentPage == "newCoupon") {
    // displaySentBook called last and book not yet created, or a new coupon
    // is being created by the user
    fadeBetweenElements("#save, #delete, #share", "#createButton", true);
  } else if (currentPage == "home") {
    // Book already created but still on displaySentBook page
    var showShareButton = !book.receiver && !book.shareCode && book.bookId;
    fadeBetweenElements("#createButton, #save, #delete", showShareButton ? "#share" : null, true);
  } else if (currentPage == "editBook" || currentPage == "editCoupon") {
    // Save edits to book or coupon;
    // TODO: only show save button once there are changes
    fadeBetweenElements("#createButton, #delete, #share", "#save", true);
  } else if (currentPage == "couponPreview") {
    // For if they want to delete a coupon;
    // TODO: Figure out why the share button is still visible after this
    fadeBetweenElements("#createButton, #save, #share", "#delete", true);
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
  book.bookId = uuid;
  book.hide = 0;

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, senderName: senderName, bookData: JSON.stringify(book) },
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
        updateStats();

        // Update Google Analytics with book creation
        gtag('event', 'Book Creation', {
          'event_category' : 'Book Modification',
          'event_label' : 'Success'
        });

        // Updates the "Create to share" text to the Stripe button on first save 
        _this.redirectTo('/sentBook');
        
        SimpleNotification.success({
          text: "Successfully created book"
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createBook:", XMLHttpRequest.responseText);
      gtag('event', 'Book Creation', {
        'event_category' : 'Book Modification',
        'event_label' : 'Error'
      });

      SimpleNotification.error({
        title: "Error creating book!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });
}

/**
 * Changes book data, meaning name, description, and image.
 * @returns {boolean} whether or not the editing completed successfully.
 * Not the best function name, so sorry, but it is what it is.
 */
function editBookDetails() {
  var oldBook = clone(book);

  // Replace Android full URL with a cross-platform local one
  var imageSrc = getById("bookImage").src;
  oldBook.image = imageSrc.includes("ticket.png") ? "./images/ticket.png" : imageSrc;

  oldBook.name        = getById("bookName").value;
  oldBook.description = getById("bookDescription").value;

  // Even if nothing is changed, we lie to the user so they don't get confused
  SimpleNotification.success({
    text: development ? "Updated template" : "Updated book"
  }, notificationOptions);

  if (!isSameObject(book, oldBook)) {
    // Update Google Analytics with book details edited
    gtag('event', 'Book Details Edited', { 'event_category' : 'Book Modification' });

    return true;
  } else {
    console.warn("Book info not modified. Returning...");
    book = clone(oldBook); // Restore to previous state

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
    data: { bookId: book.bookId, bookData: JSON.stringify(book) },
    crossDomain: true,
    cache: false,
    success: function(success) {
      previousBook = clone(book);
      console.warn("Successfully updated coupon book.");

      // Update Google Analytics with book update
      gtag('event', 'Book Updated', {
        'event_category' : 'Book Modification',
        'event_label' : 'Success',
        'non_interaction': true
      });

      if (!silent) {
        SimpleNotification.success({
          text: "Successfully updated coupon book"
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in updateCouponBook:", XMLHttpRequest.responseText);
      gtag('event', 'Book Updated', {
        'event_category' : 'Book Modification',
        'event_label' : 'Error',
        'non_interaction': true
      });

      // TODO: Think of a good way to resolve bugs for users; some log data saved?
      // IDEA: Have a 'report bug' thing somewhere that includes logs in report; send it where?
        // Theoretically could be one SQL table for bug logs and one for security violations
      SimpleNotification.error({
        // IDEA: Something in error messages about 'sorry for the inconvenience'?
        // Would make them awfully long but seems like a professional thing to do.
        title: "Error updating coupon book!",
        text: "Please try again later."
      }, notificationOptions);
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
  $.each(book.coupons, function(couponNumber, coupon) {
    if (coupon.name == name) {
      nameAlreadyExists = true;
    }
  });

  return nameAlreadyExists;
}

/**
 * Development-only function. Same as updateBook, but for templates.
 * @param {boolean} silent - whether or not a notification should be 
 * displayed on the screen if the function is successful.
 */
function updateTemplate(silent) {
  // TODO: Implement checking like this if it doesn't already exist,
  // or a silent alternative so they aren't bothered and neither is the server:
  /*
    !isSameObject(book, previousBook)
    // Template hasn't been modified
    SimpleNotification.info({
      title: "Development mode",
      text: "You haven't changed anything!"
    }, notificationOptions);
  */

  var userId = localStorage.getItem("user_id");

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/updateTemplate",
    data: { name: book.name.toLowerCase(), templateData: JSON.stringify(book), userId: userId },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      if (success) console.warn("updateTemplate success:", success);
      previousBook = clone(book);

      if (!silent) {
        SimpleNotification.success({
          text: "Successfully updated template"
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      var responseText = XMLHttpRequest.responseText;
      console.error("Error in updateTemplate:", responseText);

      if (responseText.includes("not allowed")) {
        // Unauthorized user trying to update a template
        SimpleNotification.error({
          title: "Unauthorized template update",
          text: "Your violation has been logged."
        }, notificationOptions);
      } else {
        // Generic error
        SimpleNotification.error({
          title: "Error updating template",
          text: "Please try again later."
        }, notificationOptions);
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
  }, notificationOptions);
}