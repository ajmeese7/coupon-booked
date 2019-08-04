<?php
  include('createConnection.php');

  $userId = $_GET['userId'];
  $sql = "SELECT bookData FROM couponBooks WHERE sender='$userId'";
  $result = $conn->query($sql) or die($conn->error); // TODO: Somehow handle errors

  if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
      // IDEA: Manipulate raw HTML here then add directly to document (on return)
      echo json_encode($row);
    }
  } else {
    // if none, then insert element that says "nothing here" or set existing element to display
    echo "<script></script>";
  }

  $sql = "SELECT bookData FROM couponBooks WHERE receiver='$userId'";
  $result = $conn->query($sql) or die($conn->error);

  if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
      echo json_encode($row);
    }
  } else {
    // TODO
    echo "<script></script>";
  }

  $conn->close();
?>