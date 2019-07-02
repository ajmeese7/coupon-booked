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

// This is a general function that removes one class and adds another
function toggleClass(target, addedClass) {
    // If target is an element rather than a list, it is converted to array form
    if (!NodeList.prototype.isPrototypeOf(target)) {
        target = [target];
    }

    // Allows for multiple elements to be toggled, such as by using the querySelectorAll() method
    [].forEach.call(target, (element) => {
        if (element.classList.contains(addedClass)) {
            element.classList.remove(addedClass);
        } else {
            element.classList.add(addedClass);
        }
    });
};