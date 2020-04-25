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

// IDEA: Make it when you click back from a coupon preview it takes you to where you were scrolled;
  // perhaps with a tags that automatically save id as you scroll with name? Need to handle name updating...
// TODO: Still have to redo home page...

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
        //console.warn("/ route...");
        nav = getBySelector("#nav");
        loadingIcon = getBySelector("#loader");

        // Don't want to have to code an annoying landscape layout
        screen.orientation.lock('portrait');
        //screen.orientation.lock('portrait');
        _this = this;

        // NOTE: If I want to, can always go back and replace startup animation code from app.
        if (this.state.authenticated === true) {
          // Only try to create the connection once authenticated, since login route
          // takes them away from my site anyways. Unless I bring login screen in-house...
          createConnection();

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
        console.warn("/login route...");
        if (this.state.authenticated === true) {
          return this.redirectTo('/dashboard');
        } else {
          // Show loading screen while waiting for redirect
          if (loadingIcon) this.container.appendChild(loadingIcon);
          console.log("Trying to redirect to Auth0 login...");

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
            redirectUri: 'https://couponbooked.com/webapp/callback'
          });
        }
      }
    },
    '/home': {
      // NOTE: Currently not referenced anywhere; look before this commit to see where it WAS
      // referenced if wanting to reinstate with a new look/purpose
      id: 'home',
      onMount: function(page) {
        _this = this;
        navBar();

        // Reset every time the user goes home
        localStorage.setItem('activeTab', 'sent');
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        _this = this;
        navBar();

        backButtonTarget = "/create";
        $('#backArrow').unbind().click(function() {
          // TODO: See if there needs to be a back button target here
          _this.redirectTo('/dashboard');
        });

        // TODO: When back button is clicked after editing retrieved template,
        // still make sure they want to discard changes

        // TODO: Either add a similar variable to /dashboard here or implement some
        // kind of caching mechanism so they don't have to wait every time for the
        // templates to be retrieved
        this.container.appendChild(loadingIcon);
        $("#loader").css("display", "inline-block");
        fadeBetweenElements("#gestureZone, #templateContainer", "", true);
        getAllTemplates();
      }
    },
    // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_navbar_shrink_scroll
    '/sentBook': {
      id: 'sentBook',
      onMount: function(page) {
        _this = this;
        navBar();

        displaySentBook();
        darkModeSupport();

        var stripe = Stripe('pk_test_EAwuFkepc11nHEyPnzAH2XF600aoA16vHm');
        var share = document.querySelector('#share');
        share.addEventListener('click', function () {
          // To access the current book after redirect, i.e. preventing requiring
          // retrieving the data again. Ideally I can set the succeeded flag on
          // redirect and avoid all this, but we'll see how that goes.
          localStorage.setItem('book', JSON.stringify(book));

          stripe.redirectToCheckout({
            items: [{
              sku: 'sku_H2NWOmtSCuAH2l', //sku_H2MwwLWIIYdV4M
              quantity: 1
            }],
            // TODO: Switch to HTML layout or something like normal sites so I can
            // use the book page as a URL success thing here
            successUrl: `https://www.couponbooked.com/webapp/success?bookId=${book.bookId}`,
            cancelUrl: 'https://www.couponbooked.com/webapp/cancel',
            //customerEmail: 'customer@example.com' // TODO: Find way to get this to prefill
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
        // TODO: Add way to view hidden books
        _this = this;
        navBar();

        displayReceivedBook();
        darkModeSupport();
      }
    },
    // TODO: Speed up loading of books somehow; caching until change?
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
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
          requestBook();
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
        darkModeSupport();

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
        _this = this;
        navBar();
        darkModeSupport();

        // IDEA: Use fadeBetweenElements here instead of another route
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
        //var platform = device.platform;
        var shareIcon = getById("shareIcon");
        isIOS ? shareIcon.src = "./images/ios-share.svg" : shareIcon.src = "./images/md-share.svg"; // TODO: TEST

        $("#bigShareButton").unbind().click(function() {
          shareCode();
        });
      }
    },
    '/settings': {
      id: 'settings',
      onMount: function(page) {
        _this = this;
        navBar();

        // TODO: Mess with https://auth0.com/docs/api/management/v2#!/Users/patch_users_by_id
          // to hopefully allow users to edit their data (what for?); use something similar to login functions?
        displayNameListeners();
        darkModeSupport(true);
        
        var logoutButton = getBySelector('.btn-logout');
        $(logoutButton).unbind().click(this.logout);
      }
    },
    '/guide': {
      id: 'guide',
      onMount: function(page) {
        _this = this;
        navBar();
        darkModeSupport();
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
  var $temp = $("<input>");
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
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error establishing connection:", XMLHttpRequest.responseText);
    }
  });
}

