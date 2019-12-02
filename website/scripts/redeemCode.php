<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['userId']) && isset($_POST['receiverName']) && isset($_POST['shareCode'])) {
    // NOTE: Probably don't need to escape variables now that they're being
    // sanatized before queries, but better safe than sorry.
    // NOTE 2: Fuck the above statement. I'll add that back if I need to.
    $userId = $_POST["userId"];
    $receiverName = $_POST["receiverName"];
    $shareCode = $_POST["shareCode"];

    $stmt = $conn->prepare("SELECT sender, bookData FROM couponBooks WHERE shareCode=?");
    $stmt->bind_param("s", $shareCode);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($sender, $bookData);

    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
          $sender = $row["sender"];
          if ($sender == $userId) {
            echo "Sent to self";
          } else {
            $bookData = json_decode($bookData);
            $bookData->shareCode = null;
            $bookData = json_encode($bookData);

            $stmt = $conn->prepare("UPDATE couponBooks SET receiver=?, receiverName=?,
              bookData=?, shareCode=null WHERE shareCode=?");
            $stmt->bind_param("ssss", $userId, $receiverName, $bookData, $shareCode);
            $stmt->execute();
          }
      }
    } else {
      // Share code doesn't exist; should this be an error code?
      echo "Not valid";
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
