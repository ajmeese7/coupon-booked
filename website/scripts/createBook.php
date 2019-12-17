<?php
  include('createConnection.php');

  if (isset($_POST['bookId']) && isset($_POST['sender']) && 
  isset($_POST['senderName']) && isset($_POST['bookData'])) {
    // real_escape_string was causing problems by adding backslashes in
    // $bookData when that is already taken care of by the prepare statement,
    // so I went ahead and removed it from everything to hopefully avoid any
    // potential similar problems down the road.
    $bookId = $_POST["bookId"];
    $sender = $_POST["sender"];
    $senderName = $_POST["senderName"];
    $bookData = $_POST["bookData"];

    $stmt = $conn->prepare("SELECT timeCreated FROM couponBooks WHERE bookId=?");
    $stmt->bind_param("s", $bookId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($timeCreated);

    if ($stmt->num_rows > 0) {
      // bookId already in use; generates new one in Node.
      echo "bookId in use";
    } else {
      // NOTE: For some reason this returns a warning to Node that the number
      // of bind variables does not match the number of fields in the prepared 
      // statement, which isn't true. Guessing it can be safely ignored.
      $stmt = $conn->prepare("INSERT INTO couponBooks (bookId, sender, senderName, bookData) 
        VALUES (?, ?, ?, ?)");
      $stmt->bind_param("ssss", $bookId, $sender, $senderName, $bookData);
      $stmt->execute();
    }

    $stmt->close();
  } else {
    // www.rachaelarnold.com/dev/archive/trigger-ajax-error-event
    // When should I throw a 500 error? When UUID already used? Or silently fail and retry?
    header('HTTP/1.1 400 Bad Request');
    exit("Missing POST variable.");
  }
?>
