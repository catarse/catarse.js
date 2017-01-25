import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import userVM from '../vms/user-vm';
import models from '../models';
import h from '../h';
import quickProjectList from '../c/quick-project-list';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'layouts');
const menuProfile = {
    controller(args) {
        const contributedProjects = m.prop(),
            latestProjects = m.prop([]),
            userDetails = m.prop({}),
            user_id = args.user.user_id;

        const userName = () => {
            const name = userDetails().name;
            if (name && !_.isEmpty(name)) {
                return _.first(name.split(' '));
            }

            return '';
        };

        userVM.fetchUser(user_id, true, userDetails);

        return {
            contributedProjects: contributedProjects,
            latestProjects: latestProjects,
            userDetails: userDetails,
            userName: userName,
            toggleMenu: h.toggleProp(false, true)
        };
    },
    view(ctrl, args) {
        const user = ctrl.userDetails();

        return m(`.w-dropdown.user-profile`,
            [
                m(`a.w-dropdown-toggle.dropdown-toggle[href='javascript:void()'][id='user-menu']`,
                    {
                        onclick: ctrl.toggleMenu.toggle
                    },
                    [
                        m('.user-name-menu', ctrl.userName()),
                        m(`img.user-avatar[alt='Thumbnail - ${user.name}'][height='40'][src='${h.useAvatarOrDefault(user.profile_img_thumbnail)}'][width='40']`)
                    ]
                ),
                ctrl.toggleMenu() ? m(`nav.w-dropdown-list.dropdown-list.user-menu.w--open[id='user-menu-dropdown']`, {style: 'display:block;'},
                    [
                        m(`.w-row`,
                            [
                                m(`.w-col.w-col-12`,
                                    [
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            I18n.t('user.my_history', I18nScope())
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`,
                                            [
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#contributions']`,
                                                        I18n.t('user.support_history', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                  m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#projects']`,
                                                      I18n.t('user.projects_created', I18nScope())
                                                   )
                                                 ),
                                                m(`li.w-hidden-main.w-hidden-medium.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#projects']`,
                                                        I18n.t('user.projects_created', I18nScope())
                                                    )
                                                )
                                            ]
                                        ),
                                        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            I18n.t('user.settings', I18nScope())
                                        ),
                                        m(`ul.w-list-unstyled.u-marginbottom-20`,
                                            [
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#about_me']`,
                                                        I18n.t('user.about_you', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#notifications']`,
                                                        I18n.t('user.notifications', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#settings']`,
                                                        I18n.t('user.data_address', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}/edit#billing']`,
                                                        I18n.t('user.bank_cards', I18nScope())
                                                    )
                                                )
                                            ]
                                        ),
                                        m('.divider.u-marginbottom-20'),
                                        args.user.is_admin_role ? m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                            `Admin`
                                        ) : '',
                                        args.user.is_admin_role ? m(`ul.w-list-unstyled.u-marginbottom-20`,
                                            [
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/new-admin#/users']`,
                                                        I18n.t('user.users', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/new-admin']`,
                                                        I18n.t('user.support', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/admin/financials']`,
                                                        I18n.t('user.financial_rel', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/admin/projects']`,
                                                        I18n.t('user.admin_projects', I18nScope())
                                                    )
                                                ),
                                                m(`li.lineheight-looser`,
                                                    m(`a.alt-link.fontsize-smaller[href='/en/dbhero']`,
                                                        `Dataclips`
                                                    )
                                                )
                                            ]
                                        ) : '',
                                        m('.fontsize-mini', I18n.t('user.email_text', I18nScope())),
                                        m('.fontsize-smallest.u-marginbottom-20', [
                                            m('span.fontweight-semibold',`${user.email} `),
                                            m(`a.alt-link[href='/en/users/${user.id}/edit#settings']`, I18n.t('user.change_email', I18nScope()))
                                        ]),
                                        m('.divider.u-marginbottom-20'),
                                        m(`a.alt-link[href='/en/logout']`,
                                            I18n.t('user.logout', I18nScope())
                                        )
                                    ]
                                ),
                                //m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                //    [
                                //        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                //            `Projetos apoiados`
                                //        ),
                                //        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.contributedProjects() ?
                                //            _.isEmpty(ctrl.contributedProjects) ? 'Nenhum projeto.' :
                                //            m.component(quickProjectList, {
                                //                projects: m.prop(_.map(ctrl.contributedProjects(), (contribution) => {
                                //                    return {
                                //                        project_id: contribution.project_id,
                                //                        project_user_id: contribution.project_user_id,
                                //                        thumb_image: contribution.project_img,
                                //                        video_cover_image: contribution.project_img,
                                //                        permalink: contribution.permalink,
                                //                        name: contribution.project_name
                                //                    };
                                //                })),
                                //                loadMoreHref: '/pt/users/${user.id}/edit#contributions',
                                //                ref: 'user_menu_my_contributions'
                                //            }) : 'carregando...'
                                //        )
                                //    ]
                                //),
                                //m(`.w-col.w-col-4.w-hidden-small.w-hidden-tiny`,
                                //    [
                                //        m(`.fontweight-semibold.fontsize-smaller.u-marginbottom-10`,
                                //            `Projetos criados`
                                //        ),
                                //        m(`ul.w-list-unstyled.u-marginbottom-20`, ctrl.latestProjects() ?
                                //            _.isEmpty(ctrl.latestProjects) ? 'Nenhum projeto.' :
                                //            m.component(quickProjectList, {
                                //                projects: ctrl.latestProjects,
                                //                loadMoreHref: '/pt/users/${user.id}/edit#contributions',
                                //                ref: 'user_menu_my_projects'
                                //            }) : 'carregando...'
                                //        )
                                //    ]
                                //)
                            ]
                        )
                    ]
                ) : ''
            ]
        );
    }
};

export default menuProfile;
