import m from 'mithril';

const bigInputCard = {
    view(vnode) {
        const cardClass = vnode.attrs.cardClass || '.w-row.u-marginbottom-30.card.card-terciary.padding-redactor-description.text.optional.project_about_html.field_with_hint';

        return m(cardClass, {style: (vnode.attrs.cardStyle||{})}, [
            m('div', [
                m('label.field-label.fontweight-semibold.fontsize-base', vnode.attrs.label),
                (vnode.attrs.label_hint ? m('label.hint.fontsize-smallest.fontcolor-secondary', vnode.attrs.label_hint) : '')
            ]),
            m('div', vnode.attrs.children)
        ]);
    }
};

export default bigInputCard;
