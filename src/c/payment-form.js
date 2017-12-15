import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import paymentSlip from './payment-slip';
import paymentBtc from './payment-btc';
import paymentCreditCard from './payment-credit-card';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const paymentForm = {
    controller(args) {
        const isSlip = m.prop(false),
            isBtc = m.prop(false),
            scope = () => args.vm.isInternational()
            ? I18nIntScope()
            : I18nScope();

        console.log(args);
        return {
            isSlip,
            isBtc,
            scope,
            vm: args.vm
        };
    },
    view(ctrl, args) {
        return m('#catarse_pagarme_form', [
            m('.u-text-center-small-only.u-marginbottom-30', [
                m('.fontsize-large.fontweight-semibold',
                    I18n.t('payment_info', ctrl.scope())
                ),
                m('.fontsize-smallest.fontcolor-secondary.fontweight-semibold', [
                    m('span.fa.fa-lock'),
                    I18n.t('safe_payment', ctrl.scope())
                ])
            ]),
            m('.flex-row.u-marginbottom-40', [
                m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => {
                        ctrl.isSlip(false);
                        ctrl.isBtc(false);
                    },
                    class: !ctrl.isSlip() && !ctrl.isBtc() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold',
                        I18n.t('credit_card_select', ctrl.scope())
                    ),
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                        I18n.t('debit_card_info', ctrl.scope())
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299bd8f326a24d4828a0fd_credit-cards.png\']')
                ]),
                (!args.vm.isInternational() ? m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => {
                        ctrl.isSlip(true);
                        ctrl.isBtc(false);
                    },
                    class: ctrl.isSlip() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                        'Boleto bancário'
                    ),
                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57299c6ef96a6e44489a7a07_boleto.png\'][width=\'48\']')
                ]) : m('.flex-column')),
                m('a.w-inline-block.btn-select.flex-column.u-marginbottom-20.u-text-center[href=\'javascript:void(0);\']', {
                    onclick: () => { 
                        ctrl.isSlip(false);
                        ctrl.isBtc(true);
                    },
                    class: ctrl.isBtc() ? 'selected' : ''
                }, [
                    m('.fontsize-base.fontweight-semibold',
                        I18n.t('bitcoin_select', ctrl.scope())
                    ),
                    m('.fontcolor-secondary.fontsize-smallest.u-marginbottom-20',
                        I18n.t('bitcoin_info', ctrl.scope())
                    ),
                    m('img[width="50"][src=\'https://daks2k3a4ib2z.cloudfront.net/5849f4f0a275a2a744efd93e/5a33e8ac4bd421000199ac5b_bitcoin_PNG.png\']')
                ]),
            ]), 

            !ctrl.isSlip() && !ctrl.isBtc() ? m('#credit-card-section', [
                m.component(paymentCreditCard, args)
            ]) : !args.vm.isInternational() && ctrl.isSlip() ? m('#boleto-section', [
                m.component(paymentSlip, args)
            ]) : ctrl.isBtc() ? m('#bitcoin-section',
                m.component(paymentBtc, args)
            ) : ''
        ]);
    }
};

export default paymentForm;
