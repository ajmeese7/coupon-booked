<head>
    <meta charset="utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
    <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#0b98de">
    <meta name="description" content="Looking for a thoughtful gift idea for your loved ones? Look no further, Coupon Booked has your back. We offer the most customizable gift on the market.">
    <meta name="keywords" content="coupon, booked, gifts">
    <meta name="author" content="Aaron Meese">

    <!--  Social Media Tags -->
    <meta property="og:site_name" content="Coupon Booked">
    <meta property="og:title" content="Coupon Booked - Webapp">
    <meta property="og:type" content="website" />
    <meta property="og:description" content="Looking for a thoughtful gift idea for your loved ones? Look no further, Coupon Booked has your back. We offer the most customizable gift on the market.">
    <meta property="og:image" content="https://couponbooked.com/images/socialBanner.png">
    <meta property="og:url" content="https://couponbooked.com">
    <meta property="twitter:title" content="Coupon Booked - Webapp">
    <meta property="twitter:description" content="Looking for a thoughtful gift idea for your loved ones? Look no further, Coupon Booked has your back. We offer the most customizable gift on the market.">
    <!-- TODO: Test if Twitter actually uses big images or just the small one, and change accordingly -->
    <meta name="twitter:image" content="https://couponbooked.com/images/socialBanner.png">
    <meta name="twitter:image:alt" content="Coupon Booked banner">
    <meta name="twitter:card" content="summary">

    <meta http-equiv="Content-Security-Policy" content="connect-src 'self' https://*.auth0.com https://*.couponbooked.com https://onesignal.com/api/v1/ https://checkout.stripe.com 
        https://www.google-analytics.com https://stats.g.doubleclick.net https://res.cloudinary.com/couponbooked/image/upload/ https://api.cloudinary.com/v1_1/couponbooked/upload 
        blob:https://couponbooked.com/; 
        default-src 'self' data: gap: 'unsafe-inline' https://ssl.gstatic.com https://couponbooked.auth0.com https://cdn.onesignal.com https://onesignal.com https://cdn.auth0.com 
        https://unpkg.com/uuid@latest/dist/umd/ https://code.jquery.com/ui/1.12.1/ https://js.stripe.com/ https://checkout.stripe.com/ https://cdnjs.cloudflare.com/ajax/libs/jshashes/
        https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.7/ https://www.googletagmanager.com/gtag/js https://www.google-analytics.com/; 
        style-src 'self' 'unsafe-inline' https://cdn.auth0.com https://checkout.stripe.com/v3/checkout/; media-src *; img-src https: data: blob:; font-src *;" />
    
    <link rel="stylesheet" type="text/css" href="css/index.css" />
    <link rel="stylesheet" type="text/css" href="css/nav.css" />
    <link rel="stylesheet" type="text/css" href="css/auth0-theme.min.css" />
    <link rel="stylesheet" type="text/css" href="css/cropper.min.css" />
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
    <script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.7/cropper.js"></script>

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