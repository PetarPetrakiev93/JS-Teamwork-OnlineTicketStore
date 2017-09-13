const categoryController = (() => {
});
categoryController.createCategoryPOST = function (ctx) {
    alert('here');
    let name = ctx.params.categoryName;

    let category = {
        CategoryName: name
    };

    categoriesManager.createCategory(category)
        .then(function (cat) {
            categoriesManager.saveAllCategories();
            ctx.redirect('#/admin');
            messageBox.showInfo(`Category ${name} created!`);
        })
};

categoryController.showByCategory = function (ctx) {
    let id = ctx.params.id.substr(1);
    ctx.isAdmin =  userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.categories = JSON.parse(sessionStorage.getItem('categories'));
    picturesManager.getAllPictures()
        .then(function (pictures) {
            eventsManager.getEventsInCategory(id)
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
                        eventBox: './templates/category/eventBox.hbs'
                    }).then(function () {
                        this.partial('./templates/category/eventsPage.hbs').then(function () {
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
