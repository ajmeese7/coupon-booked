<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['userId']) && isset($_POST['couponName'])) {
    $bookId = $_POST["bookId"]
    $userId = $_POST["userId"];
    $couponName = $_POST["couponName"];

    // TODO: Test this on other phone to make sure refunds still work.

    $stmt = $conn->prepare("SELECT receiver, bookData FROM couponBooks WHERE bookId=?");
    $stmt->bind_param("s", $bookId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($receiver, $bookData);

    if ($stmt->num_rows > 0) {
      // Make sure user is supposed to have access to the coupon book
      if ($receiver == $userId) {
        $bookData = json_decode($bookData);

        // Array of JSON coupons
        $coupons = $bookData->coupons;
        foreach ($coupons as $coupon) {
          if ($coupon->name == $couponName) {
            $coupon->count++;
            $bookData->coupons = $coupons;
            $bookData = json_encode($bookData);

            $stmt = $conn->prepare("UPDATE couponBooks SET bookData=? WHERE bookId=?");
            $stmt->bind_param("ss", $bookData, $bookId);
            $stmt->execute();
            break;
          }
        }
        unset($coupon);
      } else {
        // TODO: Report violations to me; test that it reports as error,
        // to help stem unauthorized abuse of the platform.
        // NOTE: Changes here should be reflected in redeemCoupon.php and 
        // vice versa, as they are essentially the same file.
        header('HTTP/1.1 403.3 Write Access Forbidden');
        exit("You are not authorized to refund coupons to this user. Your violation has been logged and reported.");
      }
    } else {
      header('HTTP/1.1 400 Bad Request');
      exit("A book by that ID does not exist.");
    }

    $stmt->close();
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>
