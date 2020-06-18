<?php
  include('createConnection.php');
  include('env.php');
  require('Composer/vendor/autoload.php');
  // The nexmo library, installed via composer then manually uploaded;
  // https://stackoverflow.com/a/61729347/6456163

  // Make sure necessary variables exist
  if (isset($_POST['senderId']) && isset($_POST['message'])) {
    $senderId = $_POST["senderId"];
    $myMessage = $_POST["message"];

    // Get their phone number to send the message
    $stmt = $conn->prepare("SELECT phone_num FROM userData WHERE userId=?");
    $stmt->bind_param("s", $senderId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($phoneNum);

    if ($stmt->num_rows > 0) {
      $basic  = new \Nexmo\Client\Credentials\Basic($VONAGE_API_KEY, $VONAGE_API_SECRET);
      $client = new \Nexmo\Client($basic);

      while ($stmt->fetch()) {
        if (!is_null($phoneNum)) {
          // TODO: Is there a way to error check this to make sure the message is sent?
          $message = $client->message()->send([
              // TODO: Let people know that this is only US numbers as of now
              'to' => "1" . $phoneNum,
              'from' => '15056669731',
              'text' => $myMessage
          ]);
        } else {
          echo "Missing number";
        }
      }
    } else {
      // Already checked this in senderHasIOS, but checking again to confirm
      echo "Missing number";
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>