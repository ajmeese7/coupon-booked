<div id="nav">
    <div class="nav-container">
        <nav class="navbar navbar-expand-md navbar-light">
            <div class="container">
                <div id="mobile">
                    <span class="menu-btn">
                        <img id="logo" src="../images/logo_small.png">
                    </span>
                    <a id="brand" href="#">Coupon Booked</a>
                </div>

                <div class="collapse navbar-collapse">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <!-- Other ideas: https://icons8.com/icons/set/slider -->
                            <img alt="Open side menu" id="sideMenuIcon" src="./images/settings.svg" />
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

    <!-- Inspiration: https://dribbble.com//shots/2494865-Coach-profile -->
    <div class="mobileSideMenu">
        <!-- Profile image should be set to the profile picture from the id token;
            src is the default image until the user's profile pic loads in -->
        <img alt="Profile picture" src="./images/default.png" class="nav-user-profile profile-image" />

        <ul id="mobileNav">
            <li class="dashboard">Dashboard</li>
            <li class="create">Create a Book</li>
            <li class="redeem">Claim Book</li>
            <li class="help">Help</li>
            <li class="settings">Settings</li>
        </ul>
    </div>
    <!-- This overlay shades the content next to the menu -->
    <div class="contentShadow"></div>
</div>