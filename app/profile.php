<!DOCTYPE html>
<html>
<head>
    <?php include 'header.php'; ?>
</head>
<body>
    <?php 
        include 'nav.php';
        include 'login.php';
    ?>

    <main>
        <div id="account-details"></div>
    </main>

    <?php include 'scripts.php'; ?>
    <script>
        /*var user = firebase.auth().currentUser;
        if (user != null) {
            user.getIdToken().then(function(accessToken) {
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
            }); // Use User.getToken()?
        } else {
            alert("You are not signed in! You aren't supposed to access this page.");
            // Attempt to prevent seeing page without being signed in.
            window.location.assign("index.php");
        }*/
    </script>
</body>
</html>
