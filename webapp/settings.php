<template id="settings">
    <link rel="stylesheet" type="text/css" href="css/app.css" />
    
    <div class="page">
        <h2>Settings</h2>
        <br />

        <!-- I honestly have no idea what this is -->
        <style id="switchStyle"></style>

        <b>Display Name</b>
        <label id="displayName">
            <!-- IDEA: Cycle through a few names here, like Elon Musk, etc. -->
            <input type="text" id="displayNameInput" name="displayName" placeholder="Robert Downey Jr.">
        </label>
        <button id="updateDisplayName">Update</button>
        <br />

        <b>Phone Number</b>
        <label id="phoneNumber">
            <input type="text" id="phoneNumberInput" name="phoneNumber" placeholder="(123) 456-7890">
        </label>
        <button id="updatePhoneNumber">Update</button>
        <br />

        <b>Stats</b>
        <div id="userStats">
            <p id="createdBooks">Created books:</p>
            <p id="sentBooks">Sent books:</p>
            <p id="receivedBooks">Received books:</p>
            <p id="redeemedCoupons">Coupons redeemed:</p>

            <!-- TODO: Work on this in app and webapp -->
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