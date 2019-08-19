<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['shareCode'])) {
    $bookId = $_POST["bookId"];
    $shareCode = $_POST["shareCode"];
    $sql = "SELECT receiver, shareCode FROM couponBooks WHERE bookId='$bookId'";
    $result = $conn->query($sql) or die($conn->error);

    // Book exists
    if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      if (!$row["receiver"] && !$row["shareCode"]) {
        $sql = "UPDATE couponBooks SET shareCode='$shareCode' WHERE bookId='$bookId'";
        $result = $conn->query($sql) or die($conn->error);
      } else if (!$row["receiver"]) {
        echo "Share code exists";
      } else {
        echo "Receiver exists";
      }

      // IDEA: must have requried ID (sender/receiver) to manipulate book?
      // Except for my master ID; how to protect?
    } else {
      // TODO: Look further into which headers to use
      header('HTTP/1.1 400 Bad Request');
      exit("A book by that ID does not exist.");
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
