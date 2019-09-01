<?php
  include('createConnection.php');

  // TODO: Do something to lock this file down to stop others from using it
  if (isset($_POST['name']) && isset($_POST['templateData'])) {
    $name = $conn->real_escape_string($_POST["name"]);
    $sql = "SELECT templateData FROM templates WHERE name='$name'";
    $result = $conn->query($sql) or die($conn->error);

    // In case template with that name already exists
    if ($result->num_rows > 0) {
      // Not replacing with error codes because this works better (can display warning)
      echo "name already exists";
    } else {
      $templateData = $conn->real_escape_string($_POST["templateData"]);
      $sql = "INSERT INTO templates (name, templateData) VALUES ('$name', '$templateData')";
      $result = $conn->query($sql) or die($conn->error);
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
