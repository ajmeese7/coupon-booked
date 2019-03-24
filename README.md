# jessica-wants
Instead of a teddy bear or a gift card, my girlfriend wanted an unconventional
gift this Christmas. She wanted me to put my programming skills to use and
create something for her. This is what I came up with.

## Setup
I used my GoDaddy cPanel web server throughout this project, so if you have a
different host then your process may be different.

Obviously, the first step is to upload the files to a directory on your website.
First, you should probably replace the `.png` files with an applicable image. An
important thing to note is that `apple-touch-icon` does not support transparency,
so you must use an image without any or use an online converter to make your image
conform to Apple's standards.

An optional step, one which I chose to follow, is to password protect this
directory to prevent unauthorized users from redeeming coupons on your significant
other's behalf. This is what the `.htaccess` file is for.

For my backend, I chose to utilize PHP to retrieve data from an SQL table hosted
on phpMyAdmin. I created a database, added a table, and populated the initial
table by hand with the desired coupon names and counts. This is possible to do
dynamically, but in my case it was easier to do it manually because I only had
twelve coupons.

In the PHP files, you must replace the four variables at the top
with your information.
