import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import projectRewardList from './project-reward-list';
import projectSuggestedContributions from './project-suggested-contributions';
import projectContributions from './project-contributions';
import projectAbout from './project-about';
import projectComments from './project-comments';
import projectPosts from './project-posts';

const projectMain = {
    oninit(vnode) {
        const hash = console.warn("m.prop has been removed from mithril 1.0") || m.prop(window.location.hash),
            displayTabContent = (project) => {
                const c_opts = {
                        project,
                        post_id: vnode.attrs.post_id
                    },
                    tabs = {
                        '#rewards': m('.w-col.w-col-12', m(projectRewardList, _.extend({}, {
                            rewardDetails: vnode.attrs.rewardDetails
                        }, c_opts))),
                        '#contribution_suggestions': m(projectSuggestedContributions, c_opts),
                        '#contributions': m(projectContributions, c_opts),
                        '#about': m(projectAbout, _.extend({}, {
                            rewardDetails: vnode.attrs.rewardDetails
                        }, c_opts)),
                        '#comments': m(projectComments, c_opts),
                        '#posts': m(projectPosts, _.extend({}, {
                            projectContributions: vnode.attrs.projectContributions,
                            userDetails: vnode.attrs.userDetails,
                        }, c_opts))
                    };

                if (_.isNumber(vnode.attrs.post_id) && !window.location.hash) {
                    window.location.hash = 'posts';
                }

                hash(window.location.hash);

                if (_.isEmpty(hash()) || hash() === '#_=_' || hash() === '#preview') {
                    return tabs['#about'];
                }

                return tabs[hash()];
            };

        h.redrawHashChange();

        return {
            displayTabContent,
            hash
        };
    },
    view(vnode) {
        return m('section.section[itemtype="http://schema.org/CreativeWork"]', [
            m(`${vnode.state.hash() !== '#contributions' ? '.w-container' : '.about-tab-content'}`, [
                m('.w-row', vnode.attrs.project() ? vnode.state.displayTabContent(vnode.attrs.project) : h.loader())
            ])
        ]);
    }
};

export default projectMain;
