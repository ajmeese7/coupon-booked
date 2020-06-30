// When document is ready, initialize the application
$(function() {
    // Called to prepare for application start
    onesignalNotifications();

    // Disable back button for page navigation; https://stackoverflow.com/a/25806609/6456163
    var rx = /INPUT|SELECT|TEXTAREA/i;
    $(document).bind("keydown keypress", function(e) {
        if (e.which == 8) { // 8 == backspace
            if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
                e.preventDefault();
            }
        }
    });

    // Actually starts the app up
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

        // Adds the OneSignal ID to the database
        OneSignal.getUserId(function(onesignalId) {
            // TODO: Can I check if the OneSignal ID changes when logged in for same account
            // on desktop vs mobile, and if it does update the server with the new one?
            localStorage.setItem('onesignal_id', onesignalId);
        });
    });

    // IDEA: https://documentation.onesignal.com/docs/create-an-activity-feed
}