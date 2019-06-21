// Handle the click of the scroll button and nav bar links
$(function() {
    // IDEA: Combine all of these under a forEach function
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
$('.menu li').click (function() {
    toggleClass(document.querySelector('.menu'), 'menu--open');
    toggleClass(document.querySelectorAll('.menu-btn img'), 'hide');
});

document.querySelector('#sign-in').addEventListener('click', function() {
    // TODO: Make it so if the user hits the browser back button the normal content is displayed
    // again instead of the sign in page (fade in somehow)

    if (document.querySelector('#sign-in').innerText == "Sign in") {
        // Fades from main page to login page
        $("nav, main, footer").fadeOut(150, function() {
            $("#container").fadeIn(400);
        });
    } else if (document.querySelector('#sign-in').innerText == "Sign out") {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            alert("Signed out successfully."); // TODO: Handle this more elegantly
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    }
});

// https://stackoverflow.com/questions/11392046/get-the-hash-value-which-was-before-hashchange
window.onhashchange = function(e) {
    var oldHash = e.oldURL.split("#")[1];
    var newHash = e.newURL.split("#")[1];
    
    // Handle back button from sign in page
    if (oldHash == "login" && newHash == undefined) {
        $("#container").fadeOut(150, function() {
            $("nav, main, footer").fadeIn(400);
        });
    }
};