const homeController = (() => {
});

homeController.displayHome = function (ctx) {
    let logged = userManager.isLoggedIn();
    ctx.loggedIn = logged;
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.isAdmin = userManager.isAdmin();
    if (!logged && !userManager.isGuest()) {
        userManager.login('guest', 'guest')
            .then(function (userInfo) {
                userManager.saveSession(userInfo);
                picturesManager.getAllPictures()
                    .then(function (allPictures) {
                        eventsManager.getEvents()
                            .then(function (allEvents) {
                                ticketsManager.getAllTickets()
                                    .then(function (allTickets) {
                                        let tickets = allTickets.sort((a, b) => b.SoldTickets - a.SoldTickets).slice(0, 3);
                                        let events = [];
                                        for (let ticket of tickets) {
                                            for (let event of allEvents) {
                                                if(ticket.EventId === event._id){
                                                    events.push(event);
                                                    continue;
                                                }
                                            }
                                        }
                                        for (let event of events) {
                                            for (let picture of allPictures) {
                                                if(event._id === picture.EventId){
                                                    event.imageUrl = picture.CoverPicture;
                                                    continue;
                                                }
                                            }
                                        }
                                        events[0].active = true;
                                        ctx.events = events;
                                        ctx.loadPartials({
                                            header: './templates/common/header.hbs',
                                            footer: './templates/common/footer.hbs',
                                            carouselItem: './templates/home/carouselItem.hbs'
                                        }).then(function () {
                                            this.partial('./templates/home/home.hbs')
                                                .then(function () {
                                                    $('.clickable').click(function () {
                                                        let id = $(this).attr('id');
                                                        ctx.redirect(`#/events/:${id}`);
                                                    })
                                                })
                                        })
                                    })
                            }).catch(messageBox.handleError);
                    });

            }).catch(messageBox.handleError);
    } else { picturesManager.getAllPictures()
        .then(function (allPictures) {
            eventsManager.getEvents()
                .then(function (allEvents) {
                    ticketsManager.getAllTickets()
                        .then(function (allTickets) {
                            let tickets = allTickets.sort((a, b) => b.SoldTickets - a.SoldTickets).slice(0, 3);
                            let events = [];
                            for (let ticket of tickets) {
                                for (let event of allEvents) {
                                    if(ticket.EventId === event._id){
                                        events.push(event);
                                        continue;
                                    }
                                }
                            }
                            for (let event of events) {
                                for (let picture of allPictures) {
                                    if(event._id === picture.EventId){
                                        event.imageUrl = picture.CoverPicture;
                                        continue;
                                    }
                                }
                            }
                            events[0].active = true;
                            ctx.events = events;
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                carouselItem: './templates/home/carouselItem.hbs'
                            }).then(function () {
                                this.partial('./templates/home/home.hbs')
                                    .then(function () {
                                        $('.clickable').click(function () {
                                            let id = $(this).attr('id');
                                            ctx.redirect(`#/events/:${id}`);
                                        })
                                    })
                            })
                        })
                }).catch(messageBox.handleError);
        });
    }
};