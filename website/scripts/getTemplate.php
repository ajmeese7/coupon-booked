<?php
  include('createConnection.php');

  if (isset($_GET['template'])) {
    $template = $_GET['template'];
    $stmt = $conn->prepare("SELECT templateData FROM templates WHERE name=?");
    $stmt->bind_param("s", $template);
    $stmt->execute();
    // IDEA: Should I add an `or die()` condition here like in 
    // https://stackoverflow.com/q/6631364/6456163 or skip it 
    // and hope the createConnection file handles it?

    $stmt->store_result();
    $stmt->bind_result($templateData);
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // For some reason encoding and echoing the data adds slashes.
        print_r($templateData);
      }
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary GET variables were not included.");
  }
?>
