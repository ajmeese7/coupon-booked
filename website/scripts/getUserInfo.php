<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_GET['userId']) && isset($_GET['iOS'])) {
    $userId = $_GET['userId'];
    $iOS = $_GET['iOS'] == "true" ? 1 : 0;
    if (is_null($userId)) {
      header('HTTP/1.1 400 Bad Request');
      exit("A null userId cannot be used to retrieve data.");
    }

    // This is not the proper file to do this in, but iOS has been misbehaving and this
    // is the only file I can rely on to be called
    $stmt = $conn->prepare("UPDATE userData SET iOS=? WHERE userId=?");
    $stmt->bind_param("is", $iOS, $userId);
    $stmt->execute();

    $stmt = $conn->prepare("SELECT phone_num, displayName, stats FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($phone_num, $displayName, $stats);

    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        if (!is_null($stats)) {
          // Using an object so it's easy to add more properties in the future
          $userData = new \stdClass();
          $userData->phoneNumber = $phone_num;
          $userData->displayName = $displayName;
          $userData->stats = $stats;
          echo json_encode($userData, JSON_UNESCAPED_SLASHES);
        }
      }
    }
    
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>