<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['name']) && isset($_POST['templateData'])) {
    $name = $_POST["name"];
    $sql = "SELECT templateData FROM templates WHERE name='$name'";
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
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
