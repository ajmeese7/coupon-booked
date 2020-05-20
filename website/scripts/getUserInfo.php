<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_GET['userId'])) {
    $userId = $_GET['userId'];

    $stmt = $conn->prepare("SELECT displayName, stats FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($displayName, $stats);

    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Using an object so it's easy to add more properties in the future
        $userData = new \stdClass();
        $userData->displayName = $displayName;
        $userData->stats = $stats;
        echo json_encode($userData, JSON_UNESCAPED_SLASHES);
      }
    }
    
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>