//var Auth0Cordova =  require('@auth0/cordova');
var App = require('./App');

// TODO: Get rid of this and replace it with something actually secure;
// https://stackoverflow.com/a/20476846/6456163
const env = require('../js/env');

$(function() {
    console.warn("Page is ready...");
    onesignalNotifications();

    // Need to figure out if I want some kind of animation for web or not
    /*if (!localStorage.getItem("start_animation")) {
        console.warn("Initially setting animation to true...");
        localStorage.setItem("start_animation", "true");
    }*/
});

/**
 * Initialize OneSignal connection once user is authenticated.
 */
function onesignalNotifications() {
    // TODO: Is there a way to handle if the user refuses?
        // IDEA: Could email or some shit?
    OneSignal.push(function() {
        // TODO: Fiddle with this
        OneSignal.showNativePrompt();
        console.log("OneSignal initialized?");
    });

    // TODO: Convert!
    OneSignal.push(["init", {
        appId: env.ONESIGNAL_ID,
        // Your other init settings
    }]);

    // IDEA: https://documentation.onesignal.com/docs/create-an-activity-feed
    //window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
    
    // IDEA: On notificationReceived refresh the display and pull books in case they're also viewing the book/coupon
    var notificationOpenedCallback = function(jsonData) {
        // TODO: When notification clicked, display something in app, 
        // like the coupon clicked, description, image, remaining count;
        // how to do? IDEA: handleNotificationReceived Cordova SDK, or replace
        // the code of this. To do across files use localStorage and a listener
        // for the value of the variable changing
        jsonData.notification.payload.rawPayload = JSON.parse(jsonData.notification.payload.rawPayload);
        jsonData.notification.payload.rawPayload.custom = JSON.parse(jsonData.notification.payload.rawPayload.custom);
        console.warn('notificationOpenedCallback:', jsonData);
    };
    
    /*window.plugins.OneSignal
        //.startInit(env.ONESIGNAL_ID)
        .handleNotificationOpened(notificationOpenedCallback)
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
        //.endInit();
    */
}