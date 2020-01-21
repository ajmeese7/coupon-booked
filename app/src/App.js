// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
const env = require('../env');
const request = require('request');
const jwt = require('jsonwebtoken');
const Auth0 = require('auth0-js');
const Auth0Cordova = require('@auth0/cordova');

// https://github.com/OneSignal/OneSignal-Cordova-SDK/issues/385
// TODO: Look into adding tests to make more appealing to buyers and
  // to assure nothing breaks in the future

// TODO: Solve https://www.google.com/search?client=firefox-b-1-d&q=uncollapse+all+comments+vscode
  // for after collapse all on file open. That or alternative of collapsing all functions.

var sent = require('./sentBooks.js');
var received = require('./receivedBooks.js');
var helper = require('./helperFunctions.js');
var globalVars = require('./globalVars.js');

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
  darkModeSupport();
}

// IDEA: Make it when you click back from a coupon preview it takes you to where you were scrolled;
  // perhaps with a tags that automatically save id as you scroll with name? Need to handle name updating...
// IDEA: Press and hold coupon to preview it or something to avoid a lot of clicking;
  // Maybe dropdown instead of entire other preview page?
// IDEA: Display book animation on app open, but you have to click it to get it to open then go into app?
  // Still have to redo home page...

/* The characters allowed in the share code and the code length.
 * Needed for createShareCode, redeemCode, and the route. */
