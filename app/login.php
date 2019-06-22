<div id="firebaseui-auth-container" class="hide"></div>

<div id="container" class="firebaseui-container hide">
    <div class= "firebaseui-card-header">
        <div id="loading">Loading...</div>
        <div id="loaded" class="hide">
            <div id="main">
                <div id="user-signed-in" class="hide">
                    <h4>You are signed in.</h4>
                    <div id="user-info">
                        <div id="photo-container">
                            <img id="photo" />
                        </div>
                        <div id="name"></div>
                        <div id="email"></div>
                        <div class="clearfix"></div>
                    </div>
                    <p>
                        <!-- TODO: Put this on a popup for user icon-->
                        <button id="sign-out" class="firebaseui-button mdl-button mdl-js-button mdl-button--raised">Sign Out</button>
                        <button id="delete-account" class="firebaseui-button mdl-button mdl-js-button mdl-button--raised">Delete account</button>
                    </p>
                </div>
                <div id="user-signed-out" class="hide">
                    <div id="firebaseui-spa">
                        <div id="firebaseui-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br />
    <br />
</div>