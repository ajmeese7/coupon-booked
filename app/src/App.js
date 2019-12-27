// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
const env = require('../env');
const request = require('request');
const jwt = require('jsonwebtoken');
const Auth0 = require('auth0-js');
const Auth0Cordova = require('@auth0/cordova');
const uuidv4 = require('uuid/v4');

function getAllBySelector(arg) {
  return document.querySelectorAll(arg);
}

function getBySelector(arg) {
  return document.querySelector(arg);
}

function getById(id) {
  return document.getElementById(id);
}

function getAllByClassName(className) {
  return document.getElementsByClassName(className);
}

var cleanBuild = false;
function App() {
  // NOTE: Uncomment this to test with all localStorage erased
  //cleanBuild = true;
  if (cleanBuild) {
    console.warn("Wiping local storage...");
    //window.plugins.OneSignal.removeExternalUserId();
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('stripeToken');

    var url = getRedirectUrl();
    openUrl(url);
  }

  this.auth0 = new Auth0.Authentication({
    domain: env.AUTH0_DOMAIN,
    clientID: env.AUTH0_CLIENT_ID
  });
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
}

/** True means book will be published to template database; false is normal */
var development = false;

// TODO: Switch to better close animation when library is updated;
// also transition hacky way of animating to officially supported option (DL new commit)
var notificationOptions = { fadeout: 500, closeButton: false, removeAllOnDisplay: true, duration: 3000 };
// IDEA: Make it when you click back from a coupon preview it takes you to where you were scrolled;
  // perhaps with a tags that automatically save id as you scroll with name? Need to handle name updating...
// IDEA: Press and hold coupon to preview it or something to avoid a lot of clicking;
  // Maybe dropdown instead of entire other preview page?
// IDEA: Display book animation on app open, but you have to click it to get it to open then go into app?
  // Still have to redo home page...

// These are all needed across various functions, so defined in the global scope
var nav, book, previousBook, profile, backButtonTarget, _this; // https://stackoverflow.com/a/1338622
App.prototype.state = {
  authenticated: false,
  accessToken: false,
  currentRoute: '/',
  routes: {
    // TODO: Is it possible to fade between routes like within books instead of the
    // lame instant transition?
    '/': {
      id: 'loading',
      onMount: function(page) {
        console.warn("/ route...");
        nav = getBySelector("#nav");
        createConnection();

        // Don't want to have to code an annoying landscape layout
        screen.orientation.lock('portrait');
        
        if (this.state.authenticated === true) {
          return this.redirectTo('/home');
        } else {
          return this.redirectTo('/login');
        }
      }
    },
    '/login': {
      id: 'login',
      onMount: function(page) {
        console.warn("/login route...");
        if (this.state.authenticated === true) {
          return this.redirectTo('/home');
        }

        // Login button at bottom of page
        var loginButton = getBySelector('.btn-login');
        $(loginButton).unbind().click(this.login);
      }
    },
    '/home': {
      id: 'home',
      onMount: function(page) {
        _this = this;
        navBar();

        // Reset every time the user goes home
        localStorage.setItem('activeTab', 'sent');

        // Theoretically disallows the usage of the same Stripe token twice when
        // it's still stored in the URL; Stripe's API *should* handle this automatically
        // but I'm attempting to avoid relying on that feature.
        var oldStripeToken = localStorage.getItem('stripeToken');
        var url_vars = getUrlVars();
        var newStripeToken = url_vars.stripeToken;
        if (newStripeToken && newStripeToken != oldStripeToken) {
          console.warn("New Stripe token exists and is not equal to old token. Processing payment...");

          localStorage.setItem('stripeToken', newStripeToken);
          handlePayments();
        } else {
          if (newStripeToken) {
            // If not this case then there's no token so shouldn't even worry about it
            console.warn("Same Stripe token! Not processing payment...");
          }
        }
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        _this = this;
        navBar();

        backButtonTarget = "/create";
        $('#backArrow').unbind().click(function() {
          backButtonTarget ="/home";
          _this.redirectTo('/dashboard');
        });

        // Set button height equal to its width because CSS is annoying
        var width = $('button').width();
        $('#buttonContainer button').height(width);

        $('#buttonContainer button').unbind().click(function() {
          // getTemplate handles the redirect to /sentBook
          var name = $(this).text().toLowerCase();
          getTemplate(name);
        });
      }
    },
    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_navbar_shrink_scroll
    '/sentBook': {
      id: 'sentBook',
      onMount: function(page) {
        _this = this;
        navBar();

        displaySentBook();
      }
    },
    '/receivedBook': {
      id: 'receivedBook',
      onMount: function(page) {
        _this = this;
        navBar();

        displayReceivedBook();
      }
    },
    // TODO: Speed up loading of books somehow; caching until change?
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        _this = this;
        navBar();
        pullUserRelatedBooks();

        // Initialize tab menu
        $('#tabs-swipe-demo').tabs();
        manageTabMenu();

        $('#backArrow').unbind().click(function() {
          _this.redirectTo('/home');
        });

        // User clicks "Send one now!" and they're redirected to the create route;
        // does the same thing as the plus button
        $('#start, #plus').unbind().click(function() {
          _this.redirectTo('/create');
        });

        $('#request').unbind().click(function() {
          // TODO: Create a request route similar to /shareCode
          //_this.redirectTo('/request');
        });

        $('#redeemLink').unbind().click(function() {
          _this.redirectTo('/redeemCode');
        });
      }
    },
    '/redeemCode': {
      id: 'redeemCode',
      onMount: function(page) {
        _this = this;
        navBar();

        // IDEA: Use fadeBetweenElements here instead of another route
        $('#backArrow').unbind().click(function() {
          _this.redirectTo('/dashboard');
        });

        $('#redeemButton').unbind().click(function() {
          var code = getById("redeemBox").value.toLowerCase();
          if (codeIsValid(code)) {
            redeemCode(code);
          }
        });

        // https://www.outsystems.com/forums/discussion/27816/mobile-max-length-of-input-not-working/#Post101576
        $('#redeemBox').on("input", function () {
          if (this.value.length > 8) {
            this.value = this.value.slice(0,8);
          }
        });
      }
    },
    '/shareCode': {
      id: 'shareCode',
      onMount: function(page) {
        _this = this;
        navBar();

        // IDEA: Use fadeBetweenElements here instead of another route
        $('#backArrow').unbind().click(function() {
          backButtonTarget = "/dashboard";
          _this.redirectTo('/sentBook');
        });
        
        // Display tooltip when box or icon is clicked and copy to clipboard
        var tooltip = $(".copytooltip .copytooltiptext");
        $('#copyButton, #shareCodeText').unbind().click(function() {
          cordova.plugins.clipboard.copy($("#shareCodeText").text());
          $(tooltip).finish().fadeTo(400, 1).delay(1500).fadeTo(400, 0);
        });

        getById("shareCodeText").innerText = book.shareCode;

        // Display share icon based on platform
        var platform = device.platform;
        var shareIcon = getById("shareIcon");
        (platform == "Android") ? shareIcon.src = "images/md-share.svg" : shareIcon.src = "images/ios-share.svg";

        $("#bigShareButton").unbind().click(function() {
          shareCode();
        });
      }
    },
    '/profile': {
      id: 'profile',
      onMount: function(page) {
        _this = this;
        navBar();

        var avatar = getBySelector('#avatar');
        avatar.src = profile.picture;

        // IDEA: Permenantly update displayed name for sent books here
        var profileCodeContainer = getBySelector('.profile-json');
        profileCodeContainer.textContent = JSON.stringify(profile, null, 4);
        
        var logoutButton = getBySelector('.btn-logout');
        $(logoutButton).unbind().click(this.logout);
      }
    }
  }
};