var ALPHABET = '23456789abdegjkmnpqrvwxyz';
var ID_LENGTH = 8;

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
        globalVars.nav = helper.getBySelector("#nav");
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
        var loginButton = helper.getBySelector('.btn-login');
        $(loginButton).unbind().click(this.login);
      }
    },
    '/home': {
      id: 'home',
      onMount: function(page) {
        globalVars._this = this;
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
        globalVars._this = this;
        navBar();

        globalVars.backButtonTarget = "/create";
        $('#backArrow').unbind().click(function() {
          globalVars.backButtonTarget ="/home";
          globalVars._this.redirectTo('/dashboard');
        });

        getAllTemplates();
      }
    },
    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_navbar_shrink_scroll
    '/sentBook': {
      id: 'sentBook',
      onMount: function(page) {
        globalVars._this = this;
        navBar();

        sent.displayBook();
        darkModeSupport();
      }
    },
    '/receivedBook': {
      id: 'receivedBook',
      onMount: function(page) {
        globalVars._this = this;
        navBar();

        received.displayBook();
        darkModeSupport();
      }
    },
    // TODO: Speed up loading of books somehow; caching until change?
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        globalVars._this = this;
        navBar();
        pullUserRelatedBooks();

        // Initialize tab menu
        $('#tab-menu').tabs();
        manageTabMenu();

        $('#backArrow').unbind().click(function() {
          globalVars._this.redirectTo('/home');
        });

        // User clicks "Send one now!" and they're redirected to the create route;
        // does the same thing as the plus button
        $('#start, #plus').unbind().click(function() {
          globalVars._this.redirectTo('/create');
        });

        $('#request').unbind().click(function() {
          // TODO: Create a request route similar to /shareCode
          //globalVars._this.redirectTo('/request');
        });

        $('#redeemLink').unbind().click(function() {
          globalVars._this.redirectTo('/redeemCode');
        });
      }
    },
    '/redeemCode': {
      id: 'redeemCode',
      onMount: function(page) {
        globalVars._this = this;
        navBar();
        darkModeSupport();

        // IDEA: Use fadeBetweenElements here instead of another route
        $('#backArrow').unbind().click(function() {
          globalVars._this.redirectTo('/dashboard');
        });

        $('#redeemButton').unbind().click(function() {
          var code = helper.getById("redeemBox").value.toLowerCase();
          if (codeIsValid(code)) {
            redeemCode(code);
          }
        });

        // https://www.outsystems.com/forums/discussion/27816/mobile-max-length-of-input-not-working/#Post101576
        $('#redeemBox').on("input", function (event) {
          if (event.originalEvent.inputType == "insertFromPaste") {
            for (var i = 0; i < this.value.length; i++) {
              var currentChar = this.value.toLowerCase().charAt(i);
              
              if (!ALPHABET.includes(currentChar)) {
                //console.log(`Problematic char: '${currentChar}'`);
                //var before = this.value;
                this.value = this.value.replace(currentChar, '');
                //console.log(`Before: ${before}, after: ${this.value}`);

                // To retest that same character spot since the string shifted now.
                // No out of bounds issue because it's about to i++ in the loop.
                i--;
              }
            }
          } else {
            var currentChar = this.value.toLowerCase().charAt(this.value.length - 1);
            if (!ALPHABET.includes(currentChar)) {
              //console.log(`Problematic char: '${currentChar}'`);
              this.value = this.value.slice(0, this.value.length - 1);
            }
          }

          // Cut length down to desired amount
          if (this.value.length > ID_LENGTH) {
            this.value = this.value.slice(0, 8);
          }
        });
      }
    },
    '/shareCode': {
      id: 'shareCode',
      onMount: function(page) {
        globalVars._this = this;
        navBar();
        darkModeSupport();

        // IDEA: Use fadeBetweenElements here instead of another route
        $('#backArrow').unbind().click(function() {
          globalVars.backButtonTarget = "/dashboard";
          globalVars._this.redirectTo('/sentBook');
        });
        
        // Display tooltip when box or icon is clicked and copy to clipboard
        var tooltip = $(".copytooltip .copytooltiptext");
        $('#copyButton, #shareCodeText').unbind().click(function() {
          cordova.plugins.clipboard.copy($("#shareCodeText").text());
          $(tooltip).finish().fadeTo(400, 1).delay(1500).fadeTo(400, 0);
        });

        helper.getById("shareCodeText").innerText = globalVars.book.shareCode;

        // Display share icon based on platform
        var platform = device.platform;
        var shareIcon = helper.getById("shareIcon");
        (platform == "Android") ? shareIcon.src = "images/md-share.svg" : shareIcon.src = "images/ios-share.svg";

        $("#bigShareButton").unbind().click(function() {
          shareCode();
        });
      }
    },
    '/settings': {
      id: 'settings',
      onMount: function(page) {
        globalVars._this = this;
        navBar();

        // TODO: Mess with https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id
          // to hopefully allow users to edit their data (what for?); use something similar to login functions?
        // IDEA: Permenantly update displayed name for sent books here
        darkModeSupport(true);
        
        // IDEA: Remove from nav dropdown and just have here?
          // Should probably have more pages on dropdown nav
        var logoutButton = helper.getBySelector('.btn-logout');
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

/**
 * Handles everything to do with dark mode.
 * @param {boolean} settingsPage - true for settings page, false for elsewhere
 */
function darkModeSupport(settingsPage) {
  if (settingsPage) {
    // https://stackoverflow.com/a/3263248/6456163
    if (localStorage.getItem('darkMode') == "true") helper.getById("darkCheckbox").click();

    // NOTE: The code in here runs twice; shouldn't be a problem
    var toggle = helper.getById('darkToggle');
    $(toggle).unbind().click(function() {
      var darkMode = helper.getById("darkCheckbox").checked;
      localStorage.setItem('darkMode', darkMode + "");

      setProperMode();
    });
  } else {
    // Set or remove the `dark` and `light` class the first time.
    setProperMode();
  }

  /** Sets dark mode if applicable and light mode if not. */
  function setProperMode() {
    var hideBook = helper.getById("hideBook");
    var copyButton = helper.getById("copyButton");
    var backArrow = helper.getById("backArrow");

    if (localStorage.getItem('darkMode') == "true") {
      setRootProperty('--background-color', 'rgb(15, 15, 15)');
      setRootProperty('--text-color', 'rgb(240, 240, 240)');
      setRootProperty('--topbar-color', '#474747');
      setRootProperty('--tab-color', '#474747');
      setRootProperty('--hr-style', '1px solid rgba(255,255,255,.35)');
      if (hideBook) hideBook.className = "filter-white";
      if (copyButton) copyButton.className = "filter-white";
      if (backArrow) backArrow.className = "filter-white";
    } else {
      setRootProperty('--background-color', '#f9f9f9');
      setRootProperty('--text-color', '#041433');
      setRootProperty('--topbar-color', '#EEEEEE');
      setRootProperty('--tab-color', '#fff');
      setRootProperty('--hr-style', '1px solid rgba(0,0,0,.1)');
      if (hideBook) hideBook.className = "filter-black";
      if (copyButton) copyButton.className = "filter-black";
      if (backArrow) backArrow.className = "filter-black";
    }
  }

  // https://stackoverflow.com/a/37802204/6456163
  function setRootProperty(name, value) {
    document.documentElement.style.setProperty(name, value);
  }
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
      globalVars.book = JSON.parse(localStorage.getItem('book'));
      localStorage.removeItem('book');
      globalVars.book.paymentStatus = success;
      sent.updateBook(true);

      if (success == "succeeded") {
        createShareCode();
      } else {
        // TODO: Proper handling for other occurances
        SimpleNotification.warning({
          title: "Problem processing payment",
          text: "Please try again later."
        }, globalVars.notificationOptions);
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
 * Pulls all the templates from the server and adds them to
 * the create page.
 * TODO: Add ability to create templates somehow; button dependent on
 * dev mode (plus) or on save, possibly?
 */
function getAllTemplates() {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getAllTemplates",
    datatype: "json",
    success: function(data) {
      data = JSON.parse(data);

      // Go over the array of returned data
      $.each(data, function(templateNumber, template) {
        var templateData = JSON.parse(template);

        // Create node and give CSS class that applies styles
        var node = document.createElement('div');
        node.setAttribute("class", "bookPreview");

        // Image and name
        node.innerHTML += `<img class='bookImage' onerror='imageError(this)' src='${templateData.image}' />`;
        node.innerHTML += `<p class='bookName'>${templateData.name}</p>`;

        // https://api.jquery.com/data/
        $(node).data("templateData", templateData);
        helper.getById("buttonContainer").appendChild(node);

        $(node).unbind().click(function() {
          globalVars.book = $(node).data("templateData");
          globalVars.previousBook = helper.clone(globalVars.book);
          globalVars._this.redirectTo('/sentBook');
        });
      });
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in getAllTemplates: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error retreiving templates',
        text: 'Please try again later.'
      }, globalVars.notificationOptions);
    }
  });
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
      url: `http://www.couponbooked.com/scripts/getData?userId=${userId}`,
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
        }, globalVars.notificationOptions);
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
  var applicableElement = isSent ? helper.getById("sent") : helper.getById("received");

  // Create node and give CSS class that applies styles
  var node = document.createElement('div');
  node.setAttribute("class", "bookPreview");

  // Image and name
  node.innerHTML += `<img class='bookImage' onerror='imageError(this)' src='${bookData.image}' />`;
  node.innerHTML += `<p class='bookName'>${bookData.name}</p>`;

  if (isSent) {
    var shareCode = bookData.shareCode;
    if (shareCode) {
      node.innerHTML += `<p class='receiverText'>Code: ${shareCode}</p>`;
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
    globalVars.book = $(this).data("bookData");
    globalVars.book.receiver = $(this).data("receiver");
    globalVars.book.sender = $(this).data("sender");
    globalVars.book.paymentStatus = $(this).data("paymentStatus");
    globalVars.previousBook = helper.clone(globalVars.book);

    // TODO: Add some kind of delay to give content time to load in;
    // IDEA: begin fading #app out, redirect, and start fading new content
    // in after a very slight delay (to fade between routes);
    // Could put in a loading screen for a short period of time
    globalVars.backButtonTarget = "/dashboard";

    var isSent = $(this).data("isSent");
    if (isSent) {
      globalVars._this.redirectTo('/sentBook');
    } else {
      globalVars._this.redirectTo('/receivedBook');
    }
  });
}