/**
 * Takes the name the user entered in the field on the settings
 * page and sets it in localStorage for display purposes.
 */
function displayNameListeners() {
  // Update textbox with current displayName
  $("#displayNameInput").val(localStorage.getItem("display_name"));

  // Listen for clicking of update button
  $("#updateDisplayName").unbind().click(function() {
    var newName = getById("displayNameInput").value;
    if (newName.length > 30) {
      SimpleNotification.warning({
        title: "Name too long",
        text: "Please enter a shorter name."
      }, notificationOptions);
    } else if (newName == "") {
      SimpleNotification.info({
        title: "No name entered",
        text: "Using default username from now on."
      }, notificationOptions);

      localStorage.setItem("display_name", "");
    } else {
      SimpleNotification.success({
        text: "Display name updated"
      }, notificationOptions);

      console.log("New display name:", newName);
      localStorage.setItem("display_name", newName);
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
    if (localStorage.getItem("darkMode") == "true") getById("darkCheckbox").click();

    // NOTE: The code in here runs twice; shouldn't be a problem
    var toggle = getById("darkToggle");
    $(toggle).unbind().click(function() {
      var darkMode = getById("darkCheckbox").checked;
      localStorage.setItem("darkMode", darkMode + "");

      setProperMode();
    });
  } else {
    // Set or remove the `dark` and `light` class the first time.
    setProperMode();
  }

  /** Sets dark mode if applicable and light mode if not. */
  function setProperMode() {
    var hideBook = getById("hideBook");
    var copyButton = getById("copyButton");
    var backArrow = getById("backArrow");

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
  // TODO: If not actually using localStorage (check) then delete this shit
  book = JSON.parse(localStorage.getItem('book'));
  if (book) {
    localStorage.removeItem('book');
    book.paymentStatus = "succeeded"; // TODO: Use this properly...
    updateBook(true);

    // TODO: Need to update succeeded status on completion of successful payment
    createShareCode();
  } else {
    console.log("Either something is fucked up or you're trying to be naughty!");
    // IDEA: Go to the page anyways or something? How to handle?
  }

  // TODO: Proper handling for other occurances
  /*SimpleNotification.warning({
    title: "Problem processing payment",
    text: "Please try again later."
  }, notificationOptions);*/
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
    var templateData = JSON.parse(template);

    // Create node and give CSS class that applies styles
    var node = document.createElement('div');
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
 * NOTE: I don't know HOW this works or even if it DOES work, 
 * but at the moment it appears to stop the loading animation
 * from displaying when returning to the dashboard. Can mess around
 * with it in the future if any problems appear.
 */
var showLoadingIcon = true;

/**
 * Retrieve coupon books the user has sent or received.
 */
function pullUserRelatedBooks() {
  showLoadingIcon = true;
  var userId = localStorage.getItem('user_id');
  $.ajax({
    type: "GET",
      url: `https://www.couponbooked.com/scripts/getData?userId=${userId}`,
      datatype: "json",
      success: function(data) {
        data = JSON.parse(data);
        processPulledData(data);
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in pullUserRelatedBooks: ", XMLHttpRequest.responseText);

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
    var isSent = arrayNumber == 0;
    var allHidden = true;

    // If there are coupons for the category
    if (array.length != 0) {
      // Go over each coupon book in sent {0} or received array {1}
      $.each(array, function(couponNumber, couponBook) {
          if (couponBook) {
            addBookToPage(couponBook, isSent);

            var hidden = JSON.parse(couponBook.bookData).hide == 1;
            if (!hidden) {
              allHidden = false;
            } else if (couponNumber == array.length - 1 && allHidden) {
              // If this is the last book and all of them are hidden
              unhideMessage(isSent);
            }
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
    fadeBetweenElements("#loader", "#gestureZone, #templateContainer");
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
  var applicableElement = isSent ? getById("sent") : getById("received");

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

    var isSent = $(this).data("isSent");
    if (isSent) {
      _this.redirectTo('/sentBook');
    } else {
      _this.redirectTo('/receivedBook');
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
    data: { userId: userId, receiverName: getUserName(), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      handleSuccess(success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCode: ", XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: "Error redeeming code!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });

  function handleSuccess(success) {
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
  var userName = getUserName(), messageStart = "";
  if (userName) {
    messageStart = `Your friend ${userName} wants a Coupon Book! `;
  } else {
    // TODO: Throw some kind of error or something here because this shouldn't happen
  }

  var options = {
    // TODO: Eventually come back and fix this URL once the site directory is solidified,
    // and then fix it in shareCode() too
    title: "Send a Coupon Book!",
    text: `${messageStart}Go to https://couponbooked.com/webapp to send a Book now!`
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
  try {
    await navigator.share(options);
    console.log('Successfully ran share');
  } catch(err) {
    // TODO: Some alternative sharing method for where it isn't supported like
    // https://css-tricks.com/how-to-use-the-web-share-api/; change in other file too
    console.error("Error running share:", err);
  }
}

/**
 * Insert navigation elements into routes requiring them.
 * Redirects to login if user not authenticated.
 */
function navBar() {
  //console.warn("navBar...");
  if (_this.state.authenticated === false) {
    return _this.redirectTo('/login');
  }

  // Route to home on title or logo click
  var mobile = getBySelector("#mobile");
  $(mobile).unbind().click(function() { _this.redirectTo('/dashboard') });

  // Only retrieve data if it does not exist in memory; https://auth0.com/docs/policies/rate-limits
  var avatar = getBySelector('.profile-image');
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

  // TODO: See if this can dynamically do dropdowns
  // TODO: Try to have it not bug the server if they click the link of the page they're already on
  // Dashboard button on dropdown
  var dashboardButton = getBySelector('.dashboard');
  $(dashboardButton).unbind().click(function() { _this.redirectTo('/dashboard') });

  // Settings button on dropdown
  var createButton = getBySelector('.create');
  $(createButton).unbind().click(function() { _this.redirectTo('/create') });

  // Settings button on dropdown
  var settingsButton = getBySelector('.settings');
  $(settingsButton).unbind().click(function() { _this.redirectTo('/settings') });

  // Guide button on dropdown
  var guideButton = getBySelector('.guide');
  $(guideButton).unbind().click(function() { _this.redirectTo('/guide') });

  // Profile picture dropdown
  $(".account").unbind().click(function() {
      // TODO: See if it is possible to have the shadow visible before the entire element is unrolled
      // IDEA: Paired element that's shadow colored and unroll at same time
      // https://tobiasahlin.com/blog/how-to-animate-box-shadow/
      if (!$('.submenu').is(':visible')) {
        $(".submenu").show("slide", { direction: "up" }, 500 );
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
  $('#tab-menu').tabs('select', localStorage.getItem('activeTab'));

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
  this.container = getBySelector(id);
  this.resumeApp();
};

// NOTE: This code is pasted into App() and navBar(), so any changes
// made here should be made there as well.
App.prototype.logout = function() {
  console.warn("Logging user out...");
  // https://documentation.onesignal.com/docs/cordova-sdk#section--removeexternaluserid-
  // TODO: Test logging in and out of devices to make sure notifications still work properly.
  //window.plugins.OneSignal.removeExternalUserId();

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
  _this = this;
  var accessToken = localStorage.getItem('access_token');
  var idToken = localStorage.getItem('id_token');

  if (accessToken) {
    // Verifies the access token is still valid
    var decoded = parseJwt(idToken);
    var expDate = decoded.exp;

    if (expDate) {
        var currentDate = Math.ceil(Date.now() / 1000);

        // NOTE: To test `expired` code, reverse the direction of the angle bracket
        if (expDate < currentDate) {
          console.log("Access token expired! Going back to login screen...");

          // TODO: Remember why I did this and fix it;
          // once done use to replace reacquireProfile()
          _this.redirectTo("/login");
        } else {
          console.warn("The tokens are not yet expired.");
          successfulAuth(accessToken);
        }
    } else {
        console.error("Error parsing idToken! Freaking out and not fixing the problem...");
    }
  } else {
    console.warn("No access token. Setting authentication state to false...");
    failedAuth();
  }
};

/** The decoding feature is all I needed from jsonwebtoken. */
function parseJwt(token) {
  // https://stackoverflow.com/a/38552302/6456163
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var stringifiedToken = decodeURIComponent(atob(base64).split('').map(function(c) {
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
}

function failedAuth() {
  _this.state.authenticated = false;
  _this.state.accessToken = null;
  _this.render();
}

App.prototype.render = function() {
  //console.warn("render...");
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
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