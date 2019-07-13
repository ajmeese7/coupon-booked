var Auth0Cordova =  require('@auth0/cordova');
var App = require('./App');

// Should this be replaced like the example suggested?
function main() {
    var app = new App();
    function intentHandler(url) {
        Auth0Cordova.onRedirectUri(url);
    }
    window.handleOpenURL = intentHandler;
    app.run('#app');
}

document.addEventListener('deviceready', main);