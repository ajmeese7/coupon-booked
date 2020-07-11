<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['countryCode']) && isset($_POST['phone_num'])) {
    $userId = $_POST["userId"];
    $countryCode = $_POST["countryCode"];
    $phone_num = $_POST["phone_num"];

    // Will let the client know whether the user's phone number was updated
    // or inserted; mostly for debugging purposes.
    $returnMessage;
    $stmt = $conn->prepare("SELECT phone_num FROM userData WHERE userId=?");
    $stmt->bind_param("s", $userId);
    $stmt->execute();
    $stmt->store_result();

    // Updates user info if it already exists and creates new info if it doesn't
    if ($stmt->num_rows > 0) {
      $stmt = $conn->prepare("UPDATE userData SET countryCode=?, phone_num=? WHERE userId=?");
      $stmt->bind_param("sss", $countryCode, $phone_num, $userId);
      $returnMessage = "updated";
    } else {
      // This should NEVER be called, but better safe than dead
      $stmt = $conn->prepare("INSERT INTO userData (userId, countryCode, phone_num) VALUES (?, ?, ?)");
      $stmt->bind_param("sss", $userId, $countryCode, $phone_num);
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