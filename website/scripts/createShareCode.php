<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['bookData']) && isset($_POST['shareCode'])) {
    $bookData = $_POST["bookData"];
    $bookId = $_POST["bookId"];
    $newShareCode = $_POST["shareCode"];

    $stmt = $conn->prepare("SELECT senderName FROM couponBooks WHERE shareCode=?");
    $stmt->bind_param("s", $newShareCode);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($senderName); // Variable not needed so it doesn't interfere

    if ($stmt->num_rows > 0) {
       // Share code already in use; generate new one
       echo "Code in use";
    } else {
      $stmt = $conn->prepare("SELECT receiver, shareCode FROM couponBooks WHERE bookId=?");
      $stmt->bind_param("s", $bookId);
      $stmt->execute();
      $stmt->store_result();
      $stmt->bind_result($receiver, $shareCode);

      // Book exists
      if ($stmt->num_rows > 0) {
        // NOTE: If data ever becomes corrupted with unnecessary slashes, replace
        // here: http://www.unit-conversion.info/texttools/replace-text/.
        // However, the new encoding parameter should prevent that.
        if (!$receiver && !$shareCode) {
          $bookData = json_decode($bookData);
          $bookData->shareCode = $newShareCode;
          $bookData = json_encode($bookData, JSON_UNESCAPED_SLASHES);
          
          // https://www.w3schools.com/php/php_mysql_prepared_statements.asp
          $stmt = $conn->prepare("UPDATE couponBooks SET shareCode=?, bookData=? WHERE bookId=?");
          $stmt->bind_param("sss", $newShareCode, $bookData, $bookId);
          $stmt->execute();
        } else if (!$receiver) {
          // Book already has a share code set
          echo "Share code exists";
        } else {
          // Book has alreay been sent and cannot be sent again;
          // IDEA: clone feature for sending same book to multiple people
          echo "Receiver exists";
        }

        // IDEA: must have requried ID (sender/receiver) to manipulate book?
        // Except for my master ID; how to protect? Env file?
      } else {
        // TODO: Look further into which headers to use
        header('HTTP/1.1 400 Bad Request');
        exit("A book by that ID does not exist.");
      }
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
