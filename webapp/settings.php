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

        <b>Stats</b>
        <div id="userStats">
            <p id="createdBooks">Created books:</p>
            <p id="sentBooks">Sent books:</p>
            <p id="receivedBooks">Received books:</p>
            <p id="redeemedCoupons">Coupons redeemed:</p>
            <p id="fulfilledCoupons">Coupons fulfilled:</p>
        </div>
        <hr />

        <div class="flex hor-centered">
            <button class="btn btn-success btn-logout">
                <span>Log Out</span>
            </button>
        </div>
    </div>
</template>