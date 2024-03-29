<template id="sentBook">
    <div id="topbar">
        <img id="backArrow" src="./images/back.svg" />
        <button id="createButton">Create</button>
        <button id="save" class="hide">Save</button>
        <button id="delete" class="hide">Delete</button>
        <button id="share" class="hide">Pay</button>
    </div>

    <div id="bookContent" class="col">
        <!-- Will create new coupon -->
        <button id="plus">+</button>
    </div>

    <!-- Can be populated by a book or a coupon preview -->
    <div id="dataPreview" class="hide col">
        <h3 id="namePreview"></h3>
        <hr />
        <img id="imgPreview" onerror="imageError(this)" src="./images/ticket.png" />
        <p id="descPreview"></p> <!-- TODO: Make this look better for short descriptions -->

        <!-- If iOS, icon is changed in Node -->
        <button id="edit"><img src="./images/md-edit.svg" /></button>
    </div>

    <div id="deleteCouponConfirm" class="dialog-box" title="Delete coupon confirmation">
        <p id="confirmText">
            <span class="ui-icon ui-icon-alert"></span>
            Are you sure you want to delete this coupon?
        </p>
    </div>

    <form id="couponForm" class="hide col">
        <div>
            <img id="couponImage" height="100px" onerror="imageError(this)" src="./images/ticket.png" />
        </div>

        <!-- NOTE: Nearly all of this is copied directly from bookForm, so changes should be reflected there -->
        <div id="imageUpload">
            <label class="pickImage" for="couponInputImage" title="Upload image file">
                <input type="file" id="couponInputImage" name="file" accept="image/*">
                <p>Change image</p>
            </label>
            <p id="couponCrop">Crop</p>
        </div>
        
        <!-- TODO: Need to get this to run on browser back button for desktop and native mobile -->
        <div id="discardCouponConfirm" class="dialog-box" title="Discard all changes?">
            <p id="confirmText">
                <span class="ui-icon ui-icon-alert"></span>
                Are you sure you want to discard your changes?
            </p>
        </div>

        <label for="name">Coupon Name</label>
        <input type="text" id="name" name="name" placeholder="Backrub">

        <label for="description">Description</label>
        <textarea id="couponDescription" name="description" placeholder="A nice, long massage." 
            maxlength="180"></textarea>
        <div id="couponDescLength">0</div>

        <label for="count">Count</label>
        <input type="number" id="count" name="count" min="1" max="99" placeholder="3">
    </form>

    <form id="bookForm" class="hide col">
        <div>
            <img id="bookImage" height="100px" onerror="imageError(this)" src="./images/ticket.png" />
        </div>

        <div id="imageUpload">
            <label class="pickImage" for="bookInputImage" title="Upload image file">
                <input type="file" id="bookInputImage" name="file" accept="image/*">
                <p>Change image</p>
            </label>
            <p id="bookCrop">Crop</p>
        </div>
        
        <div id="discardBookEditsConfirm" class="dialog-box" title="Discard all changes">
            <p id="confirmText">
                <span class="ui-icon ui-icon-alert"></span>
                Are you sure you want to discard your changes?
            </p>
        </div>

        <label for="name">Book Name</label>
        <input type="text" id="bookName" name="name" placeholder="#1 Dad">

        <label for="desc">Description</label>
        <textarea id="bookDescription" name="description" placeholder="Thank you for everything you do." 
            maxlength="180"></textarea>
        <div id="bookDescLength">0</div>
    </form>

    <div id="deleteBookConfirm" class="dialog-box" title="Delete book confirmation">
        <p id="confirmText">
            <span class="ui-icon ui-icon-alert"></span>
            Are you sure you want to delete this book?
        </p>
    </div>

    <div id="moreOptions">
        <nav class="menu">
            <input type="checkbox" href="#" class="menu-open" name="menu-open" id="menu-open"/>
            <label class="menu-open-button" for="menu-open">
                <span class="hamburger hamburger-1"></span>
                <span class="hamburger hamburger-2"></span>
                <span class="hamburger hamburger-3"></span>
            </label>
            
            <a href="#editBook" class="menu-item">
                <img id='editBook' class='ionicon' src='./images/md-edit.svg' />
            </a>
            <a href="#shareBook" class="menu-item">
                <!-- TODO: One this is working, get it to recevied books and redeemed coupons too -->
                <img id='shareBook' class='ionicon' src='./images/md-share.svg' />
            </a>
            <a href="#deleteBook" class="menu-item">
                <img id='deleteBook' class='ionicon' src='./images/md-trash.svg' />
            </a>
        </nav>
    </div>

    <!-- Required for Facebook share -->
    <div id="fb-root"></div>
    <script async defer crossorigin="anonymous" 
    src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v8.0&appId=2521896274501206&autoLogAppEvents=1" 
    nonce="EhJQ7gMr"></script>

    <!-- TODO: Figure out why this is fucky on the second book you try it on -->
    <div id="shareBookDialog" class="dialog-box" title="Share book">
        Love your new book? Spread the word!

        <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
        <div id="shareButtons">
            <a id="twitter" href="https://twitter.com/share" class="twitter-share-button" 
            data-url="https://couponbooked.com" data-via="CouponBooked" data-related="CouponBooked" 
            data-dnt="true" data-show-count="false">Tweet</a>

            <div class="fb-share-button" data-href="https://couponbooked.com" 
            data-layout="button_count" data-size="small"><a target="_blank" 
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcouponbooked.com%2F&amp;src=sdkpreparse" 
            class="fb-xfbml-parse-ignore">Share</a></div>

            <a id="pinterest">
                <img src="https://img.shields.io/badge/-Pinterest-red?style=flat&logo=Pinterest&logoColor=white" />
            </a>
        </div>
    </div>
</template>