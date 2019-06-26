<nav>
    <!-- TODO: This looks a little small on actual mobile. Field testing? -->
    <div id="mobile">
        <span class="menu-btn" style="font-size: 30px; cursor: pointer">
            <img id="logo" src="images/logo.png">
            <img id="xButton" src="images/x.png" class="hide">
        </span>
        <a id="brand" href="http://app.couponbooked.com">Coupon Booked</a>
    </div>

    <!-- NOTE: The transition here is too long. Is it fixable? -->
    <a href="#profilePic" class="account" ><img id="profile-picture" style="display: none;" /></a>
    <a id="sign-in" href="#login">Sign in</a>
</nav>

<!-- https://www.labw3.com/2014/08/round-avatar-with-drop-down-profiles-menu-code.html -->
<div class="dropdown">
    <div class="submenu" style="display: none;">
        <ul class="root">
            <!-- NOTE: href required to have mouse change to clicker on hover -->
            <li><a href="#">Dashboard</a></li>
            <li><a href="profile.php">Profile</a></li>
            <li><a href="#">Settings</a></li>
            <li><a href="#" id="sign-out">Sign Out</a></li>
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
</menu>

<div style="height: 20px; width: 100%;"><!-- Whitespace; don't question it. --></div>