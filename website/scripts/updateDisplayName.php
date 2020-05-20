<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['displayName'])) {
    $userId = $_POST["userId"];
    $displayName = $_POST["displayName"];

    $stmt = $conn->prepare("UPDATE userData SET displayName=? WHERE userId=?");
    $stmt->bind_param("ss", $displayName, $userId);
    
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>