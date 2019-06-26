<div id="firebaseui-auth-container" class="hide"></div>

<div id="container" class="firebaseui-container hide">
    <div class= "firebaseui-card-header">
        <div id="loading">Loading...</div>
        <div id="loaded" class="hide">
            <div id="main">
                <!-- Even after adding this back, mobile is still screwing up. TODO: Test tomorrow. -->
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
                </div>
                <!-- TODO: Get delete button code for profile page from old commit -->
                <div id="user-signed-out" class="hide">
                    <div id="firebaseui-spa">
                        <!-- IDEA: Stop using their UI and make my own? https://urlzs.com/ZbKNE -->
                        <div id="firebaseui-container"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <br />
</div>