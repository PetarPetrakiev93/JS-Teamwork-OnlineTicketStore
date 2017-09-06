const eventsController = {};

//CREATE EVENT
eventsController.createEventGET = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    categoriesManager.getAllCategories()
        .then(function (categories) {
            ctx.categories = categories;
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                createEventForm: './templates/event/create/createEventForm.hbs'
            }).then(function () {
                this.partial('./templates/event/create/createEventPage.hbs')
            })
        })
        .catch(messageBox.handleError);

};

eventsController.createEventPOST = function (ctx) {
    //TODO: validations
    let name = ctx.params.eventName;
    let details = ctx.params.eventDetails;
    let dateString = ctx.params.eventDate;
    let dateRegex = /(\d+)[\\\/.\-,](\d+)[\\\/.\-,](\d+)/;
    let match = dateRegex.exec(dateString.toString());
    if (name.length === 0) {
        messageBox.showError('The event must have a title.');
        return;
    }

    if (match === null) {
        messageBox.showError('Invalid date format. Try dd/MM/yyy');
        return;
    }

    let date = new Date(Number(match[3]), Number(match[2] - 1), Number(match[1]));

    let location = ctx.params.eventLocation;
    let coverPicture = ctx.params.eventCoverPicture;
    let totalTickets = ctx.params.eventTotalTickets;
    let ticketPrice = ctx.params.eventTicketPrice;
    let categoryId = $('select option:selected').attr('data-catId');

    console.log(date);
    let event = {
        EventName: name,
        Details: details,
        CDate: date,
        Location: location,
        CategoryId: categoryId
    };

    eventsManager.createEvent(event)
        .then(function (eventInfo) {
            let id = eventInfo._id;
            let picture = {
                EventId: id,
                Picture: coverPicture
            };
            let ticket = {
                EventId: id,
                TotalTickets: totalTickets,
                AvailableTickets: totalTickets,
                Price: ticketPrice,
                SoldTickets: 0
            };

            picturesManager.createPicture(picture)
                .then(function (pic) {
                    ticketsManager.createTicket(ticket)
                        .then(function (tick) {
                            ctx.redirect('#/events');
                            messageBox.showInfo(`Event "${name}" created!`);
                        })
                });

        }).catch(messageBox.handleError)
};

//SHOW EVENTS
eventsController.displayEvents = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');

    picturesManager.getAllPictures()
        .then(function (pictures) {
            eventsManager.getEvents()
                .then(function (events) {
                    ctx.events = events.sort((a, b) => compareEventDate(a, b));
                    let eventId;
                    for (let event of events) {
                        eventId = event._id;
                        let eventPictures = pictures.filter(a => a.EventId === eventId);
                        pictures = pictures.filter(a => a.EventId !== eventId);
                        event.CDate = event.CDate.substring(0, 10);
                        if (eventPictures[0]) {
                            event.Picture = eventPictures[0].Picture;
                        } else {
                            event.Picture = '';
                        }
                    }
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        eventBox: './templates/catalog/eventBox.hbs'
                    }).then(function () {
                        this.partial('./templates/catalog/eventsPage.hbs').then(function () {
                            $('.clickable').click(function () {
                                let id = $(this).attr('id');
                                ctx.redirect(`#/events/:${id}`);
                            })
                        })

                    })
                })
        }).catch(messageBox.handleError);

    function compareEventDate(a, b) {
        let eventAdate = new Date(a.CDate).getTime();
        let eventBdate = new Date(b.CDate).getTime();
        let now = Date.now();

        let aTimelapse = eventAdate - now;
        let bTimelapse = eventBdate - now;
        return aTimelapse - bTimelapse;
    }
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
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');

    picturesManager.getAllPicturesByEventId(eventId)
        .then(function (picture) {
            eventsManager.getEventDetails(eventId)
                .then(function (event) {
                    ctx.CDate = event.CDate.substring(0, 10);
                    ctx.Location = event.Location;
                    ctx.Details = event.Details;
                    ctx.EventName = event.EventName;
                    if (picture[0]) {
                        ctx.Picture = picture[0].Picture;
                    } else {
                        ctx.Picture = '';
                    }
                    ticketsManager.getTicketsForEvent(eventId)
                        .then(function (tickets) {
                            ctx._id = tickets[0]._id;
                            ctx.availableTickets = tickets[0].AvailableTickets;
                            ctx.totalTickets = tickets[0].TotalTickets;
                            ctx.soldTickets = tickets[0].SoldTickets;
                            ctx.price = tickets[0].Price;
                            ctx.EventId = tickets[0].EventId;
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                tickets: './templates/tickets/tickets.hbs'
                            }).then(function () {
                                this.partial('./templates/details/detailsView.hbs');
                            });
                        });

                });
        })
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

//ORDER TICKETS
eventsController.orderTickets = function (ctx) {
    if(Number(ctx.params.buyTickets) <= 0 || Number(ctx.params.buyTickets) > ctx.params.availableTickets){
        messageBox.showError('Tickets not available!');
        ctx.redirect('#/events/:'+ctx.params.EventId);
    }else {
        let order = {};
        order.id = ctx.params.id.substr(1);
        order.price = ctx.params.price;
        order.eventId = ctx.params.EventId;
        order.eventName = ctx.params.EventName;
        order.numberTickets = ctx.params.buyTickets;
        requester.get('user', sessionStorage.getItem('userId'))
            .then(function (user) {
                if (user.basket === undefined) {
                    user.basket = [];
                    user.basket.push(order);
                } else {
                    let idExists = false;
                    for (let o of user.basket) {
                        if (o.id === order.id) {
                            o.numberTickets = Number(o.numberTickets) + Number(order.numberTickets);
                            idExists = true;
                        }
                    }
                    if (idExists === false) {
                        user.basket.push(order);
                    }
                }

                requester.update('user', sessionStorage.getItem('userId'), user)
                    .then(function () {
                        messageBox.showInfo('Order added to basket');
                    }).catch(messageBox.showError);
            })
    }
};
