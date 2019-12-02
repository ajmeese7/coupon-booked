<?php
  include('createConnection.php');
  include('env.php');

  // Make sure necessary variables exist
  if (isset($_POST['name']) && isset($_POST['templateData']) && isset($_POST['userId'])) {
    $userId = $_POST['userId'];
    if ($userId == $MASTER_USER_ID) {
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
      // TODO: Add some form of logging here; to another SQL table?
      header("HTTP/1.1 401 Unauthorized");
      exit("You are not allowed to update templates. Your attempt has been logged.");
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
