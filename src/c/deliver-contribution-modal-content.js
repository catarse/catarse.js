/**
 * window.c.deliverContributionModalContent component
 * Render deliver contribution modal
 *
 */
import m from 'mithril';

const deliverContributionModalContent = {
    view(ctrl, args) {
        return m('div',

            m('.modal-dialog-header',
                m('.fontsize-large.u-text-center', [
                    m('span.fa.fa-check-circle',
                        ''
                    ),
                    ' Rewards on the way! Hurray !!!!'
                ])
            ),
            m('.modal-dialog-content', [
                m('p.fontsize-small.u-marginbottom-30', [
                    m('span.fontweight-semibold',
                        `You selected ${args.amount} Supports.`
                    ),
                    ' Upon your confirmation, supporters who have made these supports for your project will be notified that their rewards will be delivered soon.'
                ]),
                m('.w-form', [
                    m('form', [
                        m('.fontsize-smaller',
                            'If you want to add some information in this message, use the space below! It`s a great time to thank those people who believed in you!'
                        ),
                        m("textarea.height-mini.text-field.w-input[placeholder='Enter your message (optional)']", {
                            value: args.message(),
                            onchange: m.withAttr('value', args.message)
                        })
                    ]),
                ]),
                m('.w-row', [
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-10',
                        m('.fontsize-small.fontweight-semibold.u-marginbottom-20.u-text-center',
                            'Do you confirm that the rewards for the selected supports have been sent?'
                        )
                    ),
                    m('.w-col.w-col-1')
                ]),
                m('.w-row', [
                    m('.w-col.w-col-1'),
                    m('.w-col.w-col-5',
                        m('a.btn.btn-medium.w-button', {
                            onclick: () => args.updateStatus('delivered')
                        },
                            'Yes!'
                        )
                    ),
                    m('.w-col.w-col-5',
                        m('a.btn.btn-medium.btn-terciary.w-button', {
                            onclick: args.displayModal.toggle
                        },
                            'Come back'
                        )
                    ),
                    m('.w-col.w-col-1')
                ])
            ]));
    }
};

export default deliverContributionModalContent;
