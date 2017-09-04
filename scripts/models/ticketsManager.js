const ticketsManager = (() => {
    function createTicket(ticket) {
        return requester.post('appdata', 'Tickets', ticket)

    }

    return {
        createTicket
    }
})();