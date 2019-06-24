<nav>
    <!-- TODO: This looks a little small on actual mobile. Field testing? -->
    <div id="mobile">
        <span class="menu-btn" style="font-size: 30px; cursor: pointer">
            <img id="logo" src="images/logo.png">
            <img id="xButton" src="images/x.png" class="hide">
        </span>
        <a id="brand" href="http://app.couponbooked.com">Coupon Booked</a>
    </div>

    <a href="#profilePic" class="account" ><img id="profile-picture" style="display: none;" /></a>
    <a id="sign-in" href="#login">Sign in</a>
</nav>

<div class="dropdown">
    <div class="submenu" style="display: none;">
        <ul class="root">
            <li><a href="#">Dashboard</a></li>
            <li><a href="#">Profile</a></li>
            <li><a href="#">Settings</a></li>
            <li><a href="#">Sign Out</a></li>
        </ul>
    </div>
</div>

<!-- Sidebar content for mobile navigation -->
<menu class="menu">
    <ul>
        <!-- TODO: Work on the location of these, if the mobile menu still works that way -->
        <li><a href="#why">Why us?</a></li>
        <li><a href="#examples">Examples</a></li>
        <li><a href="#create">Create Your Own</a></li>
    </ul>

    <!-- IDEA: Make a tutorial (with skip option) for when user first signs in -->
    <!-- IDEA: Make the side menu look like the fitbit menu with the user profile image 
        and whatnot once they are signed in (dominos...). Can get Unsplash or whatever 
        random profile pictures that GitHub uses. -->
</menu>

<div style="height: 20px; width: 100%;"><!-- Whitespace; don't question it. --></div>