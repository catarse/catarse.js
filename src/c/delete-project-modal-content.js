/**
 * window.c.deleteProjectModalContent component
 * Render delete project modal
 *
 */
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';

const deleteProjectModalContent = {
    oninit(vnode) {
        let l = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);
        const deleteSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            confirmed = console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            check = console.warn("m.prop has been removed from mithril 1.0") || m.prop('');

        const deleteProject = () => {
            if (check() === 'deletar-rascunho') {
                const loaderOpts = models.deleteProject.postOptions({
                    _project_id: vnode.attrs.project.project_id
                });
                l = postgrest.loaderWithToken(loaderOpts);
                l.load().then(() => {
                    deleteSuccess(true);
                }).catch((err) => {
                    confirmed(false);
                    error('Erro ao deletar projeto. Por favor tente novamente.');
                    m.redraw();
                });
            } else {
                confirmed(false);
                error('Por favor, corrija os seguintes erros: para deletar definitivamente o projeto você deverá preencher "deletar-rascunho".');
            }
            return false;
        };

        return {
            deleteProject,
            confirmed,
            deleteSuccess,
            error,
            check
        };
    },
    view(vnode) {
        return m('div',
                 (vnode.state.deleteSuccess() ? '' : m('.modal-dialog-header',
                  m('.fontsize-large.u-text-center',
                      [
                          'Confirmar ',
                          m('span.fa.fa-trash',
                        ''
                      )
                      ]
                  )
                )),
                m('form.modal-dialog-content', { onsubmit: vnode.state.deleteProject },
                  (vnode.state.deleteSuccess() ? [m('.fontsize-base.u-margintop-30', 'Projeto deletado com sucesso. Clique no link abaixo para voltar a página inicial.'),
                      m(`a.btn.btn-inactive.btn-large.u-margintop-30[href='/pt/users/${h.getUser().user_id}/edit#projects']`, 'Voltar')
                  ] :
                  [
                      m('.fontsize-base.u-marginbottom-60',
                          [
                              'O projeto será deletado permanentemente e todos os dados que você preencheu na edição do rascunho não poderão ser recuperados.'
                          ]
                    ),
                      m('.fontsize-base.u-marginbottom-10',
                          [
                              'Confirme escrevendo ',
                              'no campo abaixo ',
                              m('span.fontweight-semibold.text-error',
                          'deletar-rascunho'
                        )
                          ]
                    ),
                      m('.w-form',
                      m('.text-error.u-marginbottom-10', vnode.state.error()),
                          [
                              m('div',
                          m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: vnode.state.confirmed() ? false : 'error', placeholder: 'deletar-rascunho', onchange: m.withAttr('value', vnode.state.check) })
                        )
                          ]
                    ),
                      m('div',
                      m('.w-row',
                          [
                              m('.w-col.w-col-3'),
                              m('.u-text-center.w-col.w-col-6',
                                  [
                                      m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Deletar para sempre\']'),
                                      m('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: vnode.attrs.displayDeleteModal.toggle }, 'Cancelar'
                              )
                                  ]
                          ),
                              m('.w-col.w-col-3')
                          ]
                      )
                    )
                  ])
                ));
    }
};

export default deleteProjectModalContent;
