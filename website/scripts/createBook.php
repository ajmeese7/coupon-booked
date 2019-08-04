<?php
  include('createConnection.php');

  $bookId = $_POST["bookId"];
  $sender = $_POST["sender"];
  $bookData = $_POST["bookData"];
  $sql = "INSERT INTO couponBooks (bookId, sender, bookData) VALUES ('$bookId', '$sender', '$bookData')";
  $result = $conn->query($sql) or die($conn->error);

  // TODO: Create a feedback check for if bookId exists and if it does generate new one and try again
  // NOTE: *should* never happen, but just on the off chance that it does

  $conn->close();
?>
