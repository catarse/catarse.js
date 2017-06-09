/**
 * window.c.ProjectSuccessfulOnboardConfirmAccountError component
 * render error form to collect user answer
 *
 * Example:
 * m.component(c.ProjectSuccessfulOnboardConfirmAccountError, {
 *    projectAccount: projectAccount,
 *    changeToAction: ctrl.changeToAction //provided by ProjectSuccessfulOnboardConfirmAccount controller
 * })
 **/
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'projects.successful_onboard.confirm_account.refuse');

const projectSuccessfulOnboardConfirmAccountError = {
    oninit(vnode) {
        const errorReasonM = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);

        const addErrorReason = () => {
            if (errorReasonM().trim() === '')	{
                return error(true);
            }
            return vnode.attrs.addErrorReason(errorReasonM).call();
        };

        return {
            addErrorReason,
            errorReasonM,
            error
        };
    },
    view(vnode) {
        return m('.w-row.bank-transfer-answer', [
            m('.w-col.w-col-6.w-col-push-3', [
                m('.w-form.bank-transfer-problem.card.u-radius', [
                    m('form#successful-onboard-error', [
                        m('a.w-inline-block.u-right.btn.btn-terciary.btn-no-border.btn-inline.fa.fa-close', { href: '#confirm_account', onclick: vnode.attrs.changeToAction('start') }),
                        m('label.field-label.fontweight-semibold.u-marginbottom-20', I18n.t('title', I18nScope())),
                        m('textarea.w-input.text-field', {
                            placeholder: I18n.t('placeholder', I18nScope()),
                            class: vnode.state.error() ? 'error' : '',
                            onfocus: () => vnode.state.error(false),
                            onchange: m.withAttr('value', vnode.state.errorReasonM)
                        }),
                        vnode.state.error() ? m('.w-row', [
                            m('.w-col.w-col-6.w-col-push-3.u-text-center', [
                                m('span.fontsize-smallest.text-error', 'Campo Obrigatório')
                            ])
                        ]) : '',
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4', [
                                m('a.w-button.btn.btn-medium', {
                                    href: '#confirm_account_refuse',
                                    onclick: vnode.state.addErrorReason
                                }, I18n.t('cta', I18nScope()))
                            ])
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default projectSuccessfulOnboardConfirmAccountError;