/**
 * Generates a share code and adds it to the book's entry 
 * in the database.
 */
function createShareCode() {
  // If this is null, book hasn't been saved yet. Will prompt user to save it.
  // IDEA: Save automatically? Decide later.
  if (globalVars.book.bookId) {
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
        data: { bookId: globalVars.book.bookId, bookData: JSON.stringify(globalVars.book), shareCode: shareCode },
        crossDomain: true,
        cache: false,
        success: function(success) {
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
            }, globalVars.notificationOptions);
          } else if (success == "Share code exists") {
            console.warn("Share code already generated.");
            SimpleNotification.warning({
              text: "Share code already generated."
            }, globalVars.notificationOptions);
          } else {
            console.warn("Share code created successfully:", shareCode);
            // Share code created successfully
            globalVars.book.shareCode = shareCode;

            // So they can go back to dashboard without dealing with confirm prompt;
            // true means it's silent so they don't get a strange notification
            sent.updateBook(true);

            globalVars._this.redirectTo('/shareCode');
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("Error in createShareCode:", XMLHttpRequest.responseText);

          // TODO: Make sure error actually has working timer
          SimpleNotification.error({
            title: "Error creating share code!",
            text: "Please try again later."
          }, globalVars.notificationOptions);
        }
      });
  } else {
    SimpleNotification.info({
      title: "Book isn't saved yet!",
      text: "Please save before sharing."
    }, globalVars.notificationOptions);
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
      }, globalVars.notificationOptions);

      return false;
    }
  } else {
    SimpleNotification.warning({
      title: "Not long enough",
      text: "Please enter your eight digit code."
    }, globalVars.notificationOptions);

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
        }, globalVars.notificationOptions);
      } else if (success == "Sent to self") {
        SimpleNotification.warning({
          title: "This is your code!",
          text: "Please send it to someone else."
        }, globalVars.notificationOptions);
      } else {
        SimpleNotification.success({
          title: "Successfully redeemed code!",
          text: "Check your dashboard."
        }, globalVars.notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCode: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: "Error redeeming code!",
        text: "Please try again later."
      }, globalVars.notificationOptions);
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
    message: `You've been Coupon Booked! Go to www.couponbooked.com to download the app, then redeem your code: ${globalVars.book.shareCode}`,
    //chooserTitle: 'Pick an app', // Android only, you can override the default share sheet title
  };
  var onSuccess = function(result) {
    // On Android result.app since plugin version 5.4.0 this is no longer empty.
    // On iOS it's empty when sharing is cancelled (result.completed=false)
    console.warn("Shared to app:", result.app);
  };
  var onError = function(msg) {
    console.error("Sharing failed with message:", msg);
  };

  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

