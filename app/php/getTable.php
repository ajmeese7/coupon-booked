<?php
  // Way to avoid issues with requests in Cordova:
  // https://stackoverflow.com/questions/29665933/how-can-use-i-use-php-as-back-end-for-ionic-framework
  $servername = "couponbooked";
  $username = "gvxn4otz8mk6";
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
