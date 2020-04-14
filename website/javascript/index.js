// Handle the click of the scroll button and nav bar links
$(function() {
    // IDEA: Combine all of these under a forEach function
    $('#scroll-why').click (function() {
        $('html, body').animate({scrollTop: $('section#why').offset().top - 40 }, 'slow');
        return false;
    });
    $('#scroll-example').click (function() {
        $('html, body').animate({scrollTop: $('section#examples').offset().top - 39 }, 'slow');
        return false;
    });
    $('.scroll-down').click (function() {
        // TODO: Look into resolution with previous problem of combining under one ID
        $('html, body').animate({scrollTop: $('section#examples').offset().top - 39 }, 'slow');
        return false;
    });
});

// This is a general function that removes one class and adds another;
// currently not in use but it's beautiful so I can't delete it
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