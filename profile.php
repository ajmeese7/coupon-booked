<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width" />
    <meta name="google-signin-client_id" content="243041825180-hf171dl59cjh4cksgko57no0jfcmgn0b.apps.googleusercontent.com">

    <link rel="stylesheet" type="text/css" href="https://unpkg.com/picnic" />
    <script src="https://cdn.firebase.com/libs/firebaseui/4.0.0/firebaseui.js"></script>
    <link rel="stylesheet" type="text/css" href="css/mobile-nav.css" />
    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <link rel="stylesheet" type="text/css" href="css/nav.css" />
    <link rel="stylesheet" type="text/css" href="css/scroll-down.css" />

    <link rel="shortcut icon" href="images/favicon.png" />
    <link rel="apple-touch-icon" href="images/apple-touch-icon.png" />

    <script src="javascript/jquery-1.8.0.min.js"></script>

    <title>Coupon Booked</title>
</head>
<body>
    <nav>
        <div id="desktop">
            <a id="brand" href="http://www.couponbooked.com"><img id="logo" src="images/logo.png">Coupon Booked</a>
            <a id="scroll-why" href="#why">Why us?</a>
            <a id="scroll-example" href="#examples">Examples</a>
            <a id="scroll-create" href="#create">Create Your Own</a>
            <div id="sign-in-status" class="hide"></div>
        </div>

        <div id="mobile">
            <span class="menu-btn" style="font-size: 30px; cursor: pointer">
                <img id="logo" src="images/logo.png">
                <img id="logo" src="images/x.png" class="hide">
            </span>
            <a id="brand" href="http://www.couponbooked.com">Coupon Booked</a>
        </div>

        <a id="sign-in" href="#login">Sign in</a>
    </nav>

    <!-- Sidebar content for mobile navigation -->
    <menu class="menu">
        <ul>
            <li><a href="#why">Why us?</a></li>
            <li><a href="#examples">Examples</a></li>
            <li><a href="#create">Create Your Own</a></li>
        </ul>
    </menu>

    <div id="firebaseui-auth-container" class="hide"></div>

    <main>
        <!-- TODO: Look into 'emailVerified' and figure out how to do that -->
        <!-- TODO: If user null, redirect to main page with alert? -->
        <!-- TODO: Fix being redirected twice; once to main page then to profile (idea) ? -->
        <pre id="account-details" style="margin-top: 100px"></pre>
        <img id="profilePic">
    </main>

    <script src="javascript/firebase-app.js"></script>
    <script src="javascript/firebase-auth.js"></script>
    <script src="javascript/firebase.js"></script>
    <script type="text/javascript" src="javascript/index.js"></script>
    <link type="text/css" rel="stylesheet" href="https://cdn.firebase.com/libs/firebaseui/4.0.0/firebaseui.css" />

    <style>
        #profilePic {
            width: 100px;
            height: 100px;
        }
    </style>
</body>
</html>
