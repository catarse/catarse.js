import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';
import userSettings from '../c/user-settings';

const projectEditUserSettings = {
    oninit(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id)
        };
    },

    view(vnode) {
        return vnode.state.user() ? m(userSettings, {
            user: vnode.state.user(),
            userId: vnode.attrs.user_id,
            hideCreditCards: true,
            useFloatBtn: true,
            publishingUserSettings: true
        }) : m('div', h.loader());
    }
};

export default projectEditUserSettings;
