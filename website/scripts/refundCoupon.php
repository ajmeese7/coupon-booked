<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['userId']) && isset($_POST['couponName'])) {
    $bookId = $conn->real_escape_string($_POST["bookId"]);
    $userId = $conn->real_escape_string($_POST["userId"]);
    $couponName = $conn->real_escape_string($_POST["couponName"]);

    $sql = "SELECT receiver, bookData FROM couponBooks WHERE bookId='$bookId'";
    $result = $conn->query($sql) or die($conn->error);

    if ($result->num_rows > 0) {
      $row = $result->fetch_assoc();
      // Make sure user is supposed to have access to the coupon book
      if ($row["receiver"] == $userId) {
        $bookData = json_decode($row["bookData"]);

        // Array of JSON coupons
        $coupons = $bookData->coupons;
        foreach ($coupons as $coupon) {
          if ($coupon->name == $couponName) {
            $coupon->count++;
            $bookData->coupons = $coupons;
            $bookData = json_encode($bookData);

            $sql = "UPDATE couponBooks SET bookData='$bookData' WHERE bookId='$bookId'";
            $result = $conn->query($sql) or die($conn->error);
            break;
          }
        }
        unset($coupon);
      } else {
        // TODO: Report violations to me; test that it reports as error,
        // to help stem unauthorized abuse of the platform
        header('HTTP/1.1 403.3 Write Access Forbidden');
        exit("You are not authorized to refund coupons to this user. Your violation has been logged and reported.");
      }
    } else {
      header('HTTP/1.1 400 Bad Request');
      exit("A book by that ID does not exist.");
    }
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }

  $conn->close();
?>
