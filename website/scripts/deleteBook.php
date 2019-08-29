<?php
  include('createConnection.php');

  if (isset($_POST['bookId'])) {
    $bookId = $_POST["bookId"];
    $sql = "UPDATE couponBooks SET deleted='1' WHERE bookId='$bookId'";
    $result = $conn->query($sql) or die($conn->error);
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variable was not included.");
  }

  $conn->close();
?>
