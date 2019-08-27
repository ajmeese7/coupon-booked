<?php
  include('createConnection.php');

  if (isset($_POST['bookId']) && isset($_POST['sender']) && 
  isset($_POST['senderName']) && isset($_POST['bookData'])) {
    $bookId = $_POST["bookId"];
    $sender = $_POST["sender"];
    $senderName = $_POST["senderName"];
    $bookData = $_POST["bookData"];

    $sql = "SELECT * FROM couponBooks WHERE bookId='$bookId'";
    $result = $conn->query($sql) or die($conn->error);

    if ($result->num_rows > 0) {
      // bookId already in use; generate new one
      echo "bookId in use";
    } else {
      $sql = "INSERT INTO couponBooks (bookId, sender, senderName, bookData) 
        VALUES ('$bookId', '$sender', '$senderName', '$bookData')";
      $result = $conn->query($sql) or die($conn->error);
    }
  } else {
    // www.rachaelarnold.com/dev/archive/trigger-ajax-error-event
    // When should I throw a 500 error? When UUID already used? Or silently fail and retry?
    header('HTTP/1.1 400 Bad Request');
    exit("Missing POST variable.");
  }

  $conn->close();
?>
