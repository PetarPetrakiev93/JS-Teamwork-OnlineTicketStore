const picturesManager = (() => {
    function createPicture(picture) {
        return requester.post('appdata', 'Pictures', picture)
    }

    function getAllPicturesByEventId(id) {
        let url = `events?query={"EventId":"${id}"}`;

        return requester.get('Pictures', url);
    }

    function getAllPictures() {
        return requester.get('appdata', 'Pictures')

    }

    return {
        createPicture,
        getAllPicturesByEventId,
        getAllPictures
    }
})();