/**
 * Establish connection with the database so no load times later on.
 */
function createConnection() {
  // NOTE: Follow the guide here to get this to work with the latest software versions -
    // https://forum.ionicframework.com/t/err-cleartext-not-permitted-in-debug-app-on-android/164101/20
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/createConnection",
    datatype: "html",
    success: function(data) {
      console.warn("Successfully established database connection.");
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error establishing connection:", XMLHttpRequest.responseText);
    }
  });
}

// IDEA: Only allow if paymentStatus != "succeeded"
function handlePayments() {
  var url_vars = getUrlVars();

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/stripe",
    data: { stripeToken: url_vars.stripeToken, bookId: url_vars.bookId },
    cache: false,
    success: function(success) {
      console.warn("Payment status:", success);
      book = JSON.parse(localStorage.getItem('book'));
      localStorage.removeItem('book');
      book.paymentStatus = success;
      updateBook(true);

      if (success == "succeeded") {
        createShareCode();
      } else {
        // TODO: Proper handling for other occurances
        SimpleNotification.warning({
          title: "Problem processing payment",
          text: "Please try again later."
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in payment:", XMLHttpRequest.responseText);
      resetUrlVars();
    }
  });
}

// https://stackoverflow.com/a/8845823/6456163
function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for (var i = 0; i < hashes.length; i++) {
    hash = hashes[i].split('=');                        
    vars[hash[0]] = hash[1];
  }
  return vars;
}

/** Removes all variables from the URL to give the window a clean slate. */
function resetUrlVars() {
  var location = window.location.href.substring(0, window.location.href.indexOf('?'));
  window.location = location;
}

/**
 * Retrieve coupon books the user has sent or received and
 * add the applicable HTML to the page.
 */
function pullUserRelatedBooks() {
  // console.warn("pullUserRelatedBooks...");
  var userId = localStorage.getItem('user_id');
  $.ajax({
    type: "GET",
      url: "http://www.couponbooked.com/scripts/getData?userId=" + userId,
      datatype: "json",
      success: function(data) {
        data = JSON.parse(data);

        // Go over sent and received arrays
        $.each(data, function(arrayNumber, array) {
            /** If true, book was sent. If false, it was received. */
            var isSent = arrayNumber == 0;

          // Go over each coupon book in sent {0} or received array {1}
          $.each(array, function(couponNumber, couponBook) {
              if (couponBook) {
                addBookToPage(couponBook, isSent);
              } else {
                // Let the user know there are no books of the specifed type
                  var element = isSent ? $("#noneSent") : $("#noneReceived");
                  if (element.hasClass("hidden")) {
                    element.removeClass("hidden");
                  }
                }
            });
      });
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in pullUserRelatedBooks: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error retreiving info',
          text: 'Please try again later.'
        }, notificationOptions);
      }
  });
}

/**
 * Creates a node, fills it with the data from the retreived
 * book, and appends the node to the document.
 * @param {object} couponBook - the data related to the coupon book
 * @param {boolean} isSent - true for sent book, false for received
 */
function addBookToPage(couponBook, isSent) {
  // console.warn("addBookToPage...");
  var bookData = JSON.parse(couponBook.bookData);
  var applicableElement = isSent ? getById("sent") : getById("received");

  // Create node and give CSS class that applies styles
  var node = document.createElement('div');
  node.setAttribute("class", "bookPreview");

  // Image and name
  node.innerHTML += "<img class='bookImage' src='" + bookData.image + "' />";
  node.innerHTML += "<p class='bookName'>" + bookData.name + "</p>";

  if (isSent) {
    var shareCode = bookData.shareCode;
    if (shareCode) {
      node.innerHTML += "<p class='receiverText'>Code: " + shareCode + "</p>";
    } else {
      // TODO: Make this not move the div up when longer than one line, and instead
      // drop the text while keeping the images level. Temporarily avoided with 
      // ellpises method but people might think that's ugly
      var receiver = couponBook.receiverName;
      node.innerHTML += "<p class='receiverText'>" +
        (receiver ? /*"Sent to " +*/ receiver : "Not sent yet") +
        "</p>";
    }
  } else {
    // Who the book is sent from; should always exist, but failsafe in case it doesn't
    var senderName = couponBook.senderName;
    node.innerHTML += "<p class='senderText'>" +
      (senderName ? /*"Sent from " +*/ senderName : "Sender unavailable") +
      "</p>";
    if (bookData.hide) {
      node.style.display = "none";
    }
  }

  // https://api.jquery.com/data/
  $(node).data("bookData", bookData);
  $(node).data("paymentStatus", couponBook.paymentStatus);
  $(node).data("isSent", isSent);
  $(node).data("receiver", couponBook.receiverName);
  $(node).data("sender", couponBook.senderName);
  applicableElement.appendChild(node);
  addBookListeners(node);
}

/**
 * Assigns click listener to each book preview.
 * @param {element} node - the coupon book preview in the document
 */
function addBookListeners(node) {
  $(node).unbind().click(function() {
    // Set the book in the global scope until another one is selected
    book = $(this).data("bookData");
    book.receiver = $(this).data("receiver");
    book.sender = $(this).data("sender");
    book.paymentStatus = $(this).data("paymentStatus");
    previousBook = clone(book);

    // TODO: Add some kind of delay to give content time to load in;
    // IDEA: begin fading #app out, redirect, and start fading new content
    // in after a very slight delay (to fade between routes);
    // Could put in a loading screen for a short period of time
    backButtonTarget = "/dashboard";

    var isSent = $(this).data("isSent");
    if (isSent) {
      _this.redirectTo('/sentBook');
    } else {
      _this.redirectTo('/receivedBook');
    }
  });
}

/**
 * Takes the current book JSON data and adds it to the page.
 */
