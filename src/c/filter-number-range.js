import m from 'mithril';

const filterNumberRange = {
    view(vnode) {
        return m('.w-col.w-col-3.w-col-small-6', [
            m(`label.fontsize-smaller[for="${vnode.attrs.index}"]`, vnode.attrs.label),
            m('.w-row', [
                m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                    m(`input.w-input.text-field.positive[id="${vnode.attrs.index}"][type="text"]`, {
                        onchange: m.withAttr('value', vnode.attrs.first),
                        value: vnode.attrs.first()
                    })
                ]),
                m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                    m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')
                ]),
                m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [
                    m('input.w-input.text-field.positive[type="text"]', {
                        onchange: m.withAttr('value', vnode.attrs.last),
                        value: vnode.attrs.last()
                    })
                ])
            ])
        ]);
    }
};

export default filterNumberRange;
