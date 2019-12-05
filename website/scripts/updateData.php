<?php
  include('createConnection.php');

  if (isset($_POST['bookData']) && isset($_POST['bookId'])) {
    // https://stackoverflow.com/a/2687891/6456163
    $bookData = $_POST["bookData"];
    $bookId = $_POST["bookId"];

    // TODO: Return if book is deleted so book can't be updated;
    // could just save it instead. Should also have UI remove book
    // and refresh on delete.
    $stmt = $conn->prepare("UPDATE couponBooks SET bookData=? WHERE bookId=?");
    $stmt->bind_param("ss", $bookData, $bookId);
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
