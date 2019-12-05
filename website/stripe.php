<?php
    require_once('../vendor/autoload.php');
    include('./scripts/env.php');
    include('./scripts/createConnection.php');

    if (isset($_POST['stripeToken']) && isset($_POST['bookId'])) {
        // Set your secret key: remember to change this to your live secret key in production
        // See your keys here: https://dashboard.stripe.com/account/apikeys
        \Stripe\Stripe::setApiKey($STRIPE_TEST_SECRET);
        // IDEA: Include a separate piece of info saying whether test or production is 
        // being used in the primary file

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
        // IDEA: Map of globe displaying general location of users overall
        $status = $charge->status;
        $bookId = $_POST["bookId"];

        // For use in success case to determine the course of action
        echo $status;
        
        // Do I need to update bookData here or can that be handled in createShareCode?
        $stmt = $conn->prepare("UPDATE couponBooks SET paymentStatus=? WHERE bookId=?");
        $stmt->bind_param("ss", $status, $bookId);
        $stmt->execute();
        $stmt->close();
      } else {
        header('HTTP/1.1 400 Bad Request');
        exit("The necessary POST variables were not included.");
      }
?>