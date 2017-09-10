const homeController = (() => {});

homeController.displayHome = function (ctx) {
    let logged = userManager.isLoggedIn();
    ctx.loggedIn = logged;
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.isAdmin = userManager.isAdmin();
    if(!logged && !userManager.isGuest()) {
        userManager.login('guest', 'guest')
            .then(function (userInfo) {
                userManager.saveSession(userInfo);
            })
            .catch(messageBox.handleError);
    }
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        carouselItem: './templates/home/carouselItem.hbs'
    }).then(function () {
        this.partial('./templates/home/home.hbs');
    })


};