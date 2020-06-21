<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['onesignalId']) && isset($_POST['iOS'])) {
    $userId = $_POST["userId"];
    $onesignalId = $_POST["onesignalId"];
    $iOS = $_POST["iOS"] == "true" ? 1 : 0;

    // Will let the client know whether the user's OneSignal ID was updated
    // or inserted; mostly for debugging purposes.
    $returnMessage;
    $stmt = $conn->prepare("SELECT onesignalId FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();

    // Updates user info if it already exists and creates new info if it doesn't
    if ($stmt->num_rows > 0) {
      $stmt = $conn->prepare("UPDATE userData SET onesignalId=?, iOS=? WHERE userId=?");
      $stmt->bind_param("sis", $onesignalId, $iOS, $userId);
      $returnMessage = "updated";
    } else {
      $stmt = $conn->prepare("INSERT INTO userData (userId, onesignalId, iOS) VALUES (?, ?, ?)");
      $stmt->bind_param("ssi", $userId, $onesignalId, $iOS);
      $returnMessage = "created";
    }
    
    $stmt->execute();
    $stmt->close();
    echo $returnMessage;
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>