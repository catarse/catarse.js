import m from 'mithril';
import _ from 'underscore';

const dropdown = {
    view(vnode) {
        const opts = (_.isFunction(vnode.attrs.options) ? vnode.attrs.options() : vnode.attrs.options);

        return m(
            `select${vnode.attrs.classes}[id="${vnode.attrs.id}"]`,
            {
                onchange: (e) => { vnode.attrs.valueProp(e.target.value); vnode.attrs.onchange(); },
                value: vnode.attrs.valueProp()
            },
            _.map(opts, data => m(`option[value="${data.value}"]`, data.option))
        );
    }
};

export default dropdown;
