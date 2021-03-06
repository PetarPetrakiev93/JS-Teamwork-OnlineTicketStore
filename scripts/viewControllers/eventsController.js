const eventsController = {};

//CREATE EVENT
eventsController.createEventGET = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.isAdmin = userManager.isAdmin();
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
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
/*
    returns false if the date is invalid
    returns Date if it is valid
     */
eventsController.isDateValid = function(dateString) {
    let dateRegex = /(\d+)[\\\/.\-,](\d+)[\\\/.\-,](\d+)/;
    let match = dateRegex.exec(dateString.toString());

    if (match === null) {
        messageBox.showError('Invalid date format. Try dd/MM/yyy');
        return false;
    }

    let year =Number(match[3]);
    let month = Number(match[2]);
    let day = Number(match[1]);

    // Check the ranges of month and year
    if(year < 0){
        messageBox.showError('Invalid year!');
        return false;
    }
    if(month === 0 || month > 12) {
        messageBox.showError('Invalid month!');
        return false;
    }

    let monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
    {
        monthLength[1] = 29;
    }


    // Check the range of the day
    if(day <= 0){
        messageBox.showError('Invalid day!');
        return false;
    }

    if(day > monthLength[month - 1]){
        messageBox.showError('Invalid day!');
        return false;
    }
    let date = new Date(Number(year), Number(month - 1), Number(day));

    let now = Date.now();

    if(now >= date.getTime()){
        messageBox.showError('The date must be in the future!');
        return false;
    }

    return date;
};
eventsController.createEventPOST = function (ctx) {
    let name = ctx.params.eventName;
    let details = ctx.params.eventDetails;
    let dateString = ctx.params.eventDate;

    let date = eventsController.isDateValid(dateString);

    if (name.length === 0) {
        messageBox.showError('The event must have a title.');
        return;
    }

    if(!date){
        return;
    }

    let location = ctx.params.eventLocation;
    let coverPicture = ctx.params.eventCoverPicture;
    let totalTickets = ctx.params.eventTotalTickets;
    let ticketPrice = ctx.params.eventTicketPrice;
    let categoryId = $('select option:selected').attr('data-catId');
    let morePhotos = $('#morePhotosDiv input');



    let event = {
        EventName: name,
        Details: details,
        CDate: date,
        Location: location,
        CategoryId: categoryId
    };
    let pictures = [];

    if(morePhotos.length > 0){
        for (let photo of morePhotos) {
            if(photo.value){
                pictures.push(photo.value);
            }
        }
    }
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

eventsController.displayFiltered = function (ctx) {
    ctx.isAdmin =  userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
    let range = sessionStorage.getItem('ids');
    let eventsRange = sessionStorage.getItem('evIds');
        picturesManager.getPicturesInRange(range)
            .then(function (pictures) {
                eventsManager.getEventsInRange(eventsRange)
                    .then(function (events) {
                            ctx.events = events.sort((a, b) => compareEventDate(a, b));
                            let eventId;
                            for (let event of events) {
                                eventId = event._id;
                                let eventPictures = pictures.filter(a => a.EventId === eventId);
                                pictures = pictures.filter(a => a.EventId !== eventId);
                                let date = event.CDate.substring(0, 10).split('-');
                                event.CDate = `${date[2]}/${date[1]}/${date[0]}`;
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
                                });
                                ctx.events = events.slice(0, 2);
                            })

                        })
                    }).catch(messageBox.handleError);
            }).catch(messageBox.handleError);

};

//SHOW EVENTS
eventsController.displayEvents = function (ctx) {
    ctx.isAdmin =  userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
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
                        let date = event.CDate.substring(0, 10).split('-');
                        event.CDate = `${date[2]}/${date[1]}/${date[0]}`;
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
                            });
                            ctx.events = events.slice(0, 2);
                        })

                    })
                })
        }).catch(messageBox.handleError);


};

