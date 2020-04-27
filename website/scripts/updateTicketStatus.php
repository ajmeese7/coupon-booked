<?php
  include('createConnection.php');
  
  if (isset($_POST['number']) && isset($_POST['status'])) {
    $number = $_POST["number"];
    $status = $_POST["status"];

    // TODO: Determine if this page should have some for of validation, possibly a working userId
    $stmt = $conn->prepare("UPDATE formSubmissions SET status=? WHERE number=?");
    $stmt->bind_param("ss", $status, $number);
    $stmt->execute();

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
