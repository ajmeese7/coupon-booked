<?php
  include('createConnection.php');

  /*$sql = "SELECT * FROM coupons";
  $result = $conn->query($sql) or die($conn->error);

  while ($row = $result->fetch_assoc()) {
    $currentCoupon->name = $row["name"];
    $currentCoupon->count = $row["count"];

    echo json_encode($currentCoupon);
  }*/

  $conn->close();
?>
