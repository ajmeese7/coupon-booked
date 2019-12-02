<?php
  include('createConnection.php');

  // TODO: Do something to lock this file down to stop others from using it
  if (isset($_POST['name']) && isset($_POST['templateData'])) {
    $name = $_POST["name"];
    $stmt = $conn->prepare("SELECT templateData FROM templates WHERE name=?");
    $stmt->bind_param("s", $name);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($templateData);

    // In case template with that name already exists
    if ($stmt->num_rows > 0) {
      // Not replacing with error codes because this works better (can display warning)
      echo "name already exists";
    } else {
      $templateData = $_POST["templateData"];
      $stmt = $conn->prepare("INSERT INTO templates (name, templateData) VALUES (?, ?)");
      $stmt->bind_param("ss", $name, $templateData);
      $stmt->execute();
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
