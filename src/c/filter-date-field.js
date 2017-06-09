import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const filterDateField = {
    oninit(vnode) {
        return {
            dateFieldMask: _.partial(h.mask, '99/99/9999')
        };
    },
    view(vnode) {
        return m('.w-col.w-col-3.w-col-small-6', [
            m(`label.fontsize-smaller[for="${vnode.attrs.index}"]`, vnode.attrs.label),
            m(`input.w-input.text-field.positive[id="${vnode.attrs.index}"][type="text"]`, {
                onkeydown: m.withAttr('value', _.compose(vnode.attrs.vm, vnode.state.dateFieldMask)),
                value: vnode.attrs.vm()
            })
        ]);
    }
};

export default filterDateField;
