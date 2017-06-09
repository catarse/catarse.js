import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import paymentSlip from './payment-slip';
import paymentCreditCard from './payment-credit-card';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const paymentForm = {
    oninit(vnode) {
        const isSlip = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            scope = () => vnode.attrs.vm.isInternational()
                       ? I18nIntScope()
                       : I18nScope();
        return {
            isSlip,
            scope,
            vm: vnode.attrs.vm
        };
    },
    view(vnode) {
        return m('#catarse_pagarme_form', [
            m('.u-text-center-small-only.u-marginbottom-30', [
                m('.fontsize-large.fontweight-semibold',
                    I18n.t('payment_info', vnode.state.scope())
                ),
                m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [
                    m('span.fa.fa-lock'),
                    I18n.t('safe_payment', vnode.state.scope())
                ])
            ]),
            m('.flex-row.u-marginbottom-40', [
                m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => vnode.state.isSlip(false),
                    class: !vnode.state.isSlip() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold',
                        I18n.t('credit_card_select', vnode.state.scope())
                    ),
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                        I18n.t('debit_card_info', vnode.state.scope())
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
                ]),
                !vnode.attrs.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => vnode.state.isSlip(true),
                    class: vnode.state.isSlip() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        'Boleto bancário'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
                ]) : m('.flex-column')
            ]), !vnode.state.isSlip() ? m('#credit-card-section', [
                m(
                    paymentCreditCard,
                    { vm: vnode.attrs.vm, contribution_id: vnode.attrs.contribution_id, project_id: vnode.attrs.project_id, user_id: vnode.attrs.user_id }
                )
            ]) : !vnode.attrs.vm.isInternational() ? m('#boleto-section', [
                m(
                    paymentSlip,
                    { vm: vnode.attrs.vm, contribution_id: vnode.attrs.contribution_id, project_id: vnode.attrs.project_id }
                )
            ]) : ''
        ]);
    }
};

export default paymentForm;