function displaySentBook() {
  // TODO: For coupon previews, when one gets too long, have it displayed
  // in rows so the other one is pushed down just as much instead of removing
  // float left and having the columns uneven
  var bookContent = getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = '<button id="plus">+</button>';

  // Create preview of book at top of display
  /* Can have bold display with image and title and everything, then as you scroll
    down it collapses to a fixed nav with image on left and title right and on click
    it scrolls back up to the big info. */
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += "<img id='miniPreviewImage' src='" + book.image + "' />";

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += "<h4 id='bookNamePreview'>" + book.name + "</h4>";

  // Sets receiver text based on the current state of the book
  if (book.receiver) {
    // Book has been sent and code redeemed
    var receiver = "<p class='receiverText'>Sent to " + book.receiver + "</p>";
    previewText.innerHTML += receiver;
  } else if (book.shareCode) {
    // Code generated but not yet redeemed
    var receiver = "<p id='shareCodePreview'>Share code: <span>" + book.shareCode + "</span></p>";
    previewText.innerHTML += receiver;
  } else if (book.bookId) {
    // No share code generated and not sent; only if book has already been
    // saved and bookId has been generated
    var stripeButton = getById("checkoutFormContainer");
    $(stripeButton).attr('class', '');
    previewText.appendChild(stripeButton);
  } else {
    // For when a template is first loaded in; not yet saved
    var receiver = "<p class='receiverText'>Save to share!</p>";
    previewText.innerHTML += receiver;
  }
  
  previewText.innerHTML += "<p id='bookDescriptionPreview'>" + book.description + "</p>";
  miniPreview.appendChild(previewText);

  // https://stackoverflow.com/a/16270807/6456163
  var moreOptions = getById("moreOptions").innerHTML;
  if (device.platform == "iOS") {
    // Changes icons based on platform
    $('#editBook').attr('src', "images/ios-edit.svg");
    $('#deleteBook').attr('src', "images/ios-trash.svg");
  }
  miniPreview.innerHTML += moreOptions;

  bookContent.appendChild(miniPreview);
  bookContent.innerHTML += "<hr>";

  if (book.description != "") {
    // TODO: Test why this looks fine with shareCode and crowded with .receiverText
    getById("bookNamePreview").style.marginBottom = "0px";
  }

  addDeleteListeners();
  sentBookListeners();
}

/**
 * Needed to include the bookId for SQL purposes once the POST
 * request for payment goes through, and this is called right when the 
 * form is pulled up, so it's the perfect way to sneak that data into
 * the request for PHP access via $_POST.
 */
function sneakFormData() {
  // https://stripe.com/docs/payments/accept-a-payment-charges#web-submit-payment
  var form = getById('checkoutForm');
  var hiddenInput = document.createElement('input');
  hiddenInput.setAttribute('type', 'hidden');
  hiddenInput.setAttribute('name', 'bookId');
  hiddenInput.setAttribute('value', book.bookId);
  form.appendChild(hiddenInput);

  localStorage.setItem('book', JSON.stringify(book));
}

/** 
 * Changes the current page to the target assigned in
 * backButtonTarget. 
 * 
 * TODO: Work on decomposing all these helper functions into
 * an imported JS file to keep them out of the way of the 
 * big functions to make this file less crowded.
 */
function goBack() {
  previousBook = null;
  book = null;
  _this.redirectTo(backButtonTarget);
}

/**
 * Returns you to your previous location; asks for confirmation
 * if you have unsaved changes.
 */
