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

    function getPicturesInRange(range) {
        return requester.get('appdata', `Pictures?query={"$or":[${range}]}`);
    }

    function editPicture(id, picture) {
        return requester.update('appdata', `Pictures/${id}`, picture);
    }

    function deletePicture(pictureId) {
        return requester.remove('appdata', `Pictures/${pictureId}`);
    }

    return {
        createPicture,
        getAllPicturesByEventId,
        getAllPictures,
        editPicture,
        deletePicture,
        getPicturesInRange
    }
})();