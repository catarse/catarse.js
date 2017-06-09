import m from 'mithril';

const filterMain = {
    view(vnode) {
        const inputWrapperClass = vnode.attrs.inputWrapperClass || '.w-input.text-field.positive.medium',
            btnClass = vnode.attrs.btnClass || '.btn.btn-large.u-marginbottom-10';

        return m('.w-row', [
            m('.w-col.w-col-8', [
                m(`input${inputWrapperClass}[placeholder="${vnode.attrs.placeholder}"][type="text"]`, {
                    onchange: m.withAttr('value', vnode.attrs.vm),
                    value: vnode.attrs.vm()
                })
            ]),
            m('.w-col.w-col-4', [
                m(`input#filter-btn${btnClass}[type="submit"][value="Buscar"]`)
            ])
        ]);
    }
};

export default filterMain;
