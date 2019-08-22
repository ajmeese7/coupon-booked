// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
const env = require('../env');
const request = require("request");
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
    localStorage.removeItem('user_id');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');
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

// TODO: Delete on page change! Something with routing? Or modify JS to add to .app
// TODO: Test if it's possible to have better close animation
// IDEA: Switch to better-maintained https://ned.im/noty or Toastify
var notificationOptions = { fadeout: 500, closeButton: false, duration: 3000 };

var nav, book, userId, profile, _this; // https://stackoverflow.com/a/1338622
App.prototype.state = {
  authenticated: false,
  accessToken: false,
  currentRoute: '/',
  routes: {
    '/': {
      id: 'loading',
      onMount: function(page) {
        console.warn("/ route...");
        nav = getBySelector("#nav");

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
        console.warn("/home route...");
        _this = this;
        navBar();

        createConnection();

        $('#createBook button').unbind().click(function() {
          _this.redirectTo('/create');
        });
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        _this = this;
        navBar();

        // Set button height equal to its width because CSS is annoying
        var width = $('button').width();
        var marginBottom = $('button').css("margin-bottom");
        $('#buttonContainer button').height(width + marginBottom);

        $('#buttonContainer button').unbind().click(function() {
          // getTemplate handles the redirect to manipulation
          var name = $(this).text().toLowerCase();
          getTemplate(name);
        });
      }
    },
    '/manipulate': {
      id: 'manipulate',
      onMount: function(page) {
        _this = this;
        navBar();

        displayBook();
        addManipulateEventListeners();
      }
    },
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        _this = this;
        navBar();

        $('#tabs-swipe-demo').tabs();
        manageTabMenu();

        // User clicks "Send one now!" and they're redirected to the create route
        $('#start').unbind().click(function() {
          _this.redirectTo('/create');
        });

        // NOTE: This is EXTREMELY temporary and used to test /shareCode until permenant
        // location is established
        $('#request').unbind().click(function() {
          _this.redirectTo('/shareCode');
        });
        
        // TODO: Add functionality where you click on the book tile and it redirects
        // you to the manipulate page with the data stored in `book`? What should
        // be done for redemptions, and should you be able to edit after sending?
        pullUserRelatedBooks();
      }
    },
    '/shareCode': {
      id: 'shareCode',
      onMount: function(page) {
        _this = this;
        navBar();

        // IDEA: Use fadeBetweenElements here instead of another route
        $('#backArrow').unbind().click(function() {
          // TODO: Add support for native back button here and elsewhere
          // TODO: Decide what the back button is to do
          //_this.redirectTo('/create');
        });
        
        // Display tooltip when box or icon is clicked and copy to clipboard
        var tooltip = $(".copytooltip .copytooltiptext");
        $('#copyButton, #shareCodeText').unbind().click(function() {
          cordova.plugins.clipboard.copy($("#shareCodeText").text());

          $(tooltip).finish().fadeTo(400, 1).delay(1500).fadeTo(400, 0);
        });

        getById("shareCodeText").innerText = book.shareCode;

        // Pass platform to iframe to display correct image
        var platform = device.platform;
        console.warn("Platform: " + platform);
        $('#shareFrame').attr('src', "shareButton.html?" + platform);
      }
    },
    '/profile': {
      id: 'profile',
      onMount: function(page) {
        _this = this;
        navBar();

        var avatar = getBySelector('#avatar');
        avatar.src = profile.picture;

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
 * TODO: Secure PHP files so no malicious requests are made.
 */
function createConnection() {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/createConnection",
    datatype: "html",
    success: function(data) {
      console.warn("Successfully established database connection.");
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error establishing connection:");
      console.error(XMLHttpRequest.responseText);
    }
  });
}

/**
 * Retrieve coupon books the user has sent or received and
 * add the applicable HTML to the page.
 */
