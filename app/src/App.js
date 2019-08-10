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

        // TODO: Make sure the user clicks "save" first, then add name to JSON (not param) {?}
        // TODO: Create save button, whether on redirected page or if modifying current
        $('#save').click(function() {
          // TODO: Display notification [Spotify style] that it saved successfully or failed;
          // Add that capability with returning the success/failure from function
          createBook("testData"); // TODO: Include the actual data here
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
 * Retrieve coupon books the user has sent or received.
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
                  // TODO: improve this by showing image, title, other person
                  var node = document.createElement('div');
                  node.innerHTML = couponBook.bookData;
                  applicableElement.appendChild(node);

                  console.log(couponBook)
                } else {
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
 * Get the template corresponding to the button the user selects.
 * @param {string} template 
 */
function getTemplate(template) {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getTemplate?template=" + template,
    datatype: "html",
    success: function(data) {
      if (data == "") {
        // Should never happen outside of testing, but just in case.
        alert("No applicable template. Please try again.")
      } else {
        console.log(data)
        book = JSON.parse(data); // IDEA: Parse here?
        console.log(book)
        
        _this.redirectTo('/manipulate');
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in getTemplate:");
      console.error(errorThrown);
      // TODO: use Materialize to show failure pop-up
    }
  });
}

/**
 * Create a new Coupon Book and upload it to the database
 * @param {string} book stringified version of JSON
 */
function createBook(book) {
  var uuid = uuidv4();
  var sender = localStorage.getItem('user_id');
  $.ajax({
    // TODO: Look into if there are fancier additional settings
    type: "POST",
    url: "http://www.couponbooked.com/scripts/createBook",
    data: { bookId: uuid, sender: sender, bookData: book },
    crossDomain: true,
    dataType: "html",
    cache: false,
    success: function(success) {
      // Notify of success; set notification to green
      var message = "Successfully created coupon book";
      alert(message);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in createBook POST:");
      console.error(errorThrown);

      // Notify of failure; set notification to red
      var message = "Error creating coupon book. Please try again later";
      alert(message);
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
 * @param {*} _this passing the `this` reference as parameter from calling route
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