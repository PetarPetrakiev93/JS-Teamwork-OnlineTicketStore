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
            ctx.redirect('#/admin');
            messageBox.showInfo(`Category ${name} created!`);
        })
}
