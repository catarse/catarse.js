import m from 'mithril';
import projectsShow from '../root/projects-show';

const projectPreview = {
    view(ctrl, args) {
        return m('div', [
            m('.u-text-center',
                m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-8.w-col-push-2', [
                            m('.fontweight-semibold.fontsize-large.u-margintop-40',
                                'It`s time for feedbacks!'
                            ),
                            m('p.fontsize-base',
                                'Share the link below with your friends and take the time to make fine adjustments to help with your campaign.'
                            ),
                            m('.w-row.u-marginbottom-30', [
                                m('.w-col.w-col-3'),
                                m('.w-col.w-col-6',
                                    m(`input.w-input.text-field[type='text'][value='http://www.grasruts.com/${args.permalink}']`)
                                ),
                                m('.w-col.w-col-3')
                            ])
                        ]),
                        m('.w-col.w-col-2')
                    ])
                )
            ),
            m(projectsShow, args)
        ]);
    }
};

export default projectPreview;
