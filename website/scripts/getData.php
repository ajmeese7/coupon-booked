<?php
  include('createConnection.php');

  $userId = $_GET['userId'];
  $sql = "SELECT bookData FROM couponBooks WHERE sender='$userId'";
  $result = $conn->query($sql) or die($conn->error); // TODO: Somehow handle errors

  $dataArray = array();
  $sentArray = array();
  $receivedArray = array();
  if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
      // IDEA: Manipulate raw HTML here then add directly to document (on return)
      $sentArray[] = $row;
    }
  } else {
    // if none, then insert element that says "nothing here" or set existing element to display
    $sentArray[] = null;
  }

  $sql = "SELECT bookData FROM couponBooks WHERE receiver='$userId'";
  $result = $conn->query($sql) or die($conn->error);

  if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
      $receivedArray[] = $row;
    }
  } else {
    $receivedArray[] = null;
  }

  $dataArray[] = $sentArray;
  $dataArray[] = $receivedArray;
  echo json_encode($dataArray);

  $conn->close();
?>