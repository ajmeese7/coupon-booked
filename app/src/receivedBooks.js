var helper = require('./helperFunctions.js');
var globalVars = require('./globalVars.js');

/**
 * Displays the UI for the current received book.
 */
function displayBook() {
  console.warn("displayReceivedBook...");
  var bookContent = helper.getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = "";

  // Dynamically create preview of book at top of display
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += `<img id='miniPreviewImage' onerror='imageError(this)' src='${globalVars.book.image}' />`;

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += `<h4>${globalVars.book.name}</h4>`;

  var senderText = "<p class='senderText'>";
  senderText += globalVars.book.sender ? `Sent from ${globalVars.book.sender}` : "Sender unavailable";
  senderText += "</p>";
  previewText.innerHTML += senderText;
  miniPreview.appendChild(previewText);

  // NOTE: These images provided by FontAwesome
  var hideImg = "<img id='hideBook' class='filter-black' src='images/eye-";
  hideImg += (globalVars.book.hide ? "slash-" : "") + "regular.svg' />";
  miniPreview.innerHTML += hideImg;
  
  bookContent.appendChild(miniPreview);
  bookContent.innerHTML += "<hr>";
  
  bookListeners();
}

/**
 * The normal listeners for the /receivedBook route.
 */
function bookListeners() {
  $('#backArrow').unbind().click(function() {
    // NOTE: previousBook probably isn't needed here, but better safe than dead
    globalVars.previousBook = null;
    globalVars.book = null;
    globalVars._this.redirectTo("/dashboard");
  });

  $('#hideBook').unbind().click(function() {
    var newHideStatus = globalVars.book.hide ? 0 : 1;
    $(this).attr('src', "images/eye-" + (newHideStatus ? "slash-" : "") + "regular.svg");
    globalVars.book.hide = newHideStatus;

    $.ajax({
      type: "POST",
      url: "http://www.couponbooked.com/scripts/changeHiddenStatus",
      data: { bookData: JSON.stringify(globalVars.book), hide: newHideStatus, bookId: globalVars.book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // NOTE: UI to display hidden books will be implemented when I add the sorting button
        // that allows you to do custom w/ dragging, alphabetical, newest, ect.
        if (globalVars.book.hide) {
          console.warn("Book is now hidden.");
        } else {
          console.warn("Book no longer hidden.");
        }

        // NOTE: Should I include this or let the icon speak for itself?
        // Also, how do you see hidden books to unhide?
        /*SimpleNotification.success({
          text: "Successfully hid book"
        }, globalVars.notificationOptions);*/
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error hiding book:", XMLHttpRequest.responseText);
        // TODO: Undo hide action here; shoud literally never run so
        // not making this a priority

        SimpleNotification.warning({
          title: "Error hiding book",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    });
  });

  createCouponElements();
}

/**
 * Adds coupon data to div and inserts it to page.
 * @param {integer} couponNumber - the location of the current coupon in the array
 * @param {object} coupon - the data for the current coupon
 * NOTE: This is duplicated for sent books until I find a way to share it
 */
function createCouponElements() {
  // TODO: Figure out how to display image licenses if not paying for yearly subscription
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  $.each(globalVars.book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      helper.getById("bookContent").appendChild(node);

      addCouponListeners(node);
  });
}

/**
 * Displays the coupon's info when the card is clicked.
 * @param {object} node - the element on the page with the coupon's data attached
 */
function addCouponListeners(node) {
  $(node).unbind().click(function() {
    helper.fadeBetweenElements("#bookContent", "#couponPreview");

      $('#backArrow').unbind().click(function() {
        helper.fadeBetweenElements("#couponPreview", "#bookContent");
        displayBook();
      });

    // Updates preview fields with actual coupon's data
    var coupon = $(this).data("coupon");
    helper.getById("imgPreview").src        = coupon.image;
    helper.getById("namePreview").innerText = `${coupon.name}: ${coupon.count}`;
    helper.getById("descPreview").innerText = coupon.description;

    // This is here to pass current coupon to redeemCoupon().
    $('#redeemCoupon').unbind().click(function() {
      function onConfirm(buttonIndex) {
        if (buttonIndex == 1) {
            redeemCoupon(coupon);
            $('#backArrow').click();
          }
        }
        
        navigator.notification.confirm(
            "Do you want to redeem this coupon?",
            onConfirm,
            "Redemption confirmation",
            ["Redeem it", "Cancel"]
      );
    });
  });
}

/**
 * If the current coupon count is greater than zero and able to 
 * be redeemed, the count is decremented, the update sent to the 
 * server and saved locally, and a notification is sent to the 
 * book's sender that the coupon has been redeemed.
 * @param {object} coupon - the coupon data for the previewed coupon
 */
function redeemCoupon(coupon) {
  console.warn("Redeeming coupon...");
  if (coupon.count > 0) {
    var userId = localStorage.getItem("user_id");
    $.ajax({
      type: "POST",
      url: "http://www.couponbooked.com/scripts/redeemCoupon",
      data: { bookId: globalVars.book.bookId, userId: userId, couponName: coupon.name },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // Uncomment to debug redeeming coupons
        console.warn("redeemCoupon success:", success);
        
        if (success == "None left") {
          noneLeft();
        } else {
          notifySender(success, coupon);
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in redeemCoupon:", XMLHttpRequest.responseText);

        SimpleNotification.error({
          title: "Error redeeming coupon!",
          text: "Please try again later."
        }, globalVars.notificationOptions);
      }
    });
  } else {
    noneLeft();
  }

  function noneLeft() {
    SimpleNotification.warning({
      title: "No coupons remaining",
      text: "Try something else or ask for more!"
      // TODO: Decide if this should be an option / how to do
    }, globalVars.notificationOptions);
  }
}

/**
 * Send OneSignal notification to the sender of the book letting
 * them know who has redeemed what coupon.
 * @param {string} senderId - the user sub of the book's sender
 * @param {element} coupon - the coupon element that is being redeemed
 */
function notifySender(senderId, coupon) {
  var title = `${getUserName()} redeemed "${coupon.name}!"`;
  var message = `Coupon description: ${coupon.description}`; // IDEA: Current count or something?
  var notificationObj = { headings: {en: title},
                          contents: {en: message},
                          include_external_user_ids: [senderId]};
  window.plugins.OneSignal.postNotification(notificationObj,
    function(successResponse) {
      coupon.count--;
      displayBook();

      console.warn("Notification post success:", successResponse);
      SimpleNotification.success({
        text: "Successfully redeemed coupon"
      }, globalVars.notificationOptions);
    },
    function (failedResponse) {
      console.error("Notification post failed: ", failedResponse);
      refundCoupon(coupon.name);

      if (failedResponse.errors[0] == "All included players are not subscribed") {
        // IDEA: If error that person doesn't exist, notify them that the 
        // sender has deactivated their account and hide the book or 
        // something and let there be a note in the SQL
        console.log("User no longer exists!");
      }
      
      // Would move this to else statement if I decide to do the above
      SimpleNotification.error({
        title: "Error redeeming coupon",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  );
}

/**
 * If sending a coupon notification fails after the coupon's count has
 * already been decremented, this will increase the count by one to
 * return it to its previous state.
 * @param {string} couponName - the name of the coupon being refunded
 */
function refundCoupon(couponName) {
  var userId = localStorage.getItem("user_id");
  $.ajax({
    type: "POST",
    url: "http://www.couponbooked.com/scripts/refundCoupon",
    data: { bookId: globalVars.book.bookId, userId: userId, couponName: couponName },
    crossDomain: true,
    cache: false,
    success: function(success) {
      // Uncomment to debug refunding coupons
      //console.warn("refundCoupon success: ", success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in redeemCoupon: ", XMLHttpRequest.responseText);

      // IDEA: Create a way to report problems such as this
      /*SimpleNotification.error({
        title: "Error refunding coupon",
        text: "Please report this issue."
      }, globalVars.notificationOptions);*/
    }
  });
}

// NOTE: All the functions in this file are listed here.
// If they are commented out, they aren't currently needed
// outside this file. Please keep this list in order :)
module.exports = Object.assign({
  displayBook,
  //bookListeners,
  //createCouponElements,
  //addCouponListeners,
  //redeemCoupon,
  //notifySender,
  //refundCoupon
});