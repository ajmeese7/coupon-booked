<?php
  // NOTE: Obviously, these have been removed for security reasons
  $servername = "";
  $username = "";
  $password = "";
  $dbname = "";

  // Create connection
  $conn = new mysqli($servername, $username, $password, $dbname);
  // Check connection
  if ($conn->connect_error) {
    // https://websitebeaver.com/prepared-statements-in-php-mysqli-to-prevent-sql-injection
    exit('Error connecting to database');
  }
?>