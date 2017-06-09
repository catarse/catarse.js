import m from 'mithril';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutEdit from '../c/user-about-edit';

const projectEditUserAbout = {
    oninit(vnode) {
        return {
            user: userVM.fetchUser(vnode.attrs.user_id)
        };
    },

    view(vnode) {
        return vnode.state.user() ? m(userAboutEdit, {
            user: vnode.state.user(),
            userId: vnode.attrs.user_id,
            useFloatBtn: true,
            hideDisableAcc: true,
            hideCoverImg: true,
            hidePasswordChange: true,
            publishingUserAbout: true
        }) : m('div', h.loader());
    }
};

export default projectEditUserAbout;
