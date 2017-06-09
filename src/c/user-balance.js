/**
 * window.c.UserBalance component
 * Render the current user total balance and request fund action
 *
 * Example:
 * m.component(c.UserBalance, {
 *     user_id: 123,
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import models from '../models';
import h from '../h';
import modalBox from './modal-box';
import userBalanceRequestModalContent from './user-balance-request-modal-content';

const I18nScope = _.partial(h.i18nScope, 'users.balance');

const userBalance = {
    oninit(vnode) {
        vnode.attrs.balanceManager.load();

        return {
            userBalances: vnode.attrs.balanceManager.collection,
            displayModal: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        const balance = _.first(vnode.state.userBalances()) || { user_id: vnode.attrs.user_id, amount: 0},
            balanceRequestModalC = [
                userBalanceRequestModalContent,
                _.extend({}, { balance }, vnode.attrs)
            ];

        return m('.w-section.section.user-balance-section', [
            (vnode.state.displayModal() ? m(modalBox, {
                displayModal: vnode.state.displayModal,
                content: balanceRequestModalC
            }) : ''),
            m('.w-container', [
                m('.w-row', [
                    m('.w-col.w-col-8.u-text-center-small-only.u-marginbottom-20', [
                        m('.fontsize-larger', [
                            I18n.t('totals', I18nScope()),
                            m('span.text-success', `R$ ${h.formatNumber(balance.amount, 2, 3)}`)
                        ])
                    ]),
                    m('.w-col.w-col-4', [
                        m(`a[class="r-fund-btn w-button btn btn-medium u-marginbottom-10 ${(balance.amount <= 0 ? 'btn-inactive' : '')}"][href="js:void(0);"]`,
                          { onclick: (balance.amount > 0 ? vnode.state.displayModal.toggle : 'js:void(0);') },
                          I18n.t('withdraw_cta', I18nScope()))
                    ])
                ])
            ])
        ]);
    }
};

export default userBalance;