/**
 * Insert navigation elements into routes requiring them.
 * Redirects to login if user not authenticated.
 */
function navBar() {
  console.warn("navBar...");
  if (globalVars._this.state.authenticated === false) {
    // With this I can remove the login button for nav
    return globalVars._this.redirectTo('/login');
  }

  // Route to home on title or logo click
  var mobile = helper.getBySelector("#mobile");
  $(mobile).unbind().click(function() { globalVars._this.redirectTo('/home') });

  // Only retrieve data if it does not exist in memory; https://auth0.com/docs/policies/rate-limits
  var avatar = helper.getBySelector('.profile-image');
  if (!globalVars.profile) {
    globalVars._this.loadProfile(function(err, _profile) {
      if (err) {
        console.error("Error loading profile: ", err);

        reacquireProfile();
      } else {
        avatar.src = _profile.picture;
        globalVars.profile = _profile;
      }
    });
  } else {
    // IDEA: Switch to localStorage to avoid profile bug? Does that solve the problem, or
    // just give the appearance of solving it?
    avatar.src = globalVars.profile.picture;
  }

  // TODO: See if this can dynamically do dropdowns other than logout to save time in future
  // Dashboard button on dropdown
  var dashboardButton = helper.getBySelector('.dashboard');
  $(dashboardButton).unbind().click(function() { globalVars._this.redirectTo('/dashboard') });

  // Settings button on dropdown
  var settingsButton = helper.getBySelector('.settings');
  $(settingsButton).unbind().click(function() { globalVars._this.redirectTo('/settings') });

  // Logout button on dropdown
  var logoutButton = helper.getBySelector('.logout');
  $(logoutButton).unbind().click( globalVars._this.logout );

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

var tempCounter = 0;
function reacquireProfile() {
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
    globalVars._this.state.accessToken = accessToken;
    globalVars._this.state.authenticated = true; // Should be set, but just in case...

    tempCounter++;
    if (tempCounter < 3) {
      console.log(`navBar re-run attempt #${tempCounter}`);
      navBar();
    }
  });
}

