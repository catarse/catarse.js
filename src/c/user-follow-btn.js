/*
 * UserFollowBtn - Component
 * Handles with follow / unfollow actions to an user
 *
 * Example:
 * m.component(c.UserFollowBtn, {follow_id: 10, following: false})
 */

import m from 'mithril';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';

const UserFollowBtn = {
    oninit(vnode) {
        const following = console.warn("m.prop has been removed from mithril 1.0") || m.prop((vnode.attrs.following || false)),
            followVM = postgrest.filtersVM({ follow_id: 'eq' }),
            loading = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            hover = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            userFollowInsert = models.userFollow.postOptions({
                follow_id: vnode.attrs.follow_id }),
            userFollowDelete = (() => {
                followVM.follow_id(vnode.attrs.follow_id);

                return models.userFollow.deleteOptions(
                      followVM.parameters());
            })(),
            follow = () => {
                const l = postgrest.loaderWithToken(userFollowInsert);
                loading(true);

                l.load().then(() => {
                    following(true);
                    loading(false);
                });
            },
            unfollow = () => {
                const l = postgrest.loaderWithToken(userFollowDelete);
                loading(true);

                l.load().then(() => {
                    following(false);
                    loading(false);
                });
            };

        return {
            following,
            follow,
            unfollow,
            loading,
            hover
        };
    },
    view(vnode) {
        if (h.userSignedIn() && h.getUserID() != vnode.attrs.follow_id) {
            let disableClass = vnode.attrs.disabledClass || '.w-button.btn.btn-medium.btn-terciary.u-margintop-20',
                enabledClass = vnode.attrs.enabledClass || '.w-button.btn.btn-medium.u-margintop-20';
            if (vnode.state.loading()) { return h.loader(); }
            if (vnode.state.following()) {
                return m(`a${enabledClass}`,
                    {
                        onclick: vnode.state.unfollow,
                        onmouseover: () => vnode.state.hover(true),
                        onmouseout: () => vnode.state.hover(false)
                    },
                         (vnode.state.hover() ? 'Deixar de seguir' : 'Seguindo'));
            }
            return m(`a${disableClass}`,
                         { onclick: vnode.state.follow },
                         'Seguir');
        }
        return m('');
    }
};

export default UserFollowBtn;
