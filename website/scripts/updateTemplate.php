<?php
  include('createConnection.php');

  // TODO: Add isset checking for all POST variables across all files
  $name = $_POST["name"];
  $sql = "SELECT templateData from templates where name='$name'";
  $result = $conn->query($sql) or die($conn->error);

  if ($result->num_rows > 0) {
    // Template by that name exists
    $templateData = $_POST["templateData"];
    $sql = "UPDATE templates SET templateData='$templateData' WHERE name='$name'";
    $result = $conn->query($sql) or die($conn->error);
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("A template by that name does not exist.");
  }

  $conn->close();
?>
