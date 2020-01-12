<?php
  include('createConnection.php');

  // TODO: Determine if this page should have some for of validation, possibly a working userId
  $stmt = $conn->prepare("SELECT templateData FROM templates");
  $stmt->execute();
  $stmt->store_result();
  $stmt->bind_result($templateData);
  // IDEA: Should I add an `or die()` condition here like in 
    // https://stackoverflow.com/q/6631364/6456163 or skip it 
    // and hope the createConnection file handles it?

  $templateArray = array();
  if ($stmt->num_rows > 0) {
    while ($stmt->fetch()) {
      $templateArray[] = $templateData;
    }
  }

  echo json_encode($templateArray, JSON_UNESCAPED_SLASHES);

  $stmt->close();
?>
