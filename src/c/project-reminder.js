/**
 * window.c.ProjectReminder component
 * A component that displays a clickable project reminder element.
 * The component can be of two types: a 'link' or a 'button'
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectReminder, {project: project, type: 'button'})
 *  }
 */
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import popNotification from './pop-notification';

const projectReminder = {
    oninit(vnode) {
        let l = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);
        const project = vnode.attrs.project,
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            storeReminderName = 'reminder',
            popNotification = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            submitReminder = () => {
                if (!h.getUser()) {
                    h.storeAction(storeReminderName, project().project_id);
                    return h.navigateToDevise();
                }
                const loaderOpts = project().in_reminder ? models.projectReminder.deleteOptions(filterVM.parameters()) : models.projectReminder.postOptions({
                    project_id: project().project_id
                });
                l = postgrest.loaderWithToken(loaderOpts);

                l.load().then(() => {
                    project().in_reminder = !project().in_reminder;

                    if (project().in_reminder) {
                        popNotification(true);
                        setTimeout(() => {
                            popNotification(false);
                            m.redraw();
                        }, 5000);
                    } else {
                        popNotification(false);
                    }
                });
            };

        if (h.callStoredAction(storeReminderName) == project().project_id) {
            submitReminder();
        }

        filterVM.project_id(project().project_id);

        return {
            l,
            submitReminder,
            popNotification
        };
    },
    view(vnode) {
        const mainClass = (vnode.attrs.type === 'button') ? '' : '.u-text-center.u-marginbottom-30',
            buttonClass = (vnode.attrs.type === 'button') ? 'w-button btn btn-terciary btn-no-border' : 'btn-link link-hidden fontsize-large',
            hideTextOnMobile = vnode.attrs.hideTextOnMobile || false,
            project = vnode.attrs.project,
            onclickFunc = h.analytics.event({ cat: 'project_view', act: 'project_floatingreminder_click', project: project() }, vnode.state.submitReminder);

        return m(`#project-reminder${mainClass}`, [
            m('a.btn.btn-small.btn-terciary.w-hidden-main.w-hidden-medium[data-ix=\'popshare\'][href=\'#\']', {
                onclick: onclickFunc
            },

              (project().in_reminder ? [
                  m('span.fa.fa-heart'),
                  ' Lembrete ativo'
              ] : [
                  m('span.fa.fa-heart-o'),
                  ' Lembrar-me'
              ])
            ),

            m(`button[class="w-hidden-small w-hidden-tiny ${buttonClass} ${(project().in_reminder ? 'link-hidden-success' : 'fontcolor-secondary')} fontweight-semibold"]`, {
                onclick: onclickFunc
            }, [
                (vnode.state.l() ? h.loader() : (project().in_reminder ? m('span.fa.fa-heart') : m('span.fa.fa-heart-o')))
            ]), (vnode.state.popNotification() ? m(popNotification, {
                message: 'Ok! Vamos te mandar um lembrete por e-mail 48 horas antes do fim da campanha'
            }) : '')
        ]);
    }
};

export default projectReminder;
