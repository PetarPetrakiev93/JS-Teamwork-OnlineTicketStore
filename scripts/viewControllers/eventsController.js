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
                    .then(function () {
                        let morePhotosLabel = $('#morePhotos');
                       let morePhotosDiv = $('#morePhotosDiv');
                       morePhotosLabel.click(function () {
                           let input = $('<input class="form-control" placeholder="Enter picture url..."/>');
                           input.appendTo(morePhotosDiv);
                       });
                    });
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
    let morePhotos = $('#morePhotosDiv input');


    let pictures = [];

    let event = {
        EventName: name,
        Details: details,
        CDate: date,
        Location: location,
        CategoryId: categoryId
    };
    if(morePhotos.length > 0){
        for (let photo of morePhotos) {
            if(photo.value){
                pictures.push(photo.value);
            }
        }
    }

    console.log(pictures);

    eventsManager.createEvent(event)
        .then(function (eventInfo) {
            let id = eventInfo._id;

            let coverPic = {
                EventId: id,
                CoverPicture: coverPicture,
                Pictures: pictures
            };
            let ticket = {
                EventId: id,
                TotalTickets: totalTickets,
                AvailableTickets: totalTickets,
                Price: ticketPrice,
                SoldTickets: 0
            };

            picturesManager.createPicture(coverPic)
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
                            event.CoverPicture = eventPictures[0].CoverPicture;
                        } else {
                            event.CoverPicture = '';
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
    eventsManager.getEventDetails(eventsController.eventId)
        .then(function (event) {
            picturesManager.getAllPicturesByEventId(event._id)
                .then(function (pictures) {
                    ctx.id = sessionStorage.getItem('userId');
                    ctx.loggedIn = userManager.isLoggedIn();
                    ctx.username = userManager.getUsername();
                    ctx.EventName = event.EventName;
                    ctx.Location = event.Location;
                    ctx.Details = event.Details;
                    ctx.Picture = pictures[0].Picture;
                    eventsController.eventCoverPictureId = pictures[0]._id;
                    ctx.CDate = event.CDate.substring(0, 10);

                    ticketsManager.getTicketsForEvent(event._id)
                        .then(function (ticket) {
                            ctx.AvailableTickets = ticket[0].AvailableTickets;
                            console.log(ctx.AvailableTickets);
                            ctx.TicketPrice = ticket[0].Price;
                            eventsController.eventTicketId = ticket[0]._id;
                            categoriesManager.getAllCategories()
                                .then(function (categories) {
                                    ctx.categories = categories;
                                    ctx.loadPartials({
                                        header: './templates/common/header.hbs',
                                        footer: './templates/common/footer.hbs',
                                        editEventForm: './templates/event/edit/editEventForm.hbs'
                                    }).then(function () {
                                        this.partial('./templates/event/edit/editEventPage.hbs');
                                    })
                                });

                        })
                });
        })
};

eventsController.editEventPOST = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
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

    let event = {
        EventName: name,
        Details: details,
        CDate: date,
        Location: location,
        CategoryId: categoryId
    };

    eventsManager.editEvent(eventsController.eventId, event)
        .then(function (eventInfo) {
            ctx.redirect('#/events');
            messageBox.showInfo(`Ad "${name}" updated!`);
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

            picturesManager.editPicture(eventsController.eventCoverPictureId, picture)
                .then(function (pic) {
                    ticketsManager.editTicket(eventsController.eventTicketId, ticket)
                        .then(function (tick) {
                            ctx.redirect('#/events');
                            messageBox.showInfo(`Event "${name}" created!`);
                        })
                });
        }).catch(messageBox.handleError);
};

//VIEW EVENT DETAILS
eventsController.eventDetailsGET = function (ctx) {
    let eventId = ctx.params.id.substring(1);
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    eventsController.eventId = eventId;

    picturesManager.getAllPicturesByEventId(eventId)
        .then(function (picture) {
            eventsManager.getEventDetails(eventId)
                .then(function (event) {
                    ctx.CDate = event.CDate.substring(0, 10);
                    ctx.Location = event.Location;
                    ctx.Details = event.Details;
                    ctx.EventName = event.EventName;
                    let eventPhotos;
                    if (picture[0]) {
                        ctx.CoverPicture = picture[0].CoverPicture;
                        eventPhotos = picture[0].Pictures

                    } else {
                        ctx.CoverPicture = '';
                    }
                    console.log(eventPhotos);
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
    //eventsController.eventId = ctx.params.id.substring(1);
    console.log(eventsController.eventId);
    eventsManager.deleteEvent(eventsController.eventId)
        .then(function () {
            ctx.redirect('#/events');
            picturesManager.getAllPicturesByEventId(eventsController.eventId)
                .then(function (pictures) {
                    for (let pic of pictures) {
                        picturesManager.deletePicture(pic._id);
                    }
                    ticketsManager.getTicketsForEvent(eventsController.eventId)
                        .then(function (tickets) {
                            for (let tick of tickets) {
                                ticketsManager.deleteTicket(tick._id);
                            }
                        })
                })
        }).catch(messageBox.handleError);

    messageBox.showInfo('Event deleted!');

};

//ORDER TICKETS
eventsController.orderTickets = function (ctx) {
    if (Number(ctx.params.buyTickets) <= 0 || Number(ctx.params.buyTickets) > ctx.params.availableTickets) {
        messageBox.showError('Tickets not available!');
        ctx.redirect('#/events/:' + ctx.params.EventId);
    } else {
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
