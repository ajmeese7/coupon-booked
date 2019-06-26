<!DOCTYPE html>
<html>
<head>
    <?php include 'header.php'; ?>
    <link rel="canonical" href="http://app.couponbooked.com/profile">
</head>
<body>
    <?php 
        include 'nav.php';
        include 'login.php';
    ?>

    <!-- TODO: Set this page to not function when user isn't signed in -->
    <main>
        <!-- TODO: Add advanced actions such as those described at https://urlzs.com/JnATD -->
        <div id="account-details"></div>
    </main>

    <?php include 'scripts.php'; ?>
    <script>
        /*var user = firebase.auth().currentUser;
            // TODO: Have some type of wait here or store user info too
            user.getIdToken().then(function(accessToken) {
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
            }); // Use User.getToken()?
        } else {
            // NOTE: This does not work because the sign in takes time to load.
            console.log("You are not signed in! You aren't supposed to access this page.");
            // Attempt to prevent seeing page without being signed in.
            //window.location.assign("index.php");
        }*/
    </script>
</body>
</html>
