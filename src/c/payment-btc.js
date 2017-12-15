import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';
import inlineError from './inline-error';
import projectVM from '../vms/project-vm';
import commonPaymentVM from '../vms/common-payment-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentBtc = {
    controller(args) {
        const vm = args.vm,
            loading = m.prop(false),
            error = m.prop(false),
            completed = m.prop(false);

        const buildPayment = () => {
            loading(true);
            m.redraw();
            vm.payBtc(args.contribution_id, args.project_id, error, loading, completed);

            return false;
        };

        return {
            buildPayment,
            loading,
            completed,
            error
        };
    },
    view(ctrl, args) {
        return m('.w-row',
                    m('.w-col.w-col-12',
                        m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                            m('.w-row',
                                m('.w-col.w-col-8.w-col-push-2', [
                                    ctrl.loading() ? h.loader() : ctrl.completed() ? '' : m('input.btn.btn-large.u-marginbottom-20', {
                                        onclick: ctrl.buildPayment,
                                        value: 'Finalizar pagamento',
                                        type: 'submit'
                                    }),
                                    ctrl.error() ? m.component(inlineError, { message: ctrl.error() }) : '',
                                    m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                        'Ao apoiar, você concorda com os ',
                                        m('a.alt-link[href=\'/pt/terms-of-use\']',
                                    'Termos de Uso '
                                ),
                                (projectVM.isSubscription() ?
                                m('a.alt-link[href=\'https://suporte.catarse.me/hc/pt-br/articles/115005588243\'][target=\'_blank\']', ', Regras do Catarse Assinaturas ')
                                : ''),
                                        'e ',
                                        m('a.alt-link[href=\'/pt/privacy-policy\']',
                                    'Política de Privacidade'
                                )
                                    ])
                                ])
                    )
                        ])
            )
        );
    }
};

export default paymentBtc;
