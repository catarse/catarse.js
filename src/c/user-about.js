import m from 'mithril';
import h from '../h';
import userCard from '../c/user-card';
import userVM from '../vms/user-vm';
import inlineError from './inline-error';

const userAbout = {
    oninit(vnode) {
        const userDetails = console.warn("m.prop has been removed from mithril 1.0") || m.prop({}),
            loader = console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            user_id = vnode.attrs.userId;

        userVM.fetchUser(user_id, true, userDetails).then(() => {
            loader(false);
        }).catch((err) => {
            error(true);
            loader(false);
            m.redraw();
        });

        return {
            userDetails,
            error,
            loader
        };
    },
    view(vnode) {
        const user = vnode.state.userDetails();
        return vnode.state.error() ? m(inlineError, { message: 'Erro ao carregar dados.' }) : vnode.state.loader() ? h.loader() : m('.content[id=\'about-tab\']',
            m('.w-container[id=\'about-content\']',
                m('.w-row',
                    [
                        m('.w-col.w-col-8',
                            m('.fontsize-base', user.about_html ? m.trust(user.about_html) : '')
                        ),
                        m('.w-col.w-col-4',
                            (user.id ? m(userCard, { userId: user.id }) : h.loader)
                        )
                    ]
                )
            )
        );
    }
};

export default userAbout;
