import m from 'mithril';
import h from '../h';
import adminUser from './admin-user';

const adminUserItem = {
    view(vnode) {
        return m(
            '.w-row', [
                m('.w-col.w-col-4', [
                    m(adminUser, vnode.attrs)
                ])
            ]
        );
    }
};

export default adminUserItem;
