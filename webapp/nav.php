<div id="nav">
    <div class="nav-container">
        <nav class="navbar navbar-expand-md navbar-light">
            <div class="container">
                <div id="mobile">
                    <span class="menu-btn">
                        <img id="logo" src="../images/logo_small.png">
                    </span>
                    <a id="brand" href="https://couponbooked.com/webapp/index">Coupon Booked</a>
                </div>

                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav">
                        <!-- Fullsize dropdown: show if authenticated -->
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle account" data-toggle="dropdown">
                                <!-- Profile image should be set to the profile picture from the id token;
                                    src is the default image until the user's profile pic loads in -->
                                <img alt="Profile picture" src="./images/default.png" class="nav-user-profile profile-image" />
                            </a>
                        </li>
                    </ul>
                </div> <!-- navbar-collapse -->
            </div> <!-- container -->

            <ul id="desktopNav" style="display: none;">
                <li class="dashboard">Dashboard</li>
                <li class="create">Create a Book</li>
                <li class="redeem">Claim Book</li>
                <li class="help">Help</li>
                <li class="settings">Settings</li>
            </ul>
        </nav> <!-- navbar -->
    </div> <!-- nav-container -->

    <!-- https://www.labw3.com/2014/08/round-avatar-with-drop-down-profiles-menu-code.html -->
    <div class="dropdown">
        <div class="submenu" style="display: none;">
            <!-- TODO: Find a more intuitive menu for this many options on mobile -->
            <ul class="root">
                <!-- IDEA: Can add relevant icons for each item -->
                <li><a href="#" class="dashboard">Dashboard</a></li>
                <li><a href="#" class="create">Create a Book</a></li>
                <li><a href="#" class="redeem">Claim Book</a></li>
                <li><a href="#" class="help">Help</a></li>
                <li><a href="#" class="settings">Settings</a></li>
            </ul>
        </div>
    </div> <!-- dropdown -->
</div>