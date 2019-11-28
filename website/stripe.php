<?php
    require_once('../vendor/autoload.php');
    include('./scripts/env.php');

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

    echo json_encode($charge);
?>