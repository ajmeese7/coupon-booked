<template id="receivedBook">
    <div id="topbar">
        <img id="backArrow" src="./images/back.svg" />
    </div>

    <div id="bookContent" class="col"></div>

    <div id="dataPreview" class="hide col">
        <h3 id="namePreview"></h3>
        <hr />
        <img id="imgPreview" onerror="imageError(this)" src="./images/ticket.png" />
        <p id="descPreview"></p>

        <div id="redeemCouponConfirm" class="dialog-box" title="Redemption confirmation">
            <p id="confirmText">
                <span class="ui-icon ui-icon-alert"></span>
                <!--"Do you want to redeem this coupon?" 
                    need to figure out if icon is needed and stuff + which text to use -->
                Are you sure you want to redeem this coupon?
            </p>
        </div>

        <div id="redeemCoupon">Redeem coupon</div>
    </div>
</template>