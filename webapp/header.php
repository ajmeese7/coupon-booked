<head>
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#0b98de">

    <meta http-equiv="Content-Security-Policy" content="connect-src 'self' https://*.auth0.com https://*.couponbooked.com https://onesignal.com/api/v1/ https://checkout.stripe.com; 
        default-src 'self' data: gap: 'unsafe-inline' https://ssl.gstatic.com https://couponbooked.auth0.com https://cdn.onesignal.com https://onesignal.com https://cdn.auth0.com 
        https://unpkg.com/uuid@latest/dist/umd/ https://code.jquery.com/ui/1.12.1/ https://js.stripe.com/ https://checkout.stripe.com/ https://cdnjs.cloudflare.com/ajax/libs/jshashes/
        https://cdnjs.cloudflare.com/ajax/libs/cloudinary-core/2.8.2/ https://widget.cloudinary.com/v2.0/global/ https://widget.cloudinary.com/v2.0/n/couponbooked/ 
        https://www.googletagmanager.com/gtag/js?id=UA-167229290-1 https://www.google-analytics.com/; 
        style-src 'self' 'unsafe-inline' https://cdn.auth0.com https://checkout.stripe.com/v3/checkout/; media-src *; img-src *; font-src *;" />
    
    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <link rel="stylesheet" type="text/css" href="css/nav.css" />
    <link rel="stylesheet" type="text/css" href="css/auth0-theme.min.css" />
    <link rel="stylesheet" type="text/css" href="css/main.css" />
    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <link rel="stylesheet" type="text/css" href="css/fontawesome.css" />
    <link rel="stylesheet" type="text/css" href="css/materialize.css" />
    <link rel="stylesheet" type="text/css" href="css/simpleNotification.css" />
    <link rel="stylesheet" type="text/css" href="css/gooMenu.css" />
    <link rel="stylesheet" type="text/css" href="css/jquery-ui.css">
    <link rel="stylesheet" type="text/css" href="css/desktop.css">

    <!-- Hangle all the icons on different platforms, courtesy of https://favicon.io/favicon-converter/ -->
    <link rel="apple-touch-icon" sizes="180x180" href="../images/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
    <link rel="manifest" href="../images/site.webmanifest">

    <!-- TODO: Find a way to prevent my adblocker from blocking this, and to allow
        it through the security policy. Test new method with blocker!! -->
    <script src="src/globalVars.js"></script>
    <script src="https://cdn.onesignal.com/sdks/OneSignalSDK.js" async=""></script>
    <script src="https://cdn.auth0.com/js/auth0/9.13.0/auth0.min.js"></script>
    <script src="https://cdn.auth0.com/w2/auth0-7.2.min.js"></script>
    <script src="https://unpkg.com/uuid@latest/dist/umd/uuidv4.min.js"></script>
    <script src="https://js.stripe.com/v3"></script>

    <script>
        // Copied from OneSignal website
        var OneSignal = window.OneSignal || [];
        OneSignal.push(function() {
            OneSignal.init({
                appId: "40029422-22e0-4569-9d55-8b6604ce2503",
            });
        });
    </script>

    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-167229290-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        
        gtag('config', googleID);
    </script>

    <title>Coupon Booked</title>
</head>