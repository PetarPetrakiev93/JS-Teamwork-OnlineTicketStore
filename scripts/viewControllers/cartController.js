const cartController = {};

//GET ALL ORDERS
cartController.getOrders = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    requester.get('user', sessionStorage.getItem('userId'))
        .then(function (user) {
            ctx.orders = user.basket;
            let totalPrice = 0;
            for(let o of user.basket){
                totalPrice += (Number(o.numberTickets) * Number(o.price));
            }
            ctx.totalPrice = totalPrice;
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                order: './templates/cart/order.hbs'
            }).then(function () {
                this.partial('./templates/cart/shoppingCart.hbs')
                    .then(function () {
                        $('button.delete-order').click(function () {
                            let id = $(this).attr('id');
                            let index = -1;
                            for(let i in user.basket){
                                if(user.basket[i].id === id){
                                    index = i;
                                }
                            }
                            user.basket.splice(index, 1);
                            requester.update('user', sessionStorage.getItem('userId'), user)
                                .then(function () {
                                    ctx.redirect('#/events');
                                })

                        });
                        $('button.checkout').click(function () {
                            if(user.basket.length > 0) {


                                let order = {Order: user.basket};
                                let notAvailableTickets = false;
                                for (let o of user.basket) {
                                    if (notAvailableTickets === false) {
                                        requester.get('appdata', 'Tickets/' + o.id)
                                            .then(function (tickets) {
                                                if (Number(tickets.AvailableTickets) < Number(o.numberTickets)) {
                                                    notAvailableTickets = true;
                                                    messageBox.showError(`No available tickets for ${o.eventName}`);
                                                } else {
                                                    let availableTickets = Number(tickets.AvailableTickets) - Number(o.numberTickets);
                                                    tickets.AvailableTickets = availableTickets;
                                                    tickets.SoldTickets = (Number(tickets.SoldTickets) + Number(o.numberTickets));
                                                    requester.update('appdata', 'Tickets/' + o.id, tickets);
                                                }
                                            })
                                    }

                                }
                                if (notAvailableTickets === false) {
                                    requester.post('appdata', 'Orders', order)
                                        .then(function () {
                                            user.basket = [];
                                            requester.update('user', sessionStorage.getItem('userId'), user)
                                                .then(function () {
                                                    messageBox.showInfo(`Total payment: ${totalPrice}`);
                                                    ctx.redirect('#/events');
                                                })
                                        })
                                }
                            }
                        });
                    })
            })
        })
};