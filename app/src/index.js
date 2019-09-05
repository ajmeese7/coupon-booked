var Auth0Cordova =  require('@auth0/cordova');
var App = require('./App');
const env = require('../env');

document.addEventListener('deviceready', main);
function main() {
    console.warn("Device is ready...");
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

/**
 * Initialize OneSignal connection once user is authenticated.
 */
// TODO: Set all of this up for iOS as well once testing commences
function onesignalNotifications() {
    // IDEA: https://documentation.onesignal.com/docs/create-an-activity-feed
    console.warn("onesignalNotifications...");
    // Enable to debug issues.
    // window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    
    var notificationOpenedCallback = function(jsonData) {
        // TODO: When notification clicked, display something in app, 
        // like the coupon clicked, description, image, remaining count;
        // how to do? IDEA: handleNotificationReceived Cordova SDK, or replace
        // the code of this
        jsonData.notification.payload.rawPayload = JSON.parse(jsonData.notification.payload.rawPayload);
        jsonData.notification.payload.rawPayload.custom = JSON.parse(jsonData.notification.payload.rawPayload.custom);
        console.warn('notificationOpenedCallback:');
        console.warn(jsonData);
    };
    
    // IDEA: implement idea above as a replacement for InAppAlert w/ notification
        // that uses handleNotificationOpened and replace the current w/ handleNotificationReceived
    // TODO: On notificationReceived refresh the display and pull books in case they're also viewing the book/coupon
    window.plugins.OneSignal
        .startInit(env.ONESIGNAL_ID)
        .handleNotificationOpened(notificationOpenedCallback)
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.InAppAlert)
        .endInit();
  }