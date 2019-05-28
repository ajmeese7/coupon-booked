// Handle the click of the scroll button and nav bar links
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

// This is a general function that removes one class and adds another
function toggleClass(targetElement, addedClass) {
    // IDEA: Make it accept an array of selectors as well?
    if (targetElement.classList.contains(addedClass)) {
        targetElement.classList.remove(addedClass);
    } else {
        targetElement.classList.add(addedClass);
    }
};

// This is the function we add to our menu button to enable its click functionality
// TODO: Add some kind of toggle associated with this to change the image from the logo to an X.
document.querySelector('.menu-btn').addEventListener('click', function() {
    toggleClass(document.querySelector('.menu'), 'menu--open');
});

// TODO: Make the mobile nav bar still show after click; stay on scroll!
$('.menu li').click (function() {
    toggleClass(document.querySelector('.menu'), 'menu--open');
});

document.querySelector('#sign-in').addEventListener('click', function() {
    // TODO: Make it so if the user hits the browser back button the normal content is displayed
    // again instead of the sign in page (fade in somehow)

    if (document.querySelector('#sign-in').innerText == "Sign in") {
        // Fades from main page to login page
        // TODO: Add a way to go back in case the user does not want to sign in.
        $("nav, main, footer").fadeOut(150, function() {
            $("#firebaseui-auth-container").fadeIn(400);
        });

        // IDEA: Toggle to an x in case the user does not want to sign in. (&times;)
        // Or instead of 'toggling' to an x, hide it and use an x button that works that way.
    } else if (document.querySelector('#sign-in').innerText == "Sign out") {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            alert("Signed out successfully.");
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    }
});
