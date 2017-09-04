const categoriesManager = (() => {
    function getAllCategories() {
        return requester.get('appdata', 'Categories');
    }

    return {
        getAllCategories
    }
})();