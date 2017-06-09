/**
 * window.c.projectReport component
 * Render project report form
 *
 */
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectVM from '../vms/project-vm';

const projectReport = {
    oninit(vnode) {
        let displayForm = h.toggleProp(false, true),
            sendSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            submitDisabled = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            user = h.getUser() || {},
            email = console.warn("m.prop has been removed from mithril 1.0") || m.prop(user.email),
            details = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            reason = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            l = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            storeReport = 'report',
            project = projectVM.currentProject(),
            hasPendingAction = project && (h.callStoredAction(storeReport) == project.project_id),
            checkLogin = () => {
                if (!_.isEmpty(user)) {
                    displayForm.toggle();
                } else {
                    h.storeAction(storeReport, project.project_id);
                    return h.navigateToDevise();
                }
            },
            sendReport = () => {
                submitDisabled(true);
                const loaderOpts = models.projectReport.postOptions({
                    email: email(),
                    details: details(),
                    reason: reason(),
                    project_id: project.project_id
                });
                l = postgrest.loaderWithToken(loaderOpts);

                l.load().then(sendSuccess(true));
                submitDisabled(false);
                return false;
            },
            checkScroll = (el, isInit) => {
                if (!isInit && hasPendingAction) {
                    h.animateScrollTo(el);
                }
            };


        if (!_.isEmpty(user) && hasPendingAction) {
            displayForm(true);
        }

        return {
            checkScroll,
            checkLogin,
            displayForm,
            sendSuccess,
            submitDisabled,
            sendReport,
            user,
            email,
            details,
            reason
        };
    },

    view(vnode) {
        const user = vnode.state.user;

        return m('.card.card-terciary.u-radius',
            [
                m('.fontsize-small.u-marginbottom-20',
                    [
                        'Este projeto desrespeita',
                        m.trust('&nbsp;'),
                        m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638\'][target=\'_blank\']',
                            'nossas regras? '
                          )
                    ]
                      ),
                vnode.state.sendSuccess() ?
                       m('.w-form',
                        m('p',
                          'Obrigado! A sua denúncia foi recebida.'
                        )
                      ) :
                [
                    m('.a.w-button.btn.btn-medium.btn-terciary.btn-inline[href=\'javascript:void(0);\']', { onclick: vnode.state.checkLogin },
                        'Denunciar este projeto'
                      ),
                    vnode.state.displayForm() ? m('#report-form.u-margintop-30',
                        m('.w-form',
                          m('form', { onsubmit: vnode.state.sendReport, config: vnode.state.checkScroll },
                              [
                                  m('.fontsize-small.fontweight-semibold.u-marginbottom-10',
                                'Por que você está denunciando este projeto?'
                              ),
                                  m('select.w-select.text-field.positive[required=\'required\']', { onchange: m.withAttr('value', vnode.state.reason) },
                                      [
                                          m('option[value=\'\']',
                                    'Selecione um motivo'
                                  ),
                                          m('option[value=\'Violação de propriedade intelectual\']',
                                    'Violação de propriedade intelectual'
                                  ),
                                          m('option[value=\'Calúnia, injúria, difamação ou discriminação\']',
                                    'Calúnia, injúria, difamação ou discriminação'
                                  ),
                                          m('option[value=\'Escopo de projeto proibido\']',
                                    'Escopo de projeto proibido'
                                  ),
                                          m('option[value=\'Recompensas proibidas\']',
                                    'Recompensas proibidas'
                                  ),
                                          m('option[value=\'Cenas de sexo explícitas e gratuitas\']',
                                    'Cenas de sexo explícitas e gratuitas'
                                  ),
                                          m('option[value=\'Abuso de SPAM\']',
                                    'Abuso de SPAM'
                                  ),
                                          m('option[value=\'Outros\']',
                                    'Outros'
                                  )
                                      ]
                              ),
                                  m('textarea.w-input.text-field.positive.u-marginbottom-30', { placeholder: 'Por favor, dê mais detalhes que nos ajudem a identificar o problema', onchange: m.withAttr('value', vnode.state.details) }),
                                  m('input.w-button.btn.btn-medium.btn-inline.btn-dark[type=\'submit\'][value=\'Enviar denúncia\']', { disabled: vnode.state.submitDisabled() })
                              ]
                          )
                        )
                      ) : '']

            ]
                  );
    }
};

export default projectReport;
