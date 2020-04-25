<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['formData'])) {
    $userId = $_POST["userId"];
    $formData = $_POST["formData"];

    // IDEA: Limit to 5 tickets max per user; can use same logic as createBook retrieval
    $stmt = $conn->prepare("INSERT INTO formSubmissions (userId, formData, status) 
        VALUES (?, ?, 'unread')");
    $stmt->bind_param("ss", $userId, $formData);
    $stmt->execute();
    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
