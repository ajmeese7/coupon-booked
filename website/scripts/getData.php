<?php
  include('createConnection.php');

  if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];

    $stmt = $conn->prepare("SELECT receiverName, bookData, paymentStatus, deleted FROM couponBooks WHERE sender=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();

    $dataArray = array();
    $sentArray = array();
    $receivedArray = array();

    $stmt->store_result();
    $stmt->bind_result($receiverName, $bookData, $paymentStatus, $deleted);
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Not deleted (0 is false in SQL)
        if ($deleted == 0) {
          // https://stackoverflow.com/a/8900730/6456163
          $row = new \stdClass();
          $row->receiverName = $receiverName;
          $row->bookData = $bookData;
          $row->paymentStatus = $paymentStatus;
          $row->deleted = $deleted; // Is this necessary?
          $sentArray[] = $row;
        }
      }
    } else {
      $sentArray[] = null;
    }

    $stmt = $conn->prepare("SELECT senderName, bookData, hide, deleted FROM couponBooks WHERE receiver=?");
    $stmt->bind_param("s", $userId); // Should already be bound, but better safe than sorry.
    $stmt->execute();

    $stmt->store_result();
    $stmt->bind_result($senderName, $bookData, $hide, $deleted);
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Not deleted (0 is false in SQL)
        if ($deleted == 0) {
          // https://stackoverflow.com/a/8900730/6456163
          $row = new \stdClass();
          $row->senderName = $senderName;
          $row->bookData = $bookData;
          $row->hide = $hide;
          $row->deleted = $deleted; // Is this necessary?
          $receivedArray[] = $row;
        }
      }
    } else {
      $receivedArray[] = null;
    }

    $stmt->close();

    $dataArray[] = $sentArray;
    $dataArray[] = $receivedArray;

    // https://stackoverflow.com/a/7282769/6456163
    echo json_encode($dataArray, JSON_UNESCAPED_SLASHES);
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>