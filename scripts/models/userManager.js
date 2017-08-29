const userManager = (() => {
    function saveSession(userInfo) {
        sessionStorage.setItem('authtoken', userInfo._kmd.authtoken);
        sessionStorage.setItem('username', userInfo.username);
        sessionStorage.setItem('userId', userInfo._id);
    }

    function isLoggedIn() {
        return sessionStorage.getItem('userId') !== null;
    }

    function getUsername() {
        return sessionStorage.getItem('username');
    }

    function register(username, password, confirmPassword) {
        if (username.length === 0) {
            messageBox.showError('Username cannot be empty!');
            return;
        }

        if (password.length === 0) {
            messageBox.showError('Password cannot be empty!');
            return;
        }

        if (password !== confirmPassword) {
            messageBox.showError("Passwords don't match!");
            return;
        }

            return requester.post('user', '', {username, password}, 'basic');

    }

    function login(username, password) {
        if (username.length === 0) {
            messageBox.showError('Username cannot be empty!');
            return;
        }

        if (password.length === 0) {
            messageBox.showError('Password cannot be empty!');
            return;
        }

        let userData = {
            username,
            password
        };

        return requester.post('user', 'login', userData, 'basic')
    }

    function logout() {
       return requester.post('user', '_logout', {authtoken: sessionStorage.getItem('authtoken')});
    }

    function getUser(id) {
        return requester.get('user', id);
    }

    function updateUser(data, id) {
        return requester.update('user', id, data);
    }

    return {
        saveSession,
        register,
        login,
        logout,
        isLoggedIn,
        getUsername,
        getUser,
        updateUser
    }
})();