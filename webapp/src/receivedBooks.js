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
  // TODO: Figure out how to display image licenses if not paying for yearly subscription
  // TODO: Implement way to rearrange organization of coupons; also change
    // display options like default, alphabetical, count remaining, etc.;
    // should changing display preference permenantly update the order?
    // Option to hide coupons with 0 count; display 3 to a row

  $.each(book.coupons, function(couponNumber, coupon) {
      var node = document.createElement('div');
      node.setAttribute("class", "couponPreview");
      node.innerHTML += `<img class='couponImage' onerror='imageError(this)' src='${coupon.image}' />`;
      node.innerHTML += `<p class='couponName'>${coupon.name}</p>`;
      node.innerHTML += `<p class='couponCount'>${coupon.count} remaining</p>`;
      $(node).data("coupon", coupon);
      $(node).data("couponNumber", couponNumber);
      getById("bookContent").appendChild(node);

      receivedCouponListeners(node);
  });
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
          "Redeem it": function() {
            // TODO: Test coupon redemption + notification;
            // how to handle if they've logged out of device? Email? Text?
            $( this ).dialog( "close" );
            redeemCoupon(coupon);
            $('#backArrow').click();
          },
          Cancel: function() {
            $( this ).dialog( "close" );
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
    // TODO: Make sure this stalling forever is just a testing issue and not a runtime problem.
    // If error continues, have some timeout that if in 3 seconds there's not a result the
    // coupon is refunded then this is recursively called. Have some counter for that too like
    // the nav issue and if nothing happens by the second time then display an error telling
    // them to restart the app or try again later or something.
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
 * @param {string} senderId - the user sub of the book's sender
 * @param {element} coupon - the coupon element that is being redeemed
 */
function notifySender(senderId, coupon) {
  var title = `${getUserName()} redeemed \"${coupon.name}!\"`;
  var message = `${coupon.description}`; // IDEA: Current count or something?
  var notificationObj = { app_id : env.ONESIGNAL_ID,
                          headings: {en: title},
                          contents: {en: message},
                          big_picture: coupon.image, // TODO: Decide if I like this or not
                          ttl: 2419200,
                          priority: 10,
                          include_external_user_ids: [senderId] };
  
  sendNotification(notificationObj, coupon);
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
      notificationSuccess(data, coupon);
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
 * @param {object} successResponse - the response from the server
 * from a successful fetch.
 */
function notificationSuccess(successResponse, coupon) {
  // PHP updated it on the server, this just does it locally and avoids another request
  coupon.count--;
  displayReceivedBook();

  console.warn("Notification post success:", successResponse);
  SimpleNotification.success({
    text: "Successfully redeemed coupon"
  }, notificationOptions);
}

/**
 * Lets user know that the notification failed to send and refunds 
 * them that count.
 * @param {object} failedResponse - the response from the server 
 * from a failed fetch.
 */
function notificationError(failedResponse, coupon) {
  refundCoupon(coupon.name);

  // TODO: Test if this actually works and can detect if the user has been deleted;
  // it probably won't but whatever. Not really important
  if (failedResponse.errors[0] == "All included players are not subscribed") {
    // IDEA: If error that person doesn't exist, hide the book or 
    // something and let there be a note in the SQL
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