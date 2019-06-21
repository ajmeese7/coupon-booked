// Initialize Firebase
/*var config = {
    
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
}*/



// TESTING!
var config = {
    apiKey: "AIzaSyAlXDmH2X2zZ1vUhP3TQ2AZ0yQVutiDQGM",
    authDomain: "coupon-booked.firebaseapp.com",
    databaseURL: "https://coupon-booked.firebaseio.com",
    storageBucket: "coupon-booked.appspot.com",
    messagingSenderId: "243041825180"
};

firebase.initializeApp(config);

var uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    callbacks: {
        signInSuccess: function(currentUser, credential, redirectUrl) {          
            handleSignedInUser(currentUser);
            // Do not redirect.
            return false;
        }
    },
    signInOptions: [
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ],
    tosUrl: 'tos.html',
    privacyPolicyUrl: 'privacy.html'
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
// Keep track of the currently signed in user.
var currentUid = null;

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
    document.getElementById('sign-in').textContent = 'Sign out';

    currentUid = user.uid;
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    
    document.getElementById('name').innerHTML = "<b>Display Name: </b>" + user.displayName;
    document.getElementById('email').innerHTML = "<b>User Email: </b>" + user.email;
    if (user.photoURL){
        document.getElementById('photo').src = user.photoURL;
        document.getElementById('photo').style.display = 'block';
    } else {
        document.getElementById('photo').style.display = 'none';
    }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    document.getElementById('sign-in').textContent = 'Sign in';

    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    ui.start('#firebaseui-container', uiConfig);
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
firebase.auth().onAuthStateChanged(function(user) {
    // The observer is also triggered when the user's token has expired and is
    // automatically refreshed. In that case, the user hasn't changed so we should
    // not update the UI.
    if (user && user.uid == currentUid) {
        return;
    }
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loaded').style.display = 'block';
    user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 * NOTE: I don't think this runs properly; I haven't been asked to sign in again.
 */
var deleteAccount = function() {
    firebase.auth().currentUser.delete().catch(function(error) {
        if (error.code == 'auth/requires-recent-login') {
            // The user's credential is too old. She needs to sign in again.
            firebase.auth().signOut().then(function() {
                // The timeout allows the message to be displayed after the UI has
                // changed to the signed out state.
                setTimeout(function() {
                    alert('Please sign in again to delete your account.');
                }, 1);
            });
        }
    });
};


/**
 * Initializes the app.
 */
var initApp = function() {
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut();
    });
    document.getElementById('delete-account').addEventListener('click', function() {
        deleteAccount();
    });
};

window.addEventListener('load', initApp);