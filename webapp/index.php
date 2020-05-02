<!DOCTYPE html>
<html>

<?php include('header.php'); ?>

<body>
    <!-- HTML is my templating engine and CSS is my router -->
    <!-- Replacement idea: https://www.filamentgroup.com/lab/html-includes/#another-demo%3A-including-another-html-file -->
    <!-- But if I did it this way would I still be able to transition between the main areas with fading? Could I include the
        body parts with the templating engine instead of the nav and stuff to include that still? -->
    <div class="app" id="app"></div>

    <template id="loading">
        <?php include('nav.php'); ?>
        <?php include('loading.php'); ?>
    </template>

    <template id="login">
        <!-- Loading screen for redirect to Auth0 login page -->
    </template>

    <template id="home">
        <div class="page">
            <!-- TODO -->
        </div>
    </template>

    <template id="help">
        <?php include('help.php'); ?>
    </template>

    <template id="create">
        <!-- Invisible back arrow to support functions without much modification -->
        <img class="hide" id="backArrow" />
        <h2 id="createHeader">Who is it for?</h2>

        <div id="templateContainer"></div>
    </template>

    <template id="sentBook">
        <?php include('sentBook.php'); ?>
    </template>

    <template id="receivedBook">
        <?php include('receivedBook.php'); ?>
    </template>

    <template id="shareCode">
        <?php include('shareCode.php'); ?>
    </template>

    <template id="redeemCode">
        <div id="topbar">
            <img id="backArrow" src="./images/back.svg" />
        </div>

        <h3 id="redeemHeader">Enter your code below</h3>
        <div>
            <input id="redeemBox" maxlength='8' autocapitalize="none" />
        </div>

        <button id="redeemButton">Redeem</button>
    </template>

    <template id="dashboard">
        <?php include('dashboard.php'); ?>
    </template>

    <template id="settings">
        <link rel="stylesheet" type="text/css" href="css/app.css" />
        
        <div class="page">
            <h2>Settings</h2>
            <br />

            <!-- I honestly have no idea what this is -->
            <style id="switchStyle"></style>

            <b>Display Name</b>
            <label id="displayName">
                <input type="text" id="displayNameInput" name="displayName" placeholder="Robert Downey Jr.">
            </label>
            <button id="updateDisplayName">Update</button>
            <br />
            
            <!-- Dark mode inspired by https://github.com/GoogleChromeLabs/dark-mode-toggle -->
            <!--<b>Dark Mode</b>
            <br />
            <label class="switch" id="darkToggle">
                <br />
                <input type="checkbox" id="darkCheckbox">
                <span class="slider round"></span>
            </label>
            <br />-->
            <hr />

            <div class="flex hor-centered">
                <button class="btn btn-success btn-logout">
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    </template>

    <?php include('footer.php'); ?>
</body>

</html>