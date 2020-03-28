<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId'])) {
    $userId = $_POST["userId"];

    $stmt = $conn->prepare("SELECT displayName FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($displayName);

    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        return _____;
      }
    } else {
      return _____;
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
