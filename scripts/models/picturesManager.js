const picturesManager = (() => {
    function createPicture(picture) {
        return requester.post('appdata', 'Pictures', picture)
    }

    function getAllPicturesByEventId(id) {
        let url = 'Pictures/?query={"EventId":"'+ id + '"}';

        return requester.get('appdata', url);
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