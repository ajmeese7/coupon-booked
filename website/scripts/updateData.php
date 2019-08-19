<?php
  include('createConnection.php');

  if (isset($_POST['bookData']) && isset($_POST['bookId'])) {
    $bookData = $_POST["bookData"];
    $bookId = $_POST["bookId"];
    $sql = "UPDATE couponBooks SET bookData='$bookData' WHERE bookId='$bookId'";
    $result = $conn->query($sql) or die($conn->error);
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
