<?php
    require_once('../vendor/autoload.php');
    include('./scripts/env.php');
    include('./scripts/createConnection.php');

    if (isset($_POST['stripeToken']) && isset($_POST['bookId'])) {
        // Set your secret key: remember to change this to your live secret key in production
        // See your keys here: https://dashboard.stripe.com/account/apikeys
        \Stripe\Stripe::setApiKey($STRIPE_TEST_SECRET);
        // IDEA: If the JS POST idea starts working, include a separate piece of info
        // that says whether test or production is being used in the primary file

        // Token is created using Checkout.
        // Get the payment token ID submitted by the form:
        $token = $_POST['stripeToken'];
        $charge = \Stripe\Charge::create([
            'amount' => 299,
            'currency' => 'usd',
            'description' => 'The perfect gift.',
            'source' => $token,
        ]);

        // NOTE: Could pull data from here eventually for analytics purposes,
        // but currently only going to use the status to determine if successful.
        $status = $charge->status;
        $bookId = $conn->real_escape_string($_POST["bookId"]);
        $sql = "UPDATE couponBooks SET paymentStatus='$status' WHERE bookId='$bookId'";
        $result = $conn->query($sql) or die($conn->error);
      } else {
        header('HTTP/1.1 400 Bad Request');
        exit("The necessary POST variables were not included.");
      }
?>