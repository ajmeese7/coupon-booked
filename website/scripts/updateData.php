<?php
  include('createConnection.php');

  $params = explode (",", $_GET['params']);
  $sql = "UPDATE `coupons` SET `count`=$params[1] WHERE `name`='". $params[0]. "'";
  $result = $conn->query($sql) or die($conn->error);

  /*echo $row["name"]. ",". $row["count"];
   while ($row = $result->fetch_assoc()) {
      $currentCoupon = array($row["name"]=>$row["count"]);
      array_merge($coupons, $currentCoupon);
   }*/
  $conn->close();
?>
