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
  // cleanBuild = true;
  if (cleanBuild) {
    console.log("Wiping local storage...");
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

// Should this close on click or reset timer default behavior?
var notificationOptions = { fadeout: 500, closeOnClick: true, duration: 3000 };
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
        navBar(_this);

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
        navBar(_this);

        // Set button height equal to its width because CSS is annoying
        var width = $('button').width();
        var marginBottom = $('button').css("margin-bottom");
        $('#buttonContainer button').height(width + marginBottom);

        $('#buttonContainer button').unbind().click(function() {
          // TODO- start manipulating (redirect to manipulation route?), store locally until saved
            // https://stackoverflow.com/a/22162030
          var name = $(this).text().toLowerCase();
          getTemplate(name);
        });
      }
    },
    '/manipulate': {
      id: 'manipulate',
      onMount: function(page) {
        _this = this;
        navBar(_this);

        // For example, in case you change your mind and want to use a different template
        $('#back').unbind().click(function() {
          book = null;
          _this.redirectTo('/create');
        });

        $('#save').unbind().click(function() {
          // IDEA: Have this function called saveBook and update if existing and create if not;
            // instead can I just check if book already has a UUID?
          createBook(JSON.stringify(book));
        });
      }
    },
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        _this = this;
        navBar(_this);

        $('#tabs-swipe-demo').tabs();
        manageTabMenu();

        // User clicks "Send one now!" and they're redirected to the create route
        $('#start').unbind().click(function() {
          _this.redirectTo('/create');
        });
        
        pullUserRelatedBooks();
      }
    },
    '/profile': {
      id: 'profile',
      onMount: function(page) {
        _this = this;
        navBar(_this);

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
      console.error(errorThrown);
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
            var isSent = arrayNumber == 0;
            var applicableElement = isSent ? getById("sent") : getById("received");

            // Go over each coupon book in sent {0} or received array {1}
            $.each(array, function(couponNumber, couponBook) {
                if (couponBook) {
                  console.log(couponBook)
                  var node = document.createElement('div');
                  node.setAttribute("class", "bookPreview");

                  // Image to represent book
                  if (couponBook.image) {
                    node.innerHTML += "<img class='bookImage' src='" + couponBook.bookData.image + "' />";
                  } else {
                    // TODO: https://www.flaticon.com/free-icon/gift_214305#term=gift&page=1&position=5
                    node.innerHTML += "<img class='bookImage' src='images/gift.png' />";
                  }

                  // Name of coupon book
                  node.innerHTML += "<p class='bookName'>" + couponBook.bookData + "</p>"; /* TODO: .name*/

                  // TODO: Test line wrapping or something for longer book names
                  if (isSent) {
                    // Sent books
                    var receiver = couponBook.receiver;
                    if (receiver) {
                      // Who the book is sent to
                      // TODO: How to store reciever name in way that is readable?
                      node.innerHTML += "<p class='receiverText'>Sent to " + receiver + "</p>";
                    } else {
                      node.innerHTML += "<p class='receiverText'>Not sent yet</p>";
                    }
                  } else {
                    // Received books
                    var sender = couponBook.sender;
                    if (sender) {
                      // Who the book is sent from
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
        console.error(errorThrown);
        // TODO: Display some kind of `failed` pop-up to user
      }
  });
}

/**
 * Get the template corresponding to the button the user selects
 * and send the user to the manipulation page. Sets the requested
 * data to the global book variable.
 * @param {string} template the name of the template to be retreived
 */
function getTemplate(template) {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getTemplate?template=" + template,
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
        _this.redirectTo('/manipulate');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in getTemplate:");
      console.error(errorThrown);

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
 * @param {string} templateData stringified JSON that comprises the coupons
 */
function createTemplate(name, templateData) {
  // IDEA: Option on manipulate page if userId is mine to send data as template;
  // Obviously remove before production to avoid hackers
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createTemplate",
    data: { name: name, templateData: templateData },
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
      console.error(errorThrown);

      SimpleNotification.error({
        title: 'Error creating template',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Create a new Coupon Book and upload it to the database
 * @param {string} book stringified version of JSON
 */
function createBook(bookData) {
  var uuid = uuidv4();
  var sender = localStorage.getItem('user_id');
  $.ajax({
    // TODO: Display notification [Spotify style] that it saved successfully or failed
    // TODO: Look into if there are fancier additional settings
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, bookData: bookData },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      SimpleNotification.success({
        text: 'Successfully saved book' // Created looks better; can I use?
      }, notificationOptions);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createBook:");
      console.error(errorThrown);

      SimpleNotification.error({
        // TODO: Try jQuery slideDown animation
        // TODO: Delete on page change! Something with routing? Or modify JS to add to .app
        // TODO: Test if it's possible to have better close animation
        title: 'Error creating book!',
        text: 'Please try again later.'
      }, notificationOptions);
    }
  });
}

/**
 * Update book, whether by adding more coupons or changing the counts.
 * @param {string} book the new bookData of the book, post-stringification
 * @param {string} bookId the UUID of the book
 */
function updateCouponBook(book, bookId) {
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/updateData",
    data: { bookData: book, bookId: bookId },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // TODO
      console.log(success)
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in updateCouponBook POST:");
      console.error(errorThrown);
    }
  });
}

/**
 * Insert navigation elements into routes requiring them
 * @param {object} _this passing the `this` reference as parameter from calling route
 */
function navBar(_this) {
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

    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('refresh_token', authResult.refreshToken);
    localStorage.setItem('id_token', authResult.idToken);
    self.resumeApp();
  });
};

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
  console.log("Please unhide warnings when debugging routing. Otherwise, hide them.");
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
        console.warn("Access token expired. Acquiring new access token using refresh token...");
        
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
                // Convert string to JavaScript object and get applicable property
                var accessToken = JSON.parse(body).access_token;
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
      console.warn("The access token is not yet expired.");
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
  var routes = ["home", "create", "manipulate", "dashboard", "profile"];
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