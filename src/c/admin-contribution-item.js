import m from 'mithril';
import h from '../h';
import adminProject from './admin-project';
import adminContribution from './admin-contribution';
import adminContributionUser from './admin-contribution-user';
import paymentStatus from './payment-status';

const adminContributionItem = {
    oninit() {
        return {
            itemBuilder: [{
                component: adminContributionUser,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminProject,
                wrapperClass: '.w-col.w-col-4'
            }, {
                component: adminContribution,
                wrapperClass: '.w-col.w-col-2'
            }, {
                component: paymentStatus,
                wrapperClass: '.w-col.w-col-2'
            }]
        };
    },
    view(vnode) {
        return m(
            '.w-row',
            _.map(vnode.state.itemBuilder, panel => m(panel.wrapperClass, [
                m(panel.component, {
                    item: vnode.attrs.item,
                    key: vnode.attrs.key
                })
            ]))
        );
    }
};

export default adminContributionItem;
