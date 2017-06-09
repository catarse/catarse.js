import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentSlip = {
    oninit(vnode) {
        const vm = vnode.attrs.vm,
            slipPaymentDate = vm.getSlipPaymentDate(vnode.attrs.contribution_id),
            loading = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            completed = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);

        const buildSlip = () => {
            loading(true);
            m.redraw();
            vm.paySlip(vnode.attrs.contribution_id, vnode.attrs.project_id, error, loading, completed);

            return false;
        };

        return {
            buildSlip,
            slipPaymentDate,
            loading,
            completed,
            error
        };
    },
    view(vnode) {
        return m('.w-row',
                    m('.w-col.w-col-12',
                        m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                            m('.fontsize-small.u-marginbottom-20',
                                vnode.state.slipPaymentDate() ? `Esse boleto bancário vence no dia ${h.momentify(vnode.state.slipPaymentDate().slip_expiration_date)}.` : 'carregando...'
                            ),
                            m('.fontsize-small.u-marginbottom-40',
                                'Ao gerar o boleto, o realizador já está contando com o seu apoio. Pague até a data de vencimento pela internet, casas lotéricas, caixas eletrônicos ou agência bancária.'
                            ),
                            m('.w-row',
                                m('.w-col.w-col-8.w-col-push-2', [
                                    vnode.state.loading() ? h.loader() : vnode.state.completed() ? '' : m('input.btn.btn-large.u-marginbottom-20', {
                                        onclick: vnode.state.buildSlip,
                                        value: 'Imprimir Boleto',
                                        type: 'submit'
                                    }),
                                    vnode.state.error() ? m(inlineError, { message: vnode.state.error() }) : '',
                                    m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                        'Ao apoiar, você concorda com os ',
                                        m('a.alt-link[href=\'/pt/terms-of-use\']',
                                    'Termos de Uso '
                                ),
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

export default paymentSlip;
