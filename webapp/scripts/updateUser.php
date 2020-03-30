<?php
  include('createConnection.php');

  if (isset($_POST['userId']) && isset($_POST['displayName']) && isset($_POST['darkMode'])) {
    $userId = $_POST["userId"];
    $displayName = $_POST["displayName"];
    $darkMode = $_POST["darkMode"];

    // NOTE: If I end up adding more fields in createUser this should probably be updated too
    $stmt = $conn->prepare("UPDATE userData SET displayName=?, darkMode=? WHERE userId=?");
    $stmt->bind_param("sss", $displayName, $darkMode, $userId);
    $stmt->execute();
    $stmt->close();

    // TODO: Do I need to return anything here or am I good?
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>