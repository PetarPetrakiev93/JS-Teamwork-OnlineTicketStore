const adminManager = (() => {
    function isAdmins() {
        requester.get('group', '').then(function (admins) {
            for(let admin of admins[0].users.list){
                if(admin._id ===  sessionStorage.getItem('userId')){
                    sessionStorage.setItem('isAdmin', true);
                }
            }
        });
    }
    function allAdmins() {
        return requester.get('group', '');
    }
    function updateAdmins(admins) {
        return requester.update('group', 'Admin', admins);
    }

    return {
        isAdmins,
        allAdmins,
        updateAdmins
    }
})();