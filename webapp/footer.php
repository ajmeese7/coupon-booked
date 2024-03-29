<script src="js/jquery.min.js"></script>
<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js"
    integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU="
    crossorigin="anonymous">
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jshashes/1.0.8/hashes.min.js"></script>
<script src="src/helperFunctions.js"></script>
<script src="src/sentBooks.js"></script>
<script src="src/receivedBooks.js"></script>
<script src="src/shareBook.js"></script>
<script src="src/App.js"></script>
<script src="src/index.js"></script>
<script src="js/materialize.js"></script>
<script src="js/simpleNotification.min.js"></script>
<script>
    /** For use in App.js and index.html when images don't load in properly */
    function imageError(image) {
        // TODO: Do something more helpful than logging element, such as making it
        // easier to track down which one has the problem, or just permenantly reset
        // the image in the JSON
        image.src = "https://couponbooked.com/webapp/images/ticket.png";
    }
</script>