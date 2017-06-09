import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectBudgetEdit from '../c/project-budget-edit';

const projectEditBudget = {
    oninit(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id),
            project: projectVM.fetchProject(vnode.attrs.project_id)
        };
    },

    view(vnode) {
        return vnode.state.user() && vnode.state.project() ? m(projectBudgetEdit, {
            user: vnode.state.user(),
            userId: vnode.attrs.user_id,
            projectId: vnode.attrs.project_id,
            project: vnode.state.project()
        }) : m('div', h.loader());
    }
};

export default projectEditBudget;
