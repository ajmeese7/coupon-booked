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

  $params = explode (",", $_GET['params']);
  $sql = "UPDATE `coupons` SET `count`=$params[1] WHERE `name`='". $params[0]. "'";
  $result = $conn->query($sql);

  /*echo $row["name"]. ",". $row["count"];
   while ($row = $result->fetch_assoc()) {
      $currentCoupon = array($row["name"]=>$row["count"]);
      array_merge($coupons, $currentCoupon);
   }*/
  $conn->close();
?>
