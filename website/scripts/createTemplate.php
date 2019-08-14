<?php
  include('createConnection.php');

  $name = $_POST["name"];
  $sql = "SELECT templateData from templates where name='$name'";
  $result = $conn->query($sql) or die($conn->error);

  // In case template with that name already exists
  if ($result->num_rows > 0) {
    // Not replacing with error codes because this works better (can display warning)
    echo "name already exists";
  } else {
    $templateData = $_POST["templateData"];
    $sql = "INSERT INTO templates (name, templateData) VALUES ('$name', '$templateData')";
    $result = $conn->query($sql) or die($conn->error);
  }

  $conn->close();
?>
