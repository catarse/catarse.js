/**
 * window.c.projectDeleteButton component
 * A button showing modal to delete draft project
 */
import m from 'mithril';
import h from '../h';
import modalBox from '../c/modal-box';
import deleteProjectModalContent from '../c/delete-project-modal-content';

const projectDeleteButton = {
    oninit(vnode) {
        const displayDeleteModal = h.toggleProp(false, true);
        return {
            displayDeleteModal
        };
    },
    view(vnode) {
        return m('div', [
            (vnode.state.displayDeleteModal() ? m(modalBox, {
                displayModal: vnode.state.displayDeleteModal,
                hideCloseButton: true,
                content: [deleteProjectModalContent, { displayDeleteModal: vnode.state.displayDeleteModal, project: vnode.attrs.project }]
            }) : ''),
            m('.before-footer',
              m('.w-container',
                m('a.btn.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button[href=\'javascript:void(0);\']', { onclick: vnode.state.displayDeleteModal.toggle, style: { transition: 'all 0.5s ease 0s' } },
                    [
                        m.trust('&nbsp;'),
                        'Deletar projeto ',
                        m('span.fa.fa-trash', ''
                    )
                    ]
                )
              )
            )]);
    }
};

export default projectDeleteButton;
