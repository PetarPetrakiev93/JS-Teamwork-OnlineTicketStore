const userController = {};
//LOGIN
userController.loginGET = function (ctx) {
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        loginForm: './templates/login/loginForm.hbs'
    }).then(function () {
        this.partial('./templates/login/loginPage.hbs');
    });
};
userController.loginPOST = function (ctx) {
    let username = ctx.params.username;
    let password = ctx.params.password;

    userManager.login(username, password)
        .then(function (userInfo) {
            userManager.saveSession(userInfo);
            requester.get('group', '').then(function (admins) {
                for (let admin of admins[0].users.list) {
                    if (admin._id === sessionStorage.getItem('userId')) {
                        ctx.isAdmin = true;
                    }
                }
                messageBox.showInfo('Successful login!');
                ctx.redirect('#');
            });


        }).catch(messageBox.handleError);
};

//REGISTER
userController.registerGET = function (ctx) {
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        registerForm: './templates/register/registerForm.hbs'
    }).then(function () {
        this.partial('./templates/register/registerPage.hbs')
    });
};
userController.registerPOST = function (ctx) {
    let username = ctx.params.username;
    let pass = ctx.params.password;
    let confirmPass = ctx.params.confirmPassword;

    userManager.register(username, pass, confirmPass)
        .then(function (userInfo) {
            userManager.saveSession(userInfo);
            userInfo.basket = [];
            requester.get('group', '').then(function (admins) {
                for (let admin of admins[0].users.list) {
                    if (admin._id === sessionStorage.getItem('userId')) {
                        ctx.isAdmin = true;
                    }
                }
                messageBox.showInfo('Successful register!');
                ctx.redirect('#');
            });
        }).catch(messageBox.handleError);
};

//LOGOUT
userController.logout = function (ctx) {
    userManager.logout()
        .then(function () {
            sessionStorage.clear();
            ctx.redirect('#/home');
            messageBox.showInfo('Successful logout!');
        }).catch(messageBox.handleError)
};

//USER DETAILS

userController.userDetails = function (ctx) {
    ctx.username = sessionStorage.getItem('username');
    ctx.isAdmin = userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    requester.get('appdata', 'Orders/?query={"_acl.creator":"' + sessionStorage.getItem('userId') + '"}')
        .then(function (orders) {
            for (let order of orders) {
                order.date = order._kmd.lmt.substr(0, 10);
            }
            ctx.orders = orders;
            ctx.loadPartials({
                header: './templates/common/header.hbs',
                footer: './templates/common/footer.hbs',
                order: './templates/userDetails/order.hbs'
            }).then(function () {
                this.partial('./templates/userDetails/userDetails.hbs').then(function () {
                    $('button.history').click(function () {
                        if ($($('div.history-content')[0]).attr('style') === 'display: none;') {
                            $($('div.history-content')[0]).show();
                        } else {
                            $($('div.history-content')[0]).hide();
                        }
                    });
                });
            });
        });
};

userController.editUserGET = function (ctx) {
    ctx.username = sessionStorage.getItem('username');
    ctx.isAdmin = userManager.isAdmin();
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs',
        userEditForm: './templates/userDetails/editUser/userEditForm.hbs'
    }).then(function () {
        this.partial('./templates/userDetails/editUser/userEditPage.hbs')
            .then(function () {
                let button = $('#showPasswordField');
                button.click(function () {
                    $('#passwordDiv').toggle();
                });
            });
    })
};

userController.editUserPOST = function (ctx) {
    let username = ctx.params.username;
    let pass = ctx.params.password;
    let confirmPass = ctx.params.confirmPassword;

    userManager.getUser(sessionStorage.getItem('userId'))
        .then(function (userInfo) {
            let basket = userInfo.basket;
            let IsAdmin = userInfo.IsAdmin;

            let user = {
                IsAdmin: IsAdmin,
                basket: basket,
            };

            if (username.length === 0) {
               user.username = sessionStorage.getItem('username');
            }else{
                user.username = username;
            }

            if (pass) {
                if (pass !== confirmPass) {
                    messageBox.showError("Passwords don't match!");
                    return;
                }
                user.password = pass;
            }

            userManager.updateUser(user, sessionStorage.getItem('userId'))
                .then(function (updatedUser) {
                    ctx.redirect('#/userDetails');
                    userManager.saveSession(updatedUser);
                })
        });
};

