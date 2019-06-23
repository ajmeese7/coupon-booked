var config = {
    // TODO: Use https://stackoverflow.com/a/40962187 for security + API permissions
    apiKey: "AIzaSyAlXDmH2X2zZ1vUhP3TQ2AZ0yQVutiDQGM",
    authDomain: "coupon-booked.firebaseapp.com",
    databaseURL: "https://coupon-booked.firebaseio.com",
    storageBucket: "coupon-booked.appspot.com",
    messagingSenderId: "243041825180"
};

firebase.initializeApp(config);
firebase.auth().useDeviceLanguage();

var uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    callbacks: {
        signInSuccess: function(currentUser, credential, redirectUrl) {
            handleSignedInUser(currentUser);
            // Manually redirect.
            //window.location.assign("/profile.php"); // TODO: Set this page to function when user isn't signed in
            // Do not automatically redirect.
            return false;
        }
    },
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
// Keep track of the currently signed in user.
var currentUid = null;

/**
 * Displays the UI for a signed in user.
 * @param {!firebase.User} user
 */
var handleSignedInUser = function(user) {
    document.getElementById('sign-in').style.display = 'none';
    document.getElementById('profile-picture').style.display = 'inline-block';
    
    currentUid = user.uid;
    document.getElementById('user-signed-in').style.display = 'block';
    document.getElementById('user-signed-out').style.display = 'none';
    
    document.getElementById('name').innerHTML = "<b>Display Name: </b>" + user.displayName;
    document.getElementById('email').innerHTML = "<b>User Email: </b>" + user.email;
    if (user.photoURL) {
        document.getElementById('profile-picture').src = user.photoURL;
    } else {
        // TODO: Get a better image
        var defaultImage = "images/default.png";

        user.updateProfile({
            photoURL: defaultImage
        }).then(function() {
            // Update successful.
            document.getElementById('profile-picture').src = user.photoURL;
        }).catch(function(error) {
            // An error happened.
            console.error(error);
            document.getElementById('profile-picture').src = defaultImage;
        });
    }
};


/**
 * Displays the UI for a signed out user.
 */
var handleSignedOutUser = function() {
    document.getElementById('sign-in').style.display = 'block';
    document.getElementById('profile-picture').style.display = 'none';
    
    document.getElementById('user-signed-in').style.display = 'none';
    document.getElementById('user-signed-out').style.display = 'block';
    ui.start('#firebaseui-container', uiConfig);
};

// Listen to change in auth state so it displays the correct UI for when
// the user is signed in or not.
// TODO: Even though auth state is tracked, user data is not. How to do?
firebase.auth().onAuthStateChanged(function(user) {
    // The observer is also triggered when the user's token has expired and is
    // automatically refreshed. In that case, the user hasn't changed so we should
    // not update the UI.
    if (user && user.uid == currentUid) {
        return;
    }

    // TODO: Use this tracking state code to determine whether each page's nav needs
    // to show the sign in button or the user's information on the fancy menu.
    document.getElementById('loading').style.display = 'none';
    document.getElementById('loaded').style.display = 'block';
    user ? handleSignedInUser(user) : handleSignedOutUser();
});

/**
 * Deletes the user's account.
 */
var deleteAccount = function() {
    firebase.auth().currentUser.delete().catch(function(error) {
        if (error.code == 'auth/requires-recent-login') {
            // The user's credential is too old. User needs to sign in again.
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
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            // TODO: Handle this more elegantly
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    });
    document.getElementById('delete-account').addEventListener('click', function() {
        deleteAccount();
    });
};

window.addEventListener('load', initApp);