<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['bookData']) && isset($_POST['shareCode'])) {
    $bookId = $_POST["bookId"];
    $bookData = $_POST["bookData"];
    $shareCode = $_POST["shareCode"];

    // Probably the longest query; any way to speed up if it becomes an issue?
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
          // Update bookData so JSON also has shareCode;
          // NOTE: Means I also have to set that to null on code redemption
          $bookData = json_decode($bookData);
          $bookData->shareCode = $shareCode;
          $bookData = json_encode($bookData);
          
          $sql = "UPDATE couponBooks SET shareCode='$shareCode', bookData='$bookData' WHERE bookId='$bookId'";
          $result = $conn->query($sql) or die($conn->error);
        } else if (!$row["receiver"]) {
          // Book already has a share code set
          echo "Share code exists";
        } else {
          // Book has alreay been sent and cannot be sent again;
          // IDEA: clone feature?
          echo "Receiver exists";
        }

        // IDEA: must have requried ID (sender/receiver) to manipulate book?
        // Except for my master ID; how to protect?
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
