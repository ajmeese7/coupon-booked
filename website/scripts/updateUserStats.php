<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['stats'])) {
    $userId = $_POST["userId"];
    $stats = $_POST["stats"];

    $stmt = $conn->prepare("UPDATE userData SET stats=? WHERE userId=?");
    $stmt->bind_param("ss", $stats, $userId);
    
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>