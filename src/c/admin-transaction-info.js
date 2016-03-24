/**
 * window.c.AdminTransactionInfo component
 * Return notifications list from an User object.
 *
 * Example:
 * m.component(c.AdminTransactionInfo, {
 *     user: user
 * })
 */

window.c.AdminTransactionInfo = ((m, h, _, models) => {
    return {
        controller: (args) => {
            const transactions = m.prop([]),
                vm = m.postgrest.filtersVM({'user_id': 'eq'});

            vm.user_id(args.user_id);

            const l = m.postgrest.loaderWithToken(models.balanceTransaction.getRowOptions(vm.parameters()));

            l.load().then(transactions);

            return {
                transactions: transactions
            };
        },

        view: (ctrl, args) => {
            console.log(args);

            return m('.w-col.w-col-8', [
                m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Extrato dos últimos 30 dias'),
                _.map(ctrl.transactions(), (transactionRow) => {
                    return _.map(transactionRow.source, (transaction) => {
                        const pos = transaction.amount >= 0;

                        return m('.w-row.fontsize-smallest.lineheight-looser.divider', [
                            m('.w-col.w-col-2', [
                                m('fontcolor-secondary', h.momentify(transaction.created_at))
                            ]),
                            m('.w-col.w-col-6', `${transaction.event_name} ${transaction.origin_object.name}`),
                            m('.w-col.w-col-2', [
                                m(`.text-${(pos ? 'success' : 'error')}`, `${pos ? '+' : '-'} R$ ${h.formatNumber(Math.abs(transaction.amount), 2, 3)}`)
                            ]),
                        ]);
                    });
                }),
                m('.w-row.fontsize-smallest.lineheight-looser.divider', [
                    m('.w-col.w-col-2', [
                        m('fontcolor-secondary', h.momentify(Date.now()))
                    ]),
                    m('.w-col.w-col-6', 'SALDO'),
                    m('.w-col.w-col-2', [
                        `R$ ${h.formatNumber(args.amount)}`
                    ]),
                ])
            ]);
        }
    };
}(window.m, window.c.h, window._, window.c.models));
