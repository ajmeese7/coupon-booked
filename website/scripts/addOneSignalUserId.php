<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['onesignalId'])) {
    $userId = $_POST["userId"];
    $onesignalId = $_POST["onesignalId"];

    // Will let the client know whether the user's OneSignal ID was updated
    // or inserted; mostly for debugging purposes.
    $returnMessage;

    // Currently this will create a OneSignal ID every time the user logs in,
    // but if I can get the notifications to work that'll be an issue for another day.
    $stmt = $conn->prepare("SELECT onesignalId FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();

    // Updates user info if it already exists and creates new info if it doesn't
    if ($stmt->num_rows > 0) {
      $stmt = $conn->prepare("UPDATE userData SET onesignalId=? WHERE userId=?");
      $stmt->bind_param("ss", $onesignalId, $userId);
      $returnMessage = "updated";
    } else {
      $stmt = $conn->prepare("INSERT INTO userData (userId, onesignalId) VALUES (?, ?)");
      $stmt->bind_param("ss", $userId, $onesignalId);
      $returnMessage = "created";
    }
    
    $stmt->execute();
    $stmt->close();
    return $returnMessage;
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>