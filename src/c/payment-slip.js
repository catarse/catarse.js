import m from 'mithril';
import I18n from 'i18n-js';
import h from '../h';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit.errors');

const paymentSlip = {
    controller(args) {
        const vm = args.vm,
            slipPaymentDate = vm.getSlipPaymentDate(args.contribution_id),
            loading = m.prop(false),
            error = m.prop(false),
            completed = m.prop(false);

        const buildSlip = () => {
            loading(true);
            m.redraw();
            vm.paySlip(args.contribution_id, args.project_id, error, loading, completed);

            return false;
        };

        return {
            buildSlip: buildSlip,
            slipPaymentDate: slipPaymentDate,
            loading: loading,
            completed: completed,
            error: error
        };
    },
    view(ctrl, args) {
        return m('.w-row',
                    m('.w-col.w-col-12',
                        m('.u-margintop-30.u-marginbottom-60.u-radius.card-big.card', [
                            m('.fontsize-small.u-marginbottom-20',
                                ctrl.slipPaymentDate() ? `This bank slip expires on ${h.momentify(ctrl.slipPaymentDate().slip_expiration_date)}.` : 'Loading...'
                            ),
                            m('.fontsize-small.u-marginbottom-40',
                                'In generating the ticket, the director is already counting on his support. Pay through the internet due date, lottery houses, ATMs or bank branch.'
                            ),
                            m('.w-row',
                                m('.w-col.w-col-8.w-col-push-2', [
                            ctrl.loading() ? h.loader() : ctrl.completed() ? '' : m('input.btn.btn-large.u-marginbottom-20',{
                                onclick: ctrl.buildSlip,
                                value: 'Print Ticket',
                                type: 'submit'
                            }),
                            ctrl.error() ? m.component(inlineError, {message: ctrl.error()}) : '',
                            m('.fontsize-smallest.u-text-center.u-marginbottom-30', [
                                'By supporting, you agree with the ',
                                m('a.alt-link[href=\'/en/terms-of-use\']',
                                    'Terms of use '
                                ),
                                'e ',
                                m('a.alt-link[href=\'/en/privacy-policy\']',
                                    'privacy policy'
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
