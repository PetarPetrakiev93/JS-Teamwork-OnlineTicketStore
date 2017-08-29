const eventsManager = (() => {

    function getEvents() {
        return requester.get('appdata', 'events');
    }

    function getEventDetails(id) {
        return requester.get('appdata', `events/${id}`)
    }

    function editEvent(id, event) {
        return requester.update('appdata', `events/${id}`, event);
    }

    function createEvent(event) {
        return requester.post('appdata', 'events', event)
    }

    function deleteEvent(eventId) {
        return requester.remove('appdata', `events/${eventId}`);
    }

    function getEventsByCategory(category) {
        let url = `events?query={"category":"${category}"}`;

        return requester.get('appdata', url);
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