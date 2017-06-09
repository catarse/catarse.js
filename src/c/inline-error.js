import m from 'mithril';

const inlineError = {
    view(vnode) {
        return m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle', m('span', ` ${vnode.attrs.message}`));
    }
};

export default inlineError;
