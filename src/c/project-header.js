import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectHighlight from './project-highlight';
import projectSidebar from './project-sidebar';
import projectHeaderTitle from './project-header-title';
import userContributionDetail from './user-contribution-detail';
import contributionVM from '../vms/contribution-vm';
import userVM from '../vms/user-vm';

const projectHeader = {
    oninit(vnode) {
        const project = vnode.attrs.project,
            currentUser = h.getUser();

        if (h.isProjectPage() && currentUser && !_.isUndefined(project())) {
            contributionVM
                .getUserProjectContributions(currentUser.user_id, project().project_id, ['paid', 'refunded', 'pending_refund'])
                .then(vnode.attrs.projectContributions);
        }

        return {
            projectContributions: vnode.attrs.projectContributions,
            showContributions: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        const project = vnode.attrs.project,
            rewardDetails = vnode.attrs.rewardDetails;
        const hasContribution = !_.isEmpty(vnode.state.projectContributions()) ? m('.card.card-terciary.u-radius.u-margintop-20', [
            m('.fontsize-small.u-text-center', [
                m('span.fa.fa-thumbs-up'),
                ' Você é apoiador deste projeto! ',
                m('a.alt-link[href=\'javascript:void(0);\']', {
                    onclick: vnode.state.showContributions.toggle
                }, 'Detalhes')
            ]),
            vnode.state.showContributions() ? m('.card.u-margintop-20',
                m('.w-row',
                    _.map(vnode.state.projectContributions(), contribution => m(userContributionDetail, {
                        contribution,
                        rewardDetails
                    }))
                )
            ) : ''
        ]) : '';

        return !_.isUndefined(project()) ? m('#project-header', [
            m(`.w-section.section-product.${project().mode}`),
            m(projectHeaderTitle, {
                project,
                children: hasContribution
            }),
            m('.w-section.project-main', [
                m('.w-container', [
                    m('.w-row.project-main', [
                        m('.w-col.w-col-8.project-highlight', m(projectHighlight, {
                            project
                        })),
                        m('.w-col.w-col-4', m(projectSidebar, {
                            project,
                            userDetails: vnode.attrs.userDetails
                        }))
                    ])
                ])
            ])
        ]) : m('');
    }
};

export default projectHeader;
