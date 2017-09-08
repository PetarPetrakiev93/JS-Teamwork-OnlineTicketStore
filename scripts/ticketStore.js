function startApp() {
    const app = Sammy('#main', function () {

        $('.notification').click(function (e) {
            $(e.target).hide();
        });

        this.use('Handlebars', 'hbs');


        //HOME
        this.get('index.html', homeController.displayHome);
        this.get('#/home', homeController.displayHome);

        //REGISTER
        this.get('#/register', userController.registerGET);
        this.post('#/register', userController.registerPOST);

        //LOGIN
        this.get('#/login', userController.loginGET);
        this.post('#/login', userController.loginPOST);

        //USER DETAILS
        this.get('#/userDetails', userController.userDetails);

        //LOGOUT
        this.get('#/logout', userController.logout);


        //CATALOG
        //CREATE EVENT
        this.get('#/createEvent', eventsController.createEventGET);
        this.post('#/createEvent', eventsController.createEventPOST);

        //SHOW ALL EVENTS
        this.get('#/events', eventsController.displayEvents);

        //SHOW EVENTS BY CATEGORY
        this.get('#/events/category/:id', eventsController.displayEventsByCategory);

        //EDIT EVENT
        this.get('#/events/edit/:id', eventsController.editEventGET);
        this.post('#/events/edit/:id', eventsController.editEventPOST);

        //EVENT DETAILS
        this.get('#/events/:id', eventsController.eventDetailsGET);

        //DELETE EVENT
        this.get('#/events/delete/:id', eventsController.deleteEvent);

        //ORDER TICKET
        this.post('#/tickets/:id', eventsController.orderTickets);

        //CART
        this.get('#/cart', cartController.getOrders);

    });
    app.run();
}