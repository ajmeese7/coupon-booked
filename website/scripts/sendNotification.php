<?php
  include('env.php');

  // Make sure necessary variables exist
  if (isset($_POST['title']) && isset($_POST['message']) && isset($_POST['image']) && isset($_POST['senderId'])) {
    $title = $_POST["title"];
    $message = $_POST["message"];
    $image = $_POST["image"];
    $senderId = $_POST["senderId"];

    $content = array(
      "en" => $message
    );

    // TODO: Sometimes they take a long time to come through; how to speed up?
    $fields = array(
      //'headings' => $title,
      //'big_picture' => $image, // TODO: Decide if I like this or not
      //'ttl' => 2419200,
      //'priority' => 10,
      'app_id' => $ONESIGNAL_APP_ID,
      'include_player_ids' => array($senderId),
      'data' => array("testing" => "user data"),
      'contents' => $content
      //'included_segments' => array('All'),
    );

    $fields = json_encode($fields);

    // https://stackoverflow.com/a/43641110/6456163
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
                                                "Authorization: Basic {$ONESIGNAL_API_KEY}"));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

    $response = curl_exec($ch);
    curl_close($ch);

    $return["allresponses"] = $response;
    $return = json_encode($return);

    return $return;
  } else {
    header('HTTP/1.1 400 Bad Request');
    exit("The necessary POST variables were not included.");
  }
?>