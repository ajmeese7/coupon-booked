<?php
  include('createConnection.php');

  $template = $_GET['template'];
  $sql = "SELECT templateData FROM templates WHERE name='$template'";
  $result = $conn->query($sql) or die($conn->error); // https://stackoverflow.com/a/35669638

  while ($row = $result->fetch_assoc()) {
    echo json_encode($row);
  }

  $conn->close();
?>
