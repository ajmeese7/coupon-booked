<?php
$servername = "website-IP-HERE";
$username = "your-username";
$password = "your-password";
$dbname = "database-name";

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
     die("Connection failed: " . $conn->connect_error);
  }

  $sql = "SELECT * FROM coupons";
  $result = $conn->query($sql);

  while ($row = $result->fetch_assoc()) {
    $currentCoupon->name = $row["name"];
    $currentCoupon->count = $row["count"];

    echo json_encode($currentCoupon);
  }

  $conn->close();
?>
