import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminItem = {
    oninit(vnode) {
        return {
            displayDetailBox: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        const item = vnode.attrs.item,
              listWrapper = vnode.attrs.listWrapper || {},
              selectedItem = (_.isFunction(listWrapper.isSelected) ?
                              listWrapper.isSelected(item.id) : false);


        return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', {
            class: (selectedItem ? 'card-alert' : '')
        },[
            m(vnode.attrs.listItem, {
                item,
                listWrapper: vnode.attrs.listWrapper,
                key: vnode.attrs.key
            }),
            m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', {
                onclick: vnode.state.displayDetailBox.toggle
            }),
            vnode.state.displayDetailBox() ? m(vnode.attrs.listDetail, {
                item,
                key: vnode.attrs.key
            }) : ''
        ]);
    }
};

export default adminItem;
