<?php
  include('createConnection.php');

  $bookData = $_POST["bookData"];
  $bookId = $_POST["bookId"];
  $sql = "UPDATE couponBooks SET bookData='$bookData' WHERE bookId='$bookId'";
  $result = $conn->query($sql) or die($conn->error);

  $conn->close();
?>
