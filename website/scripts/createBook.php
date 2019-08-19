<?php
  include('createConnection.php');

  if (isset($_POST['bookId']) && isset($_POST['sender']) && isset($_POST['bookData'])) {
    $bookId = $_POST["bookId"];
    $sender = $_POST["sender"];
    $bookData = $_POST["bookData"];
    
    $sql = "INSERT INTO couponBooks (bookId, sender, bookData) VALUES ('$bookId', '$sender', '$bookData')";
    $result = $conn->query($sql) or die($conn->error);
    // TODO: How to check if PHP error exists here?
  } else {
    // www.rachaelarnold.com/dev/archive/trigger-ajax-error-event
    // When should I throw a 500 error? When UUID already used? Or silently fail and retry?
    header('HTTP/1.1 400 Bad Request');
    exit("Missing POST variable.");
  }

  // TODO: Create a feedback check for if bookId exists and if it does generate new one and try again
  // NOTE: *should* never happen, but just on the off chance that it does

  $conn->close();
?>
