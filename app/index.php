<!DOCTYPE html>
<html>
<head>
    <?php
        include 'reused-code/header.php';
        include 'reused-code/scripts.php';
    ?>
    <!-- ex. var imported = require('your-module'); in Node.js, Pug or Handlebars,
         <%- include('header'); %> with EJS (https://www.reddit.com/r/node/comments/8xd4z1/what_is_the_node_equivalent_of_a_php_include/),
         or partials with ZURB Foundation; https://stackoverflow.com/questions/36098736/connect-php-with-phonegap -->
    <link rel="canonical" href="http://app.couponbooked.com">
</head>
<body>
    <?php 
        include 'reused-code/nav.php';
        include 'reused-code/login.php';
    ?>

    <main>
        <section id="why">
            <div id="title">
                <h2>Why us?</h2>
                <br />
                <p>
                    Coupon Booked is an excellent choice for any occasion, whether it be Mother's Day, Father's Day,
                    a birthday, or an anniversary. You should create a Book because it is a thoughtful
                    way to show someone how well you know them and how much you really care.
                </p>
            </div>
        </section>

        <section id="examples">
            <h2>Examples</h2>

            <div class="flex one four-300">
                <img src="https://via.placeholder.com/300" />
                <img src="https://via.placeholder.com/300" />
                <img src="https://via.placeholder.com/300" />
                <img src="https://via.placeholder.com/300" />
            </div>
        </section>

        <section id="create">
            <h2>Create Your Own</h2>
            <button>Start here!</button>
        </section>
    </main>
</body>
</html>
