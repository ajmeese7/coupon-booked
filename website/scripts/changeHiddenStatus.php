<?php
  include('createConnection.php');

  if (isset($_POST['bookData']) && isset($_POST['hide']) && isset($_POST['bookId'])) {
    // NOTE: Booleans in SQL are 0/1
    $bookData = $_POST["bookData"];
    $hide = $_POST["hide"];
    $bookId = $_POST["bookId"];
    $stmt = $conn->prepare("UPDATE couponBooks SET bookData=?, hide=? WHERE bookId=?");
    $stmt->bind_param("sis", $bookData, $hide, $bookId);
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
