import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectVM from '../vms/project-vm';
import rewardVM from '../vms/reward-vm';
import projectHeader from '../c/project-header';
import projectTabs from '../c/project-tabs';
import projectMain from '../c/project-main';
import projectDashboardMenu from '../c/project-dashboard-menu';

const projectsShow = {
    oninit(vnode) {
        const { project_id, project_user_id } = vnode.attrs;

        if (project_id && !_.isNaN(Number(project_id))) {
            projectVM.init(project_id, project_user_id);
        } else {
            projectVM.getCurrentProject();
        }
        try{
            h.analytics.windowScroll({ cat: 'project_view', act: 'project_page_scroll', project: project_id?{ id: project_id, user_id: project_user_id }:null });
            h.analytics.event({ cat: 'project_view', act: 'project_page_view', project: project_id?{ id: project_id, user_id: project_user_id }:null }).call();
        }catch(e){console.error(e);}
    
        return projectVM;
    },
    view(vnode) {
        const project = vnode.state.currentProject;

        return m('.project-show', {
            config: vnode.state.setProjectPageTitle()
        }, project() ? [
            m(projectHeader, {
                project,
                rewardDetails: vnode.state.rewardDetails,
                userDetails: vnode.state.userDetails,
                projectContributions: vnode.state.projectContributions
            }),
            m(projectTabs, {
                project,
                rewardDetails: vnode.state.rewardDetails
            }),
            m(projectMain, {
                project,
                post_id: vnode.attrs.post_id,
                rewardDetails: vnode.state.rewardDetails,
                userDetails: vnode.state.userDetails,
                projectContributions: vnode.state.projectContributions
            }),
                (project() && project().is_owner_or_admin ? m(projectDashboardMenu, {
                    project
                }) : '')
        ] : h.loader());
    }
};

export default projectsShow;
