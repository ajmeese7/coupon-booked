<template id="help">
    <link rel="stylesheet" type="text/css" href="css/app.css" />
    <link rel="stylesheet" type="text/css" href="css/help.css" />
    <script src="js/help.js"></script>

    <div class="page">
        <h2 id="helpHeader">Help</h2>
        <br />

        <!-- NOTE: Can also switch stytes to https://jsfiddle.net/ajmeese7/bhsf2q3u/1/ -->
        <button class="accordion">Creating a new book</button>
        <div class="panel">
            <p>
                On desktop, you select the <q>Create a Book</q> option on the sidebar. From there you select a template and start customizing the book.
                Once you are ready to create it, click the <q>Create</q> button in the upper right corner of the screen.
            </p>
            <p>
                On mobile, you open the dropdown by selecting your profile picture. When you select the <q>Create a Book</q> option from the dropdown, a
                list of templates will be displayed. You can select any template and begin editing. When you want to save your work, select the <q>Create</q>
                button in the upper right corner of the screen.
            </p>
            <!-- IDEA: Make this a `Save` button or something instead? Ask consumers. -->
            <p>
                Don't be afraid to create a book. All it does is save your progress to your account so you can edit it further in the future. You don't have
                to have the book finished when you create it.
            </p>
        </div>

        <!-- TODO: Probably switch back from `Pay` to `Share` -->
        <button class="accordion">Sharing a book</button>
        <div class="panel">
            <p>
                Once you have created a coupon book, you can share it by clicking the "Share" button in the upper right hand corner.    
            </p>
            <p>
                You are free to edit the book any time before sending it and after you have sent it, so don't stress if you need to go back and add more coupons later. 
            </p>
            <p>
                We only charge you to initially send a book to someone, so we have enough revenue to keep the service going. It's free to modify the book and reload 
                coupons after you send it, so don't be stingy with them!
            </p>
        </div>

        <button class="accordion">Changing your display name</button>
        <div class="panel">
            <p>
                When you send someone a coupon code and they redeem it, the book will display who sent it. If you logged in through Google this will be your name, 
                but if you created an account you will have to change it on the settings page.
            </p>
            <!-- TODO: Read this stuff -->
            <p>
                You can type whatever you want to be shown to people in the "Display Name" field and click the update button to submit the new display name. 
                If you update when the field is empty, your default display name will show again.
            </p>
        </div>

        <button class="accordion">App looks strange</button>
        <div class="panel">
            <p>
                If you have your accessibility settings set to anything other than your device's default, the app may be displayed strangely.
            </p>
            <p>
                Currently, the only way to resolve this is to change the settings on your device.
            </p>
            <p>
                I am in the process of working on a fix for this, but unfortunately I cannot give a timeline for when it will be resolved.
            </p>
        </div>

        <h5 id="reachOut">
            Still not answering your question? Reach out to us and we'll do our best to help.
        </h5>

        <!-- https://www.w3schools.com/css/css_form.asp -->
        <div id="helpFormContainer">
            <form id="helpForm"> <!-- action="/form_submit.php" -->
                <div class="row">
                    <div>
                        <label for="topic">Topic</label>
                    </div>
                    <div>
                        <select id="topic" name="topic">
                            <option value="feedback">Feedback</option>
                            <option value="bugs">Bug Reporting</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div>
                        <label for="name">Your Name</label>
                    </div>
                    <div>
                        <input type="text" id="name" name="name" placeholder="Your name..">
                    </div>
                </div>
                <div class="row">
                    <div>
                        <label for="email">Your Email</label>
                    </div>
                    <div>
                        <!-- TODO: Prevent form submission until the email syntax is validated -->
                        <input type="email" id="email" name="email" placeholder="someone@something.com">
                    </div>
                </div>
                <div class="row">
                    <div>
                        <label for="subject">Subject</label>
                    </div>
                    <div>
                        <!-- TODO: Limit the length like in coupon description -->
                        <textarea id="subject" name="subject" placeholder="Write something.." style="height:200px"></textarea>
                    </div>
                </div>
                <div class="row">
                    <input id="submit" type="submit" value="Submit">
                </div>
            </form>
        </div>
    </div>
</template>