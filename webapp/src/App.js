// Starts the app when called in index.js
function App() {
  this.auth0 = new auth0.WebAuth({
    domain: "couponbooked.auth0.com",
    clientID: "6XFstRMqF3LN5h24Tooi22h1BMHCdnjh",
    packageIdentifier: "com.couponbooked.app"
  });

  this.logout = this.logout.bind(this);
  darkModeSupport();
}

var showLoadingIcon = true;
App.prototype.state = {
  authenticated: false,
  accessToken: false,
  currentRoute: '/',
  routes: {
    '/': {
      id: 'loading',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'root', 'page_path' : '/' });
        nav = getBySelector("#nav");
        loadingIcon = getBySelector("#loader");
        _this = this;

        // NOTE: If I want to, can always go back and replace startup animation code from app.
        if (this.state.authenticated === true) {
          // Only try to create the connection once authenticated, since login route
          // takes them away from my site anyways. Unless I bring login screen in-house...
          createConnection();
          getUserInfo();

          // To check if directed here by the successful payments page
          var url_vars = getUrlVars();
          if (url_vars.shared && url_vars.bookId) {
            handlePayments();
          }

          return this.redirectTo('/dashboard');
        } else {
          return this.redirectTo('/login');
        }
      }
    },
    '/login': {
      id: 'login',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Login Page', 'page_path' : '/login' });

        console.warn("/login route...");
        if (this.state.authenticated === true) {
          return this.redirectTo('/dashboard');
        } else {
          // Show loading screen while waiting for redirect
          if (loadingIcon) this.container.appendChild(loadingIcon);
          console.warn("Trying to redirect to Auth0 login...");

          // Authentication
          var client = new auth0.WebAuth({
            domain: "couponbooked.auth0.com",
            clientID: "6XFstRMqF3LN5h24Tooi22h1BMHCdnjh",
            packageIdentifier: "com.couponbooked.app"
          });

          client.authorize({
            scope: "openid profile",
            responseType: 'code token id_token',
            audience: "https://couponbooked.auth0.com/userinfo",
            redirectUri: "https://couponbooked.com/webapp/callback"
          });
        }
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Create Book', 'page_path' : '/create' });

        _this = this;
        navBar();

        backButtonTarget = "/create";
        $('#backArrow').unbind().click(function() { _this.redirectTo('/dashboard') });

        this.container.appendChild(loadingIcon);
        $("#loader").css("display", "inline-block");
        fadeBetweenElements("#gestureZone, #templateContainer", "", true);
        getAllTemplates();
      }
    },
    '/sentBook': {
      id: 'sentBook',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Sent Book Page', 'page_path' : '/sentBook' });

        _this = this;
        navBar();

        displaySentBook();
        darkModeSupport();

        // pk_test_EAwuFkepc11nHEyPnzAH2XF600aoA16vHm
        var stripe = Stripe("pk_live_I0WlDMmpJNIVTFLhWJQj551C00ymlegiCt");
        var share = document.querySelector("#share");
        share.addEventListener("click", function () {
          // To access the current book after redirect, i.e. preventing requiring
          // retrieving the data again. Ideally I can set the succeeded flag on
          // redirect and avoid all this, but we'll see how that goes.
          localStorage.setItem("book", JSON.stringify(book));

          stripe.redirectToCheckout({
            items: [{
              sku: "sku_H2MwwLWIIYdV4M", // test: sku_H2NWOmtSCuAH2l
              quantity: 1
            }],
            successUrl: `https://couponbooked.com/webapp/success?shared=true&bookId=${book.bookId}`,
            cancelUrl: "https://couponbooked.com/webapp/index",
          }).then(function (result) {
            // TODO: Do something similar to example on products page for error handling
            console.log("Result:", result);
            if (result.error.message) console.error("Error with payment =>", result.error.message);
          });
        });
      }
    },
    '/receivedBook': {
      id: 'receivedBook',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Received Book Page', 'page_path' : '/receivedBook' });

        _this = this;
        navBar();

        displayReceivedBook();
        darkModeSupport();
      }
    },
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Dashboard', 'page_path' : '/dashboard' });
        gtag('config', googleID, { 'user_id': localStorage.getItem("user_id") });  

        _this = this;
        navBar();

        if (showLoadingIcon) {
          this.container.appendChild(loadingIcon);
          fadeBetweenElements("#gestureZone", "", true);
        }
        pullUserRelatedBooks();

        // Initialize tab menu
        $('#tab-menu').tabs();
        manageTabMenu();

        $('#backArrow').unbind().click(function() {
          _this.redirectTo('/dashboard');
        });

        // User clicks "Send one now!" and they're redirected to the create route
        $('#start').unbind().click(function() {
          _this.redirectTo('/create');
        });

        getById("request").addEventListener('click', async () => {
          if (navigator.share) {
            requestBook();
          } else {
            gtag('event', 'Book Requested', {
              'event_category' : 'Book Sharing',
              'event_label' : 'Email Implementation'
            });

            // For now, if the share API isn't supported, it just opens the default
            // email client with the specified contents
            var subject = "I want a gift!";
            var emailBody = "I want a Coupon Book! Go to https://couponbooked.com/webapp to make me something special :)";
            document.location = "mailto:?subject="+subject+"&body="+emailBody;
          }
        });

        $('#redeemLink').unbind().click(function() {
          _this.redirectTo('/redeemCode');
        });
      }
    },
    '/redeemCode': {
      id: 'redeemCode',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Redeem Code Page', 'page_path' : '/redeemCode' });

        _this = this;
        navBar();
        darkModeSupport();

        $('#backArrow').unbind().click(function() { _this.redirectTo('/dashboard') });
        redeemListeners();
      }
    },
    '/shareCode': {
      id: 'shareCode',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Share Code Page', 'page_path' : '/shareCode' });

        _this = this;
        navBar();
        darkModeSupport();

        $('#backArrow').unbind().click(function() {
          backButtonTarget = "/dashboard";
          _this.redirectTo('/sentBook');
        });
        
        // Display tooltip when box or icon is clicked and copy to clipboard
        var tooltip = $(".copytooltip .copytooltiptext");
        $('#copyButton, #shareCodeText').unbind().click(function() {
          copyToClipboard("#shareCodeText");
          $(tooltip).finish().fadeTo(400, 1).delay(1500).fadeTo(400, 0);
        });

        getById("shareCodeText").innerText = book.shareCode;

        // Display share icon based on platform
        var shareIcon = getById("shareIcon");
        let shareIcon = getById("shareIcon");
        if (isIOS) shareIcon.src = "./images/ios-share.svg";

        // Hides share button if native share API not supported;
        // can implement my own alternative later if desired like in
        // https://css-tricks.com/how-to-use-the-web-share-api/
        if (navigator.share) {
          $("#bigShareButton").unbind().click(function() {
            shareCode();
          });
        } else {
          $("#bigShareButton").hide();
        }
      }
    },
    '/settings': {
      id: 'settings',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Settings Page', 'page_path' : '/settings' });

        _this = this;
        navBar();

        // Called again to refresh data
        getUserInfo(true);

        formatPhoneNumber(true);
        $("#updatePhoneNumber").unbind().click(function() {
          validatePhoneNumber(true);
        });
        displayNameListeners();
        darkModeSupport(true);
        
        let logoutButton = getBySelector(".btn-logout");
        $(logoutButton).unbind().click(this.logout);
      }
    },
    '/help': {
      id: 'help',
      onMount: function(page) {
        gtag('config', googleID, { 'page_title' : 'Help Page', 'page_path' : '/help' });

        _this = this;
        navBar();
        darkModeSupport();

        helpFormListeners();
      }
    }
  }
};

