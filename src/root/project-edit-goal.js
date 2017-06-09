import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import projectVM from '../vms/project-vm';
import projectGoalEdit from '../c/project-goal-edit';

const projectEditGoal = {
    oninit(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id),
            project: projectVM.fetchProject(vnode.attrs.project_id)
        };
    },

    view(vnode) {
        return vnode.state.user() && vnode.state.project() ? m(projectGoalEdit, {
            user: vnode.state.user(),
            userId: vnode.attrs.user_id,
            projectId: vnode.attrs.project_id,
            project: vnode.state.project()
        }) : m('div', h.loader());
    }
};

export default projectEditGoal;
