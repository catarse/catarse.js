import m from 'mithril';
import h from '../h';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import popNotification from './pop-notification';
import projectGoogleContactImport from './project-google-contact-import';

const projectEmailInvite = {
    oninit(vnode) {
        const emailText = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            loading = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            project = vnode.attrs.project,
            showSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),

            submitInvite = () => {
                if (_.isEmpty(emailText()) || loading() === true) {
                } else {
                    loading(true);
                    const emailList = _.reduce(emailText().split('\n'), (memo, text) => {
                        if (h.validateEmail(text)) {
                            memo.push(text);
                        }
                        return memo;
                    }, []);

                    if (!_.isEmpty(emailList)) {
                        showSuccess(false);
                        postgrest.loaderWithToken(
                              models.inviteProjectEmail.postOptions({
                                  data: {
                                      project_id: project.project_id,
                                      emails: emailList
                                  }
                              })).load().then((data) => {
                                  emailText('');
                                  loading(false);
                                  showSuccess(true);
                              });
                    } else {
                        loading(false);
                    }
                }
            };

        return {
            emailText,
            submitInvite,
            loading,
            showSuccess
        };
    },
    view(vnode) {
        const project = vnode.attrs.project;

        return m('.email-invite-box', [
            (vnode.state.showSuccess() ? m(popNotification, { message: 'Convites enviados.' }) : ''),
            (vnode.state.loading() ? h.loader()
             : [
                 m('.w-form', [
                     m('form', [
                         m('.u-marginbottom-10', [
                             m(projectGoogleContactImport, {
                                 project,
                                 showSuccess: vnode.state.showSuccess
                             })
                         ]),
                         m('textarea.positive.text-field.w-input[maxlength="5000"][placeholder="Adicione um ou mais emails, separados por linha."]', {
                             onchange: m.withAttr('value', vnode.state.emailText),
                             value: vnode.state.emailText()
                         })
                     ])
                 ]),
                 m('.u-text-center', [
                     m('a.btn.btn-inline.btn-medium.w-button[href="javascript:void(0)"]', {
                         onclick: vnode.state.submitInvite
                     }, 'Enviar convites')
                 ])
             ])
        ]);
    }
};

export default projectEmailInvite;
