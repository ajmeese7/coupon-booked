<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['name']) && isset($_POST['templateData'])) {
    $name = $_POST["name"];
    $stmt = $conn->prepare("SELECT templateData FROM templates WHERE name=?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($templateData);

    if ($stmt->num_rows > 0) {
      // Template by that name exists
      $templateData = $_POST["templateData"];
      $stmt = $conn->prepare("UPDATE templates SET templateData=? WHERE name=?");
      $stmt->bind_param("ss", $templateData, $name);
      $stmt->execute();
    } else {
      header('HTTP/1.1 400 Bad Request');
      exit("A template by that name does not exist.");
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
