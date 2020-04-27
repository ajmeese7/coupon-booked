<?php
  include('createConnection.php');

  // TODO: Determine if this page should have some for of validation, possibly a working userId
  $stmt = $conn->prepare("SELECT * FROM formSubmissions");
  $stmt->execute();
  $stmt->store_result();
  $stmt->bind_result($number, $userId, $formData, $status, $timestamp);

  // TODO: Paginate with 10 or so and next buttons, then eventually add filtering to only
  // show open or unread tickets and the like. IDEA: Add flagged as a status
  $ticketArray = array();
  if ($stmt->num_rows > 0) {
    while ($stmt->fetch()) {
      // https://stackoverflow.com/questions/20364349/pagination-using-mysql-limit-offset
      $ticket = new \stdClass();
      $ticket->number = $number;
      $ticket->userId = $userId;
      $ticket->formData = $formData;
      $ticket->status = $status;
      $ticket->timestamp = $timestamp;
      $ticketArray[] = $ticket;
    }
  }

  echo json_encode($ticketArray, JSON_UNESCAPED_SLASHES);

  $stmt->close();
?>
