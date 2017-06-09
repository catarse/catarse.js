import m from 'mithril';

const bigCard = {
    view(vnode) {
        const cardClass = '.card.medium.card-terciary.u-marginbottom-30';

        return m(cardClass, [
            m('div.u-marginbottom-30', [
                m('label.fontweight-semibold.fontsize-base', vnode.attrs.label),
                (vnode.attrs.label_hint ? m('.fontsize-small', vnode.attrs.label_hint) : '')
            ]),
            m('div', vnode.attrs.children)
        ]);
    }
}

export default bigCard;
