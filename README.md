# coupon-booked
Instead of a teddy bear or a gift card, my girlfriend wanted an unconventional
gift this Christmas. She wanted me to put my programming skills to use and
create something for her. After making her an app, it was suggested that I 
commercialize the idea, which I did.

## Setup
I used my GoDaddy cPanel web server throughout this project, so if you have a
different host then your process may be different.

Obviously, the first step is to upload the files to a directory on your website.
First, you should probably replace the `.png` files with an applicable image. An
important thing to note is that `apple-touch-icon` does not support transparency,
so you must use an image without any or use an online converter to make your image
conform to Apple's standards.

For my backend, I chose to utilize PHP to retrieve data from an SQL table hosted
on phpMyAdmin. I created a database, added a table, and populated the initial
table by hand with the desired coupon names and counts. This is possible to do
dynamically, but in my case it was easier to do it manually because I only had
twelve coupons.

## Information
Between the table rows and the JSON data stored under either bookData or 
templateData, several bits of data are shared. This is because it is fastest
to search in SQL through clear pieces of data, such as the UUIDs, but easiest
in JavaScript to get that information directly from an object created from
the JSON.

The SQL server is two hours behind my timezone, putting it in Pacific Daylight
Time. This may be important for running analytics or finding the proper last 
modified time.

The app is reduced to approximately 10mb once deployed to Android, so don't make
the mistake I made and think you need to minify the massive node_modules folder.

I'm probably going to switch to Azure SQL eventually, as I'm sure it is faster and 
can't be more expensive than GoDaddy, but for now I'm going to stick with what is 
working because Azure is a BIG pain in the ass for me to work with as it has a rather
steep learning curve from my experience. It has been down more than it has been up
lately, which is pretty damn useless for a service that guarantees 99.99% uptime.

## TODO
- Try to add an animated book splashscreen
