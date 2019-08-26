var Auth0Cordova =  require('@auth0/cordova');
var App = require('./App');

function main() {
    document.addEventListener("backbutton", handleNativeBackButton, false);

    var app = new App();
    function intentHandler(url) {
        Auth0Cordova.onRedirectUri(url);
    }
    window.handleOpenURL = intentHandler;
    app.run('#app');
}

document.addEventListener('deviceready', main);

function handleNativeBackButton() {
    // IDEA: Set this to go to previous route if no #backArrow;
    // close app if precious route /login or /
    var backButton = document.getElementById("backArrow");
    if (backButton) {
        console.warn("Native back button calling listener...");
        $('#backArrow').click();
    } else {
        // NOTE: This prevents the default behavior of the back button
        console.warn("Back button not supported on this page!");
    }
}