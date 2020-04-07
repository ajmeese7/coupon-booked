// TODO: Get rid of env.js and replace it with something actually secure;
// https://stackoverflow.com/a/20476846/6456163

// When document is ready, initialize the application
$(function() {
    console.warn("Page is ready...");
    onesignalNotifications();

    var app = new App();
    app.run('#app');
});

/**
 * Initialize OneSignal connection once user is authenticated.
 */
function onesignalNotifications() {
    // TODO: Is there a way to handle if the user refuses?
        // IDEA: Could email or some shit?
    OneSignal.push(function() {
        OneSignal.showNativePrompt();
        console.warn("OneSignal initialized...");
    });

    // IDEA: https://documentation.onesignal.com/docs/create-an-activity-feed
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
        .handleNotificationOpened(notificationOpenedCallback)
        .inFocusDisplaying(window.plugins.OneSignal.OSInFocusDisplayOption.Notification)
    */
}