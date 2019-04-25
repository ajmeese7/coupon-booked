// Handle the click of the scroll button
$(function() {
    $('#scroll-why').click (function() {
        $('html, body').animate({scrollTop: $('section#why').offset().top + 1 }, 'slow');
        return false;
    });
    $('#scroll-example').click (function() {
        $('html, body').animate({scrollTop: $('section#examples').offset().top + 1 }, 'slow');
        return false;
    });
    $('.scroll-down').click (function() {
        // TODO: Look into resolution with previous problem of combining under one ID
        $('html, body').animate({scrollTop: $('section#examples').offset().top + 1 }, 'slow');
        return false;
    });
    $('#scroll-create').click (function() {
        $('html, body').animate({scrollTop: $('section#create').offset().top + 1 }, 'slow');
        return false;
    });
});

// Handle mobile menu
var exitMenuButton = "<a href='javascript:void(0)' class='closebtn' onclick='closeNav()'>&times; Coupon Booked</a>";
var openMenuButton = "<span style='font-size: 30px; cursor: pointer' onclick='openNav()'><img id='logo' src='images/logo.png'></span>";
function openNav() {
    // TODO: Find safer alternative to innerHTML if necessary (BELOW as well!)
    document.getElementById("main").innerHTML = exitMenuButton;
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementsByTagName("main")[0].style.marginLeft = "250px";
    //document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
    // NOTE: This method of transparency doesn't work. TODO: Use a div.
}

function closeNav() {
    document.getElementById("main").innerHTML = openMenuButton;
    document.getElementById("mySidenav").style.width = "0";
    document.getElementsByTagName("main")[0].style.marginLeft= "0";
    //document.body.style.backgroundColor = "white";
}