<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['displayName'])) {
    $userId = $_POST["userId"];
    $displayName = $_POST["displayName"];
    $darkMode = 0; // Will potentially be a parameter later

    // https://stackoverflow.com/a/4254003/6456163
    $stmt = $conn->prepare("SELECT 1 FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();

    // Updating user if their data row already exists
    if ($stmt->num_rows > 0) {
      // NOTE: If I end up adding more fields in createUser this should be updated too
      $stmt = $conn->prepare("UPDATE userData SET displayName=?, darkMode=? WHERE userId=?");
      $stmt->bind_param("sis", $displayName, $darkMode, $userId);
    } else {
      // If user data doesn't exist yet, it's created from the current data
      $stmt = $conn->prepare("INSERT INTO userData (userId, displayName, darkMode) VALUES (?, ?, ?)");
      $stmt->bind_param("ssi", $userId, $displayName, $darkMode);
    }
    
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>