function sentBookBackButton() {
  $('#backArrow').unbind().click(function() {
    // If not yet saved, just discards without secondary confirmation.
    if (!isSameObject(book, previousBook) && book.bookId) {
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
function sentBookSaveButton() {
  $('#save').unbind().click(function() {
    if (development) {
        if (!isSameObject(book, previousBook)) {
          console.warn("Updating template...", book);
          updateTemplate();
        } else {
          // Template hasn't been modified
          SimpleNotification.info({
            title: 'Development mode',
          text: 'You haven\'t changed anything!'
        }, notificationOptions);
      }
    } else {
        if (book.bookId) {
          if (!isSameObject(book, previousBook)) {
            console.warn("Updating book...", book);
            updateBook();
          } else {
            // Book hasn't been modified
            SimpleNotification.info({
              text: 'You haven\'t changed anything!'
            }, notificationOptions);
          }
        } else {
          console.warn("Creating book...", book);
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
    fadeBetweenElements("#couponForm", "#bookContent");
    sentBookListeners();
    displaySentBook();
  }

  $('#plus').unbind().click(function() {
    fadeBetweenElements("#bookContent", "#couponForm");

    // Reset form to blank in case it is clicked after editing a coupon
    getById("couponImage").src   = "images/gift.png"; // TODO: Change that once image upload working
    getById("name").value        = "";
    getById("description").value = "";
    getById("count").value       = "";

      // Set edit icon based on platform (iOS or not iOS); default is not iOS icon
      if (device.platform == "iOS") {
        $('#edit img').attr('src', "images/ios-edit.svg");
      }

    // Set back button to take you back to coupon list
    $('#backArrow').unbind().click(function() {
      fadeToBookContent();
    });

    $('#save').unbind().click(function() {
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
function editButton() {
  function fadeToBookContent() {
    fadeBetweenElements("#bookForm", "#bookContent");
    sentBookListeners();
    displaySentBook();
  }

  $("#editBook").unbind().click(function() {
    fadeBetweenElements("#bookContent", "#bookForm");
    limitDescriptionLength(true);
    imageUploadListeners();

    getById("bookImage").src         = book.image;
    getById("bookName").value        = book.name;
    getById("bookDescription").value = book.description;

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
 * TODO: Add development mode support for template image uploading
 * into a separate folder; maybe also allow users to search through
 * (browse) all the templated images
 */
function imageUploadListeners(coupon) {
  // TODO: Add option to reset image to present
  var imageToUpdate = !!coupon ? getById("couponImage") : getById("bookImage");
  var bytes = require('bytes');
  var args = {
      'selectMode': 100,
      'maxSelectCount': 1,
      'maxSelectSize': (bytes.parse("5mb") * 8) // Megabytes to bytes to bits
  };

  $('#bookOpenPhoto, #couponOpenPhoto').unbind().click(function() {
    // TODO: Get uniform cropping; the take photo one is better so try to expand usage
    MediaPicker.getMedias(args, function(image) {
      // Lets the user crop the selected image in a square shape;
      // TODO: Eventually try to make the initial sizing better (100% width)
      // TODO: resize to uniform, i.e. 512x512?
      plugins.crop.promise(image[0].uri, {quality:100})
        .then(function success (newPath) {
          // https://riptutorial.com/cordova/example/23783/crop-image-after-clicking-using-camera-or-selecting-image-
          console.log("Cropped image data:", newPath);

          // TODO: Decide if I still want to do this here or somewhere else
          imageToUpdate.src = newPath;

          // Should I wait until save for this or just roll with it?
          uploadImage(newPath, coupon);
        })
        .catch(function fail (err) {
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

  // TODO: Do something with file names that's more organized than now; could also attach
    // bookId as tags (metadata) to easily link for search purposes
  var options = new FileUploadOptions();
    options.fileKey = "file";
    options.fileName = fileToUploadPath.substr(fileToUploadPath.lastIndexOf('/') + 1);
  var timestamp = Math.floor(Date.now() / 1000);

  // https://support.cloudinary.com/hc/en-us/community/posts/360030104392/comments/360002948811
  var folder = "users/" + localStorage.getItem('user_id') + "/" + (!!coupon ? "coupons" : "books");

  // Add in the params required for Cloudinary
  options.params = {
      api_key: env.CLOUDINARY_KEY,
      timestamp: timestamp,
      folder: folder,
      signature: new Hashes.SHA1().hex('folder=' + folder + '&timestamp=' + timestamp + env.CLOUDINARY_SECRET)
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
        book.image = response.secure_url;
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
  descLength.text(book.description.length + "/" + maxlen);

  // http://form.guide/html-form/html-textarea-maxlength.html
  desc.oninput = function(event) {
    // https://stackoverflow.com/a/5371115/6456163
    var length = desc.value.length;
    if (length >= maxlen) {
      event.preventDefault();

      descLength.text("Max number of characters reached!");
      desc.value = desc.value.substring(0, maxlen);
      length = maxlen;
    } else {
      // Example: 146/180
      descLength.text(length + "/" + maxlen);

      updateHeight(isBook);
    }
  };
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

  field.style.height = height + 'px';

  // NOTE: This works because you can't scroll past the end of the document.
  // Otherwise I'd have to have a variable checking the previous height of the
  // field and if it's different then run this code.
  var lineHeight = parseInt($(field).css('line-height'));
  var y = $(window).scrollTop();
  $(window).scrollTop(y + lineHeight);
}
 
/**
 * The normal listeners for the /sentBook route.
 */
function sentBookListeners() {
  $("#bookDescriptionPreview").unbind().click(function() {
    // IDEA: Add this to the image too, or just view the image in
    // its entirety? Do that option once the preview is opened from here?
    openBookPreview();
  });

  // Will give users the chance again to share their code
  $("#shareCodePreview").unbind().click(function() {
    _this.redirectTo('/shareCode');
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

  sentBookBackButton();
  sentBookSaveButton();
  plusButton();
  editButton();
  createCouponElements(true);
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
 * Displays the received UI for the current book.
 */
function displayReceivedBook() {
  console.warn("displayReceivedBook...");
  var bookContent = getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = "";

  // Dynamically create preview of book at top of display
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += "<img id='miniPreviewImage' src='" + book.image + "' />";

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += "<h4>" + book.name + "</h4>";

  var senderText = "<p class='senderText'>";
  senderText += book.sender ? "Sent from " + book.sender : "Sender unavailable";
  senderText += "</p>";
  previewText.innerHTML += senderText;
  miniPreview.appendChild(previewText);

  // NOTE: These images provided by FontAwesome
  var hideImg = "<img id='hideBook' src='images/eye-";
  hideImg += (book.hide ? "slash-" : "") + "regular.svg' />";
  miniPreview.innerHTML += hideImg;
  
  bookContent.appendChild(miniPreview);
  bookContent.innerHTML += "<hr>";
  
  receivedBookListeners();
}

/**
 * The normal listeners for the /receivedBook route.
 */
function receivedBookListeners() {
  $('#backArrow').unbind().click(function() {
    // NOTE: previousBook probably isn't needed here, but better safe than dead
    previousBook = null;
    book = null;
    _this.redirectTo("/dashboard");
  });

  $('#hideBook').unbind().click(function() {
    var newHideStatus = book.hide ? 0 : 1;
    $(this).attr('src', "images/eye-" + (newHideStatus ? "slash-" : "") + "regular.svg");
    book.hide = newHideStatus;

    $.ajax({
      type: "POST",
      url: "http://www.couponbooked.com/scripts/changeHiddenStatus",
      data: { bookData: JSON.stringify(book), hide: newHideStatus, bookId: book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // NOTE: UI to display hidden books will be implemented when I add the sorting button
        // that allows you to do custom w/ dragging, alphabetical, newest, ect.
        if (book.hide) {
          console.warn("Book is now hidden.");
        } else {
          console.warn("Book no longer hidden.");
        }

        // NOTE: Should I include this or let the icon speak for itself?
        // Also, how do you see hidden books to unhide?
        /*SimpleNotification.success({
          text: "Successfully hid book"
        }, notificationOptions);*/
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error hiding book:", XMLHttpRequest.responseText);
        // TODO: Undo hide action here; shoud literally never run so
        // not making this a priority

        SimpleNotification.warning({
          title: "Error hiding book",
          text: "Please try again later."
        }, notificationOptions);
      }
    });
  });

  createCouponElements();
}

/**
 * Adds coupon data to div and inserts it to page.
 * @param {integer} couponNumber - the location of the current coupon in the array
 * @param {object} coupon - the data for the current coupon
 * @param {boolean} sent - true if sent coupon, false if received
 */
function createCouponElements(sent) {
  // TODO: Figure out how to display image licenses if not paying for yearly subscription
  // TODO: Exclude this file from UglifyJS so I can use template literals
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  $.each(book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += "<img class='couponImage' src='" + coupon.image + "' />";
    node.innerHTML += "<p class='couponName'>" + coupon.name + "</p>";
    node.innerHTML += "<p class='couponCount'>" + coupon.count + " remaining</p>";
    $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      getById("bookContent").appendChild(node);

      if (sent) {
        addSentCouponListeners(node);
      } else {
        addReceivedCouponListeners(node);
      }
  });
}

/**
 * Adds click listeners to the specified sent coupon element.
 * @param {node} node - the coupon element
 */
function addSentCouponListeners(node) {
  $(node).unbind().click(function() {
    /** Allows coupon node to be passed as parameter to functions */
    var $this = this;
    showSentCouponPreview($this);

    $("#edit").unbind().click(function() {
      showCouponEditPage($this);
    });
  });
}

/**
 * Displays the coupon's info when the card is clicked.
 * @param {object} node - the element on the page with the coupon's data attached
 */
function addReceivedCouponListeners(node) {
  $(node).unbind().click(function() {
    fadeBetweenElements("#bookContent", "#couponPreview");

      $('#backArrow').unbind().click(function() {
        fadeBetweenElements("#couponPreview", "#bookContent");
        displayReceivedBook();
      });

      // Updates preview fields with actual coupon's data
      var coupon = $(this).data("coupon");
      getById("imgPreview").src = coupon.image;
    getById("namePreview").innerText = coupon.name + ": " + coupon.count;
    getById("descPreview").innerText = coupon.description;

    // This is here to pass current coupon to redeemCoupon().
    $('#redeemCoupon').unbind().click(function() {
      function onConfirm(buttonIndex) {
        if (buttonIndex == 1) {
            redeemCoupon(coupon);
            $('#backArrow').click();
          }
        }
        
        navigator.notification.confirm(
            "Do you want to redeem this coupon?",
            onConfirm,
            "Redemption confirmation",
            ["Redeem it", "Cancel"]
      );
    });
  });
}

/**
 * If the current coupon count is greater than zero and able to 
 * be redeemed, the count is decremented, the update sent to the 
 * server and saved locally, and a notification is sent to the 
 * book's sender that the coupon has been redeemed.
 * @param {object} coupon - the coupon data for the previewed coupon
 */
function redeemCoupon(coupon) {
  console.warn("Redeeming coupon...");
  if (coupon.count > 0) {
    var userId = localStorage.getItem("user_id");
    $.ajax({
      type: "POST",
      url: "http://www.couponbooked.com/scripts/redeemCoupon",
      data: { bookId: book.bookId, userId: userId, couponName: coupon.name },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Uncomment to debug redeeming coupons
        console.warn("redeemCoupon success:", success);
        
        if (success == "None left") {
          noneLeft();
        } else {
          notifySender(success, coupon);
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in redeemCoupon:", XMLHttpRequest.responseText);

        SimpleNotification.error({
          title: "Error redeeming coupon!",
          text: "Please try again later."
        }, notificationOptions);
      }
    });
  } else {
    noneLeft();
  }

  function noneLeft() {
    SimpleNotification.warning({
      title: "No coupons remaining",
      text: "Try something else or ask for more!"
      // TODO: Decide if this should be an option / how to do
    }, notificationOptions);
  }
}

/**
 * Send OneSignal notification to the sender of the book letting
 * them know who has redeemed what coupon.
 * @param {string} senderId - the user sub of the book's sender
 * @param {element} coupon - the coupon element that is being redeemed
 */
function notifySender(senderId, coupon) {
  var title = getUserName() + " redeemed \"" + coupon.name + "!\"";
  var message = "Coupon description: " + coupon.description; // IDEA: Current count or something?
  var notificationObj = { headings: {en: title},
                          contents: {en: message},
                          include_external_user_ids: [senderId]};
  window.plugins.OneSignal.postNotification(notificationObj,
    function(successResponse) {
      coupon.count--;
      displayReceivedBook();

      console.warn("Notification post success:", successResponse);
      SimpleNotification.success({
        text: "Successfully redeemed coupon"
      }, notificationOptions);
    },
    function (failedResponse) {
      console.error("Notification post failed: ", failedResponse);
      refundCoupon(coupon.name);

      if (failedResponse.errors[0] == "All included players are not subscribed") {
        // IDEA: If error that person doesn't exist, notify them that the 
        // sender has deactivated their account and hide the book or 
        // something and let there be a note in the SQL
        console.log("User no longer exists!");
      }
      
      // Would move this to else statement if I decide to do the above
      SimpleNotification.error({
        title: "Error redeeming coupon",
        text: "Please try again later."
      }, notificationOptions);
    }
  );
}

/**
 * If sending a coupon notification fails after the coupon's count has
 * already been decremented, this will increase the count by one to
 * return it to its previous state.
 * @param {string} couponName - the name of the coupon being refunded
 */
function refundCoupon(couponName) {
  var userId = localStorage.getItem("user_id");
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/refundCoupon",
    data: { bookId: book.bookId, userId: userId, couponName: couponName },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // Uncomment to debug refunding coupons
      //console.warn("refundCoupon success: ", success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCoupon: ", XMLHttpRequest.responseText);

      // IDEA: Create a way to report problems such as this
      /*SimpleNotification.error({
        title: "Error refunding coupon",
        text: "Please report this issue."
      }, notificationOptions);*/
    }
  });
}

/**
 * Hides the `/sentBook` route and shows the preview of the coupon 
 * that was selected. Also adds listeners for going back to `/sentBook`.
 */
function showSentCouponPreview($this) {
  //console.warn("showSentCouponPreview...");
  saveAndDeleteToggle();
  fadeBetweenElements("#bookContent, #couponForm", "#couponPreview");

  $('#backArrow').unbind().click(function() {
    saveAndDeleteToggle();
    fadeBetweenElements("#couponPreview", "#bookContent");

    // Calls this again in case data was updated and needs to be redisplayed
    displaySentBook();
  });

  $('#delete').unbind().click(function() {
    function onConfirm(buttonIndex) {
      if (buttonIndex == 1) {
        // TODO: Fix this not working immediately after displaying a 
        // new template. Error message: "Failed to execute 'appendChild' on 
        // 'Node': parameter 1 is not of type 'Node'.
        var couponNumber = $($this).data("couponNumber");
        book.coupons.splice(couponNumber, 1);
        
        displaySentBook();
        saveAndDeleteToggle();
        fadeBetweenElements("#couponForm, #couponPreview", "#bookContent");
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
  getById("imgPreview").src = coupon.image;
  getById("namePreview").innerText = coupon.name + ": " + coupon.count;
  getById("descPreview").innerText = coupon.description;
}

/**
 * Updates edit page's form with the current coupon data and
 * displays the edit page.
 */
function showCouponEditPage($this) {
  //console.warn("showCouponEditPage...");
  saveAndDeleteToggle();
  fadeBetweenElements("#couponPreview", "#couponForm");

  var coupon = $($this).data("coupon");
  getById("couponImage").src         = coupon.image;
  getById("name").value              = coupon.name;
  getById("couponDescription").value = coupon.description;
  getById("count").value             = coupon.count;

  imageUploadListeners(coupon);
  limitDescriptionLength(false);

  // NOTE: On press, error for reading `image` of undefined... why?
  $('#backArrow').unbind().click(function() {
    // Will show the new data
    showSentCouponPreview($this);
  });

  $('#save').unbind().click(function() {
    if (couponFormIsValid()) {
      updateCoupon(coupon, $this);
      showSentCouponPreview($this);
    }
  });
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
    url: "http://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, senderName: senderName, bookData: JSON.stringify(book) },
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
        _this.redirectTo('/sentBook');
        
        SimpleNotification.success({
          text: "Successfully created book"
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createBook:", XMLHttpRequest.responseText);

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
  var form = $('#bookForm').serializeArray();

 // Can't use previousBook because that's storing it for exiting the page to 
 // check if it has been saved or not. Sorry for the confusion.
  var oldBook = clone(book);
  for (var i = 0; i < form.length; i++) {
    book[form[i].name] = form[i].value;
  }

  if (!isSameObject(book, oldBook)) {
      SimpleNotification.success({
        text: "Updated book"
      }, notificationOptions);

      return true;
  } else {
    console.warn("Book info not modified. Returning...");
    book = clone(oldBook); // Restore to previous state

    SimpleNotification.info({
      text: 'You haven\'t changed anything!'
    }, notificationOptions);

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
    data: { bookId: book.bookId, bookData: JSON.stringify(book) },
    crossDomain: true,
    cache: false,
    success: function(success) {
      previousBook = clone(book);
      console.warn("Successfully updated coupon book.");

      if (!silent) {
        SimpleNotification.success({
          text: "Successfully updated coupon book"
        }, notificationOptions);
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
      }, notificationOptions);
    }
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
      url: "http://www.couponbooked.com/scripts/deleteBook",
      data: { bookId: book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Uncomment to debug deleting books
        //console.warn("deleteBook success: ", success);

        SimpleNotification.success({
          text: "Successfully deleted book"
        }, notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in deleteBook: ", XMLHttpRequest.responseText);

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

  // TODO: Implement image input
  coupon.image = "images/gift.png";

  // Uncomment for debugging coupon creation
  // console.warn("New coupon:", coupon);

  // Name already validated before this function is called so
  // no need to do it again.
  book.coupons.push(coupon);
  displaySentBook();
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

  var newCoupon = {};
  newCoupon.image = oldCoupon.image; // NOTE: Temporary
  for (var i = 0; i < form.length; i++) {
    newCoupon[form[i].name] = form[i].value;
  }

  // Convert from string to number
  newCoupon.count = parseInt(newCoupon.count);

  if (!isSameObject(oldCoupon, newCoupon)) {
      // TODO: Consider decomposing
      var oldName = oldCoupon.name;
      var newName = newCoupon.name;
  if (newName != oldName && nameAlreadyExists(newName)) {
    newNameWarning();
  } else {
    // Iterate over coupons until the one with the previous name is found
    $.each(book.coupons, function(couponNumber, coupon) {
      if (coupon.name == oldName) {
        // Uncomment for debugging coupon updating
            /*console.warn("Old coupon:", oldCoupon);
            console.warn("New coupon:", newCoupon);*/

            // TODO: Check for special character support, i.e. other languages;
              // also in editBookDetails
            coupon = newCoupon;
            book.coupons[couponNumber] = newCoupon;
      
        $($this).data("coupon", newCoupon);
        displaySentBook();
  
        // https://learn.jquery.com/using-jquery-core/faq/how-do-i-pull-a-native-dom-element-from-a-jquery-object/
            $('#bookContent p:contains(' + newName + ')').parent()[0].click();
            
            console.warn("Coupon updated!");
            showSentCouponPreview($this);

            SimpleNotification.success({
              text: "Updated coupon"
            }, notificationOptions);
          }
        });
      }
  } else {
    // Coupon hasn't been modified
    console.warn("Coupon not modified. Returning...");

    SimpleNotification.info({
      text: 'You haven\'t changed anything!'
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
    // Name too long;
    // IDEA: Switch this to textArea-style validation like in book
    SimpleNotification.warning({
      title: "Name too long",
      text: "Please enter a shorter name"
    }, notificationOptions);
  } else if (isNaN(count) || count < 1 || count > 99) {
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
 * If save element is visible, it fades out and the delete
 * element fades in. If not, then the reverse happens.
 */
function saveAndDeleteToggle() {
  var saveShowing = $("#save").is(':visible');
  if (saveShowing) {
    fadeBetweenElements("#save", "#delete");
  } else {
    fadeBetweenElements("#delete", "#save");
  }
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
 * Shows a warning notification that a unique name is required.
 */
function newNameWarning() {
  SimpleNotification.warning({
    title: "Already used this name",
    text: "Please enter a unique name."
  }, notificationOptions);
}

/**
 * Gets the name of the current user. NOTE: May be updated
 * if I switch to using a user-selected name in the future
 * like several TODOs mention.
 * @returns {string}
 */
function getUserName() {
  if (profile.given_name) {
    // Through Google; name should be whole name
    return profile.name;
  } else {
    // Through Auth0; nickname should be first part of email
    return profile.nickname;
  }
}

/**
 * Get the template corresponding to the button the user selects
 * and send the user to the manipulation page. Sets the requested
 * data to the global book variable.
 * @param {string} name - the name of the template to be retreived
 */
function getTemplate(name) {
  console.warn("Getting template '" + name + "'...");
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getTemplate?template=" + name,
    datatype: "html",
    success: function(data) {
      if (data == "") {
        // Should never happen outside of testing, but just in case.
        if (development) {
          function onConfirm(buttonIndex) {
            if (buttonIndex == 1) {
              createTemplate(name);
            } else {
              console.warn("Template '" + name + "' is not being created at this time.");
            }
          }
          
          navigator.notification.confirm(
              "Template doesn't exist yet. Do you want to create it?",
              onConfirm,
              "No applicable template",
              ["Create it", "Not right now"]
          );
        } else {
          SimpleNotification.error({
            title: "No applicable template",
            text: "Please try again."
          }, notificationOptions);
        }
      } else {
        book = JSON.parse(data);

        // Capitalize name; looks better
        var bookName = book.name;
        bookName = bookName.charAt(0).toUpperCase() + bookName.slice(1)
        book.name = bookName;
        previousBook = clone(book);

        _this.redirectTo('/sentBook');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in getTemplate: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: "Error retreiving template!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });
}

/**
 * Development-only function. Meant to aid in the process of creating
 * templates and adding them to the template table in the database.
 * @param {string} name - the name of the template to be created
 */
function createTemplate(name) {
  console.warn("Creating template " + name + "...");
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
        }, notificationOptions);
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
        }, notificationOptions);
      } else {
        // Generic error
        SimpleNotification.error({
          title: "Error creating template",
          text: "Please try again later."
        }, notificationOptions);
      }
    }
  });
}

/**
 * Development-only function. Same as updateBook, but for templates.
 */
function updateTemplate() {
  var userId = localStorage.getItem("user_id");

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateTemplate",
    data: { name: book.name.toLowerCase(), templateData: JSON.stringify(book), userId: userId },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      if (success) {
        console.warn("updateTemplate success:", success);
      }

      previousBook = clone(book);

      SimpleNotification.success({
        text: "Successfully updated template"
      }, notificationOptions);
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

/* The characters allowed in the share code and the code length.
 * Needed for createShareCode and redeemCode. */
var ALPHABET = '23456789abdegjkmnpqrvwxyz';
var ID_LENGTH = 8;

/**
 * Generates a share code and adds it to the book's entry 
 * in the database.
 */
function createShareCode() {
  // If this is null, book hasn't been saved yet. Will prompt user to save it.
  // IDEA: Save automatically? Decide later.
  if (book.bookId) {
      // https://www.fiznool.com/blog/2014/11/16/short-id-generation-in-javascript/
      var shareCode = generateShareCode();
      function generateShareCode() {
        var rtn = '';
        for (var i = 0; i < ID_LENGTH; i++) {
          rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
        return rtn;
      }

      $.ajax({
        type: "POST",
        url: "http://www.couponbooked.com/scripts/createShareCode",
    data: { bookId: book.bookId, bookData: JSON.stringify(book), shareCode: shareCode },
    crossDomain: true,
        cache: false,
        success: function(success) {
          // For debugging purposes
          // console.warn("createShareCode success:", success);

          // NOTE: Should think of better messages here
          if (success == "Code in use") {
        // Try again with a new share code
        console.warn("Share code in use. Generating new code...");
            createShareCode();
          } else if (success == "Receiver exists") {
            // NOTE: Should probably add in headers
            console.warn("Book has already been sent.");
            SimpleNotification.warning({
              // IDEA: Warning symbol for images; yellow might not be enough
              text: "Book has already been sent."
            }, notificationOptions);
          } else if (success == "Share code exists") {
            console.warn("Share code already generated.");
            SimpleNotification.warning({
              text: "Share code already generated."
            }, notificationOptions);
          } else {
            console.warn("Share code created successfully:", shareCode);
            // Share code created successfully
            book.shareCode = shareCode;

            // So they can go back to dashboard without dealing with confirm prompt
            updateBook();

            _this.redirectTo('/shareCode');
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("Error in createShareCode:", XMLHttpRequest.responseText);

          // TODO: Make sure error actually has working timer
          SimpleNotification.error({
            title: "Error creating share code!",
            text: "Please try again later."
          }, notificationOptions);
        }
      });
  } else {
    SimpleNotification.info({
      title: "Book isn't saved yet!",
      text: "Please save before sharing."
    }, notificationOptions);
  }
}

/**
 * Checks if code characters are all within the defined
 * alphabet and if it is the right length.
 * @param {string} shareCode 
 */
function codeIsValid(shareCode) {
  if (shareCode.length == ID_LENGTH) {
    var validCode = true;
    for (var i = 0; i < ID_LENGTH; i++) {
      if (!ALPHABET.includes(shareCode.charAt(i))) {
        validCode = false;
      }
    }

    if (validCode) {
      return true;
    } else {
      SimpleNotification.warning({
        title: "Invalid code",
        text: "Please try again."
      }, notificationOptions);

      return false;
    }
  } else {
    SimpleNotification.warning({
      title: "Not long enough",
      text: "Please enter your eight digit code."
    }, notificationOptions);

    return false;
  }
}

/**
 * Sends code to server to see if it is valid, and redeems it to
 * the current user if it is.
 * @param {string} shareCode the code to be redeemed for access
 * to a coupon book.
 */
function redeemCode(shareCode) {
  var userId = localStorage.getItem("user_id");
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/redeemCode",
    data: { userId: userId, receiverName: getUserName(), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // TODO: Something to prevent spam, i.e. IP limiting
      if (success == "Not valid") {
        SimpleNotification.warning({
          title: "Invalid code",
          text: "Please try again."
        }, notificationOptions);
      } else if (success == "Sent to self") {
        SimpleNotification.warning({
          title: "This is your code!",
          text: "Please send it to someone else."
        }, notificationOptions);
      } else {
        SimpleNotification.success({
          title: "Successfully redeemed code!",
          text: "Check your dashboard."
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCode: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: "Error redeeming code!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });
}

/**
 * Opens native share function of device populated with the coded options.
 */
function shareCode() {
  // TODO: Test on iOS, as site said there may be some special requirements
  var options = {
    // TODO: Display sender name in message -> getUserName()
    subject: "You've been Coupon Booked!", // for email
    message: "You've been Coupon Booked! Go to www.couponbooked.com to download the app, then redeem your code: " + book.shareCode,
    //chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title
  };
  var onSuccess = function(result) {
    // On Android result.app since plugin version 5.4.0 this is no longer empty.
    // On iOS it's empty when sharing is cancelled (result.completed=false)
    console.warn("Shared to app: " + result.app);
  };
  var onError = function(msg) {
    console.error("Sharing failed with message: " + msg);
  };

  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

/**
 * Insert navigation elements into routes requiring them.
 * Redirects to login if user not authenticated.
 */
var tempCounter = 0;
function navBar() {
  console.warn("navBar...");
  if (_this.state.authenticated === false) {
    // With this I can remove the login button for nav
    return _this.redirectTo('/login');
  }

  // Route to home on title or logo click
  var mobile = getBySelector("#mobile");
  $(mobile).unbind().click(function() { _this.redirectTo('/home') });

  // Only retrieve data if it does not exist in memory; https://auth0.com/docs/policies/rate-limits
  var avatar = getBySelector('.profile-image');
  if (!profile) {
    _this.loadProfile(function(err, _profile) {
      if (err) {
        console.error("Error loading profile: ", err);

        var options = {
          method: 'POST',
          url: 'https://couponbooked.auth0.com/oauth/token',
          headers: {'content-type': 'application/x-www-form-urlencoded'},
          form: {
            grant_type: 'refresh_token',
            client_id: env.AUTH0_CLIENT_ID,
            refresh_token: localStorage.getItem('refresh_token')
          }
        };

        request(options, function (error, response, body) {
          if (error) throw new Error(error);

          var accessToken = JSON.parse(response.body).access_token;
          localStorage.setItem('access_token', accessToken);
          _this.state.accessToken = accessToken;
          _this.state.authenticated = true; // Should be set, but just in case...

          tempCounter++;
          if (tempCounter < 3) {
            console.log("navBar re-run attempt #" + tempCounter);
            navBar();
          }
        });
      } else {
        avatar.src = _profile.picture;
        profile = _profile;
      }
    });
  } else {
    // IDEA: Switch to localStorage to avoid profile bug? Does that solve the problem, or
    // just give the appearance of solving it?
    avatar.src = profile.picture;
  }

  // Dashboard button on dropdown
  var dashboardButton = getBySelector('.dashboard');
  $(dashboardButton).unbind().click(function() { _this.redirectTo('/dashboard') });

  // Profile button on dropdown
  var profileButton = getBySelector('.profile');
  $(profileButton).unbind().click(function() { _this.redirectTo('/profile') });

  // Logout button on dropdown
  var logoutButton = getBySelector('.logout');
  $(logoutButton).unbind().click( _this.logout );

  // Profile picture dropdown
  $(".account").unbind().click(function() {
      // TODO: See if it is possible to have the shadow visible before the entire element is unrolled
      // IDEA: Container element?
      if (!$('.submenu').is(':visible')) {
        $(".submenu").slideDown();
      }
  });
  $(document).unbind().mouseup(function() {
    $(".submenu").slideUp();
  });
}

/**
 * Function to fade between elements so it is easy to adjust
 * the timings without changing in multiple places.
 * @param {string} fadeOut - the selector of the element to disappear
 * @param {string} fadeIn - the selector of the element to appear
 */
function fadeBetweenElements(fadeOut, fadeIn) {
  //console.warn("Fading out " + fadeOut + " and fading in " + fadeIn + "...");
  $(fadeOut).fadeOut(150, function() {
    $(fadeIn).fadeIn(400);
  });
}

/**
 * Handle swiping for the tab menu.
 */
function manageTabMenu() {
  // Select the tab the user was last on; sent by default;
  // IDEA: Do the full red background styling here for applicable tab
  $('#tabs-swipe-demo').tabs('select', localStorage.getItem('activeTab'));

  const gestureZone = getById('gestureZone');
  var sentButton = $('#sentButton');
  var receivedButton = $('#receivedButton');
  var touchstartX = 0;
  var touchendX = 0;

  gestureZone.addEventListener('touchstart', function(event) {
      touchstartX = event.changedTouches[0].screenX;
  }, false);

  gestureZone.addEventListener('touchend', function(event) {
      touchendX = event.changedTouches[0].screenX;
      handleGesture();
  }, false);

  // Modified from https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d#gistcomment-2555343
  function handleGesture() {
    // IDEA: Add animation while moving between pages; is this possible with Materialize?
    var ratio_horizontal = (touchendX - touchstartX) / $(gestureZone).width();
    var ratioComparison = .10;

    // Swipe right (select sent)
    if (ratio_horizontal > ratioComparison) {
      localStorage.setItem('activeTab', 'sent');
      $('#tabs-swipe-demo').tabs('select', 'sent');

      sentButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
      receivedButton.css('background-color', 'transparent');
      sentButton.css('text-decoration', 'underline');
      receivedButton.css('text-decoration', 'none');
    }
    // Swipe left (select received)
    if (ratio_horizontal < -ratioComparison) {
      localStorage.setItem('activeTab', 'received');
      $('#tabs-swipe-demo').tabs('select', 'received');

      receivedButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
      sentButton.css('background-color', 'transparent');
      receivedButton.css('text-decoration', 'underline');
      sentButton.css('text-decoration', 'none');
    }
  }

  // Click sent tab
  sentButton.unbind().click(function() {
    localStorage.setItem('activeTab', 'sent');
    sentButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    receivedButton.css('background-color', 'transparent');
    sentButton.css('text-decoration', 'underline');
    receivedButton.css('text-decoration', 'none');
  });
  // Click received tab
  receivedButton.unbind().click(function() {
    localStorage.setItem('activeTab', 'received');
    receivedButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    sentButton.css('background-color', 'transparent');
    receivedButton.css('text-decoration', 'underline');
    sentButton.css('text-decoration', 'none');
  });
}

/**
 * Deep clones specified object to the returned object.
 * Copied from https://stackoverflow.com/a/4460624/6456163 
 * @param {object} item - object to be cloned
 */
function clone(item) {
  if (!item) { return item; } // null, undefined values check

  var types = [ Number, String, Boolean ], 
      result;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function(type) {
      if (item instanceof type) {
          result = type( item );
      }
  });

  if (typeof result == "undefined") {
      if (Object.prototype.toString.call( item ) === "[object Array]") {
          result = [];
          item.forEach(function(child, index, array) { 
              result[index] = clone( child );
          });
      } else if (typeof item == "object") {
          // testing that this is DOM
          if (item.nodeType && typeof item.cloneNode == "function") {
              result = item.cloneNode( true );    
          } else if (!item.prototype) { // check that this is a literal
              if (item instanceof Date) {
                  result = new Date(item);
              } else {
                  // it is an object literal
                  result = {};
                  for (var i in item) {
                      result[i] = clone( item[i] );
                  }
              }
          } else {
              // depending what you would like here,
              // just keep the reference, or create new object
              if (false && item.constructor) {
                  // would not advice to do that, reason? Read below
                  result = new item.constructor();
              } else {
                  result = item;
              }
          }
      } else {
          result = item;
      }
  }

  return result;
}

/**
 * Performs deep object comparison between obj1 and obj2.
 * Shamelessly stolen from https://gist.github.com/nicbell/6081098
 * @param {object} obj1 
 * @param {object} obj2 
 */
function isSameObject(obj1, obj2) {
  // Loop through properties in object 1
  for (var p in obj1) {
      // Check property exists on both objects
      if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;

      switch (typeof (obj1[p])) {
          // Deep compare objects
          case 'object':
              if (!isSameObject(obj1[p], obj2[p])) return false;
              break;
          // Compare function code
          case 'function':
              if (typeof (obj2[p]) == 'undefined' || (p != 'compare' && obj1[p].toString() != obj2[p].toString())) return false;
              break;
          // Compare values
          default:
              if (obj1[p] != obj2[p]) return false;
      }
  }

  // Check object 2 for any extra properties;
  // NOTE: This is problematic when left in tact, but hopefully 
  // removing it won't cause any unintended issues
  /*for (var p in obj2) {
      if (typeof (obj1[p]) == 'undefined') return false;
  }*/
  return true;
};

App.prototype.run = function(id) {
  this.container = getBySelector(id);
  this.resumeApp();
};

App.prototype.loadProfile = function(cb) {
  this.auth0.userInfo(this.state.accessToken, cb);
};

App.prototype.login = function(e) {
  e.target.disabled = true;

  var client = new Auth0Cordova({
    domain: env.AUTH0_DOMAIN,
    clientId: env.AUTH0_CLIENT_ID,
    packageIdentifier: env.PACKAGE_ID
  });

  var options = {
    scope: 'openid profile offline_access',
    audience: env.AUTH0_AUDIENCE
  };
  var self = this;
  client.authorize(options, function(err, authResult) {
    if (err) {
      console.error("Problem with login ->", err);
      return (e.target.disabled = false);
    }

    client.client.userInfo(authResult.accessToken, function(err, user) {
      if (err) {
        console.error("Problem in userInfo():", err);
      } else {
        // Now you have the user's information
        var userId = user.sub;
        console.warn("User sub:", userId);
        localStorage.setItem('user_id', userId);

        // Need to be able to access easily from my server
        window.plugins.OneSignal.setExternalUserId(userId);
      }
    });

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('id_token', authResult.idToken);
    self.resumeApp();
  });
};

// NOTE: This code is pasted into App() and navBar(), so any changes
// made here should be made there as well.
App.prototype.logout = function(e) {
  // TODO: Once decided if going to use this, copy it over to other places;
    // https://documentation.onesignal.com/docs/cordova-sdk#section--removeexternaluserid-
  // window.plugins.OneSignal.removeExternalUserId();
  profile = null;
  localStorage.removeItem('user_id');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');

  // https://auth0.com/authenticate/cordova/auth0-oidc/
  var url = getRedirectUrl();
  openUrl(url);
  this.resumeApp();
};

function getRedirectUrl() {
  var returnTo = env.PACKAGE_ID + '://' + env.AUTH0_DOMAIN + '/cordova/' + env.PACKAGE_ID + '/callback';
  var url = 'https://' + env.AUTH0_DOMAIN + '/v2/logout?client_id=' + env.AUTH0_CLIENT_ID + '&returnTo=' + returnTo;
  return url;
}

function openUrl(url) {
  SafariViewController.isAvailable(function (available) {
    if (available) {
      SafariViewController.show({
            url: url
          },
          function(result) {
            if (result.event === 'opened') {
              console.warn('Opened logout connection...');
            } else if (result.event === 'loaded') {
              console.warn('Logging user out...');
            } else if (result.event === 'closed') {
              console.warn('Logout successful!');
              _this.redirectTo("/login");
            }
          },
          function(msg) {
            console.log("KO: " + JSON.stringify(msg));
          })
    } else {
      window.open(url, '_system');
    }
  })
}

App.prototype.redirectTo = function(route) {
  console.warn("redirectTo " + route + "...");
  if (!this.state.routes[route]) {
    throw new Error('Unknown route ' + route + '.');
  }
  this.state.currentRoute = route;
  this.render();
};

App.prototype.resumeApp = function() {
  console.log("Please unhide warnings if debugging. Otherwise, you might want to hide them.");
  console.warn("resumeApp...");
  _this = this;
  var accessToken = localStorage.getItem('access_token');
  var refreshToken = localStorage.getItem('refresh_token');
  var idToken = localStorage.getItem('id_token');

  if (accessToken) {
    // Verifies the access token is still valid
    var decoded = jwt.decode(idToken);
    var expDate = decoded.exp;
    var currentDate = Math.ceil(Date.now() / 1000);

    // NOTE: To test `expired` code, reverse the direction of the angle bracket
    if (expDate < currentDate) {
        // Token already expired
        console.warn("Tokens expired. Acquiring new tokens using refresh token...");
        
        function generateAccessToken() {
          // https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
          var options = {
            method: 'POST',
            url: 'https://couponbooked.auth0.com/oauth/token',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {
              grant_type: 'refresh_token',
              client_id: env.AUTH0_CLIENT_ID,
              refresh_token: refreshToken
            }
          };

          // Return new promise
          return new Promise(function(resolve, reject) {
            // Gets a new access token using the refresh token
            request(options, function (error, response, body) {
              if (error) {
                reject(error);
              } else {
                var body = JSON.parse(body);
                var idToken = body.id_token;
                console.warn("ID token retrieval successful! New ID token: " + idToken);
                localStorage.setItem('id_token', idToken);

                var accessToken = body.access_token;
                resolve(accessToken);
              }
            });
          });
        }

        var getNewAccessToken = generateAccessToken();
        getNewAccessToken.then(function(result) {
          console.warn("Access token retrieval successful! New access token: " + result);
          localStorage.setItem('access_token', result);
          
          successfulAuth();
        }, function(error) {
          console.log("Retrieval of new access token failed! Setting authentication state to false...");
          console.error(error);

          failedAuth();
        });
    } else {
      console.warn("The tokens are not yet expired.");
      successfulAuth();
    }
  } else {
    console.warn("No access token. Setting authentication state to false...");
    failedAuth();
  }

  function successfulAuth() {
    console.warn("Setting authentication state to true...");
    _this.state.authenticated = true;
    _this.state.accessToken = accessToken;
    _this.render();
  }

  function failedAuth() {
    _this.state.authenticated = false;
    _this.state.accessToken = null;
    _this.render();
  }
};

App.prototype.render = function() {
  //console.warn("render...");
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav; IDEA: Just do everything except login? What else is there?
  var routes = ["home", "create", "sentBook", "receivedBook", "dashboard", "redeemCode", "shareCode", "profile"];
  if ($.inArray(currRouteId, routes) >= 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(nav);
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;