// When document is ready, initialize the application
$(function() {
    // Called to prepare for application start
    onesignalNotifications();

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
            var userId = localStorage.getItem('user_id');
            let iOS = !!navigator.platform.match(/iPhone|iPod|iPad/);
            localStorage.setItem('onesignal_id', onesignalId);

            $.ajax({
                type: "POST",
                url: "https://www.couponbooked.com/scripts/addOneSignalUserId",
                data: { userId: userId, onesignalId: onesignalId, iOS: iOS },
                crossDomain: true,
                cache: false,
                success: function(success) {
                    console.warn("Successfully set user's OneSignal ID...", success);
                },
                error: function(XMLHttpRequest, textStatus, errorThrown) {
                    console.error("Error setting OneSignal ID:", XMLHttpRequest.responseText);
                }
            });
        });
    });

    // IDEA: https://documentation.onesignal.com/docs/create-an-activity-feed
}