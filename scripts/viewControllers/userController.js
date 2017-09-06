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
            ctx.redirect('#/home');
            messageBox.showInfo('Successful login!');
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
userController.registerPOST =  function (ctx) {
    let username = ctx.params.username;
    let pass = ctx.params.password;
    let confirmPass = ctx.params.confirmPassword;

    userManager.register(username, pass, confirmPass)
        .then(function (userInfo) {
            userManager.saveSession(userInfo);
            ctx.redirect('#/home');
            messageBox.showInfo('Successful register!');
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
    ctx.isAdmin = sessionStorage.getItem('isAdmin');
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.loadPartials({
        header: './templates/common/header.hbs',
        footer: './templates/common/footer.hbs'
    }).then(function () {
        this.partial('./templates/userDetails/userDetails.hbs').then(function(){
            //console.log($('button.admin-control'));
            $('button.admin-control').click(function () {
                if($($('div.admin-control-content')[0]).attr('style') === 'display: none;'){
                    $($('div.admin-control-content')[0]).show();
                }else{
                    $($('div.admin-control-content')[0]).hide();
                }
            });
            $('button.history').click(function () {
                if($($('div.history-content')[0]).attr('style') === 'display: none;'){
                    $($('div.history-content')[0]).show();
                }else{
                    $($('div.history-content')[0]).hide();
                }
            });
        });
    });

};

