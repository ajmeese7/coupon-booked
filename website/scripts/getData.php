<?php
  include('createConnection.php');

  if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];
    if (is_null($userId)) {
      header('HTTP/1.1 400 Bad Request');
      exit("A null userId cannot be used to retrieve data.");
    }

    $stmt = $conn->prepare("SELECT receiverName, bookData, deleted FROM couponBooks WHERE sender=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();

    $dataArray = array();
    $sentArray = array();
    $receivedArray = array();

    $stmt->store_result();
    $stmt->bind_result($receiverName, $bookData, $deleted);
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Not deleted (0 is false in SQL)
        if ($deleted == 0) {
          // https://stackoverflow.com/a/8900730/6456163
          $row = new \stdClass();
          $row->receiverName = $receiverName;
          $row->bookData = $bookData;
          $row->deleted = $deleted; // TODO: Is this necessary?
          $sentArray[] = $row;
        }
      }
    } else {
      $sentArray[] = null;
    }

    $stmt = $conn->prepare("SELECT senderName, bookData, deleted FROM couponBooks WHERE receiver=?");
    $stmt->bind_param("s", $userId); // Should already be bound, but better safe than sorry.
    $stmt->execute();

    $stmt->store_result();
    $stmt->bind_result($senderName, $bookData, $deleted);
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Not deleted (0 is false in SQL)
        if ($deleted == 0) {
          // https://stackoverflow.com/a/8900730/6456163
          $row = new \stdClass();
          $row->senderName = $senderName;
          $row->bookData = $bookData;
          $row->deleted = $deleted; // TODO: Is this necessary?
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