/**
 * Handle swiping for the tab menu.
 */
function manageTabMenu() {
  // Select the tab the user was last on; sent by default;
  // IDEA: Do the full red background styling here for applicable tab
  $('#tab-menu').tabs('select', localStorage.getItem('activeTab'));

  const gestureZone = helper.getById('gestureZone');
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
      sentTab();
      $('#tab-menu').tabs('select', 'sent');
    }
    // Swipe left (select received)
    if (ratio_horizontal < -ratioComparison) {
      receivedTab();
      $('#tab-menu').tabs('select', 'received');
    }
  }

  // Click sent tab
  sentButton.unbind().click(function() {
    sentTab();
  });
  // Click received tab
  receivedButton.unbind().click(function() {
    receivedTab();
  });

  function sentTab() {
    localStorage.setItem('activeTab', 'sent');
    
    sentButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    receivedButton.css('background-color', 'transparent');
    sentButton.css('text-decoration', 'underline');
    receivedButton.css('text-decoration', 'none');
  }
  function receivedTab() {
    localStorage.setItem('activeTab', 'received');

    receivedButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    sentButton.css('background-color', 'transparent');
    receivedButton.css('text-decoration', 'underline');
    sentButton.css('text-decoration', 'none');
  }
}

App.prototype.run = function(id) {
  this.container = helper.getBySelector(id);
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
  // https://documentation.onesignal.com/docs/cordova-sdk#section--removeexternaluserid-
  // TODO: Test logging in and out of devices to make sure notifications still work properly.
  //window.plugins.OneSignal.removeExternalUserId();

  globalVars.profile = null;
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
  var returnTo = `${env.PACKAGE_ID}://${env.AUTH0_DOMAIN}/cordova/${env.PACKAGE_ID}/callback`;
  var url = `https://${env.AUTH0_DOMAIN}/v2/logout?client_id=${env.AUTH0_CLIENT_ID}&returnTo=${returnTo}`;
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
              globalVars._this.redirectTo("/login");
            }
          },
          function(msg) {
            console.log("KO:", JSON.stringify(msg));
          })
    } else {
      window.open(url, '_system');
    }
  })
}

App.prototype.redirectTo = function(route) {
  console.warn(`redirectTo ${route}...`);
  if (!this.state.routes[route]) {
    throw new Error(`Unknown route ${route}.`);
  }
  this.state.currentRoute = route;
  this.render();
};

App.prototype.resumeApp = function() {
  console.log("Please unhide warnings if debugging. Otherwise, you might want to hide them.");
  console.warn("resumeApp...");
  globalVars._this = this;
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
                console.warn("ID token retrieval successful! New ID token:", idToken);
                localStorage.setItem('id_token', idToken);

                var accessToken = body.access_token;
                resolve(accessToken);
              }
            });
          });
        }

        var getNewAccessToken = generateAccessToken();
        getNewAccessToken.then(function(result) {
          console.warn("Access token retrieval successful! New access token:", result);
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
    globalVars._this.state.authenticated = true;
    globalVars._this.state.accessToken = accessToken;
    globalVars._this.render();
  }

  function failedAuth() {
    globalVars._this.state.authenticated = false;
    globalVars._this.state.accessToken = null;
    globalVars._this.render();
  }
};

App.prototype.render = function() {
  //console.warn("render...");
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = helper.getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav
  // TODO: See if possible to just do everything except login, if there's nothing else
  var routes = ["home", "create", "sentBook", "receivedBook", "dashboard", "redeemCode", "shareCode", "settings"];
  if ($.inArray(currRouteId, routes) >= 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(globalVars.nav);

    // NOTE: For some reason putting darkModeSupport() here doesn't work out
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;