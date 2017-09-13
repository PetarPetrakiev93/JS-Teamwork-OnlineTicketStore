const categoriesManager = (() => {
    function getAllCategories() {
        return requester.get('appdata', 'Categories');
    }

    function createCategory(category) {
        return requester.post('appdata', 'Categories', category)
    }

    return {
        getAllCategories,
        createCategory
    }
})();