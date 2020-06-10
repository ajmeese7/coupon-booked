<template id="shareCode">
    <link rel="stylesheet" type="text/css" href="css/shareCode.css" />
    <div id="topbar">
        <img id="backArrow" src="./images/back.svg" />
    </div>

    <h4 id="shareHeader">Your book is ready to be sent!</h4>
    <div class="copytooltip">
        <span class="copytooltiptext" style="opacity: 0;">Copied to clipboard</span>
    </div>
    <div id="shareCodeDiv">
        <!-- TODO: Switch to having icons in different folders for different OS -->
        <p id="shareCodeText">88888888</p>
        <img id="copyButton" src="./images/copy.svg" />
        <!-- https://ionicons.com/ -->
    </div>

    <p id="shareCodeDescription">
        Send this code to whomever you want to receive your Coupon Book.
        <br id="desktopBreak" />
        They must create an account if they don't already have one to 
        redeem the code.
    </p>

    <button id="bigShareButton"><img id="shareIcon" class="ionicon" />SHARE</button>
    <script src="js/fireworks.js"></script>
</template>