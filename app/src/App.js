// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
var env = require('../env');
var request = require("request");
var jwt = require('jsonwebtoken');
var Auth0 = require('auth0-js');
var Auth0Cordova = require('@auth0/cordova');
var profile;

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

function App() {
  // NOTE- I don't understand what this does, but it might be possible to replicate for SQL database
  this.auth0 = new Auth0.Authentication({
    domain: env.AUTH0_DOMAIN,
    clientID: env.AUTH0_CLIENT_ID
  });
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
}

var nav, userId, _this; // https://stackoverflow.com/a/1338622
App.prototype.state = {
  authenticated: false,
  accessToken: false,
  currentRoute: '/',
  routes: {
    '/': {
      id: 'loading',
      onMount: function(page) {
        nav = getBySelector("#nav");

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
        if (this.state.authenticated === true) {
          return this.redirectTo('/home');
        }

        // Login button at bottom of page
        var loginButton = getBySelector('.btn-login');
        loginButton.addEventListener('click', this.login);
      }
    },
    '/home': {
      id: 'home',
      onMount: function(page) {
        _this = this;
        navBar(_this);

        $('#createBook button').click(function() {
          _this.redirectTo('/create');
        });
      }
    },
    '/create': {
      id: 'create',
      onMount: function(page) {
        _this = this;
        navBar(_this);

        $('button').click(function() {
          var name = $(this).text().toLowerCase();
          getTemplate(name);

          // TODO: Make sure the user clicks "save" first, then add name to JSON (not param)
          //createNewCouponBook();
        });

        // TODO- create JSON for blank CB here, start manipulating (redirect to manipulation route?), store locally until saved
          // https://stackoverflow.com/a/22162030
          // For bookId, use small footprint method here: https://www.npmjs.com/package/uuid
        // TODO- AFTER user clicks save, make this create SQL connection and insert new CB
          // https://www.w3schools.com/nodejs/nodejs_mysql_select.asp
      }
    },
    '/dashboard': {
      id: 'dashboard',
      onMount: function(page) {
        _this = this;
        navBar(_this);

        // TODO set the content of the two menu pages in this function
        //pullUserRelatedBooks();
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
        logoutButton.addEventListener('click', this.logout);
      }
    }
  }
};

/**
 * Refresh the display with items from the table.
 */
function pullUserRelatedBooks() {
  $.ajax({
      type: "GET",
      url: "http://www.couponbooked.com/scripts/getData.php", // TODO add param here !!
      datatype: "html",
      success: function(data) {
        alert(data);
          // The split makes an array and the '-1' gets rid of an empty index at the end
          /*var coupons = data.split("}");
          coupons = coupons.slice(0, coupons.length - 1);
          applyOnlineCounts(coupons);*/
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log("Error in pullUserRelatedBooks:");
        console.error(errorThrown);
      }
  });
}

function getTemplate(template) {
  $.ajax({
    type: "GET",
    url: "http://www.couponbooked.com/scripts/getTemplate.php?template=" + template,
    datatype: "html",
    success: function(data) {
      //data = JSON.parse(data);
      console.log(data);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("Error in getTemplate:");
      console.error(errorThrown);
    }
});
}

function createNewCouponBook(book) {
  // TODO figure out what to do with parameters
  // https://stackoverflow.com/questions/38824050/get-javascript-and-ajax
  var xhr = new XMLHttpRequest();

  var params = name + "," + newCount;
  xhr.open("GET", "http://www.couponbooked.com/scripts/updateData.php?params=" + encodeURIComponent(params), true);
  xhr.send();
}

function navBar(_this) {
  if (_this.state.authenticated === false) {
    // With this I can remove the login button for nav
    return _this.redirectTo('/login');
  }

  // Route to home on title or logo click
  var mobile = getBySelector("#mobile");
  mobile.addEventListener('click', function() { _this.redirectTo('/home') });

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
  dashboardButton.addEventListener('click', function() { _this.redirectTo('/dashboard') });

  // Profile button on dropdown
  var profileButton = getBySelector('.profile');
  profileButton.addEventListener('click', function() { _this.redirectTo('/profile') });

  // Logout button on dropdown
  var logoutButton = getBySelector('.logout');
  logoutButton.addEventListener('click', _this.logout);

  // Profile picture dropdown
  $(".account").click(function() {
      // TODO: See if it is possible to have the shadow visible before the entire element is unrolled
      // IDEA: Container element?
      if (!$('.submenu').is(':visible')) {
        $(".submenu").slideDown();
      }
  });
  $(document).mouseup(function() {
      // TODO: Find a way for scrolling to close it
      $(".submenu").slideUp();
  });
}

App.prototype.run = function(id) {
  this.container = getBySelector(id);
  this.resumeApp();
};

App.prototype.loadProfile = function(cb) {
  this.auth0.userInfo(this.state.accessToken, cb);
};

App.prototype.login = function(e) {
  // TODO: Look into this forcing another login after authentication state confirmed
  console.log("/login route...");
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
        userId = user.sub;
        console.log("User sub: " + userId);

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
  console.log("Logging user out...");

  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('id_token');
  this.resumeApp();
};

App.prototype.redirectTo = function(route) {
  if (!this.state.routes[route]) {
    throw new Error('Unknown route ' + route + '.');
  }
  this.state.currentRoute = route;
  this.render();
};

App.prototype.resumeApp = function() {
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
        console.log("Access token expired. Acquiring new access token using refresh token...");
        
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
                // Convert string to JavaScript object
                resolve(JSON.parse(body));
              }
            });
          });
        }

        var getNewAccessToken = getNewAccessToken();
        getNewAccessToken.then(function(result) {
          result = result.access_token;
          localStorage.setItem('access_token', result);
          console.log("Access token retrieval successful! New access token: " + result);

          successfulAuth();
        }, function(error) {
          console.log("Retrieval of new access token failed! Setting authentication state to false...");
          console.error(error);

          failedAuth();
        });
    } else {
      console.log("The access token is not yet expired.");
      successfulAuth();
    }
  } else {
    console.log("No access token. Setting authentication state to false...");
    failedAuth();
  }

  function successfulAuth() {
    console.log("Setting authentication state to true...");
    _this.state.authenticated = true;
    _this.state.accessToken = accessToken;
  }

  function failedAuth() {
    _this.state.authenticated = false;
    _this.state.accessToken = null;
  }

  this.render();
};

App.prototype.render = function() {
  var currRoute = this.state.routes[this.state.currentRoute];
  var currRouteEl = getById(currRoute.id);
  var currRouteId = currRouteEl.id;
  var element = document.importNode(currRouteEl.content, true);
  this.container.innerHTML = '';

  // Apply nav
  var navRoutes = ["home", "create", "dashboard", "profile"];
  if ($.inArray(currRouteId, navRoutes) >= 0) {
    // IDEA: See if I can include all the nav code here as well
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(nav);
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;