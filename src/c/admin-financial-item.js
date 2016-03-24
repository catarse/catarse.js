window.c.AdminFinancialItem = (function(m, c, h) {
    return {
        controller: (args) => {
            const idVM = h.idVM,
                userDetails = m.prop([]);

            idVM.id(args.item.user_id);

            const lUser = m.postgrest.loaderWithToken(c.models.userDetail.getRowOptions(idVM.parameters()));
            lUser.load().then(userDetails);

            return {
                lUser: lUser,
                userDetails: userDetails
            };
        },
        view: function(ctrl, args) {
            const item = args.item;

            return m(
                '.w-row', [
                    m('.w-col.w-col-4', [
                        !ctrl.lUser() ? m.component(c.AdminUser, {item: _.first(ctrl.userDetails())}) : 'carregando usuário...'
                    ]),
                    m('.w-col.w-col-3', [
                        m('span.fontsize-large', `R$ ${h.formatNumber(item.amount)}`)
                    ])
                ]
            );
        }
    };
}(window.m, window.c, window.c.h));
