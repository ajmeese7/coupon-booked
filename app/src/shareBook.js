var helper = require('./helperFunctions');
var globalVars = require('./globalVars.js');
var sent = require('./sentBooks.js');

/**
 * Adds Google Play support to the share button
 * with native in-app purchases.
 */
function shareButtonListeners() {
  $('#share').unbind().click(function() {
    inAppPurchase
      .getProducts([ 'book' ])
      .then(function (products) {
        inAppPurchase
          .buy('book')
          .then(function (data) {
            // ...then mark it as consumed:
            return inAppPurchase.consume(data.productType, data.receipt, data.signature);
          })
          .then(function (data) {
            createShareCode();
          })
          .catch(function (err) {
            console.error("Error making purchase:", err);
            SimpleNotification.warning({
              title: "Problem making purchase",
              text: "Please try again later."
            }, globalVars.notificationOptions);
          });
      })
      .catch(function (err) {
        console.error("Error retrieving products:", err);
      });
  });
}

/* The characters allowed in the share code and the code length.
 * Needed for createShareCode, redeemCode, and the route. */
var ALPHABET = '23456789abdegjkmnpqrvwxyz';
var ID_LENGTH = 8;

/**
 * Generates a share code and adds it to the book's entry 
 * in the database.
 */
function createShareCode() {
  // https://www.fiznool.com/blog/2014/11/16/short-id-generation-in-javascript/
  var shareCode = generateShareCode();
  function generateShareCode() {
    var rtn = '';
    for (var i = 0; i < ID_LENGTH; i++) {
      rtn += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
    }
    return rtn;
  }

  $.ajax({
    type: "POST",
    url: "https://couponbooked.com/scripts/createShareCode",
    data: { bookId: globalVars.book.bookId, bookData: JSON.stringify(globalVars.book), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      handleSuccess(success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createShareCode:", XMLHttpRequest.responseText);

      // TODO: Make sure error actually has working timer
      SimpleNotification.error({
        title: "Error creating share code!",
        text: "Please try again later."
      }, globalVars.notificationOptions);
    }
  });

  function handleSuccess(success) {
    console.log("Share code success:", success)

    // NOTE: Should think of better messages here
    if (success == "Code in use") {
      // Try again with a new share code
      console.warn("Share code in use. Generating new code...");
      createShareCode();

    } else if (success == "Receiver exists") {
      // NOTE: Should probably add in headers
      console.warn("Book has already been sent.");
      SimpleNotification.warning({
        // IDEA: Warning symbol for images; yellow might not be enough
        text: "Book has already been sent."
      }, globalVars.notificationOptions);

    } else if (success == "Share code exists") {
      console.warn("Share code already generated.");
      SimpleNotification.warning({
        text: "Share code already generated."
      }, globalVars.notificationOptions);

    } else {
      console.warn("Share code created successfully:", shareCode);
      globalVars.book.shareCode = shareCode;

      // Set fireworks to display on the share code page
      localStorage.setItem("show_fireworks", "true");

      // This is the end goal, meaning payment was successful
      window.ga.trackView('Play Store Payment');

      // Update sent books stats
      var stats = JSON.parse(localStorage.getItem("stats"));
      stats.sentBooks++;
      localStorage.setItem("stats", JSON.stringify(stats));
      helper.updateStats();

      // So they can go back to dashboard without dealing with confirm prompt;
      // true means it's silent so they don't get a strange notification
      sent.updateBook(true);
      globalVars._this.redirectTo('/shareCode');
    }
  }
}

/**
 * Opens native share function of device populated with the coded options.
 */
function shareCode() {
  var options = {
    //subject: "You've been Coupon Booked!", // for email
    message: `You've been Coupon Booked! Go to couponbooked.com/webapp to redeem your code: ${globalVars.book.shareCode}`
  };
  var onSuccess = function(result) {
    // On Android result.app since plugin version 5.4.0 this is no longer empty.
    // On iOS it's empty when sharing is cancelled (result.completed=false)
    console.warn("Shared to app:", result.app);
    window.ga.trackEvent('Book Sharing', 'Book Shared', 'Cordova Implementation');
  };
  var onError = function(msg) {
    console.error("Sharing failed with message:", msg);
    window.ga.trackEvent('Book Sharing', 'Book Shared', 'Error');
  };

  window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
}

// NOTE: Functions needed outside this file are listed here.
module.exports = Object.assign({
  shareButtonListeners,
  shareCode,
  ID_LENGTH,
  ALPHABET
});