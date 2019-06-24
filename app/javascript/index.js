// This is a general function that removes one class and adds another
function toggleClass(target, addedClass) {
    // If target is an element rather than a list, it is converted to array form
    if (!NodeList.prototype.isPrototypeOf(target)) {
        target = [target];
    }

    // Allows for multiple elements to be toggled, such as by using the querySelectorAll() method
    [].forEach.call(target, (element) => {
        if (element.classList.contains(addedClass)) {
            element.classList.remove(addedClass);
        } else {
            element.classList.add(addedClass);
        }
    });
};

// This is the function we add to our menu button to enable its click functionality
document.querySelector('.menu-btn').addEventListener('click', function() {
    // Opens or closes menu
    toggleClass(document.querySelector('.menu'), 'menu--open');

    // Toggles whether the x button or the menu button is shown
    toggleClass(document.querySelectorAll('.menu-btn img'), 'hide');
});

// TODO: Make the mobile nav bar still show after click; stay on scroll!
// TODO: See if all of this can be transitioned to pure JS in case mobile doesn't support it
$('.menu li').click (function() {
    toggleClass(document.querySelector('.menu'), 'menu--open');
    toggleClass(document.querySelectorAll('.menu-btn img'), 'hide');
});

// querySelector vs getElementById?
document.querySelector('#sign-in').addEventListener('click', function() {
    // Fades from main page to login page
    $("nav, main, footer").fadeOut(150, function() {
        $("#container").fadeIn(400);
    });
});

// Profile picture menu
$(document).ready(function() {
    $(".account").click(function() {
        // TODO: Something with toggle here?
        if ($(this).attr('id') == 1) {
            $(".submenu").hide();
            $(this).attr('id', '0');
        } else {
            $(".submenu").show();
            $(this).attr('id', '1');
        }
    });
    $(".submenu").mouseup(function() {
        return false
    });
    $(".account").mouseup(function() {
        return false
    });
    // IDEA: Switch to mousedown for scrolling to close it? Document only.
    $(document).add("#sign-out").mouseup(function() {
        $(".submenu").hide();
        $(".account").attr('id', '');
    });
});

// https://stackoverflow.com/questions/11392046/get-the-hash-value-which-was-before-hashchange
window.onhashchange = function(e) {
    var oldHash = e.oldURL.split("#")[1];
    var newHash = e.newURL.split("#")[1];
    
    // Handle back button from sign in page
    if (oldHash == "login" && newHash != "login") {
        // Doesn't work nearly as well with PHP; hopefully it will be smooth again once PHP is replaced
        $("#container").fadeOut(150, function() {
            $("nav, main, footer").fadeIn(400);
        });
    }/* else if (newHash == "profilePic" && oldHash != "profilePic") {
        // TODO: Creatively display dropdown menu
    }*/
};