function pullUserRelatedBooks() {
  var userId = localStorage.getItem('user_id');
  $.ajax({
      type: "GET",
      url: "http://www.couponbooked.com/scripts/getData?userId=" + userId,
      datatype: "html",
      success: function(data) {
        data = JSON.parse(data);

        // Go over sent and received arrays
        $.each(data, function(arrayNumber, array) {
            /** If true, book was sent. If false, it was received. */
            var isSent = arrayNumber == 0;
            var applicableElement = isSent ? getById("sent") : getById("received");

            // Go over each coupon book in sent {0} or received array {1}
            $.each(array, function(couponNumber, couponBook) {
                if (couponBook) {
                  var bookData = JSON.parse(couponBook.bookData);
                  var node = document.createElement('div');
                  node.setAttribute("class", "bookPreview");

                  // Image to represent book
                  node.innerHTML += "<img class='bookImage' src='" + bookData.image + "' />";

                  // Name of coupon book
                  node.innerHTML += "<p class='bookName'>" + bookData.name + "</p>";

                  if (isSent) {
                    // Who the book is sent to
                    var receiver = couponBook.receiver;
                    if (receiver) {
                      // TODO: How to store reciever name in way that is readable?
                      node.innerHTML += "<p class='receiverText'>Sent to " + receiver + "</p>";
                    } else {
                      node.innerHTML += "<p class='receiverText'>Not sent yet</p>";
                    }
                  } else {
                    // Who the book is sent from
                    var sender = couponBook.sender;
                    if (sender) {
                      node.innerHTML += "<p class='senderText'>Sent from " + sender + "</p>";
                    } else {
                      // Don't know how this would ever happen, but just in case
                      node.innerHTML += "<p class='senderText'>Sender unavailable</p>";
                    }
                  }

                  applicableElement.appendChild(node);
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
        console.log("Error in pullUserRelatedBooks:");
        console.error(XMLHttpRequest.responseText);

        SimpleNotification.error({
          title: 'Error retreiving info',
          text: 'Please try again later.'
        }, notificationOptions);
      }
  });
}

/**
 * Takes the current book JSON data and adds it to the page.
 */
function displayBook() {
  // TODO: Implement way to rearrange organization of coupons; also change
  // display options like default, alphabetical, count remaining, etc.;
  // should changing display preference permenantly update the order?
  $.each(book.coupons, function(couponNumber, coupon) {
    console.warn("Coupon #" + couponNumber + ":");
    console.warn(coupon);

    // TODO: Figure out how to display image licenses if not paying for yearly subscription
    var node = document.createElement('div');
    node.setAttribute("class", "couponPreview");
    node.innerHTML += "<img class='couponImage' src='" + coupon.image + "' />";
    node.innerHTML += "<p class='couponName'>" + coupon.name + "</p>";
    node.innerHTML += "<p class='couponCount'>" + coupon.count + " remaining</p>";
    getById("bookContent").appendChild(node);
  });
}

/**
 * Get the template corresponding to the button the user selects
 * and send the user to the manipulation page. Sets the requested
 * data to the global book variable.
 * @param {string} name the name of the template to be retreived
 */
function getTemplate(name) {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getTemplate?template=" + name,
    datatype: "html",
    success: function(data) {
      if (data == "") {
        // Should never happen outside of testing, but just in case.
        SimpleNotification.error({
          title: 'No applicable template',
          text: 'Please try again.'
        }, notificationOptions);
      } else {
        book = JSON.parse(data);
        book = JSON.parse(book.templateData);
        console.warn("getTemplate book:");
        console.warn(book);

        // Capitalize name; looks better
        var name = book.name;
        name = name.charAt(0).toUpperCase() + name.slice(1)
        book.name = name;

        _this.redirectTo('/manipulate');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in getTemplate:");
      console.error(XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error retreiving template!',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Development-only function. Meant to aid in the process of creating
 * templates and adding them to the template table in the database.
 * @param {string} name the name of the template to be created
 */
function createTemplate(name) {
  // TODO: https://www.flaticon.com/free-icon/gift_214305#term=gift&page=1&position=5
  var emptyTemplate = { name:name, image:"images/gift.png", bookId:null, shareCode:null, coupons:[] };
  emptyTemplate = JSON.stringify(emptyTemplate);
  console.warn("emptyTemplate:");
  console.warn(emptyTemplate);

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createTemplate",
    data: { name: name, templateData: emptyTemplate },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      // PHP echos a message if name already exists; if it doesn't, PHP is silent
      if (success) {
        SimpleNotification.warning({
          title: 'Please choose another name!',
          text: 'Template by name ' + name + ' already exists.'
        }, notificationOptions);
      } else {
        SimpleNotification.success({
          title: 'Successfully created template!',
          text: 'Good for you. Keep up the great work!'
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createTemplate:");
      console.error(XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error creating template',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Development-only function. Same as updateBook, but for templates.
 */
function updateTemplate() {
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateTemplate",
    data: { name: book.name, templateData: JSON.stringify(book) },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      if (success) {
        console.warn("updateTemplate success:");
        console.warn(success);
      }

      SimpleNotification.success({
        text: 'Successfully updated template'
      }, notificationOptions);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createTemplate:");
      console.error(XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error updating template',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Take data from form fields and add it to `book`.
 */
function createCoupon() {
  console.warn("Creating coupon...");
  var form = $('#newCouponForm').serializeArray();

  // https://stackoverflow.com/a/51175100/6456163
  var coupon = {};
  for (var i = 0; i < form.length; i++) {
    coupon[form[i].name] = form[i].value;
  }
  
  // Leaving commented out until image input is supported
  //book.coupons.push(coupon);
}

/**
 * Create a new Coupon Book and upload it to the database
 */
function createBook() {
  var uuid = uuidv4();
  var sender = localStorage.getItem('user_id');
  book.bookId = uuid;

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, bookData: JSON.stringify(book) },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      console.warn("createBook success:");
      console.warn(success);

      if (success == "bookId in use") {
        // Try again with a new bookId
        createBook();
      } else {
        SimpleNotification.success({
          text: 'Successfully created book'
        }, notificationOptions);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createBook:");
      console.error(XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error creating book!',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Update book, whether by adding more coupons or changing the counts.
 */
function updateBook() {
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateData",
    data: { bookId: book.bookId, bookData: JSON.stringify(book) },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // For debugging purposes
      console.warn("updateCouponBook success:");
      console.warn(success);

      SimpleNotification.success({
        text: 'Successfully updated coupon book'
      }, notificationOptions);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in updateCouponBook:");
      console.error(XMLHttpRequest.responseText);

      // TODO: Think of a good way to resolve bugs for users; some log data saved?
      // IDEA: Have a 'report bug' thing somewhere that includes logs in report; send it where?
      SimpleNotification.error({
        // IDEA: Something in error messages about 'sorry for the inconvenience'?
        // Would make them awfully long but seems like a professional thing to do.
        title: 'Error updating coupon book!',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Generates a share code and adds it to the book's entry 
 * in the database.
 * TODO: How to handle this when dealing with multiple books?
 * Will book always be set to the current book as it should?
 */
// TODO: Determine where to call this; after pay wall?
function createShareCode() {
  // https://www.fiznool.com/blog/2014/11/16/short-id-generation-in-javascript/
  var ALPHABET = '23456789abdegjkmnpqrvwxyz';
  var ID_LENGTH = 8;
  var shareCode = shareCode();
  function shareCode() {
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
      rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
  }

  console.warn("createShareCode book:");
  console.warn(book);

  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createShareCode",
    data: { bookId: book.bookId, bookData: JSON.stringify(book), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // For debugging purposes
      console.warn("createShareCode success:");
      console.warn(success);

      // NOTE: Should think of better messages here
      if (success == "Code in use") {
        // Try again with a new share code
        console.warn("Share code in use. Generating new code...");
        createShareCode();
      } else if (success == "Receiver exists") {
        // NOTE: Should probably add in headers
        SimpleNotification.warning({
          // IDEA: Warning symbol for images; yellow might not be enough
          text: 'Book has already been sent.'
        }, notificationOptions);
      } else if (success == "Share code exists") {
        SimpleNotification.warning({
          text: 'Share code already generated.'
        }, notificationOptions);
      } else {
        // Share code created successfully
        book.shareCode = shareCode;
        _this.redirectTo('/shareCode');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createShareCode:");
      console.error(XMLHttpRequest.responseText);

      SimpleNotification.error({
        title: 'Error creating share code!',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Insert navigation elements into routes requiring them
 */
function navBar() {
  if (_this.state.authenticated === false) {
    // With this I can remove the login button for nav
    return _this.redirectTo('/login');
  }

  // Route to home on title or logo click
  var mobile = getBySelector("#mobile");
  $(mobile).unbind().click(function() { _this.redirectTo('/home') });

  // Only retrieve data if it does not exist in memory; https://auth0.com/docs/policies/rate-limits
  var avatar = getBySelector('.profile-image');
  if (profile == null) {
    _this.loadProfile(function(err, _profile) {
      if (err) {
        console.log("Error loading profile:");
        console.error(err);

        // Assumes user is somehow not authenticated; easy catch-all solution
        _this.redirectTo('/login');
      }

      avatar.src = _profile.picture;
      profile = _profile;
    });
  } else {
    // NOTE: May cause issues if some data is changed; how to fix?
    // Not using localStorage yet because it seems overkill
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
      // TODO: Find a way for scrolling to close it
      $(".submenu").slideUp();
  });
}

/**
 * This needs to be easily collapsible because it is huge in
 * the route. As it says, just handles the event listeners.
 */
function addManipulateEventListeners() {
  // For example, in case you change your mind and want to use a different template
  $('#back').unbind().click(function() {
    // TODO: Add support for native back button here and elsewhere
    book = null;
    _this.redirectTo('/create');
  });

  $('#save').unbind().click(function() {
    if (development) {
      updateTemplate();
    } else {
      // IDEA: Have this function called saveBook and update if existing and create if not;
      // instead can I just check if book already has a UUID? How...
      createBook();
    }
  });

  // Shows user UI to create a new coupon to add to the book
  $('#plus').unbind().click(function() {
    fadeBetweenElements("#bookContent", "#newCouponForm");

    // Set back button to take you back to coupon list
    $('#back').unbind().click(function() {
      fadeBetweenElements("#newCouponForm", "#bookContent");

      $('#back').unbind().click(function() {
        book = null;
        _this.redirectTo('/create');
      });

      $('#save').unbind().click(function() {
        if (development) {
          updateTemplate();
        } else {
          createBook();
        }
      });
    });

    $('#save').unbind().click(function() {
      createCoupon();
    });
  });
}

/**
 * Function to fade between elements so it is easy to adjust
 * the timings without changing in multiple places.
 * @param {string} fadeOut the selector of the element to disappear
 * @param {string} fadeIn the selector of the element to appear
 */
function fadeBetweenElements(fadeOut, fadeIn) {
  console.warn("Fading out " + fadeOut + " and fading in " + fadeIn + "...");
  $(fadeOut).fadeOut(150, function() {
    $(fadeIn).fadeIn(400);
  });
}

/**
 * Handle (eventually) swiping for the tab menu
 */
function manageTabMenu() {
  const gestureZone = getById('gestureZone');
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
    // TODO: Add animation while moving between pages
    var ratio_horizontal = (touchendX - touchstartX) / $(gestureZone).width();
    var ratioComparison = .10;

    // Swipe right
    if (ratio_horizontal > ratioComparison) {
      var sentIsActive = $('#sentButton').hasClass('active');
      if (sentIsActive) {
        /*$(function () {
          $("#sent").animate({
              width: '100%'
          }, { duration: 500, queue: false });
      
          $("#received").animate({
              width: '0px'
          }, { duration: 500, queue: false });
        });*/
      }
    }
    
    // Swipe left
    if (ratio_horizontal < -ratioComparison) {
      // TODO
    }
  }
}

App.prototype.run = function(id) {
  this.container = getBySelector(id);
  this.resumeApp();
};

App.prototype.loadProfile = function(cb) {
  this.auth0.userInfo(this.state.accessToken, cb);
};

// TODO: Fix this not properly displaying the page because of SSO
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
      console.log(err);
      return (e.target.disabled = false);
    }

    client.client.userInfo(authResult.accessToken, function(err, user) {
      if (err) {
        console.log("Error in userInfo():");
        console.error(err);
      } else {
        // Now you have the user's information
        var userId = user.sub;
        console.warn("User sub: " + userId);
        localStorage.setItem('user_id', userId);

        // TODO: How to handle the sub if user logs in a different way?
      }
    });

    // TODO: Stop generating new refresh tokens; delete old ones
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('id_token', authResult.idToken);
    self.resumeApp();
  });
};

// TODO: Fix this allowing user to immediately login again without credentials
App.prototype.logout = function(e) {
  console.warn("Logging user out...");

  localStorage.removeItem('user_id');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  
  this.resumeApp();
};

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
        
        function getNewAccessToken() {
          // https://auth0.com/docs/tokens/refresh-token/current#use-a-refresh-token
          var options = {
            method: 'POST',
            url: 'https://couponbooked.auth0.com/oauth/token',
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form: {
              grant_type: 'refresh_token',
              client_id: 'eSRrTRp3CHav2n2wvXo9LvRtodKP4Ey8',
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

        var getNewAccessToken = getNewAccessToken();
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
  console.warn("render...");
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav
  var routes = ["home", "create", "manipulate", "dashboard", "shareCode", "profile"];
  if ($.inArray(currRouteId, routes) >= 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(nav);

    // Looks bad to have padding on home
    if (currRouteId != "home") {
      // Add invisible div for content padding below nav
      var invisibleDiv = document.createElement('div');
      invisibleDiv.style.cssText = "height: 60px;";
      this.container.appendChild(invisibleDiv);
    }
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;