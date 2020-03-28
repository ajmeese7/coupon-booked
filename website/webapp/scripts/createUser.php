<?php
  include('createConnection.php');

  if (isset($_POST['userId']) && isset($_POST['displayName'])) {
    $userId = $_POST["userId"];
    $displayName = $_POST["displayName"];

    // TODO: Figure out if I need any other fields for users
    $stmt = $conn->prepare("INSERT INTO userData (userId, displayName, darkMode) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $userId, $displayName, 0);
    $stmt->execute();
    $stmt->close();

    // TODO: Do I need to return anything here or am I good?
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>