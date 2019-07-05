var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // TODO: Experiment with what this could change, i.e. when profile pic is gotten if user is authed (cache image?)
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        // NOTE: Could transition from splashscreen with CSS book here to normal app
        var parentElement = document.getElementById(id);
        parentElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};