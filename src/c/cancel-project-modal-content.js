/**
 * window.c.cancelProjectModalContent component
 * Render cancel project modal
 *
 */
import m from 'mithril';

const cancelProjectModalContent = {
    oninit(vnode) {
        const checkError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            check = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            showNextModal = () => {
                if (check() === 'cancelar-projeto') {
                    vnode.attrs.displayModal.toggle();
                    document.getElementById('send-message').style.display = 'block';
                } else {
                    checkError(true);
                }
                return false;
            };

        return {
            showNextModal,
            checkError,
            check
        };
    },

    view(vnode) {
        return m('form.cancel-project-modal.modal-dialog-content', { onsubmit: vnode.state.showNextModal },
            [
                m('.fontsize-small.u-marginbottom-20',
                    [
                        'Após o cancelamento, sua campanha constará na plataforma como "não financiada" e os seus apoiadores serão imediatamente reembolsados. ',
                        m('span.fontweight-semibold',
                                'Essa ação não poderá ser desfeita!'
                            ),
                        m('br'),
                        m('span.fontweight-semibold')
                    ]
                    ),
                m('.fontsize-small.u-marginbottom-10',
                    [
                        'Se você tem certeza que deseja cancelar seu projeto, confirme escrevendo ',
                        m('span.fontweight-semibold.text-error',
                                'cancelar-projeto '
                            ),
                        'no campo abaixo. Em seguida te pediremos para escrever uma mensagem aos seus apoiadores e seu projeto será então cancelado.',
                        m('span.fontweight-semibold.text-error')
                    ]
                    ),
                m('.w-form',
                    [
                        m('input.positive.text-field.u-marginbottom-40.w-input[maxlength=\'256\'][type=\'text\']', { class: !vnode.state.checkError() ? false : 'error', placeholder: 'cancelar-projeto', onchange: m.withAttr('value', vnode.state.check) })
                    ]
                    ),
                m('div',
                        m('.w-row',
                            [
                                m('.w-col.w-col-3'),
                                m('.u-text-center.w-col.w-col-6',
                                    [
                                        m('input.btn.btn-inactive.btn-large.u-marginbottom-20[type=\'submit\'][value=\'Próximo passo >\']'),
                                        m('a.fontsize-small.link-hidden-light[href=\'#\']', { onclick: vnode.attrs.displayModal.toggle },
                                            'Cancelar'
                                        )
                                    ]
                                ),
                                m('.w-col.w-col-3')
                            ]
                        )
                    )
            ]);
    }
};

export default cancelProjectModalContent;
