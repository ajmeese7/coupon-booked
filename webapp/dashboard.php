<template id="dashboard">
    <!-- Invisible back arrow to support functions without much modification -->
    <img class="hide" id="backArrow" />
    <ul id="tab-menu" class="tabs">
        <li class="tab"><a id="sentButton" href="#sent" class="active">Sent</a></li>
        <li class="tab"><a id="receivedButton" href="#received">Received</a></li>
    </ul>

    <div id="gestureZone">
        <div id="sent" class="col">
            <div id="noneSent" class="hidden">
                <!-- Formatted like this in case I decide to add something else to message; 
                    if not, will switch to paragraph -->
                You haven't sent any Books yet. <br />
                <a id="start">Send one now!</a>
            </div>
        </div>
        <div id="received" class="col">
            <div id="noneReceived" class="hidden">
                <!-- IDEA: Implement UI for this elsewhere -->
                You haven't received any Books yet. <br />
                Want to <a id="request">request one</a>?
            </div>

            <div id="redeemLink">Redeem a code!</div>
        </div>
    </div>
</template>