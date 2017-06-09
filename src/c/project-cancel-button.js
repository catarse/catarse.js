/**
 * window.c.projectCancelButton component
 * A button showing modal to cancel online project
 */
import m from 'mithril';
import h from '../h';
import modalBox from '../c/modal-box';
import cancelProjectModalContent from '../c/cancel-project-modal-content';

const projectCancelButton = {
    oninit(vnode) {
        const displayCancelModal = h.toggleProp(false, true);
        return {
            displayCancelModal
        };
    },
    view(vnode) {
        return m('div', [
            (vnode.state.displayCancelModal() ? m(modalBox, {
                displayModal: vnode.state.displayCancelModal,
                content: [cancelProjectModalContent, { displayModal: vnode.state.displayCancelModal }]
            }) : ''),
            m('.w-row.before-footer',
              m('.w-col.w-col-12',
                m('.w-container',
                    m('button.btn.btn-cancel.btn-inline.btn-no-border.btn-small.btn-terciary.u-marginbottom-20.u-right.w-button', { onclick: vnode.state.displayCancelModal.toggle, style: { transition: 'all 0.5s ease 0s' } },
                        [
                            m('span.fa.fa-times-circle', ''),
                            m.trust('&nbsp;'),
                            'Cancelar projeto'
                        ]
                    )
                ))
            )
        ]);
    }
};

export default projectCancelButton;
