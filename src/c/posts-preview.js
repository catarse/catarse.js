import m from 'mithril';
import h from '../h';

const postsPreview = {
    controller(args) {
        const togglePreview = () => {
                h.scrollTop();
                args.showPreview(false);
            },
            sendNotification = (e) => {
                e.preventDefault();

                const notificationData = {
                    title: args.title(),
                    comment_html: args.comment_html(),
                    reward_id: args.reward_id >= 1 ? args.reward_id : null,
                    recipients: args.reward_id >= 1 ? 'reward' : args.reward_id == '-1' ? 'public' : 'backers'
                };

                return m.request({
                    method: 'POST',
                    url: `/projects/${args.project_id}/posts.json`,
                    data: {
                        project_post: notificationData,
                        project: args.project_id
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    args.showSuccess(true);
                    args.comment_html('');
                    args.title('');
                    togglePreview();
                    m.redraw();
                }).catch((err) => {
                    args.errors('Error sending message.'),
                    args.showError(true);
                    m.redraw();
                });
            };
        return {
            sendNotification,
            togglePreview
        };
    },
    view(ctrl, args) {
        const comment_html = args.comment_html(),
            title = args.title(),
            recipientsText = args.reward_id > 1 ?
            m('.fontsize-small.u-marginbottom-30', [
                'The news above will be sent by email to the ',
                m('span.fontweight-semibold',
                    args.rewardText
                ),
                ' And it will stay ',
                m('span.fontweight-semibold',
                'Visible on the platform only for these supporters.'
                )
            ]) :
            args.reward_id === '-1' ?
            m('.fontsize-small.u-marginbottom-30', [
                'The news above will be  ',
                m('span.fontweight-semibold',
                    'sent by email to everyone'
                ),
                ' and will be ',
                m('span.fontweight-semibold',
                    'publicly visible '
                ),
                'on the platform.'
            ]) :
            m('.fontsize-small.u-marginbottom-30', [
                m('span', ' The news above will be  '),
                m('span.fontweight-semibold', 'sent by email to all supporters'),
                m('span', ' and it will stay '),
                m('span.fontweight-semibold' , 'visible only to those on the platform.')
            ]);

        return m('div', [

            m('.dashboard-header.u-text-center',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6',
                            m('.fontsize-larger.fontweight-semibold.lineheight-tight',
                                'Review your news before submitting!'
                            )
                        ),
                        m('.w-col.w-col-3')
                    ])
                )
            ),
            m('.section', [
                m('.w-container',
                    m('.card.u-marginbottom-60.u-radius.w-row', [
                        m('.w-col.w-col-1'),
                        m('.u-marginbottom-30.u-margintop-30.w-col.w-col-10.w-hidden-small.w-hidden-tiny', [
                            m('.fontcolor-secondary.fontsize-small.u-text-center',
                                '16/01/2017'
                            ),
                            m('.fontsize-larger.fontweight-semibold.u-marginbottom-30.u-text-center',
                                title
                            ),
                            m('.fontsize-base', m.trust(comment_html))
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ),
                m('.w-row', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6',
                        recipientsText
                    ),
                    m('.w-col.w-col-3')
                ]),
                m('.u-marginbottom-20.w-row', [
                    m('.w-col.w-col-3'),
                    m('._w-sub-col.w-col.w-col-4',
                        m('button.btn.btn-large', {
                            onclick: ctrl.sendNotification
                        }, [
                            m('span.fa.fa-paper-plane',
                                ''
                            ),
                            ' ',
                            m.trust('&nbsp;'),
                            'Send'
                        ])
                    ),
                    m('.w-col.w-col-2',
                        m('button.btn.btn-large.btn-terciary', {
                                onclick: ctrl.togglePreview
                            },
                            'Edit'
                        )
                    ),
                    m('.w-col.w-col-3')
                ])
            ])
        ]);
    }
};

export default postsPreview;
