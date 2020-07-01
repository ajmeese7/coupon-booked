const env = require('../env');
var helper = require('./helperFunctions.js');
var globalVars = require('./globalVars.js');

/**
 * Displays the UI for the current received book.
 */
function displayBook() {
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

  var couponContainer = document.createElement('div');
  couponContainer.setAttribute("id", "couponContainer");
  $.each(globalVars.book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      couponContainer.appendChild(node);

      addCouponListeners(node);
  });

  helper.getById("bookContent").appendChild(couponContainer);
}

/**
 * Displays the coupon's info when the card is clicked.
 * @param {object} node - the element on the page with the coupon's data attached
 */
function addCouponListeners(node) {
  $(node).unbind().click(function() {
    helper.fadeBetweenElements("#bookContent", "#dataPreview");

    $('#backArrow').unbind().click(function() {
      helper.fadeBetweenElements("#dataPreview", "#bookContent");
      displayBook();
    });

    // Updates preview fields with actual coupon's data
    var coupon = $(this).data("coupon");
    helper.getById("imgPreview").src        = coupon.image;
    helper.getById("namePreview").innerText = `${coupon.name}: ${coupon.count}`;
    helper.getById("descPreview").innerText = coupon.description;

    // This is here to pass current coupon to redeemCoupon().
    $('#redeemCoupon').unbind().click(function() {
      $( "#redeemCouponConfirm" ).dialog({
        draggable: false,
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
          Cancel: function() {
            $( this ).dialog( "close" );
          },
          "Redeem it": function() {
            // TODO: Test coupon redemption + notification;
            // how to handle if they've logged out of device? Email? Text?
            $( this ).dialog( "close" );
            redeemCoupon(coupon);
            $('#backArrow').click();
          }
        }
      });
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
      url: "https://couponbooked.com/scripts/redeemCoupon",
      data: { bookId: globalVars.book.bookId, userId: userId, couponName: coupon.name },
      crossDomain: true,
      cache: false,
      success: function(success) {
        console.warn("redeemCoupon success:", success);
        window.ga.trackEvent('Book Modification', 'Coupon Redeemed', 'Success');
        
        if (success == "None left") {
          noneLeft();
        } else if (success) {
          // Should be an object with onesignalId and sender properties
          notifySender(JSON.parse(success), coupon);
        } else {
          // TODO: Alert user that there's an error and log it? This should never run, outside of
          // when I break stuff when testing...
          console.error("No server OneSignal user ID set! Not attempting to send notification...");
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error in redeemCoupon:", XMLHttpRequest.responseText);
        window.ga.trackEvent('Book Modification', 'Coupon Redeemed', 'Error');

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
 * @param {object} senderInfo - the user sub of the book's sender, both 
 * OneSignal and their actual ID.
 * @param {element} coupon - the coupon element that is being redeemed
 */
function notifySender(senderInfo, coupon) {
  // TODO: Find a cleaner way to do this, because this is nasty
  $.ajax({
    type: "GET",
    url: `https://couponbooked.com/scripts/senderHasIOS?senderId=${senderInfo.sender}`,
    success: function(data) {
      let message = `${helper.getUserName()} redeemed \"${coupon.name}\"`;
      if (data == "Missing number") {
        notificationError("Error from sender_ios", coupon);
      } else if (data == "true") {
        // Notifications probably not supported, so using text messaging
        $.ajax({
          type: "POST",
          url: "https://couponbooked.com/scripts/sendTextMessage",
          data: { senderId: senderInfo.sender, message: `Coupon Booked: ${message}` },
          crossDomain: true,
          cache: false,
          success: function(data) {
            if (data == "Missing number") {
              notificationError("Error from sender_ios", coupon);
            } else {
              notificationSuccess(true, coupon);
            }
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.error("Error sending message:", XMLHttpRequest.responseText);
            notificationError(null, coupon);
          }
        });
      } else {
        var notificationObj = { app_id : env.ONESIGNAL_ID,
          safari_web_id: env.ONESIGNAL_SAFARI_ID,
          contents: {en: message},
          big_picture: coupon.image,
          chrome_web_image: coupon.image,
          adm_big_picture: coupon.image,
          ios_attachments: coupon.image,
          ttl: 2419200,
          priority: 10,
          include_player_ids: [senderInfo.onesignalId] };

        sendNotification(notificationObj, coupon);
      }
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      // This should *hopefully* never have to run, so that's why
      // the error handling is extremely half-assed
      console.error("Error in senderHasIOS:", XMLHttpRequest.responseText);
    }
  });
}

/** Handles the sending of the notifySender notification. */
var sendNotification = function(data, coupon) {
  var headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Authorization": "Basic " + env.ONESIGNAL_API_KEY
  };

  fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: headers,
      body: JSON.stringify(data)
  })
  .then((response) => response.json())
  .then((data) => {
    // troglodyte error checking because even an error is returned as success here
    if (data.errors) {
      console.error("Notification post failed: ", data);
      notificationError(data, coupon);
    } else {
      notificationSuccess(false, coupon);
    }
  })
  .catch((error) => {
    // Shouldn't ever run, but just in case
    console.error("CAUGHT error with notification:", error);
    notificationError(error, coupon);
  });
};

/**
 * Updates local display with lowered coupon count and lets them 
 * know the redemption was successful.
 * @param {boolean} isText - if false it's a OneSignal notification
 * that was successfully send, and if true it was a text message.
 */
function notificationSuccess(isText, coupon) {
  window.ga.trackEvent('Notification', isText ? 'Text Sent' : 'Notification Sent');
  SimpleNotification.success({
    text: "Successfully redeemed coupon"
  }, globalVars.notificationOptions);

  // Update redeemed coupons stats
  var stats = JSON.parse(localStorage.getItem("stats"));
  stats.redeemedCoupons++;
  localStorage.setItem("stats", JSON.stringify(stats));
  helper.updateStats();

  // PHP updated it on the server, this just does it locally and avoids another request
  coupon.count--;
  displayBook();
}

/**
 * Lets user know that the notification failed to send and refunds 
 * them that count.
 * @param {object} failedResponse - the response from the server 
 * from a failed fetch, or a string in the case of a failed text.
 */
function notificationError(failedResponse, coupon) {
  console.error("Inside notificationError:", failedResponse);
  window.ga.trackEvent('Notification', 'Notification Not Sent', 'notificationError');
  refundCoupon(coupon.name);

  if (failedResponse == "Error from sender_ios") {
    SimpleNotification.warning({
      title: "Can't send notification!",
      text: "Please let them know they have to add their phone number to their account."
    }, globalVars.notificationOptions);
  } else if (failedResponse.errors[0] == "All included players are not subscribed") {
    console.log("User no longer exists!");
    SimpleNotification.error({
      text: "User no longer exists!"
    }, globalVars.notificationOptions);
  } else {
    SimpleNotification.error({
      title: "Error redeeming coupon",
      text: "Please try again later."
    }, globalVars.notificationOptions);
  }
}

/**
 * If sending a coupon notification fails after the coupon's count has
 * already been decremented, this will increase the count by one to
 * return it to its previous state.
 * @param {string} couponName - the name of the coupon being refunded
 */
function refundCoupon(couponName) {
  console.warn("Refunding coupon...");
  var userId = localStorage.getItem("user_id");
  
  $.ajax({
    type: "POST",
    url: "https://couponbooked.com/scripts/refundCoupon",
    data: { bookId: globalVars.book.bookId, userId: userId, couponName: couponName },
    crossDomain: true,
    cache: false,
    success: function(success) {
      console.warn("refundCoupon SUCCESS:", success);
      window.ga.trackEvent('Refund', 'Coupon Refunded');
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("ERROR in refundCoupon: ", XMLHttpRequest.responseText);
      window.ga.trackEvent('Refund', 'Coupon Not Refunded');
    }
  });
}

// NOTE: Functions needed outside this file are listed here.
module.exports = Object.assign({
  displayBook
});