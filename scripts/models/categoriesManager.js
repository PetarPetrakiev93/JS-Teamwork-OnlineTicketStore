const categoriesManager = (() => {
    function getAllCategories() {
        return requester.get('appdata', 'Categories');
    }

    function createCategory(category) {
        return requester.post('appdata', 'Categories', category)
    }
    
    function saveAllCategories() {
        getAllCategories()
            .then(function (categories) {
                sessionStorage.setItem('categories', JSON.stringify(categories));
            })
    }

    return {
        getAllCategories,
        createCategory,
        saveAllCategories
    }
})();