<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['shareCode'])) {
    $userId = $conn->real_escape_string($_POST["userId"]);
    $shareCode = $conn->real_escape_string($_POST["shareCode"]);

    $sql = "SELECT sender, bookData FROM couponBooks WHERE shareCode='$shareCode'";
    $result = $conn->query($sql) or die($conn->error);

    if ($result->num_rows > 0) {
      // Share code exists
      while ($row = $result->fetch_assoc()) {
        $sender = $row["sender"];
        if ($sender == $userId) {
          echo "Sent to self";
        } else {
          $bookData = json_decode($row["bookData"]);
          $bookData->shareCode = null;
          $bookData = json_encode($bookData);

          $sql = "UPDATE couponBooks SET receiver='$userId', bookData='$bookData', shareCode=null WHERE shareCode='$shareCode'";
          $result = $conn->query($sql) or die($conn->error);
        }
      }
    } else {
      // Share code doesn't exist; should this be an error code?
      echo "Not valid";
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
