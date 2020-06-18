<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_GET['senderId'])) {
    $senderId = $_GET["senderId"];

    $stmt = $conn->prepare("SELECT phone_num, iOS FROM userData WHERE userId=?");
    $stmt->bind_param("s", $senderId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($phoneNum, $iOS);

    // Updates user info if it already exists and creates new info if it doesn't
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        if (!is_null($phoneNum) && $phoneNum != 1 && $phoneNum != "1") {
          if ($iOS == 1) {
            echo "true";
            return;
          }
          echo "false";
        } else {
          // Will let the client know whether the user has a phone number missing,
          // thus disallowing us from sending them a text
          echo "Missing number";
        }
      }
    } else {
      // Shouldn't occur, but we can't text them if there's no number, so we
      // assume that they are capable of getting a OneSignal notification
      echo "false";
    }
    
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary GET variables were not included.");
  }
?>