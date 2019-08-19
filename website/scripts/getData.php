<?php
  include('createConnection.php');

  if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];
    $sql = "SELECT bookData, receiver FROM couponBooks WHERE sender='$userId'";
    $result = $conn->query($sql) or die($conn->error); // TODO: Somehow handle errors

    $dataArray = array();
    $sentArray = array();
    $receivedArray = array();
    if ($result->num_rows > 0) {
      while ($row = $result->fetch_assoc()) {
        $sentArray[] = $row;
      }
    } else {
      $sentArray[] = null;
    }

    $sql = "SELECT bookData, sender FROM couponBooks WHERE receiver='$userId'";
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
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>