// TODO: Work on fixing third party cookies issue
var config = {
    // TODO: Use https://stackoverflow.com/a/40962187 for security + API permissions
    apiKey: "AIzaSyAlXDmH2X2zZ1vUhP3TQ2AZ0yQVutiDQGM",
    authDomain: "coupon-booked.firebaseapp.com",
    databaseURL: "https://coupon-booked.firebaseio.com",
    storageBucket: "coupon-booked.appspot.com",
    messagingSenderId: "243041825180"
};

// TODO: Look into using Firebase database for user info?
firebase.initializeApp(config);
firebase.auth().useDeviceLanguage();

// TODO: Implement this for account creation:
// https://firebase.google.com/docs/functions/auth-events#trigger_a_function_on_user_creation
var uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    callbacks: {
        signInSuccess: function(currentUser, credential, redirectUrl) {
            handleSignedInUser(currentUser);
            // Manually redirect.
            // TODO: Implement this to determine whether to send user to tutorial on first login:
            // https://github.com/firebase/firebaseui-web/issues/137#issuecomment-388467423
            //window.location.assign("/tutorial.php");
            // Do not automatically redirect.
            return false;
            // IDEA: Send some kind of signal, possibly via URL, to the redirect page (experimentation)
            // that tells it to switch to profile pic displayed with loading icon (3 bouncing dots).
            // NOTE: Obviosuly this would not be ideal, but better than nothing until the data retrieval
            // can be sped up for things such as the profile page, perhaps with SQL.
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
    // IDEA: Display a splashscreen at startup when waiting for data;
    // https://stackoverflow.com/a/41954672
    // NOTE: can also lazy load all required data and assume user is still
    // signed in until told otherwise by Firebase; https://urlzs.com/kNbJG
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
        // TODO: Get a better image or assign a random one like
        // https://github.com/adorableio/avatars-api-middleware
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
    // TODO: Migrate to example where there is a then statement to handle that case.
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
    // TODO: Use this if I switch to Cordova:
    // https://firebase.google.com/docs/auth/web/cordova
    document.getElementById('sign-out').addEventListener('click', function() {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            // TODO: Handle this with some kind of sign out notification
            // ex. https://css-tricks.com/pop-from-top-notification/
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    });
    /*document.getElementById('delete-account').addEventListener('click', function() {
        // TODO: Add to settings or profile page
        deleteAccount();
    });*/
};

window.addEventListener('load', initApp);