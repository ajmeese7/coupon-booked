<?php
  include('createConnection.php');

  // Make sure necessary variables exist
  if (isset($_POST['bookId']) && isset($_POST['userId']) && isset($_POST['couponName'])) {
    $bookId = $_POST["bookId"];
    $userId = $_POST["userId"];
    $couponName = $_POST["couponName"];

    $stmt = $conn->prepare("SELECT sender, receiver, bookData FROM couponBooks WHERE bookId=?");
    $stmt->bind_param("s", $bookId);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($sender, $receiver, $bookData);
    
    if ($stmt->num_rows > 0) {
      while ($stmt->fetch()) {
        // Make sure user is supposed to have access to redeeming coupons
        if ($receiver == $userId) {
          $bookData = json_decode($bookData);

          // Array of JSON coupons
          $coupons = $bookData->coupons;
          foreach ($coupons as $coupon) {
            if ($coupon->name == $couponName) {
                // Server-side verification to prevent local variable spoofing
                if ($coupon->count > 0) {
                  $coupon->count--;
                  $bookData->coupons = $coupons;
                  $bookData = json_encode($bookData);

                  // Get the OneSignal ID for the specified sender
                  $stmt = $conn->prepare("SELECT onesignalId FROM userData WHERE userId=?");
                  $stmt->bind_param("s", $sender);
                  $stmt->execute();
                  $stmt->store_result();
                  $stmt->bind_result($onesignalId);

                  // Make sure the OneSignal ID is retrieved; probably a shorter way out there
                  if ($stmt->num_rows > 0) {
                    while ($stmt->fetch()) {
                        // Sends back OneSignal ID and Auth0 ID for notification purposes in Node
                        $userInfo = new \stdClass();
                        $userInfo->onesignalId = $onesignalId;
                        $userInfo->sender = $sender;
                        echo json_encode($userInfo, JSON_UNESCAPED_SLASHES);

                        $stmt = $conn->prepare("UPDATE couponBooks SET bookData=? WHERE bookId=?");
                        $stmt->bind_param("ss", $bookData, $bookId);
                        $stmt->execute();
                    }
                  }
                } else {
                  // Return that they are out of that coupon, on top of the local check
                  echo "None left";
                }
                break;
            }
          }
          unset($coupon);
        } else {
          // TODO: Report violations to me; test that it reports as error,
          // to help stem unauthorized abuse of the platform
          header('HTTP/1.1 403.3 Write Access Forbidden');
          exit("You are not authorized to redeem coupons for this user. Your violation has been logged and reported.");
        }
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
