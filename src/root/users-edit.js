import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import userHeader from '../c/user-header';
import userCreated from '../c/user-created';
import userAboutEdit from '../c/user-about-edit';
import userPrivateContributed from '../c/user-private-contributed';
import userSettings from '../c/user-settings';
import userNotifications from '../c/user-notifications';
import userBalanceMain from '../c/user-balance-main';

const usersEdit = {
    oninit(vnode) {
        const userDetails = console.warn("m.prop has been removed from mithril 1.0") || m.prop({}),
            userId = vnode.attrs.user_id.split('-')[0],
            hash = console.warn("m.prop has been removed from mithril 1.0") || m.prop(window.location.hash),
            displayTabContent = (user) => {
                const tabs = {
                    '#projects': m(userCreated, {
                        userId,
                        showDraft: true
                    }),
                    '#contributions': m(userPrivateContributed, {
                        userId,
                        user
                    }),
                    '#about_me': m(userAboutEdit, {
                        userId,
                        user
                    }),
                    '#settings': m(userSettings, {
                        userId,
                        user
                    }),
                    '#notifications': m(userNotifications, {
                        userId,
                        user
                    }),
                    '#balance': m(userBalanceMain, {
                        user_id: userId,
                        userId,
                        user
                    })
                };

                hash(window.location.hash);

                if (_.isEmpty(hash()) || hash() === '#_=_') {
                    hash('#contributions');
                    return tabs['#contributions'];
                }

                return tabs[hash()];
            };

        h.redrawHashChange();
        userVM.fetchUser(userId, true, userDetails);
        return {
            displayTabContent,
            hash,
            userDetails
        };
    },

    view(vnode) {
        const user = vnode.state.userDetails();

        return m('div', [
            m(userHeader, {
                user,
                hideDetails: true
            }),
            (!_.isEmpty(user) ? [m('nav.dashboard-nav.u-text-center', {
                style: {
                    'z-index': '10',
                    position: 'relative'
                }
            },
                        m('.w-container', [
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#contributions' ? '.selected' : '')}[data-target='#dashboard_contributions'][href='#contributions'][id='dashboard_contributions_link']`, 'Apoiados'),
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#projects' ? '.selected' : '')}[data-target='#dashboard_projects'][href='#projects'][id='dashboard_projects_link']`,
                                'Criados'
                            ),
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#about_me' ? '.selected' : '')}[data-target='#dashboard_about_me'][href='#about_me'][id='dashboard_about_me_link']`,
                              'Perfil Público'
                            ),
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#settings' ? '.selected' : '')}[data-target='#dashboard_settings'][href='#settings'][id='dashboard_settings_link']`,
                              'Dados cadastrais'
                            ),
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#notifications' ? '.selected' : '')}[data-target='#dashboard_notifications'][href='#notifications'][id='dashboard_notifications_link']`,
                                'Notificações'
                            ),
                            m(`a.dashboard-nav-link${(vnode.state.hash() === '#balance' ? '.selected' : '')}[data-target='#dashboard_balance'][href='#balance'][id='dashboard_balance_link']`,
                              'Saldo'
                             ),
                            m(`a.dashboard-nav-link.u-right-big-only[href='/pt/users/${user.id}']`, {
                                oncreate: m.route.link,
                                onclick: () => {
                                    m.route(`/users/${user.id}`, {
                                        user_id: user.id
                                    });
                                }
                            },
                                'Ir para o perfil público'
                            )
                        ])
                    ),

                m('section.section',
                  m((vnode.state.hash() == '#balance' ? '.w-section' : '.w-container'),
                            m('.w-row', user.id ? vnode.state.displayTabContent(user) : h.loader())
                        )
                    )

            ] :
                '')
        ]);
    }
};

export default usersEdit;
