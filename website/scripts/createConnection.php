<?php
  include('env.php');

  try {
    // Create connection
    $conn = new mysqli($SERVER_NAME, $SERVER_USERNAME, $SERVER_PASSWORD, $DATABASE_NAME);
  } catch(Exception $e) {
    // https://websitebeaver.com/prepared-statements-in-php-mysqli-to-prevent-sql-injection
    error_log($e->getMessage());
    exit('Error connecting to database');
  }
?>