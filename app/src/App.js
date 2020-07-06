// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
const env = require('../env');
const request = require('request');
const jwt = require('jsonwebtoken');
const Auth0 = require('auth0-js');
const Auth0Cordova = require('@auth0/cordova');

// Other local JavaScript files
var sent = require('./sentBooks.js');
var received = require('./receivedBooks.js');
var share = require('./shareBook.js');
var helper = require('./helperFunctions.js');
var globalVars = require('./globalVars.js');

var showLoadingIcon = true;
var cleanBuild = false;
var firstLogin = false;
function App() {
  // NOTE: Uncomment this to test with all localStorage erased
  //cleanBuild = true;
  if (cleanBuild) {
    console.warn("Wiping local storage...");
    window.plugins.OneSignal.removeExternalUserId();
    
    // Have both just in case; either should cut it
    window.localStorage.clear();
    localStorage.clear();
    globalVars.profile = null;

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

App.prototype.state = {
  authenticated: false,
  accessToken: false,
  currentRoute: '/',
  routes: {
    '/': {
      id: 'loading',
      onMount: function(page) {
        // Start new Google Analytics session
        window.ga.trackView('root', '', true);
        globalVars.nav = helper.getBySelector("#nav");
        globalVars.loadingIcon = helper.getBySelector("#loader");

        // Don't want to have to code an annoying landscape layout
        screen.orientation.lock('portrait');
        globalVars._this = this;

        //determineAuthRoute(localStorage.getItem("start_animation") != "true");
        if (this.state.authenticated === true) {
          createConnection();
          getUserInfo();

          return this.redirectTo('/dashboard');
        } else {
          return this.redirectTo('/login');
        }
      }
    },
    '/login': {
      id: 'login',
      onMount: function(page) {
        console.warn("/login route...");

        // TODO: Make this work, because it isn't showing up right now
        window.ga.trackView('Login Page');

        if (this.state.authenticated === true) {
          return this.redirectTo('/dashboard');
        } else {
          firstLogin = true;
        }

        // Login button at bottom of page;
        // TODO: Find a way to remove this like in the webapp
        var loginButton = helper.getBySelector('.btn-login');
        $(loginButton).unbind().click(this.login);
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        window.ga.trackView('Create Book');
        globalVars._this = this;
        navBar();

        globalVars.backButtonTarget = "/create";
        $('#backArrow').unbind().click(function() { globalVars._this.redirectTo('/dashboard') });

        // TODO: When back button is clicked after editing retrieved template,
        // still make sure they want to discard changes

        // TODO: Either add a similar variable to /dashboard here or implement some
        // kind of caching mechanism so they don't have to wait every time for the
        // templates to be retrieved
        this.container.appendChild(globalVars.loadingIcon);
        $("#loader").css("display", "inline-block");
        helper.fadeBetweenElements("#gestureZone, #templateContainer", "", true);
        getAllTemplates();
      }
    },
    '/sentBook': {
      id: 'sentBook',
      onMount: function(page) {
        window.ga.trackView('Sent Book Page');
        globalVars._this = this;
        navBar();

        sent.displayBook();
        share.shareButtonListeners();
        darkModeSupport();
      }
    },
    '/receivedBook': {
      id: 'receivedBook',
      onMount: function(page) {
        window.ga.trackView('Redeem Code Page');

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
        window.ga.trackView('Dashboard');
        globalVars._this = this;
        navBar();

        if (showLoadingIcon) {
          this.container.appendChild(globalVars.loadingIcon);
          helper.fadeBetweenElements("#gestureZone", "", true);
        }

        // Initialize tab menu
        $('#tab-menu').tabs();
        manageTabMenu();
        pullUserRelatedBooks();

        $('#backArrow').unbind().click(function() {
          globalVars._this.redirectTo('/dashboard');
        });

        // User clicks "Send one now!" and they're redirected to the create route
        $('#start').unbind().click(function() {
          globalVars._this.redirectTo('/create');
        });

        helper.getById("request").addEventListener('click', async () => {
          requestBook();
        });

        $('#redeemLink').unbind().click(function() {
          globalVars._this.redirectTo('/redeemCode');
        });
      }
    },
    '/redeemCode': {
      id: 'redeemCode',
      onMount: function(page) {
        window.ga.trackView('Redeem Code Page');

        globalVars._this = this;
        navBar();
        darkModeSupport();

        $('#backArrow').unbind().click(function() { globalVars._this.redirectTo('/dashboard') });
        redeemListeners();
      }
    },
    '/shareCode': {
      id: 'shareCode',
      onMount: function(page) {
        window.ga.trackView('Share Code Page');

        globalVars._this = this;
        navBar();
        darkModeSupport();

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
          share.shareCode();
        });
      }
    },
    '/settings': {
      id: 'settings',
      onMount: function(page) {
        window.ga.trackView('Settings Page');

        globalVars._this = this;
        navBar();

        // Called again to refresh data
        getUserInfo(true);

        formatPhoneNumber(true);
        $("#updatePhoneNumber").unbind().click(function() {
          validatePhoneNumber(true);
        });
        displayNameListeners();
        darkModeSupport(true);
        //animationSetting();
        
        var logoutButton = helper.getBySelector('.btn-logout');
        $(logoutButton).unbind().click(this.logout);
      }
    },
    '/help': {
      id: 'help',
      onMount: function(page) {
        window.ga.trackView('Help Page');

        _this = this;
        navBar();
        darkModeSupport();

        helpFormListeners();
      }
    }
  }
};