/**
 * Copies text from the selected element.
 * @param {object} element - the element that the text
 * is going to be copied from.
 */
function copyToClipboard(element) {
  let $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}

/**
 * Establish connection with the database so no load times later on.
 */
function createConnection() {
  $.ajax({
    type: "GET",
    url: "https://www.couponbooked.com/scripts/createConnection",
    datatype: "html",
    success: function(data) {
      console.warn("Successfully established database connection.");
      gtag('event', 'Connection Established', {
        'event_category' : 'Connection',
        'non_interaction': true
      });
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error establishing connection:", XMLHttpRequest.responseText);
      gtag('event', 'Connection Not Established', {
        'event_category' : 'Connection',
        'non_interaction': true
      });
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
  let userId = localStorage.getItem("user_id");
  if (!userId) return console.error("No user ID! Can't get user info...");
  let iOS = !!navigator.platform.match(/iPhone|iPod|iPad/);

  $.ajax({
    type: "GET",
    url: `https://www.couponbooked.com/scripts/getUserInfo?userId=${userId}&iOS=${iOS}`,
    datatype: "html",
    success: function(data) {
      // IDEA: Set mobile menu to creator, giver, etc. Have settings page on desktop show
      // something similar with the profile so they aren't missing out
      if (data) {
        console.warn("Successfully retrieved user info.");
        addOneSignalUserId();

        // Store all the data in localStorage for later use
        data = JSON.parse(data);
        localStorage.setItem("display_name", data.displayName);
        localStorage.setItem("country_code", data.countryCode);
        localStorage.setItem("phone_num", data.phoneNumber);
        localStorage.setItem("stats", data.stats);

        // TODO: Find a way to add for desktop
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
 * Called after we have confirmed that the user's data already exists,
 * so we only have to worry about updating instead of insertion.
 */
function addOneSignalUserId() {
  //console.warn("Setting user's OneSignal ID...");
  let userId = localStorage.getItem('user_id');
  let onesignalId = localStorage.getItem('onesignal_id');
  let iOS = !!navigator.platform.match(/iPhone|iPod|iPad/);
  if (!onesignalId || onesignalId == "null") {
    iOS = true; // TODO: Test this here and in PHP
    onesignalId = null;
  }

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/addOneSignalUserId",
    data: { userId: userId, onesignalId: onesignalId, iOS: iOS },
    crossDomain: true,
    cache: false,
    success: function(success) {
        console.warn("Successfully set user's OneSignal ID...", success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error setting OneSignal ID:", XMLHttpRequest.responseText);
    }
  });
}

/**
 * Adds user info to mobile sidebar menu.
 */
function sideMenuInfo() {
  getById("sidebarName").innerText = getUserName();
  let stats = JSON.parse(localStorage.getItem("stats")), quip = "Explorer";
  if (stats.sentBooks > stats.receivedBooks) {
    quip = "Giver";
  } else if (stats.createdBooks > stats.sentBooks + 1) {
    quip = "Creator";
  }

  getById("sidebarQuip").innerText = quip;
}

/**
 * Is called by getUserInfo() if there is no data returned from
 * the server for the user. Generates inital data for the user
 * and saves it for later modification.
 */
function createUserInfo() {
  // NOTE: This is the code that will only run on a user's first login, so I
  //  call a prompt for their phone number here!
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
  $("#phoneForm").dialog({
    draggable: false,
    resizable: false,
    height: "auto",
    width: 400,
    modal: true,
    buttons: {
      Cancel: function() {
        $(this).dialog("close");
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
  let phoneNum = getById(settingsPage ? "phoneNumberInput" : "phoneNumber").value.replace( /\D+/g, '');
  if (phoneNum.length == 10) {
    // Proper length phone number submitted
    addPhoneNumber(phoneNum, settingsPage);
  } else {
    SimpleNotification.warning({
      text: "Please enter all 10 digits!"
    }, notificationOptions);
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

  const enforceFormat = (event) => {
    // Input must be of a valid number format or a modifier key, and not longer than ten digits
    if (!isNumericInput(event) && !isModifierKey(event)) {
      event.preventDefault();
    }
  };

  const formatToPhone = (event) => {
    if (isModifierKey(event)) { return; }
    const target = event.target;
    const number = event.target.value.replace(/\D/g,'').substring(0,10); // First ten digits of input only
    target.value = number;
  };

  const inputElement = getById(settingsPage ? "phoneNumberInput" : "phoneNumber");
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
  let userId = localStorage.getItem("user_id");
  if (!userId) return console.error("No user ID! Can't add phone number...");
  let countryCode = getById("countryCode").selectedOptions[0].value;

  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/addUserPhoneNumber",
    data: { userId: userId, countryCode: countryCode, phone_num: phoneNum },
    crossDomain: true,
    cache: false,
    success: function(data) {
      console.warn("Phone number added to user account!", data);
      SimpleNotification.success({
        text: `Phone number ${settingsPage ? "updated!" : "received!"}`
      }, notificationOptions);

      $("#phoneForm").dialog("close");
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error adding phone number:", XMLHttpRequest.responseText);
      SimpleNotification.error({
        title: "Error adding phone number",
        text: "Please try again later."
      }, notificationOptions);
    }
  });
}

/**
 * Takes the user's stats and adds them to the settings page.
 */
function displayUserData() {
  // Put current display name in settings page input
  let displayName = localStorage.getItem("display_name"),
      phoneNumber = localStorage.getItem("phone_num"),
      countryCode = localStorage.getItem("country_code");
  if (displayNameExists()) {
    // Stringified null would be put in the input box otherwise
    $("#displayNameInput").val(displayName);
  }

  // '> 4' prevents null from being displayed, because that happens for some reason
  if (phoneNumber && phoneNumber.length > 4) {
    $("#phoneNumberInput").val(phoneNumber);
    $('#countryCode').val(countryCode);
  }

  // Update all the individual stats elements
  var stats = JSON.parse(localStorage.getItem("stats"));
  getById("createdBooks").innerText += ` ${stats.createdBooks}`;
  getById("sentBooks").innerText += ` ${stats.sentBooks}`;
  getById("receivedBooks").innerText += ` ${stats.receivedBooks}`;
  getById("redeemedCoupons").innerText += ` ${stats.redeemedCoupons}`;

  // TODO: Still need to either do this one or get rid of it
  //getById("fulfilledCoupons").innerText += ` ${stats.fulfilledCoupons}`;
}

/**
 * Takes the name the user entered in the field on the settings
 * page and sets it in localStorage for display purposes.
 */
function displayNameListeners() {
  // Listen for clicking of update button
  $("#updateDisplayName").unbind().click(function() {
    let newName = getById("displayNameInput").value;
    let updateName = true;
    if (newName.length > 30) {
      SimpleNotification.warning({
        title: "Name too long",
        text: "Please enter a shorter name."
      }, notificationOptions);
      updateName = false;
    } else if (newName == "") {
      gtag('event', 'Display Name Reset', { 'event_category' : 'Display Name' });

      SimpleNotification.info({
        title: "No name entered",
        text: "Using default username from now on."
      }, notificationOptions);

      localStorage.setItem("display_name", "");
    } else {
      gtag('event', 'Display Name Updated', { 'event_category' : 'Display Name' });

      SimpleNotification.success({
        text: "Display name updated"
      }, notificationOptions);

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
  let userId = localStorage.getItem("user_id");
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
  // Set or remove the `dark` and `light` class the first time.
  if (!settingsPage)
    return setProperMode();

  // https://stackoverflow.com/a/3263248/6456163
  if (localStorage.getItem("darkMode") == "true") getById("darkCheckbox").click();

  // NOTE: The code in here runs twice; shouldn't be a problem
  let toggle = getById("darkToggle");
  $(toggle).unbind().click(function() {
    let darkMode = getById("darkCheckbox").checked;
    localStorage.setItem("darkMode", darkMode + "");

    setProperMode();
  });

  /** Sets dark mode if applicable and light mode if not. */
  function setProperMode() {
    let copyButton = getById("copyButton");
    let backArrow = getById("backArrow");

    if (localStorage.getItem('darkMode') == "true") {
      setRootProperty('--background-color', 'rgb(15, 15, 15)');
      setRootProperty('--text-color', 'rgb(240, 240, 240)');
      setRootProperty('--topbar-color', '#474747');
      setRootProperty('--tab-color', '#474747');
      setRootProperty('--hr-style', '1px solid rgba(255,255,255,.35)');
      if (copyButton) copyButton.className = "filter-white";
      if (backArrow) backArrow.className = "filter-white";
    } else {
      setRootProperty('--background-color', '#f9f9f9');
      setRootProperty('--text-color', '#041433');
      setRootProperty('--topbar-color', '#EEEEEE');
      setRootProperty('--tab-color', '#fff');
      setRootProperty('--hr-style', '1px solid rgba(0,0,0,.1)');
      if (copyButton) copyButton.className = "filter-black";
      if (backArrow) backArrow.className = "filter-black";
    }
  }

  // https://stackoverflow.com/a/37802204/6456163
  function setRootProperty(name, value) {
    document.documentElement.style.setProperty(name, value);
  }
}

function handlePayments() {
  book = JSON.parse(localStorage.getItem('book'));

  // Typically means they refreshed the page with the URL variables still up there.
  // Not really an issue I'm worried about, that's why I clear the localStorage so it doesn't
  // try to process the payments twice.
  if (!book)
    return console.error("There was a problem retrieving the book to update payment status...");
  
  localStorage.removeItem('book');
  book.paymentStatus = "succeeded"; // TODO: Use this properly...
  updateBook(true);

  // TODO: Need to update succeeded status on completion of successful payment
  createShareCode();
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
      }, notificationOptions);

      // Only way you can get to the create route, so easy to send them back
      _this.redirectTo("/dashboard");
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
    let templateData = JSON.parse(template);

    // Create node and give CSS class that applies styles
    let node = document.createElement("div");
    node.setAttribute("class", "bookPreview");

    // Image and name
    node.innerHTML += `<img class='bookImage' onerror='imageError(this)' src='${templateData.image}' />`;
    node.innerHTML += `<p class='bookName'>${templateData.name}</p>`;

    // https://api.jquery.com/data/
    $(node).data("templateData", templateData);
    getById("templateContainer").appendChild(node);

    $(node).unbind().click(function() {
      book = $(node).data("templateData");
      previousBook = clone(book);
      _this.redirectTo('/sentBook');
    });
  });

  hideLoadingIcon(true);
}

/**
 * Retrieve coupon books the user has sent or received.
 */
function pullUserRelatedBooks() {
  showLoadingIcon = true;
  let userId = localStorage.getItem("user_id");
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

        SimpleNotification.error({
          title: 'Error reaching server',
          text: 'Please try again later.'
        }, notificationOptions);
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
    let isSent = arrayNumber == 0;

    // If there are coupons for the category
    if (array.length != 0) {
      // Go over each coupon book in sent {0} or received array {1}
      $.each(array, function(couponNumber, couponBook) {
        if (couponBook) {
          addBookToPage(couponBook, isSent);
        } else {
          console.warn("Showing that user doesn't have any books. They could be new, or something really bad could've happened...");
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
    fadeBetweenElements("#loader", "#gestureZone, #templateContainer");
  }, templatesPage ? 750 : 950);
}

/**
 * Let the user know there are no books of the specifed type.
 * @param {boolean} isSent - true if sent page, false if received
 */
function unhideMessage(isSent) {
  let element = isSent ? $("#noneSent") : $("#noneReceived");
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
  let bookData = JSON.parse(couponBook.bookData);
  let applicableElement = getById(isSent ? "sent": "received");

  // Create node and give CSS class that applies styles
  let node = document.createElement("div");
  node.setAttribute("class", "bookPreview");

  // Image and name
  node.innerHTML += `<img class='bookImage' onerror='imageError(this)' src='${bookData.image}' />`;
  node.innerHTML += `<p class='bookName'>${bookData.name}</p>`;

  if (isSent) {
    let shareCode = bookData.shareCode;
    if (shareCode) {
      node.innerHTML += `<p class='receiverText'>Code: ${shareCode}</p>`;
    } else {
      // TODO: Make this not move the div up when longer than one line, and instead
      // drop the text while keeping the images level. Temporarily avoided with 
      // ellpises method but people might think that's ugly
      let receiver = couponBook.receiverName;
      node.innerHTML += "<p class='receiverText'>" +
        (receiver ? /*"Sent to " +*/ receiver : "Not sent yet") +
        "</p>";
    }
  } else {
    // Who the book is sent from; should always exist, but failsafe in case it doesn't
    let senderName = couponBook.senderName;
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
    book = $(this).data("bookData");
    book.receiver = $(this).data("receiver");
    book.sender = $(this).data("sender");
    previousBook = clone(book);

    // TODO: Add some kind of delay to give content time to load in;
    // IDEA: begin fading #app out, redirect, and start fading new content
    // in after a very slight delay (to fade between routes);
    // Could put in a loading screen for a short period of time
    backButtonTarget = "/dashboard";

    let isSent = $(this).data("isSent");
    _this.redirectTo(isSent ? "/sentBook" : "/receivedBook");
  });
}

/**
 * Adds the listeners for the help route.
 */
function helpFormListeners() {
  let userId = localStorage.getItem("user_id");
  $("#submit").unbind().click(function(event) {
    event.preventDefault();

    // TODO: Properly grab new lines from subject
    let form = $("#helpForm").serializeArray();
    let formData = {};
    for (let i = 0; i < form.length; i++) {
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
        // TODO: Test, and also finish the pagination
        gtag('event', 'Help Form Submitted', {
          'event_category' : 'Form Submission',
          'event_label' : formData.topic
        });

        // TODO: Show them a notification or fade the form into a success text or something
        SimpleNotification.success({
          text: "Form successfully submitted"
        }, notificationOptions);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error with form submission:", XMLHttpRequest.responseText);
        gtag('event', 'Help Form Submitted', {
          'event_category' : 'Form Submission',
          'event_label' : 'Error'
        });

        SimpleNotification.error({
          title: "Error submitting form",
          text: "Please try again later."
        }, notificationOptions);
      }
    });
  });
}

/**
 * Makes sure the stuff entered falls within the defined parameters.
 */
function redeemListeners() {
  $("#redeemButton").unbind().click(function() {
    let code = getById("redeemBox").value.toLowerCase();
    if (codeIsValid(code)) redeemCode(code);
  });

  // https://www.outsystems.com/forums/discussion/27816/mobile-max-length-of-input-not-working/#Post101576
  $("#redeemBox").on("input", function (event) {
    if (event.originalEvent.inputType == "insertFromPaste") {
      for (let i = 0; i < this.value.length; i++) {
        let currentChar = this.value.toLowerCase().charAt(i);
        
        if (!ALPHABET.includes(currentChar)) {
          this.value = this.value.replace(currentChar, '');

          // To retest that same character spot since the string shifted now.
          // No out of bounds issue because it's about to i++ in the loop.
          i--;
        }
      }
    } else {
      let currentChar = this.value.toLowerCase().charAt(this.value.length - 1);
      if (!ALPHABET.includes(currentChar))
        this.value = this.value.slice(0, this.value.length - 1);
    }

    // Cut length down to desired amount
    if (this.value.length > ID_LENGTH)
      this.value = this.value.slice(0, 8);
  });
}

/**
 * Sends code to server to see if it is valid, and redeems it to
 * the current user if it is.
 * @param {string} shareCode the code to be redeemed for access
 * to a coupon book.
 */
function redeemCode(shareCode) {
  let userId = localStorage.getItem("user_id");
  $.ajax({
    type: "POST",
    url: "https://www.couponbooked.com/scripts/redeemCode",
    data: { userId: userId, receiverName: getUserName(), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      handleSuccess(success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCode: ", XMLHttpRequest.responseText);
      gtag('event', 'Share Code Redeemed', {
        'event_category' : 'Redemption',
        'event_label' : 'Error'
      });

      SimpleNotification.error({
        title: "Error redeeming code!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });

  function handleSuccess(success) {
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
      gtag('event', 'Share Code Redeemed', {
        'event_category' : 'Redemption',
        'event_label' : 'Success'
      });

      SimpleNotification.success({
        title: "Successfully redeemed code!",
        text: "Check your dashboard."
      }, notificationOptions);

      // Update received book stats
      let stats = JSON.parse(localStorage.getItem("stats"));
      stats.receivedBooks++;
      localStorage.setItem("stats", JSON.stringify(stats));
      updateStats();
    }
  }
}

/**
 * Checks if code characters are all within the defined
 * alphabet and if it is the right length.
 * @param {string} shareCode 
 */
function codeIsValid(shareCode) {
  if (shareCode.length == ID_LENGTH) {
    let validCode = true;
    for (let i = 0; i < ID_LENGTH; i++) {
      if (!ALPHABET.includes(shareCode.charAt(i))) {
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
 * shareCode but requesting a book; just changed the contents.
 * TODO: Have a button to call this always, not just when you
 * don't have any received books.
 */
async function requestBook() {
  let userName = getUserName(), messageStart = "";
  if (userName) {
    // NOTE: This can probably be improved. Think on it
    messageStart = `Your friend ${userName} wants a Coupon Book! `;
  }

  let options = {
    title: "Send a Coupon Book!",
    text: `${messageStart}Go to https://couponbooked.com/webapp to send a Book now!`
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
  try {
    // TODO: Work on adding a dedicated Snapchat share like Spotify does
    await navigator.share(options);
    console.log('Successfully requested book');

    gtag('event', 'Book Requested', {
      'event_category' : 'Book Sharing',
      'event_label' : 'Navigator Implementation'
    });
  } catch(err) {
    console.error("Error running share:", err);

    gtag('event', 'Book Requested', {
      'event_category' : 'Book Sharing',
      'event_label' : 'Error'
    });
  }
}

/**
 * Insert navigation elements into routes requiring them.
 * Redirects to login if user not authenticated.
 */
function navBar() {
  if (_this.state.authenticated === false)
    return _this.redirectTo('/login');

  // Only retrieve data if it does not exist in memory; https://auth0.com/docs/policies/rate-limits
  let avatar = getBySelector('.profile-image');
  if (!profile) {
    var storedProfile = JSON.parse(localStorage.getItem('user_info'));
    if (storedProfile) {
      avatar.src = storedProfile.picture;
      profile = storedProfile;
    } else {
      console.error("Error loading profile: ", err);
      reacquireProfile();
    }
  } else {
    avatar.src = profile.picture;
  }

  $("#mobile").unbind().click(function() { _this.redirectTo('/dashboard'); });

  // TODO: Make this all programmatic
  $(".dashboard").unbind().click(function() {
    toggleMobileMenu();
    _this.redirectTo('/dashboard');
  });
  $(".create").unbind().click(function() {
    toggleMobileMenu();
    _this.redirectTo('/create');
  });
  $(".redeem").unbind().click(function() {
    toggleMobileMenu();
    _this.redirectTo('/redeemCode');
  });
  $(".settings").unbind().click(function() {
    toggleMobileMenu();
    _this.redirectTo('/settings');
  });
  $(".help").unbind().click(function() {
    toggleMobileMenu();
    _this.redirectTo('/help');
  });

  // Mobile menu will slide open on icon click
  $("#sideMenuIcon, .contentShadow").unbind().click(function() {
    toggleMobileMenu();
  });
}

function toggleMobileMenu() {
  toggleClass(document.querySelector(".mobileSideMenu"), "mobileSideMenu--open");
  toggleClass(document.querySelector(".contentShadow"), "contentShadow--open");
}

var tempCounter = 0;
function reacquireProfile() {
  let options = {
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

    let accessToken = JSON.parse(response.body).access_token;
    localStorage.setItem('access_token', accessToken);
    _this.state.accessToken = accessToken;
    _this.state.authenticated = true; // Should be set, but just in case...

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
  $("#tab-menu").tabs("select", localStorage.getItem("activeTab"));

  const gestureZone = getById("gestureZone");
  let sentButton = $("#sentButton");
  let receivedButton = $("#receivedButton");
  let touchstartX = 0;
  let touchendX = 0;

  gestureZone.addEventListener("touchstart", function(event) {
    touchstartX = event.changedTouches[0].screenX;
  }, false);

  gestureZone.addEventListener("touchend", function(event) {
    touchendX = event.changedTouches[0].screenX;
    handleGesture();
  }, false);

  // Modified from https://gist.github.com/SleepWalker/da5636b1abcbaff48c4d#gistcomment-2555343
  function handleGesture() {
    // IDEA: Add animation while moving between pages; is this possible with Materialize?
    let ratio_horizontal = (touchendX - touchstartX) / $(gestureZone).width();
    let ratioComparison = .10;

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

  // Click listeners for sent/received tab
  sentButton.unbind().click(() => sentTab());
  receivedButton.unbind().click(() => receivedTab());

  // TODO: Replicate behavior of color fading away when tab clicked off of,
  // i.e. when the user is scrolling down the page
  function sentTab() {
    gtag('event', 'Sent tab', { 'event_category' : 'Navigation' });
    localStorage.setItem('activeTab', 'sent');
    
    sentButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    receivedButton.css('background-color', 'transparent');
    sentButton.css('text-decoration', 'underline');
    receivedButton.css('text-decoration', 'none');
  }
  function receivedTab() {
    gtag('event', 'Received tab', { 'event_category' : 'Navigation' });
    localStorage.setItem('activeTab', 'received');

    receivedButton.css('background-color', 'rgba(246, 178, 181, 0.2)');
    sentButton.css('background-color', 'transparent');
    receivedButton.css('text-decoration', 'underline');
    sentButton.css('text-decoration', 'none');
  }
}

App.prototype.run = function(id) {
  this.container = getBySelector(id);
  this.resumeApp();
};

// NOTE: This code is pasted into App() and navBar(), so any changes
// made here should be made there as well.
App.prototype.logout = function() {
  console.warn("Logging user out...");

  localStorage.clear();
  profile = null;

  var client = new auth0.WebAuth({
    domain: "couponbooked.auth0.com",
    clientID: "6XFstRMqF3LN5h24Tooi22h1BMHCdnjh",
    packageIdentifier: "com.couponbooked.app"
  });
  
  client.logout({
    returnTo: 'https://couponbooked.com/webapp',
    client_id: '6XFstRMqF3LN5h24Tooi22h1BMHCdnjh'
  });
};

App.prototype.redirectTo = function(route) {
  if (!this.state.routes[route])
    throw new Error(`Unknown route ${route}.`);
  
  this.state.currentRoute = route;
  this.render();
};

App.prototype.resumeApp = function() {
  console.log("Please unhide warnings if debugging. Otherwise, you might want to hide them.");
  console.warn("resumeApp...");
  _this = this;
  let accessToken = localStorage.getItem('access_token');
  let idToken = localStorage.getItem('id_token');

  if (!accessToken) {
    console.warn("No access token. Setting authentication state to false...");
    return failedAuth();
  }

  // Verifies the access token is still valid
  let decoded = parseJwt(idToken);
  let expDate = decoded.exp;
  if (!expDate)
    return console.error("Error parsing idToken! Freaking out and not fixing the problem...");

  // NOTE: To test `expired` code, reverse the direction of the angle bracket
  var currentDate = Math.ceil(Date.now() / 1000);
  if (expDate < currentDate) {
    console.log("Access token expired! Going back to login screen...");

    // TODO: Remember why I did this and fix it;
    // once done use to replace reacquireProfile()
    _this.redirectTo("/login");
  } else {
    console.warn("The tokens are not yet expired.");
    successfulAuth(accessToken);
  }
};

/** The decoding feature is all I needed from jsonwebtoken. */
function parseJwt(token) {
  // https://stackoverflow.com/a/38552302/6456163
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let stringifiedToken = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  localStorage.setItem('user_info', stringifiedToken);
  return JSON.parse(stringifiedToken);
};

function successfulAuth(accessToken) {
  console.warn("Setting authentication state to true...");
  _this.state.authenticated = true;
  _this.state.accessToken = accessToken;
  _this.render();
};

function failedAuth() {
  _this.state.authenticated = false;
  _this.state.accessToken = null;
  _this.render();
};

App.prototype.render = function() {
  //console.warn("render...");
  let currRoute = this.state.routes[this.state.currentRoute];
  let currRouteEl = getById(currRoute.id);
  let currRouteId = currRouteEl.id;
  let element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav
  var nonNavRoutes = ["login", "loading"];
  if ($.inArray(currRouteId, nonNavRoutes) < 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(nav);

    // NOTE: For some reason putting darkModeSupport() here doesn't work out
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};