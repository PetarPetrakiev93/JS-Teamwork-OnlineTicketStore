const eventsController = {};

//CREATE EVENT
eventsController.createEventGET = function (ctx) {
    //TODO: view for create event page
    // ctx.loggedIn = userManager.isLoggedIn();
    // ctx.username = userManager.getUsername();
    // ctx.id = sessionStorage.getItem('userId');
    //
    // ctx.loadPartials({
    //     header: './templates/common/header.hbs',
    //     footer: './templates/common/footer.hbs',
    //     createEventForm: './templates/event/create/createEventForm.hbs'
    // }).then(function () {
    //     this.partial('./templates/event/create/createEventPage.hbs')
    // })
};

eventsController.createEventPOST = function (ctx) {
    //TODO: create event
    // let title = ctx.params.title;
    // let information = ctx.params.information;
    // let date = new Date();
    // let price = ctx.params.price;
    // let availableTickets = ctx.params.availableTickets;
    // let location = ctx.params.location;
    //let category = ctx.params.category;
    // let event = {
    //     title,
    //     information,
    //     date,
    //     price,
    //     availableTickets,
    //     location,
    //     category
    // };
    //
    // eventsManager.createEvent(event)
    //     .then(function (eventInfo) {
    //         ctx.redirect('#/events');
    //         messageBox.showInfo(`Event "${event.title}" created!`);
    //     }).catch(messageBox.handleError)
};

//SHOW EVENTS
eventsController.displayEvents = function (ctx) {
    eventsManager.getEvents()
        .then(function (events) {
            //TODO: append needed things and redirect
        }).catch(messageBox.handleError);
};

//SHOW EVENTS BY CATEGORY
eventsController.displayEventsByCategory = function (ctx) {
    //let category = ctx.params...;
    eventsManager.getEventsByCategory(category)
        .then(function (events) {
            //TODO: append needed things and redirect
        }).catch(messageBox.handleError);
};

//EDIT EVENT
eventsController.editEventGET = function (ctx) {
    //TODO: view for editing event
};

eventsController.editEventPOST = function (ctx) {
    //TODO: edit event
};

//VIEW EVENT DETAILS
eventsController.eventDetailsGET = function (ctx) {
    let eventId = ctx.params.id.substring(1);

    //TODO: show detailed view for event
};

//DELETE EVENT
eventsController.deleteEvent = function (ctx) {
    eventsController.advertisementId = ctx.params.id.substring(1);
    eventsManager.deleteEvent(eventsController.advertisementId)
        .then(function () {
            ctx.redirect('#/events');
        }).catch(messageBox.handleError);

    messageBox.showInfo('Event deleted!');

};