/**
 * Decides whether to redirect to the home page or the login page,
 * depending on the current authentication state of the user.
 * @param {boolean} instant - true for zero delay, false for time for 
 * animation to display to the user.
 */
function determineAuthRoute(instant) {
  console.warn("Showing startup animation:", !instant);

  // Gives time for opening animation to run
  setTimeout(function() {
    if (globalVars._this.state.authenticated === true) {
      return globalVars._this.redirectTo('/dashboard');
    } else {
      return globalVars._this.redirectTo('/login');
    }
  }, instant ? 1 : 3500);
}

/**
 * Establish connection with the database so no load times later on.
 */
function createConnection() {
  // NOTE: Follow the guide here to get this to work with the latest software versions -
    // https://forum.ionicframework.com/t/err-cleartext-not-permitted-in-debug-app-on-android/164101/20
  $.ajax({
    type: "GET",
    url: "https://www.couponbooked.com/scripts/createConnection",
    datatype: "html",
    success: function(data) {
      console.warn("Successfully established database connection.");
      window.ga.trackEvent('Connection', 'Connection Established');
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error establishing connection:", XMLHttpRequest.responseText);
      window.ga.trackEvent('Connection', 'Connection Not Established');
    }
  });
}

/**
 * Gets the current user info from the server and updates
 * the contents of the settings page to reflect it.
 * @param {boolean} updatePage - whether the setings page information
 * should be updated on successful data retrieval.
 */
function getUserInfo(updatePage) {
  var userId = localStorage.getItem('user_id');
  if (!userId) return console.error("No user ID! Can't get user info...");
  let iOS = device != "Android" && device != "browser" && device != "Mac OS X";

  $.ajax({
    type: "GET",
    url: `https://www.couponbooked.com/scripts/getUserInfo?userId=${userId}&iOS=${iOS}`,
    datatype: "html",
    success: function(data) {
      if (data) {
        console.warn("Successfully retrieved user info.");
        if (firstLogin) {
          // The initial pull will have failed, so calling the function again
          pullUserRelatedBooks();
          firstLogin = false;
        }

        // Store all the data in localStorage for later use
        data = JSON.parse(data);
        localStorage.setItem("display_name", data.displayName);
        localStorage.setItem("phone_num", data.phoneNumber);
        localStorage.setItem("stats", data.stats);

        addOneSignalId(userId);
        sideMenuInfo();
        if (updatePage) displayUserData();
      } else {
        console.warn("There was no user info to retrieve. Creating data...");
        createUserInfo();
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error retrieving user info:", XMLHttpRequest.responseText);
    }
  });
}

/**
 * Adds user info to mobile sidebar menu.
 */
function sideMenuInfo() {
  helper.getById("sidebarName").innerText = helper.getUserName();
  var stats = JSON.parse(localStorage.getItem("stats")), quip = "Explorer";
  if (stats.sentBooks > stats.receivedBooks) {
    quip = "Giver";
  } else if (stats.createdBooks > stats.sentBooks + 1) {
    quip = "Creator";
  }

  helper.getById("sidebarQuip").innerText = quip;
}

/**
 * Is called by getUserInfo() if there is no data returned from
 * the server for the user. Generates inital data for the user
 * and saves it for later modification.
 */
function createUserInfo() {
  // NOTE: This is the code that will only run on a user's first login, so I
  // call a prompt for their phone number here!
  var userId = localStorage.getItem('user_id');
  if (!userId) return console.error("No user ID! Can't create user info...");
  phoneNumberDialog();

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/createUserInfo",
    data: { userId: userId },
    crossDomain: true,
    cache: false,
    success: function(success) {
      console.warn("Successfully created user info...", success);
      getUserInfo();
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error creating user info:", XMLHttpRequest.responseText);
    }
  });
}

