import m from 'mithril';

const inputCard = {
    view(vnode) {
        const cardClass = vnode.attrs.cardClass || '.w-row.u-marginbottom-30.card.card-terciary',
            onclick = vnode.attrs.onclick || Function.prototype;

        return m(cardClass, { onclick }, [
            m('.w-col.w-col-5.w-sub-col', [
                m('label.field-label.fontweight-semibold', vnode.attrs.label),
                (vnode.attrs.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', vnode.attrs.label_hint) : '')
            ]),
            m('.w-col.w-col-7.w-sub-col', vnode.attrs.children)
        ]);
    }
};

export default inputCard;
