/**
 * window.c.AdminBankingInfo component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminBankingInfo, {
 *     user: user
 * })
 */

window.c.AdminBankingInfo = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const banking = m.prop([]),
                vm = m.postgrest.filtersVM({'user_id': 'eq'});

            vm.user_id(args.user_id);

            const l = m.postgrest.loaderWithToken(models.bankAccount.getRowOptions(vm.parameters()));

            l.load().then(banking);

            return {
                banking: banking
            };
        },

        view: (ctrl) => {
            return m('.w-col.w-col-4', [
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Dados bancários'),
                m('.fontsize-smallest.lineheight-looser', [
                    m('span.fontweight-semibold', 'Banco:'),
                    h.selfOrEmpty(ctrl.banking.bank_id, ' ...'),
                    m('br'),
                    m('span.fontweight-semibold', 'Agência:'),
                    `${h.selfOrEmpty(ctrl.banking.account, ' ...')}-${h.selfOrEmpty(ctrl.banking.account_digit)}`,
                    m('br'),
                    m('span.fontweight-semibold', 'Conta:'),
                    `${h.selfOrEmpty(ctrl.banking.agency, ' ...')}-${h.selfOrEmpty(ctrl.banking.agency_digit)}`,
                    m('br'),
                    m('span.fontweight-semibold', 'Nome:'),
                    h.selfOrEmpty(ctrl.banking.owner_name, ' ...'),
                    m('br'),
                    m('span.fontweight-semibold', 'CPF:'),
                    h.selfOrEmpty(ctrl.banking.owner_document, ' ...'),
                    m('br')
                ])
            ]);
        }
    };
}(window.m, window.c.h, window._, window.c.models));