function compareEventDate(a, b) {
    let eventAdate = new Date(a.CDate).getTime();
    let eventBdate = new Date(b.CDate).getTime();
    let now = Date.now();

    let aTimelapse = eventAdate - now;
    let bTimelapse = eventBdate - now;
    return aTimelapse - bTimelapse;
}

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
    ctx.isAdmin = userManager.isAdmin();
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
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
                    ctx.CoverPicture = pictures[0].CoverPicture;
                    eventsController.eventCoverPictureId = pictures[0]._id;
                    let date = event.CDate.substring(0, 10).split('-');
                    ctx.CDate = `${date[2]}/${date[1]}/${date[0]}`;
                    ctx.photos = pictures[0].Pictures;
                    ticketsManager.getTicketsForEvent(event._id)
                        .then(function (ticket) {
                            ctx.AvailableTickets = ticket[0].AvailableTickets;
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
                                        this.partial('./templates/event/edit/editEventPage.hbs').then(function () {
                                            let morePhotosLabel = $('#editMorePhotos');
                                            let morePhotosDiv = $('#editMorePhotosDiv');
                                            morePhotosLabel.click(function () {
                                                let input = $('<input class="form-control" placeholder="Enter picture url..."/>');
                                                input.appendTo(morePhotosDiv);
                                            });
                                        });
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
    let date = eventsController.isDateValid(dateString);

    if (name.length === 0) {
        messageBox.showError('The event must have a title.');
        return;
    }

    if(!date){
        return;
    }


    let location = ctx.params.eventLocation;
    let coverPicture = ctx.params.editEventCoverPicture;
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

    let morePhotos = $('#editMorePhotosDiv input');

    let pictures = [];

    if(morePhotos.length > 0){
        for (let photo of morePhotos) {
            if(photo.value){
                pictures.push(photo.value);
            }
        }
    }

    eventsManager.editEvent(eventsController.eventId, event)
        .then(function (eventInfo) {
            let id = eventInfo._id;
            let picture = {
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

            picturesManager.editPicture(eventsController.eventCoverPictureId, picture)
                .then(function (pic) {
                    ticketsManager.editTicket(eventsController.eventTicketId, ticket)
                        .then(function () {
                            ctx.redirect('#/events');
                            messageBox.showInfo(`Event "${name}" edited!`);
                        })
                });
        }).catch(messageBox.handleError);
};

//VIEW EVENT DETAILS
eventsController.eventDetailsGET = function (ctx) {
    ctx.isAdmin = userManager.isAdmin();
    let eventId = ctx.params.id.substring(1);
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    eventsController.eventId = eventId;
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));

    picturesManager.getAllPicturesByEventId(eventId)
        .then(function (picture) {
            eventsManager.getEventDetails(eventId)
                .then(function (event) {
                    if(event._acl.creator === sessionStorage.getItem('userId')){
                        ctx.isCreator = true;
                    }
                    ctx.CDate = event.CDate.substring(0, 10);
                    ctx.Location = event.Location;
                    ctx.Details = event.Details;
                    ctx.EventName = event.EventName;
                    let eventPhotos;
                    if (picture[0]) {
                        ctx.CoverPicture = picture[0].CoverPicture;
                        eventPhotos = picture[0].Pictures;
                        ctx.photos = [];
                        let index = 0;
                        for(let photo in eventPhotos){
                            if(index === 0){
                                ctx.photos.push({
                                    firstPhoto: true,
                                    imageUrl: eventPhotos[photo]
                                })
                            }else{
                                ctx.photos.push({
                                    imageUrl: eventPhotos[photo]
                                })
                            }
                            index++;
                        }
                    } else {
                        ctx.CoverPicture = '';
                    }
                    if(eventPhotos.length !== 0){
                        ctx.hasEventPhotos = true;
                    }
                    ticketsManager.getTicketsForEvent(eventId)
                        .then(function (tickets) {
                            ctx._id = tickets[0]._id;
                            ctx.availableTickets = tickets[0].AvailableTickets;
                            ctx.totalTickets = tickets[0].TotalTickets;
                            ctx.soldTickets = tickets[0].SoldTickets;
                            ctx.price = tickets[0].Price;
                            ctx.EventId = tickets[0].EventId;
                            ctx.loggedIn = userManager.isLoggedIn();
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

eventsController.search = function (ctx) {
    if(ctx.params.search === ""){
        ctx.redirect('#/home');
        return;
    }
    let search = ctx.params.search;
    ctx.isAdmin =  userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
    picturesManager.getAllPictures()
        .then(function (pictures) {
            eventsManager.getEvents()
                .then(function (events) {
                    ctx.events = [];
                    for(let event of events){
                        if(event.EventName.indexOf(search) !== -1){
                            ctx.events.push(event);
                        }
                    }
                    ctx.events.sort((a, b) => compareEventDate(a, b));
                    let eventId;
                    for (let event of ctx.events) {
                        eventId = event._id;
                        let eventPictures = pictures.filter(a => a.EventId === eventId);
                        pictures = pictures.filter(a => a.EventId !== eventId);
                        let date = event.CDate.substring(0, 10).split('-');
                        event.CDate = `${date[2]}/${date[1]}/${date[0]}`;
                        if (eventPictures[0]) {
                            event.CoverPicture = eventPictures[0].CoverPicture;
                        } else {
                            event.CoverPicture = '';
                        }
                    }
                    ctx.loadPartials({
                        header: './templates/common/header.hbs',
                        footer: './templates/common/footer.hbs',
                        eventBox: './templates/search/eventBox.hbs'
                    }).then(function () {
                        this.partial('./templates/search/eventsPage.hbs').then(function () {
                            $('.clickable').click(function () {
                                let id = $(this).attr('id');
                                ctx.redirect(`#/events/:${id}`);
                            });
                            ctx.events = events.slice(0, 2);
                        })

                    })
                })
        }).catch(messageBox.handleError);
};
