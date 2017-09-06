const ticketsManager = (() => {
    function createTicket(ticket) {
        return requester.post('appdata', 'Tickets', ticket)

    }

    function getTicketsForEvent(id) {
        return requester.get('appdata', 'Tickets/?query={"EventId":"'+ id + '"}');
    }

    function updateTicket(id, ticket) {
        return requester.update('appdate', 'Tickets/:' + id, ticket);
    }

    return {
        createTicket,
        getTicketsForEvent,
        updateTicket
    }
})();