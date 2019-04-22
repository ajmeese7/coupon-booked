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

// "Coupon" should be the ID of the coupon redeemed
function redeemCoupon(coupon) {
    var currentValue = $("span#" + coupon + ".count").text();

    if (currentValue != 0) {
        var newValue = parseInt(currentValue) - 1;
        $("span#" + coupon + ".count").text(newValue);

        $.ajax({
            url: "https://maker.ifttt.com/trigger/coupon_redeemed/with/key/YOUR-KEY-HERE",
            type: "POST",
            data: { value1: coupon },
            dataType: "json"
        });
    } else {
        // NOTE: Alert untested, just a new idea...
        alert("You have zero " + coupon + " coupons remaining! <a href='...'>Ask for more?</a>");
    }
}

$("#toggle").unbind('click').click(function () {
    var toggle = document.getElementById("toggle");

    $("#help").toggle();
    $("#home").toggle();

    if (toggle.innerText == "Help") {
        toggle.innerText = "Home";
    } else {
        toggle.innerText = "Help";
    }
});
