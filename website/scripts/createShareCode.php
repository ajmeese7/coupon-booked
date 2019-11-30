<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['bookData']) && isset($_POST['shareCode'])) {
    $bookData = $_POST["bookData"];
    $bookId = $conn->real_escape_string($_POST["bookId"]);
    $shareCode = $conn->real_escape_string($_POST["shareCode"]);

    // NOTE: Probably the longest query; any way to speed up if it becomes an issue?
    $sql = "SELECT * FROM couponBooks WHERE shareCode='$shareCode'";
    $result = $conn->query($sql) or die($conn->error);

    if ($result->num_rows > 0) {
      // Share code already in use; generate new one
      echo "Code in use";
    } else {
      $sql = "SELECT receiver, shareCode FROM couponBooks WHERE bookId='$bookId'";
      $result = $conn->query($sql) or die($conn->error);

      // Book exists
      if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        if (!$row["receiver"] && !$row["shareCode"]) {
          $bookData = json_decode($bookData);
          $bookData->shareCode = $shareCode;
          $bookData = json_encode($bookData);
          
          // https://www.w3schools.com/php/php_mysql_prepared_statements.asp;
          // TODO: Switch to this more secure method everywhere and test thoroughly.
          $stmt = $conn->prepare("UPDATE couponBooks SET shareCode=?, bookData=? WHERE bookId=?");
          $stmt->bind_param("sss", $shareCode, $bookData, $bookId);
          $stmt->execute();
          $stmt->close();
        } else if (!$row["receiver"]) {
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
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
