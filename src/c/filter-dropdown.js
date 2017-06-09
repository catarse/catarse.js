import m from 'mithril';
import dropdown from './dropdown';

const filterDropdown = {
    view(vnode) {
        const wrapper_c = vnode.attrs.wrapper_class || '.w-col.w-col-3.w-col-small-6';
        return m(wrapper_c, [
            m(`label.fontsize-smaller[for="${vnode.attrs.index}"]`,
              (vnode.attrs.custom_label ? m(vnode.attrs.custom_label[0], vnode.attrs.custom_label[1]) : vnode.attrs.label)),
            m(dropdown, {
                id: vnode.attrs.index,
                onchange: _.isFunction(vnode.attrs.onchange) ? vnode.attrs.onchange : Function.prototype,
                classes: '.w-select.text-field.positive',
                valueProp: vnode.attrs.vm,
                options: vnode.attrs.options
            })
        ]);
    }
};

export default filterDropdown;
