var Auth0Cordova =  require('@auth0/cordova');
var App = require('./App');
const env = require('../env');

document.addEventListener('deviceready', main);
function main() {
    document.addEventListener("backbutton", handleNativeBackButton, false);
    onesignalNotifications();

    var app = new App();
    function intentHandler(url) {
        Auth0Cordova.onRedirectUri(url);
    }
    window.handleOpenURL = intentHandler;
    app.run('#app');
}

function handleNativeBackButton() {
    // IDEA: Set this to go to previous route if no #backArrow;
    // close app if previous route /login or /
    var backButton = document.getElementById("backArrow");
    if (backButton) {
        console.warn("Native back button calling listener...");
        $('#backArrow').click();
    } else {
        // NOTE: This prevents the default behavior of the back button
        console.warn("Back button not supported on this page!");
    }
}

// TODO: Set all of this up for iOS as well once testing commences
function onesignalNotifications() {
    // Enable to debug issues.
    // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    
    var notificationOpenedCallback = function(jsonData) {
        console.log('notificationOpenedCallback:');
        console.log(jsonData);
    };
    
    // TODO: Prevent it from displaying alert if currently in app?
    window.plugins.OneSignal
        .startInit(env.ONESIGNAL_ID)
        .handleNotificationOpened(notificationOpenedCallback)
        .endInit();
}