// Initialize Firebase
var config = {
    // TODO: How to obsfucate this?
    apiKey: "AIzaSyAlXDmH2X2zZ1vUhP3TQ2AZ0yQVutiDQGM",
    authDomain: "coupon-booked.firebaseapp.com",
    databaseURL: "https://coupon-booked.firebaseio.com",
    projectId: "coupon-booked",
    storageBucket: "coupon-booked.appspot.com",
    messagingSenderId: "243041825180"
};
firebase.initializeApp(config);

var uiConfig = {
    // IDEA: Could send them to their profile for the redirect, but be careful, because that was causing problems last time.
    // Ties into ui.start() method linked
    signInSuccessUrl: 'http://couponbooked.com',
    signInOptions: [
        // TODO: Enable all sign-in options and configure
        // IDEA: Instead of guest login, ust add option to send coupon book anonymously
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
        firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
    // Is the callback function better or different in any way?
    // TODO: Test this to make sure it works somehow
    tosUrl: 'tos.html',
    privacyPolicyUrl: function() {
        window.location.assign('privacy.html');
    }
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);
// Is pending redirect option needed? https://github.com/firebase/firebaseui-web#using-firebaseui-for-authentication


// TODO: Use this tracking state code to determine whether each page's nav needs
// to show the sign in button or the user's information on the fancy menu.
initApp = function() {
    // NOTE: Most of this is unnecessary and should be removed before production
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            user.getIdToken().then(function(accessToken) {
                document.getElementById('sign-in-status').textContent = 'Signed in';
                document.getElementById('sign-in').textContent = 'Sign out';
                // TODO: Need to change this to show user image that leads to fancy drop down menu
                document.getElementById('account-details').textContent = JSON.stringify({
                    displayName: displayName,
                    email: email,
                    emailVerified: emailVerified,
                    phoneNumber: phoneNumber,
                    photoURL: photoURL,
                    uid: uid,
                    accessToken: accessToken,
                    providerData: providerData
                }, null, '  ');
            });
        } else {
            // User is signed out.
            document.getElementById('sign-in-status').textContent = 'Signed out';
            document.getElementById('sign-in').textContent = 'Sign in';
            document.getElementById('account-details').textContent = 'User not logged in';
        }
    }, function(error) {
        console.error(error);
    });
};

window.addEventListener('load', function() {
    initApp();
});