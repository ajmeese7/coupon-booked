// TODO: Get rid of env.js and replace it with something actually secure;
// https://stackoverflow.com/a/20476846/6456163

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
    var userId = localStorage.getItem('user_id');
    let iOS = /iPad|iPhone|iPod/.test(navigator.platform)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    // TODO: Double check on a real device that this actually works

    // TODO: Is there a way to handle if the user refuses?
        // IDEA: Could email or some shit?
    OneSignal.push(function() {
        OneSignal.showNativePrompt();
        console.warn("OneSignal initialized...");

        // Adds the OneSignal ID to the database
        OneSignal.getUserId(function(onesignalId) {
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