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

    function editTicket(id, ticket) {
        return requester.update('appdata', `Tickets/${id}`, ticket);
    }

    function deleteTicket(ticketId) {
        return requester.remove('appdata', `Tickets/${ticketId}`);
    }

    return {
        createTicket,
        getTicketsForEvent,
        updateTicket,
        editTicket,
        deleteTicket
    }
})();