/**
 * Popup prompting for the user's phone number.
 */
function phoneNumberDialog() {
  formatPhoneNumber();
  $( "#phoneForm" ).dialog({
    draggable: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      Cancel: function() {
        $( this ).dialog( "close" );
      },
      "Submit Number": function() {
        validatePhoneNumber();
      }
    }
  });
}

/**
 * Makes sure the phone number is the proper length before
 * calling the function that sends it to the server.
 * @param {boolean} settingsPage - used to determine which input
 * element the listeners should be applied to.
 */
function validatePhoneNumber(settingsPage) {
  let phoneNum = helper.getById(settingsPage ? "phoneNumberInput" : "phoneNumber").value.replace( /\D+/g, '');
  if (phoneNum.length == 10) {
    // Proper length phone number submitted
    addPhoneNumber(phoneNum, settingsPage);
  } else {
    SimpleNotification.warning({
      text: "Please enter all 10 digits!"
    }, globalVars.notificationOptions);
  }
}

/**
 * Modified slightly from https://jsfiddle.net/rafj3md0;
 * intended to make the phone number look properly formatted
 * as the user types it, with some input validation.
 * @param {boolean} settingsPage - used to determine which input
 * element the listeners should be applied to.
 */
function formatPhoneNumber(settingsPage) {
  const isNumericInput = (event) => {
    const key = event.keyCode;
    return ((key >= 48 && key <= 57) || // Allow number line
      (key >= 96 && key <= 105) // Allow number pad
    );
  };

  const isModifierKey = (event) => {
    const key = event.keyCode;
    return (event.shiftKey === true || key === 35 || key === 36) || // Allow Shift, Home, End
      (key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
      (key > 36 && key < 41) || // Allow left, up, right, down
      (
        // Allow Ctrl/Command + A,C,V,X,Z
        (event.ctrlKey === true || event.metaKey === true) &&
        (key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
      )
  };

  // NOTE: This doesn't work on the first key press; why?
  const enforceFormat = (event) => {
    // Input must be of a valid number format or a modifier key, and not longer than ten digits
    if (!isNumericInput(event) && !isModifierKey(event)) {
      event.preventDefault();
    }
  };

  const formatToPhone = (event) => {
    if (isModifierKey(event)) { return; }
    const target = event.target;
    const input = event.target.value.replace(/\D/g,'').substring(0,10); // First ten digits of input only
    const zip = input.substring(0,3);
    const middle = input.substring(3,6);
    const last = input.substring(6,10);
  
    if (input.length > 6) { target.value = `(${zip}) ${middle}-${last}` }
    else if (input.length > 3) { target.value = `(${zip}) ${middle}` }
    else if (input.length > 0) { target.value = `(${zip}` }
  };

  const inputElement = helper.getById(settingsPage ? "phoneNumberInput" : "phoneNumber");
  inputElement.addEventListener('keydown', enforceFormat);
  inputElement.addEventListener('keyup', formatToPhone);
}

/**
 * Uploads the user's phone number to the server.
 * @param {string} phoneNum 
 * @param {boolean} settingsPage - used to determine what the
 * successful notification should say.
 */
function addPhoneNumber(phoneNum, settingsPage) {
  var userId = localStorage.getItem('user_id');
  if (!userId) return console.error("No user ID! Can't add phone number...");

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/addUserPhoneNumber",
    data: { userId: userId, phone_num: phoneNum },
    crossDomain: true,
    cache: false,
    success: function(data) {
      console.warn("Phone number added to user account!", data);
      SimpleNotification.success({
        text: `Phone number ${settingsPage ? "updated!" : "received!"}`
      }, globalVars.notificationOptions);

      $( "#phoneForm" ).dialog( "close" );
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error adding phone number:", XMLHttpRequest.responseText);
      SimpleNotification.error({
        title: "Error adding phone number",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  });
}

/**
 * Takes the user's stats and adds them to the settings page.
 */
function displayUserData() {
  // Put current display name in settings page input
  var displayName = localStorage.getItem("display_name"),
      phoneNumber = localStorage.getItem("phone_num");
  if (helper.displayNameExists()) {
    // Stringified null would be put in the input box otherwise
    $("#displayNameInput").val(displayName);
  }

  // '> 4' prevents null from being displayed, because that happens for some reason
  if (phoneNumber && phoneNumber.length > 4) {
    // Format the number before displaying in input
    let zip = phoneNumber.substring(0,3);
    let middle = phoneNumber.substring(3,6);
    let last = phoneNumber.substring(6,10);
    $("#phoneNumberInput").val(`(${zip}) ${middle}-${last}`);
  }

  // Update all the individual stats elements
  var stats = JSON.parse(localStorage.getItem("stats"));
  helper.getById("createdBooks").innerText += ` ${stats.createdBooks}`;
  helper.getById("sentBooks").innerText += ` ${stats.sentBooks}`;
  helper.getById("receivedBooks").innerText += ` ${stats.receivedBooks}`;
  helper.getById("redeemedCoupons").innerText += ` ${stats.redeemedCoupons}`;

  // TODO: Still need to either do this one or get rid of it
  helper.getById("fulfilledCoupons").innerText += ` ${stats.fulfilledCoupons}`;
}

/**
 * Add user's OneSignal ID to the database.
 */
function addOneSignalId(userId) {
  // Not 100% accurate, but should detect when OneSignal notifications aren't supported
  let OS = device.platform;
  let iOS = OS != "Android" && OS != "browser" && OS != "Mac OS X";

  window["plugins"].OneSignal.getIds(function (state) {
    localStorage.setItem('onesignal_id', state.userId);
    $.ajax({
        type: "POST",
        url: "https://www.couponbooked.com/scripts/addOneSignalUserId",
        data: { userId: userId, onesignalId: state.userId, iOS: iOS },
        crossDomain: true,
        cache: false,
        success: function(success) {
          console.warn("Successfully set user's OneSignal ID...", success);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("Error setting OneSignal ID:", XMLHttpRequest.responseText);
        }
    });
  }, err => {
      console.error("Error getting user's OneSignal ID:", err);
  });
}

/**
 * Takes the name the user entered in the field on the settings
 * page and sets it in localStorage for display purposes.
 */
function displayNameListeners() {
  // Listen for clicking of update button
  $("#updateDisplayName").unbind().click(function() {
    var newName = helper.getById("displayNameInput").value;
    var updateName = true;
    if (newName.length > 30) {
      SimpleNotification.warning({
        title: "Name too long",
        text: "Please enter a shorter name."
      }, globalVars.notificationOptions);
      updateName = false;
    } else if (newName == "") {
      window.ga.trackEvent('Display Name', 'Display Name Reset');

      SimpleNotification.info({
        title: "No name entered",
        text: "Using default username from now on."
      }, globalVars.notificationOptions);

      localStorage.setItem("display_name", "");
    } else {
      window.ga.trackEvent('Display Name', 'Display Name Updated');

      SimpleNotification.success({
        text: "Display name updated"
      }, globalVars.notificationOptions);

      localStorage.setItem("display_name", newName);
    }

    // If there isn't a problem like "name too long", the update function will be called
    if (updateName) updateDisplayName(newName);
  });
}

/**
 * Sends the updated display name to the server. In the future
 * this function will also send updates to other settings, but
 * none of those have been implemented yet.
 * @param {string} newName - the name to replace the display name
 * with; null if no display name
 */
function updateDisplayName(newName) {
  var userId = localStorage.getItem('user_id');
  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/updateDisplayName",
    data: { userId: userId, displayName: newName },
    crossDomain: true,
    cache: false,
    success: function(success) {
      console.warn("Successfully updated display name...");
      localStorage.setItem("display_name", newName);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      // TODO: Need to think of an elegant way to show user that it failed,
      // but I'll have to get fancy with all the above notifications and
      // I honestly just don't want to do that right now.
      console.error("Error in updateDisplayName:", XMLHttpRequest.responseText);
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
    if (localStorage.getItem("darkMode") == "true") helper.getById("darkCheckbox").click();

    // NOTE: The code in here runs twice; shouldn't be a problem
    var toggle = helper.getById("darkToggle");
    $(toggle).unbind().click(function() {
      var darkMode = helper.getById("darkCheckbox").checked;
      localStorage.setItem("darkMode", darkMode + "");

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

/**
 * Helps display the toggle for startup animation and modify
 * the localStorage variable when the toggle is modified.
 */
function animationSetting() {
  if (localStorage.getItem("start_animation") == "true") helper.getById("animationCheckbox").click();

  // NOTE: The code in here runs twice; shouldn't be a problem
  var toggle = helper.getById("animationToggle");
  $(toggle).unbind().click(function() {
    var animation = helper.getById("animationCheckbox").checked;
    console.log("Animation state changing to " + animation + "...")
    localStorage.setItem("start_animation", animation + "");
  });
}

/**
 * Pulls all the templates from the server.
 */
function getAllTemplates() {
  $.ajax({
    type: "GET",
    url: "https://www.couponbooked.com/scripts/getAllTemplates",
    datatype: "json",
    success: function(data) {
      data = JSON.parse(data);
      processTemplates(data);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in getAllTemplates:", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error retreiving templates',
        text: 'Please try again later.'
      }, globalVars.notificationOptions);

      // Only way you can get to the create route, so easy to send them back
      globalVars._this.redirectTo("/dashboard");
    }
  });
}

/**
 * Iterate over templates and display them on the /create route.
 * @param {object} data - the parsed JSON retrieved from the
 * getAllTemplates PHP script
 */
function processTemplates(data) {
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
    helper.getById("templateContainer").appendChild(node);

    // TODO: Instead of applying this to the node, somehow only do it to the image
    $(node).unbind().click(function() {
      globalVars.book = $(node).data("templateData");
      globalVars.previousBook = helper.clone(globalVars.book);
      globalVars._this.redirectTo('/sentBook');
    });
  });

  hideLoadingIcon(true);
}

/**
 * Retrieve coupon books the user has sent or received.
 */
function pullUserRelatedBooks() {
  showLoadingIcon = true;
  var userId = localStorage.getItem('user_id');
  if (!userId) return console.error("No user ID! Can't pull user related books...");

  $.ajax({
    type: "GET",
      url: `https://www.couponbooked.com/scripts/getData?userId=${userId}`,
      datatype: "json",
      success: function(data) {
        data = JSON.parse(data);
        processPulledData(data);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in pullUserRelatedBooks:", XMLHttpRequest.responseText);

        // TODO: Stop error being thrown when clicking logo
        SimpleNotification.error({
          title: 'Error reaching server',
          text: 'Please try again later.'
        }, globalVars.notificationOptions);
      }
  });
}

/**
 * Add the applicable HTML to the page for pulled books.
 * @param {object} data - the parsed JSON retrieved from the
 * getData PHP script
 */
function processPulledData(data) {
  // Go over sent and received arrays
  $.each(data, function(arrayNumber, array) {
    /** If true, book was sent. If false, it was received. */
    var isSent = arrayNumber == 0;

    // If there are coupons for the category
    if (array.length != 0) {
      // Go over each coupon book in sent {0} or received array {1}
      $.each(array, function(couponNumber, couponBook) {
        if (couponBook) {
          addBookToPage(couponBook, isSent);
        } else {
          console.log("Showing that user doesn't have any books. They could be new, or something really bad could've happened...");
          unhideMessage(isSent);
        }
      });
    } else {
      unhideMessage(isSent);
    }
  });

  hideLoadingIcon();
}

/**
 * Switches from the loading icon to the normal content
 * after a short delay, depending on the calling route.
 * @param {boolean} templatesPage - whether /create or /dashboard
 */
function hideLoadingIcon(templatesPage) {
  showLoadingIcon = false;
  
  setTimeout(function() {
    helper.fadeBetweenElements("#loader", "#gestureZone, #templateContainer");
  }, templatesPage ? 750 : 950);
}

/**
 * Let the user know there are no books of the specifed type.
 * @param {boolean} isSent - true if sent page, false if received
 */
function unhideMessage(isSent) {
  var element = isSent ? $("#noneSent") : $("#noneReceived");
  if (element.hasClass("hidden")) {
    element.removeClass("hidden");
  }
}

/**
 * Creates a node, fills it with the data from the retreived
 * book, and appends the node to the document.
 * @param {object} couponBook - the data related to the coupon book
 * @param {boolean} isSent - true for sent book, false for received
 */
function addBookToPage(couponBook, isSent) {
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
  }

  // https://api.jquery.com/data/
  $(node).data("bookData", bookData);
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
 * Adds the listeners for the help route.
 */
function helpFormListeners() {
  var userId = localStorage.getItem("user_id");
  $("#submit").unbind().click(function(event) {
    event.preventDefault();

    // TODO: Properly grab new lines from subject
    var form = $('#helpForm').serializeArray();
    var formData = {};
    for (var i = 0; i < form.length; i++) {
      formData[form[i].name] = form[i].value;
    }

    // TODO: Client side verification before submission
    $.ajax({
      type: "POST",
      url: "https://www.couponbooked.com/scripts/form_submit",
      data: { userId: userId, formData: JSON.stringify(formData) },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // TODO: Finish the pagination for the dashboard
        window.ga.trackEvent('Form Submission', 'Help Form Submitted', formData.topic);

        // TODO: Show them a notification or fade the form into a success text or something
        SimpleNotification.success({
          text: "Form successfully submitted"
        }, globalVars.notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error with form submission:", XMLHttpRequest.responseText);
        window.ga.trackEvent('Form Submission', 'Help Form Submitted', 'Error');

        SimpleNotification.error({
          title: "Error submitting form",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    });
  });
}

/**
 * Makes sure the stuff entered falls within the defined parameters.
 */
function redeemListeners() {
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
        
        if (!share.ALPHABET.includes(currentChar)) {
          this.value = this.value.replace(currentChar, '');

          // To retest that same character spot since the string shifted now.
          // No out of bounds issue because it's about to i++ in the loop.
          i--;
        }
      }
    } else {
      var currentChar = this.value.toLowerCase().charAt(this.value.length - 1);
      if (!share.ALPHABET.includes(currentChar)) {
        this.value = this.value.slice(0, this.value.length - 1);
      }
    }

    // Cut length down to desired amount
    if (this.value.length > share.ID_LENGTH) {
      this.value = this.value.slice(0, 8);
    }
  });
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
    url: "https://www.couponbooked.com/scripts/redeemCode",
    data: { userId: userId, receiverName: helper.getUserName(), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      handleSuccess(success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCode: ", XMLHttpRequest.responseText);
      window.ga.trackEvent('Redemption', 'Share Code Redeemed', 'Error');

      SimpleNotification.error({
        title: "Error redeeming code!",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  });

  function handleSuccess(success) {
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
      window.ga.trackEvent('Redemption', 'Share Code Redeemed', 'Success');

      SimpleNotification.success({
        title: "Successfully redeemed code!",
        text: "Check your dashboard."
      }, globalVars.notificationOptions);

      // Update received book stats
      var stats = JSON.parse(localStorage.getItem("stats"));
      stats.receivedBooks++;
      localStorage.setItem("stats", JSON.stringify(stats));
      helper.updateStats();
    }
  }
}

/**
 * Checks if code characters are all within the defined
 * alphabet and if it is the right length.
 * @param {string} shareCode 
 */
function codeIsValid(shareCode) {
  if (shareCode.length == share.ID_LENGTH) {
    var validCode = true;
    for (var i = 0; i < share.ID_LENGTH; i++) {
      if (!share.ALPHABET.includes(shareCode.charAt(i))) {
        validCode = false;
      }
    }

    // NOTE: Immediate input checking prevents this from ever running,
    // so it would probably be safe to remove it.
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
 * shareCode but requesting a book; just changed the contents.
 * TODO: Have a button to call this always, not just when you
 * don't have any received books.
 */
function requestBook() {
  var userName = helper.getUserName(), messageStart = "";
  if (userName) {
    // NOTE: This can probably be improved. Think on it
    messageStart = `Your friend ${userName} wants a Coupon Book! `;
  }

  var options = {
    subject: "Send a Coupon Book!",
    message: `${messageStart}Go to https://couponbooked.com/webapp to send a Book now!`
  };

  // TODO: Work on adding a dedicated Snapchat share like Spotify does
  var onSuccess = function(result) {
    console.log("Shared to app:", result.app);
    window.ga.trackEvent('Book Sharing', 'Book Requested', 'Cordova Implementation');
  };
  var onError = function(msg) {
    console.error("Sharing failed with message:", msg);
    window.ga.trackEvent('Book Sharing', 'Book Requested', 'Error');
  };

  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

/**
 * Insert navigation elements into routes requiring them.
 * Redirects to login if user not authenticated.
 */
function navBar() {
  if (globalVars._this.state.authenticated === false) {
    return globalVars._this.redirectTo('/login');
  }

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
        sideMenuInfo();
      }
    });
  } else {
    avatar.src = globalVars.profile.picture;
  }

  $("#mobile").unbind().click(function() { globalVars._this.redirectTo('/dashboard'); });

  // TODO: Make this all programmatic
  $(".dashboard").unbind().click(function() {
    toggleMobileMenu();
    globalVars._this.redirectTo('/dashboard');
  });
  $(".create").unbind().click(function() {
    toggleMobileMenu();
    globalVars._this.redirectTo('/create');
  });
  $(".redeem").unbind().click(function() {
    toggleMobileMenu();
    globalVars._this.redirectTo('/redeemCode');
  });
  $(".settings").unbind().click(function() {
    toggleMobileMenu();
    globalVars._this.redirectTo('/settings');
  });
  $(".help").unbind().click(function() {
    toggleMobileMenu();
    globalVars._this.redirectTo('/help');
  });

  // Mobile menu will slide open on icon click
  $("#sideMenuIcon, .contentShadow").unbind().click(function() {
    toggleMobileMenu();
  });
}

function toggleMobileMenu() {
  helper.toggleClass(document.querySelector('.mobileSideMenu'), 'mobileSideMenu--open');
  helper.toggleClass(document.querySelector('.contentShadow'), 'contentShadow--open');
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
  // Select the tab the user was last on; sent by default
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

  // TODO: Replicate behavior of color fading away when tab clicked off of,
  // i.e. when the user is scrolling down the page
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
        localStorage.setItem('user_id', userId);
        window.ga.setUserId(userId);

        // Called here once user ID is 100% valid
        getUserInfo();

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

  // Have both just in case; either should cut it
  window.localStorage.clear();
  localStorage.clear();
  localStorage.removeItem('user_id');
  globalVars.profile = null;

  // https://auth0.com/authenticate/cordova/auth0-oidc/
  var url = getRedirectUrl();
  openUrl(url);
  this.state.authenticated = false;
  globalVars._this.state.authenticated = false;
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
  //console.warn(`redirectTo ${route}...`);
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
  var idToken = localStorage.getItem('id_token');

  if (accessToken) {
    // Verifies the access token is still valid
    var decoded = jwt.decode(idToken);
    var expDate = decoded.exp;
    var currentDate = Math.ceil(Date.now() / 1000);

    // NOTE: To test `expired` code, reverse the direction of the angle bracket
    if (expDate < currentDate) {
      console.warn("Tokens expired. Acquiring new tokens using refresh token...");
      handleExpiredToken();
    } else {
      console.warn("The tokens are not yet expired.");
      successfulAuth(accessToken);
    }
  } else {
    console.warn("No access token. Setting authentication state to false...");
    failedAuth();
  }
};

/**
 * Generates a new access token and attemprs to reauthenticate
 * with it.
 */
function handleExpiredToken() {
  var getNewAccessToken = generateAccessToken();
  getNewAccessToken.then(function(result) {
    console.warn("Access token retrieval successful!"); // New access token:", result
    localStorage.setItem('access_token', result);
    
    successfulAuth(result);
  }, function(error) {
    // NOTE: This is broken now! Look into fixing somehow...
    console.log("Retrieval of new access token failed! Setting authentication state to false...");
    console.error(error);

    failedAuth();
  });
}

/**
 * Uses the local refresh token from Auth0 to request a new
 * access token for the user.
 */
function generateAccessToken() {
  var refreshToken = localStorage.getItem('refresh_token');
  
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
        console.warn("ID token retrieval successful!"); // New ID token:", idToken
        localStorage.setItem('id_token', idToken);

        var accessToken = body.access_token;
        resolve(accessToken);
      }
    });
  });
}

function successfulAuth(accessToken) {
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

App.prototype.render = function() {
  //console.warn("render...");
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = helper.getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav
  var nonNavRoutes = ["login", "loading"];
  if ($.inArray(currRouteId, nonNavRoutes) < 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(globalVars.nav);

    // NOTE: For some reason putting darkModeSupport() here doesn't work out
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;