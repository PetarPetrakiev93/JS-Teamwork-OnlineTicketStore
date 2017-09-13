const adminController = {};


adminController.getAdmin = function (ctx) {
    ctx.loggedIn = userManager.isLoggedIn();
    ctx.username = userManager.getUsername();
    ctx.id = sessionStorage.getItem('userId');
    ctx.isAdmin = userManager.isAdmin();
    requester.get('appdata', 'Orders')
        .then(function (orders) {
            for(let order of orders){
                order.date = order._kmd.lmt.substr(0,10);
            }
            ctx.orders = orders;
            requester.get('user', '')
                .then(function (users) {
                    adminManager.allAdmins()
                        .then(function (admins) {
                            for(let user in users){
                                for(let admin of admins[0].users.list){
                                    if(users[user]._id === admin._id){
                                        users[user].admin = true;
                                    }
                                }
                            }
                            ctx.users = users;
                            ctx.loadPartials({
                                header: './templates/common/header.hbs',
                                footer: './templates/common/footer.hbs',
                                order: './templates/admin/order.hbs'
                            }).then(function () {
                                this.partial('./templates/admin/adminControl.hbs').then(function(){
                                    $('button.history').click(function () {
                                        if($($('div.history-content')[0]).attr('style') === 'display: none;'){
                                            $($('div.history-content')[0]).show();
                                        }else{
                                            $($('div.history-content')[0]).hide();
                                        }
                                    });

                                    $('button.admin').click(function () {
                                        if($($('div.admin-content')[0]).attr('style') === 'display: none;'){
                                            $($('div.admin-content')[0]).show();
                                        }else{
                                            $($('div.admin-content')[0]).hide();
                                        }
                                    });

                                    let button = $('#categoryBtn');
                                    button.click(function () {
                                        $('#categoryDiv').toggle();
                                    });
                                });
                            });
                        })
                });

        })
};

adminController.updateAdmins = function (ctx) {
    let newAdmins = ctx.params.user;
    let admins = {};
    admins._id ="Admin";
    admins._acl = {gr:true, gw:true};
    admins.users = {};
    admins.users.all = false;
    admins.users.list = [];
    for(let a of newAdmins){
        admins.users.list.push({
            _type: "KinveyRef",
            _collection: "user",
            _id: a
        })
    }
    adminManager.updateAdmins(admins)
        .then(function (a) {
            ctx.redirect('#/admin');
            messageBox.showInfo('Admins list updated')
        }).catch(messageBox.handleError);
};