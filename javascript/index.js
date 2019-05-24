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

// This is a general function that removes one class and adds another
function toggleClass(targetElement, addedClass) {
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

document.querySelector('#sign-in').addEventListener('click', function() {
    if (document.querySelector('#sign-in').innerText == "Sign in") {
        // TODO: Make the whole transition from main page to sign in smoother
        $("#firebaseui-auth-container").fadeIn(1000);
        //toggleClass(document.querySelector('#firebaseui-auth-container'), 'hide');

        // IDEA: Make it accept an array of selectors as well? Avoids these four calls by combining
        toggleClass(document.querySelector('nav'), 'hide');
        toggleClass(document.querySelector('main'), 'hide');
        toggleClass(document.querySelector('footer'), 'hide');
    } else if (document.querySelector('#sign-in').innerText == "Sign out") {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
            alert("Signed out successfully.");
        }).catch(function(error) {
            // An error happened.
            console.error(error);
        });
    }
    // IDEA: Toggle to an x in case the user does not want to sign in. (&times;)
    // Or instead of 'toggling' to an x, hide it and use an x button that works that way.
});
