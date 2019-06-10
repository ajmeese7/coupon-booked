// Initialize Firebase
var config = {
    // TODO: Work on project API permissions once I get closer to production, and TEST!
    apiKey: "AIzaSyAlXDmH2X2zZ1vUhP3TQ2AZ0yQVutiDQGM",
    authDomain: "coupon-booked.firebaseapp.com",
    databaseURL: "https://coupon-booked.firebaseio.com",
    projectId: "coupon-booked",
    storageBucket: "coupon-booked.appspot.com",
    messagingSenderId: "243041825180"
};

// IDEA: Use a URL parameter for the app that conditionally loads specific
// Firebase settings, etc. for mobile platforms; will that work for analytics too?
firebase.initializeApp(config);
firebase.auth().useDeviceLanguage();

// TODO: Look into using something like this to help my build process:
// https://stackoverflow.com/a/40962187
var uiConfig = {
    // TODO: Add callbacks for failure, etc.
    signInSuccessUrl: 'http://couponbooked.com/profile.php',
    signInOptions: [
        // IDEA: Instead of guest login, just add option to send coupon book anonymously
        // TODO: Either style what is here better or add more options; maybe both
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    tosUrl: 'tos.html',
    privacyPolicyUrl: 'privacy.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

var user = firebase.auth().currentUser; // For accessing user propeties outside of the initApp function

// TODO: Use this tracking state code to determine whether each page's nav needs
// to show the sign in button or the user's information on the fancy menu.
initApp = function() {
    // NOTE: Currently the sign in is not persistant when page is refreshed; HOW TO FIX?
    firebase.auth().onAuthStateChanged(function(currentUser) {
        user = currentUser;
    }, function(error) {
        console.error(error);
    });
};

window.addEventListener('load', function() {
    initApp();
});

// NOTE: After creating a Google account, it sends you back to the main page without signing
// you in. You then have to sign in again. How to fix?
if (user) {
    // TODO: Look into the purpose of accessToken
    user.getIdToken().then(function(accessToken) {
        document.getElementById('sign-in').textContent = 'Sign out';
        // TODO: Need to change this to show user image that leads to fancy drop down menu
        document.getElementById('account-details').textContent = JSON.stringify({
            displayName: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
            phoneNumber: user.phoneNumber,
            photoURL: user.photoURL,
            uid: user.uid,
            accessToken: user.accessToken,
            providerData: user.providerData
        }, null, '  ');
    });
} else {
    document.getElementById('sign-in').textContent = 'Sign in';
    document.getElementById('account-details').textContent = 'User not logged in';
}

var profilePic = document.getElementById("profilePic");
if (profilePic) profilePic.setAttribute("src", user.photoURL);