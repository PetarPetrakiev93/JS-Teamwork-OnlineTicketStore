const eventsManager = (() => {

    function getEvents() {
        return requester.get('appdata', 'Events');
    }

    function getEventDetails(id) {
        return requester.get('appdata', `Events/${id}`)
    }

    function editEvent(id, event) {
        return requester.update('appdata', `Events/${id}`, event);
    }

    function createEvent(event) {
        return requester.post('appdata', 'Events', event)
    }

    function deleteEvent(eventId) {
        return requester.remove('appdata', `events/${eventId}`);
    }

    function getEventsByCategory(category) {
        let url = `events?query={"CategoryId":"${category}"}`;

        return requester.get('Events', url);
    }

    return {
        getEvents,
        getEventDetails,
        editEvent,
        createEvent,
        deleteEvent,
        getEventsByCategory
    }

})();