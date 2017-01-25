/**
 * window.c.deleteProjectModalContent component
 * Render delete project modal
 *
 */
import m from 'mithril';
import h from '../h';
import models from '../models';
import postgrest from 'mithril-postgrest';

const deleteProjectModalContent = {
    controller(args) {
        let l = m.prop(false),
            deleteSuccess = m.prop(false),
            confirmed = m.prop(true),
            error = m.prop(''),
            check = m.prop('');

        const deleteProject = () => {
            if (check() === 'Delete-draft'){
                let loaderOpts = models.deleteProject.postOptions({
                    _project_id: args.project.project_id
                });
                l = postgrest.loaderWithToken(loaderOpts);
                l.load().then(() => {
                  deleteSuccess(true);
                }).catch(err => {
                  confirmed(false);
                  error('Error deleting project. Please try again.');
                  m.redraw();
            });;

            } else {
                confirmed(false);
                error('Please correct the following errors: To permanently delete the project you must fill in "delete-draft".');
            }
            return false;
        };

        return {
            deleteProject: deleteProject,
            confirmed: confirmed,
            deleteSuccess: deleteSuccess,
            error: error,
            check: check
        };
    },
    view(ctrl, args) {
        const project = args.project;
        return m('div',
                 (ctrl.deleteSuccess() ?  '' : m('.modal-dialog-header',
                  m('.fontsize-large.u-text-center',
                    [
                      'Confirm ',
                      m('span.fa.fa-trash',
                        ''
                      )
                    ]
                  )
                )),
                m('form.modal-dialog-content',{onsubmit: ctrl.deleteProject},
                  (ctrl.deleteSuccess() ? [m('.fontsize-base.u-margintop-30', 'Project deleted successfully. Click the link below to return to the homepage.'),
                      m(`a.btn.btn-inactive.btn-large.u-margintop-30[href='/en/users/${h.getUser().user_id}/edit#projects']`, 'Resume')
                  ] :
                  [
                    m('.fontsize-base.u-marginbottom-60',
                      [
                        'The project will be permanently deleted and all data you filled in the draft edition will not be retrieved.'
                      ]
                    ),
                    m('.fontsize-base.u-marginbottom-10',
                      [
                        'Confirm writing ',
                        'In the field below',
                        m('span.fontweight-semibold.text-error',
                          ' Delete-draft'
                        )
                      ]
                    ),
                    m('.w-form',
                      m('.text-error.u-marginbottom-10', ctrl.error()),
                      [
                        m('div',
                          m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', {class: ctrl.confirmed() ? false : 'error', placeholder: 'Delete-draft', onchange: m.withAttr('value', ctrl.check)})
                        )
                      ]
                    ),
                    m('div',
                      m('.w-row',
                        [
                          m('.w-col.w-col-3'),
                          m('.u-text-center.w-col.w-col-6',
                            [
                              m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Delete forever\']'),
                              m('a.fontsize-small.link-hidden-light[href=\'#\']', {onclick: args.displayDeleteModal.toggle}, 'Cancel'
                              )
                            ]
                          ),
                          m('.w-col.w-col-3')
                        ]
                      )
                    )
                  ])
                )) ;
    }
};

export default deleteProjectModalContent;
