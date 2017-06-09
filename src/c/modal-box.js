/**
 * window.c.ModalBox component
 * Buils the template for using modal
 *
 * Example:
 * m.component(c.ModalBox, {
 *     displayModal: tooglePropObject,
 *     content: ['ComponentName', {argx: 'x', argy: 'y'}]
 * })
 * ComponentName structure =>  m('div', [
 *                  m('.modal-dialog-header', []),
 *                  m('.modal-dialog-content', []),
 *                  m('.modal-dialog-nav-bottom', []),
 *              ])
 */
import m from 'mithril';

const modalBox = {
    view(vnode) {
        return m('.modal-backdrop', [
            m('.modal-dialog-outer', [
                m('.modal-dialog-inner.modal-dialog-small', [
                    m(`a.w-inline-block.fa.fa-lg.modal-close${vnode.attrs.hideCloseButton ? '' : '.fa-close'}[href="javascript:void(0);"]`, {
                        onclick: vnode.attrs.displayModal.toggle
                    }),
                    m(vnode.attrs.content[0], vnode.attrs.content[1])
                ]),
            ])
        ]);
    }
};

export default modalBox;
