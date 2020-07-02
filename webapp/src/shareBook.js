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
    url: "https://www.couponbooked.com/scripts/createShareCode",
    data: { bookId: book.bookId, bookData: JSON.stringify(book), shareCode: shareCode },
    crossDomain: true,
    cache: false,
    success: function(success) {
      handleSuccess(success);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.error("Error in createShareCode:", XMLHttpRequest.responseText);
      gtag('event', 'Share Code Generated', {
        'event_category' : 'Book Sharing',
        'event_label' : 'Error'
      });

      // TODO: Make sure error actually has working timer
      SimpleNotification.error({
        title: "Error creating share code!",
        text: "Please try again later."
      }, notificationOptions);
    }
  });

  function handleSuccess(success) {
    // Aside from the first and last, these should never run. They're
    // just here on the off chance that something fails and they run
    console.log("Share code success:", success)
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
      }, notificationOptions);

    } else if (success == "Share code exists") {
      console.warn("Share code already generated.");
      SimpleNotification.warning({
        text: "Share code already generated."
      }, notificationOptions);

    } else {
      console.warn("Share code created successfully:", shareCode);
      book.shareCode = shareCode;
      
      // This is the end goal, meaning payment was successful
      gtag('config', googleID, { 'page_title' : 'Stripe Payment', 'page_path' : '/stripePayment' });

      // Set fireworks to display on the share code page
      localStorage.setItem("show_fireworks", "true");

      // Update sent books stats
      var stats = JSON.parse(localStorage.getItem("stats"));
      stats.sentBooks++;
      localStorage.setItem("stats", JSON.stringify(stats));
      updateStats();

      // So they can go back to dashboard without dealing with confirm prompt;
      // true means it's silent so they don't get a strange notification
      updateBook(true);
      _this.redirectTo('/shareCode');
    }
  }
}

/**
 * Opens native share function of device populated with the coded options.
 */
async function shareCode() {
  var options = {
    //title: "You've been Coupon Booked!", // for email
    text: `You've been Coupon Booked! Go to couponbooked.com/webapp to redeem your code: ${book.shareCode}`
  };

  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
  try {
    await navigator.share(options);
    console.log('Successfully ran share');

    gtag('event', 'Book Shared', {
      'event_category' : 'Book Sharing',
      'event_label' : 'Navigator Implementation'
    });
  } catch(err) {
    console.error("Error running share:", err);

    gtag('event', 'Book Shared', {
      'event_category' : 'Book Sharing',
      'event_label' : 'Error'
    });
  }
}