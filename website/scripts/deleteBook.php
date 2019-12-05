<?php
  include('createConnection.php');

  if (isset($_POST['bookId'])) {
    // NOTE: Booleans in SQL are 0/1
    $bookId = $_POST["bookId"];
    $stmt = $conn->prepare("UPDATE couponBooks SET deleted='1' WHERE bookId=?");
    $stmt->bind_param("s", $bookId);
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variable was not included.");
  }
?>
