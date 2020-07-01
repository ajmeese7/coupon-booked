var notificationOptions = { fadeout: 500, closeButton: false, removeAllOnDisplay: true, duration: 4000 };

$(function() {
    getTickets();
});

/**
 * This function actually fires off the request to pull back the submitted form
 * information from the server. Then it passes it along to processTickets() to 
 * parse over everything and add it to the page.
 */
function getTickets() {
    $.ajax({
        type: "GET",
        url: "https://couponbooked.com/scripts/getTickets",
        datatype: "json",
        success: function(tickets) {
            tickets = JSON.parse(tickets);
            processTickets(tickets);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.error("Error retrieving tickets:", XMLHttpRequest.responseText);
    
          SimpleNotification.error({
            title: 'Error retreiving tickets',
            text: 'Please try again later.'
          }, notificationOptions);
        }
    });
}

/**
 * Iterates over the list of tickets from the server and creates the HTML
 * to add them to the page.
 * @param {object} tickets - the parsed data returned from the server
 */
function processTickets(tickets) {
    // Go over the array of returned data
    $.each(tickets, function(index, ticketData) {
        var formData = JSON.parse(ticketData.formData);

        // Create node and give CSS class that applies styles
        var node = document.createElement('div');
        node.setAttribute("class", "ticketPreview");

        node.innerHTML += `<p class='ticketCount'>#${ticketData.number}</p>`;
        node.innerHTML += `<p class='ticketType'>${formData.topic}</p>`;
        node.innerHTML += `<p class='ticketStatus'>${ticketData.status}</p>`;
        node.innerHTML += `<p class='ticketHeader'>${formData.subject}</p>`;
        node.innerHTML += `<a href='mailto:${formData.email}' target='_blank' class='userEmail'>${formData.email}</p>`;
        node.innerHTML += `<p class='ticketTimestamp'>${ticketData.timestamp}</p>`;

        $(node).data("ticketData", ticketData);
        $(node).data("formData", formData);

        // TODO: Do opposite and put at start so it's most recent first
        document.getElementById("ticketContainer").appendChild(node);

        $(node).unbind().click(function() {
            // TODO: Open ticket more in depth here, including status change and 
            // option to flag it or set it as unread and stuff. How to respond?
            
            var data = $(node).data("ticketData");
            if (data.status == "unread") {
                updateStatus(data.number, "read", node);
            }
            
            this.classList.toggle("activeTicket");
        });
    });
}

/**
 * Sends the new status and the ticket number to the server
 * to update the status of the right ticket.
 * @param {string} number - the unique ticket number
 * @param {string} newStatus - pretty self-explanatory
 * @param {object} node - the entire element on the page, so the
 * status can be updated on the page to reflect the new status
 * just sent to the server without another request.
 * @returns {boolean} whether or not the update was successful
 */
function updateStatus(number, newStatus, node) {
    $.ajax({
        type: "POST",
        url: "https://couponbooked.com/scripts/updateTicketStatus",
        data: { number: number, status: newStatus },
        crossDomain: true,
        cache: false,
        success: function(success) {
            console.warn(`Successfully updated ticket status to ${newStatus}.`);
            $(node).find(".ticketStatus").text(newStatus);

            // Update the node data so the server doesn't look at the old
            // data and try to update it every time.
            var ticketData = $(node).data("ticketData");
            ticketData.status = newStatus;
            $(node).data("ticketData", ticketData);
    
            SimpleNotification.success({
                text: "Successfully updated ticket status"
            }, notificationOptions);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
            console.error("Error updating ticket status:", XMLHttpRequest.responseText);
        
            SimpleNotification.error({
                title: "Error updating ticket status!",
                text: "Please try again later."
            }, notificationOptions);
        }
    });
}