<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId'])) {
    $userId = $_POST["userId"];
    if (is_null($userId)) {
      header('HTTP/1.1 400 Bad Request');
      exit("A null userId cannot be used to create data.");
    }

    $stats = new \stdClass();
    $stats->createdBooks = 0;
    $stats->sentBooks = 0;
    $stats->receivedBooks = 0;
    $stats->redeemedCoupons = 0;
    $stats->fulfilledCoupons = 0;
    $stats = json_encode($stats, JSON_UNESCAPED_SLASHES);

    // Check if the OneSignal ID has already been created;
    // should be yes on webapp and no on app
    $stmt = $conn->prepare("SELECT userId FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();

    // Display name defaults to null
    if ($stmt->num_rows > 0) {
      $stmt = $conn->prepare("UPDATE userData SET stats=? WHERE userId=?");
      $stmt->bind_param("ss", $stats, $userId);
    } else {
      $stmt = $conn->prepare("INSERT INTO userData (userId, stats) VALUES (?, ?)");
      $stmt->bind_param("ss", $userId, $stats);
    }

    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>