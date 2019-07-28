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
  this.auth0 = new Auth0.Authentication({
    domain: env.AUTH0_DOMAIN,
    clientID: env.AUTH0_CLIENT_ID
  });
  this.login = this.login.bind(this);
  this.logout = this.logout.bind(this);
}

var nav, _this; // https://stackoverflow.com/a/1338622
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

        var loginButton = getBySelector('.btn-login');
        loginButton.addEventListener('click', this.login);
      }
    },
    '/home': {
      id: 'home',
      onMount: function(page) {
          if (this.state.authenticated === false) {
            // With this I can remove the login button for nav
            return this.redirectTo('/login');
          }

          _this = this;
          navBar(_this);
      }
    },
    '/profile': {
      id: 'profile',
      onMount: function(page) {
        if (this.state.authenticated === false) {
          return this.redirectTo('/login');
        }

        _this = this;
        navBar(_this);

        var logoutButton = getBySelector('.btn-logout');
        var avatar = getBySelector('#avatar');
        var profileCodeContainer = getBySelector('.profile-json');
        logoutButton.addEventListener('click', this.logout);
        
        profileCodeContainer.textContent = JSON.stringify(profile, null, 4);
        avatar.src = profile.picture;
      }
    }
  }
};

function navBar(_this) {
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
        this.redirectTo('/login');
      }

      avatar.src = _profile.picture;
      profile = _profile;
    });
  } else {
    // NOTE: May cause issues if some data is changed; how to fix?
    // Not using localStorage yet because it seems overkill
    avatar.src = profile.picture;
  }

  // Logout button on dropdown
  var logoutButton = getBySelector('.logout');
  logoutButton.addEventListener('click', _this.logout);

  // Profile button on dropdown
  var profileButton = getBySelector('.profile');
  profileButton.addEventListener('click', function() { _this.redirectTo('/profile') });

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
        console.log("User sub: " + userId);

        // TODO: Use this info to access the SQL database
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
  var accessToken = localStorage.getItem('access_token');
  var refreshToken = localStorage.getItem('refresh_token');
  var idToken = localStorage.getItem('id_token');

  if (accessToken) {
    // Verifies the access token is still valid
    var decoded = jwt.decode(idToken);
    var expDate = decoded.exp;
    var currentDate = Math.ceil(Date.now() / 1000);

    if (expDate < currentDate) {
        // Token already expired
        console.log("Access token expired. Acquiring new access token using refresh token...");

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
        
        // Gets a new access token using the refresh token
        request(options, function (error, response, body) {
          if (error) throw new Error(error);
          
          // Convert string to JavaScript object
          body = JSON.parse(body);
          localStorage.setItem('access_token', body.access_token);
          console.log("Access token retrieval successful! New access token: " + body.access_token);
        });
    } else {
      console.log("The access token is not yet expired.");
    }

    console.log("Setting authentication state to true...");
    this.state.authenticated = true;
    this.state.accessToken = accessToken;
  } else {
    console.log("No access token. Setting authentication state to false...");

    this.state.authenticated = false;
    this.state.accessToken = null;
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
  var navRoutes = ["home", "profile"];
  if ($.inArray(currRouteId, navRoutes) >= 0) {
    // https://frontstuff.io/a-better-way-to-perform-multiple-comparisons-in-javascript
    this.container.appendChild(nav);
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;