// NOTE: THIS FILE DOES NOT REDEPLOY ON `npm run android`
// This goes to webpack, which you have to rebuid to test any changes.
var env = require('../env');
var Auth0 = require('auth0-js');
var Auth0Cordova = require('@auth0/cordova');

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
        nav = page.querySelector("#nav");

        if (this.state.authenticated === true) {
          return this.redirectTo('/home');
        }
        return this.redirectTo('/login');
      }
    },
    '/login': {
      id: 'login',
      onMount: function(page) {
        if (this.state.authenticated === true) {
          return this.redirectTo('/home');
        }
        var loginButton = page.querySelector('.btn-login');
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
          navBar(page, _this);
      }
    },
    '/profile': {
      id: 'profile',
      onMount: function(page) {
        if (this.state.authenticated === false) {
          return this.redirectTo('/login');
        }

        _this = this;
        navBar(page, _this);

        var logoutButton = page.querySelector('.btn-logout');
        var avatar = page.querySelector('#avatar');
        var profileCodeContainer = page.querySelector('.profile-json');
        logoutButton.addEventListener('click', this.logout);
        this.loadProfile(function(err, profile) {
          if (err) {
            profileCodeContainer.textContent = 'Error ' + err.message;
          }
          profileCodeContainer.textContent = JSON.stringify(profile, null, 4);
          avatar.src = profile.picture;
        });
      }
    }
  }
};

function navBar(page, _this) {
  // Profile picture for nav bar
  var avatar = page.querySelector('.profile-image');
  _this.loadProfile(function(err, profile) {
    if (err) {
      console.error('Error ' + err.message);
    }
    avatar.src = profile.picture;
  });

  // Logout button on dropdown
  var logoutButton = page.querySelector('.logout');
  logoutButton.addEventListener('click', _this.logout);

  // Profile button on dropdown
  var profileButton = page.querySelector('.profile');
  profileButton.addEventListener('click', function() { _this.redirectTo('/profile') });

  // Profile picture dropdown
  $(".account").click(function() {
      // TODO: See if it is possible to have the shadow visible before the entire element is unrolled
      // IDEA: Container element?
      if (!$('.submenu').is(':visible')) {
        $(".submenu").slideDown();
      }
  });
  $(".root li").mouseup(function() {
      return false
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
    scope: 'openid profile',
    audience: env.AUTH0_AUDIENCE
  };
  var self = this;
  client.authorize(options, function(err, authResult) {
    if (err) {
      console.log(err);
      return (e.target.disabled = false);
    }
    localStorage.setItem('access_token', authResult.accessToken);
    self.resumeApp();
  });
};

App.prototype.logout = function(e) {
  localStorage.removeItem('access_token');
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

  if (accessToken) {
    this.state.authenticated = true;
    this.state.accessToken = accessToken;
  } else {
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
  if (currRouteId == "home" || currRouteId == "profile") {
    this.container.appendChild(nav);
  }

  this.container.appendChild(element);
  currRoute.onMount.call(this, this.container);
};

module.exports = App;
