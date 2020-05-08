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