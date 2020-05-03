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

    <template id="create">
        <!-- Invisible back arrow to support functions without much modification -->
        <img class="hide" id="backArrow" />
        <h2 id="createHeader">Who is it for?</h2>

        <div id="templateContainer"></div>
    </template>

    <?php include('help.php'); ?>
    <?php include('sentBook.php'); ?>
    <?php include('receivedBook.php'); ?>
    <?php include('shareCode.php'); ?>
    <?php include('redeemCode.php'); ?>
    <?php include('dashboard.php'); ?>
    <?php include('settings.php'); ?>

    <?php include('footer.php'); ?>
</body>

</html>