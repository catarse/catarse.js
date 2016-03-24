/**
 * window.c.AdminFinancialDetail component
 * Return action inputs to be used inside AdminList component.
 *
 * Example:
 * m.component(c.AdminList, {
 *     data: {},
 *     listDetail: c.AdminFinancialDetail
 * })
 */
window.c.AdminFinancialDetail = (function(m, _, c){
    return {
        controller: function(){
            return {
                actions: {
                    approve: {
                        property: 'status',
                        updateKey: 'id',
                        callToAction: 'Aprovar Saque',
                        innerLabel: 'Tem certeza que deseja aprovar?',
                        successMessage: 'Saque aprovado!',
                        errorMessage: 'O saque não pode ser aprovado!',
                        outerLabel: 'Aprovar',
                        forceValue: 'Approved',
                        model: c.models.balance
                    },
                    refuse: {
                        property: 'status',
                        updateKey: 'id',
                        callToAction: 'Recusar Saque',
                        innerLabel: 'Tem certeza que deseja recusar esse saque?',
                        successMessage: 'Saque recusado!',
                        errorMessage: 'O saque não pode ser recusado!',
                        outerLabel: 'Recusar',
                        forceValue: 'Refused',
                        model: c.models.balance
                    }
                }
            };
        },

        view: function(ctrl, args){
            var actions = ctrl.actions,
                item = args.item,
                details = args.details;

            return m('#admin-contribution-detail-box', [
                m('.divider.u-margintop-20.u-marginbottom-20'),
                m('.w-row.u-marginbottom-30', [
                    m.component(c.AdminInputAction, {data: actions.approve, item: item}),
                    m.component(c.AdminInputAction, {data: actions.refuse, item: item}),
                ]),
                m('.w-row.card.card-terciary.u-radius', [
                    m.component(c.AdminBankingInfo, {
                        user_id: item.user_id
                    }),
                    m.component(c.AdminTransactionInfo, item),
                ]),
            ]);
        }
    };
}(window.m, window._, window.c));
