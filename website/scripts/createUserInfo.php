<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId'])) {
    $userId = $_POST["userId"];

    $stats = new \stdClass();
    $stats->createdBooks = 0;
    $stats->sentBooks = 0;
    $stats->receivedBooks = 0;
    $stats->redeemedCoupons = 0;
    $stats->fulfilledCoupons = 0;
    $stats = json_encode($stats, JSON_UNESCAPED_SLASHES);

    // Display name defaults to null and dark mode defaults to 0
    $stmt = $conn->prepare("INSERT INTO userData (userId, stats) VALUES (?, ?)");
    $stmt->bind_param("ss", $userId, $stats);
    
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>