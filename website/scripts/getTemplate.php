<?php
  include('createConnection.php');

  if (isset($_GET['template'])) {
    $template = $_GET['template'];
    $sql = "SELECT templateData FROM templates WHERE name='$template'";
    $result = $conn->query($sql) or die($conn->error); // https://stackoverflow.com/a/35669638
  
    while ($row = $result->fetch_assoc()) {
      echo json_encode($row);
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary GET variables were not included.");
  }

  $conn->close();
?>
