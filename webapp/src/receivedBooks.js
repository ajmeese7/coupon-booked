/**
 * Displays the UI for the current received book.
 */
function displayReceivedBook() {
  var bookContent = getById("bookContent");

  // Reset to default code so when refreshed it isn't populated twice
  bookContent.innerHTML = "";

  // Dynamically create preview of book at top of display
  var miniPreview = document.createElement('div');
  miniPreview.setAttribute("id", "miniPreview");
  miniPreview.innerHTML += `<img id='miniPreviewImage' onerror='imageError(this)' src='${book.image}' />`;

  var previewText = document.createElement('div');
  previewText.setAttribute("id", "previewText");
  previewText.innerHTML += `<h4>${book.name}</h4>`;

  var senderText = "<p class='senderText'>";
  senderText += book.sender ? `Sent from ${book.sender}` : "Sender unavailable";
  senderText += "</p>";
  previewText.innerHTML += senderText;
  miniPreview.appendChild(previewText);

  // NOTE: These images provided by FontAwesome
  var hideImg = "<img id='hideBook' class='filter-black' src='images/eye-";
  hideImg += (book.hide ? "slash-" : "") + "regular.svg' />";
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
    previousBook = null;
    book = null;
    _this.redirectTo("/dashboard");
  });

  $('#hideBook').unbind().click(function() {
    var newHideStatus = book.hide ? 0 : 1;
    $(this).attr('src', "images/eye-" + (newHideStatus ? "slash-" : "") + "regular.svg");
    book.hide = newHideStatus;

    $.ajax({
      type: "POST",
      url: "https://www.couponbooked.com/scripts/changeHiddenStatus",
      data: { bookData: JSON.stringify(book), hide: newHideStatus, bookId: book.bookId },
      crossDomain: true,
      cache: false,
      success: function(success) {
        // NOTE: UI to display hidden books will be implemented when I add the sorting button
        // that allows you to do custom w/ dragging, alphabetical, newest, ect.
        if (book.hide) {
          console.warn("Book is now hidden.");
        } else {
          console.warn("Book no longer hidden.");
        }

        // NOTE: Should I include this or let the icon speak for itself?
        // Also, how do you see hidden books to unhide?
        /*SimpleNotification.success({
          text: "Successfully hid book"
        }, notificationOptions);*/
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.error("Error hiding book:", XMLHttpRequest.responseText);
        // TODO: Undo hide action here; shoud literally never run so
        // not making this a priority

        SimpleNotification.warning({
          title: "Error hiding book",
          text: "Please try again later."
        }, notificationOptions);
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
function createReceivedCouponElements() {
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  var couponContainer = document.createElement('div');
  couponContainer.setAttribute("id", "couponContainer");
  $.each(book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      couponContainer.appendChild(node);

      receivedCouponListeners(node);
  });

  getById("bookContent").appendChild(couponContainer);
}

/**
 * Displays the coupon's info when the card is clicked.
 * @param {object} node - the element on the page with the coupon's data attached
 */
function receivedCouponListeners(node) {
  $(node).unbind().click(function() {
    fadeBetweenElements("#bookContent", "#couponPreview");

    $('#backArrow').unbind().click(function() {
      fadeBetweenElements("#couponPreview", "#bookContent");
      displayReceivedBook();
    });

    // Updates preview fields with actual coupon's data
    var coupon = $(this).data("coupon");
    getById("imgPreview").src        = coupon.image;
    getById("namePreview").innerText = `${coupon.name}: ${coupon.count}`;
    getById("descPreview").innerText = coupon.description;

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
      url: "https://www.couponbooked.com/scripts/redeemCoupon",
      data: { bookId: book.bookId, userId: userId, couponName: coupon.name },
      crossDomain: true,
      cache: false,
      success: function(success) {
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
        }, notificationOptions);
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
    }, notificationOptions);
  }
}

/**
 * Send OneSignal notification to the sender of the book letting
 * them know who has redeemed what coupon.
 * @param {string} onesignalId - the OneSignal ID of the book's sender
 * @param {element} coupon - the coupon element that is being redeemed
 */
function notifySender(onesignalId, coupon) {
  var title = `${getUserName()} redeemed \"${coupon.name}!\"`;
  var message = `${coupon.description}`; // IDEA: Current count or something?

  if (onesignalId) {
      $.ajax({
        type: "POST",
        url: "https://www.couponbooked.com/scripts/sendNotification",
        // senderId was external, but now it's the native OneSignal user's UUID
        data: { title: title, message: message, image: coupon.image, senderId: onesignalId },
        crossDomain: true,
        cache: false,
        success: function(data) {
          if (data.includes("errors")) {
            notificationError(data, coupon);
          } else {
            notificationSuccess(data, coupon);
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("Error sending notification:", XMLHttpRequest.responseText);
        }
      });
  } else {
    // TODO: Alert user that there's an error and log it? This should never run, outside of
    // when I break stuff when testing...
    console.error("No server OneSignal user ID set! Not attempting to send notification...");
  }
}

/**
 * Updates local display with lowered coupon count and lets them 
 * know the redemption was successful.
 * @param {object} successResponse - the response from the server
 * from a successful fetch.
 */
function notificationSuccess(successResponse, coupon) {
  //console.warn("Notification post success:", successResponse);
  SimpleNotification.success({
    text: "Successfully redeemed coupon"
  }, notificationOptions);

  // Update redeemed coupons stats
  var stats = JSON.parse(localStorage.getItem("stats"));
  stats.redeemedCoupons++;
  localStorage.setItem("stats", JSON.stringify(stats));
  updateStats();

  // PHP updated it on the server, this just does it locally and avoids another request
  coupon.count--;
  displayReceivedBook();
}

/**
 * Lets user know that the notification failed to send and refunds 
 * them that count.
 * @param {object} failedResponse - the response from the server 
 * from a failed fetch.
 */
function notificationError(failedResponse, coupon) {
  console.error("Notification post failed:", data);
  refundCoupon(coupon.name);

  // TODO: Test if this actually works and can detect if the user has been deleted;
  // it probably won't but whatever. Not really important
  if (failedResponse.includes("All included players are not subscribed")) {
    console.log("User no longer exists!");
    SimpleNotification.error({
      text: "User no longer exists!"
    }, notificationOptions);
  } else {
    SimpleNotification.error({
      title: "Error redeeming coupon",
      text: "Please try again later."
    }, notificationOptions);
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
    url: "https://www.couponbooked.com/scripts/refundCoupon",
    data: { bookId: book.bookId, userId: userId, couponName: couponName },
    crossDomain: true,
    cache: false,
    success: function(success) {
      console.warn("refundCoupon SUCCESS:", success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("ERROR in refundCoupon: ", XMLHttpRequest.responseText);

      // IDEA: Create a way to report problems such as this
      /*SimpleNotification.error({
        title: "Error refunding coupon",
        text: "Please report this issue."
      }, notificationOptions);*/
    }
  });
}