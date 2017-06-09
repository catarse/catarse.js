/**
 * window.c.root.ProjectsDashboard component
 * A root component to manage projects
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsDashboard">
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsDashboard = {
    oninit(vnode) {
        projectVM.init(vnode.attrs.project_id, vnode.attrs.project_user_id);

        return projectVM;
    },
    view(vnode) {
        const project = vnode.state.currentProject;

        return project().is_owner_or_admin ?
            m(projectDashboardMenu, { project }) : '';
    }
};

export default projectsDashboard;
