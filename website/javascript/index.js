// Handle the click of the scroll button and nav bar links
$(function() {
    // IDEA: Combine all of these under a forEach function
    $('#scroll-create').click (function() {
        $('html, body').animate({scrollTop: $('section#create').offset().top - 48 }, 'slow');
        return false;
    });
    $('#scroll-about, .scroll-down').click (function() {
        $('html, body').animate({scrollTop: $('section#about').offset().top - 48 }, 'slow');
        return false;
    });
    $('#scroll-testimonials').click (function() {
        $('html, body').animate({scrollTop: $('section#testimonials').offset().top - 48 }, 'slow');
        return false;
    });

    var glide = new Glide('.glide', {
        // https://glidejs.com/docs/options/
        type: 'carousel',
        perView: 1,
        autoplay: 6850,
        animationDuration: 1500,
        focusAt: 'center',
        hoverpause: false
    })
    
    glide.mount();
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