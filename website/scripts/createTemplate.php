<?php
  include('createConnection.php');
  include('env.php');

  if (isset($_POST['name']) && isset($_POST['templateData']) && isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    if ($userId == $MASTER_USER_ID) {
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
      // TODO: Add some form of logging here; to another SQL table?
      header("HTTP/1.1 401 Unauthorized");
      exit("You are not allowed to create templates. Your attempt has been logged.");
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
