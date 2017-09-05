const homeController = (() => {
});

homeController.displayHome = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.isAdmin = userManager.isAdmin();

    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        carouselItem: './templates/home/carouselItem.hbs'
    }).then(function () {
        this.partial('./templates/home/home.hbs');
    })


};