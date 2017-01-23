import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'fb_connect');

const SignedFriendFacebookConnect = {
    controller(args) {
        const mapWithAvatar = () => {
            return _.sample(_.filter(args.friendListVM.collection(), (item) => {
                return !_.isNull(item.avatar);
            }), 8);
        };

        return {
            mapWithAvatar: mapWithAvatar
        };
    },
    view(ctrl, args) {
        if (args.friendListVM.isLoading()) {
            return h.loader();
        } else {
            let total = args.friendListVM.total();
            return m('.w-section.section.bg-backs-carrosel.section-large', [
                m('.w-container', [
                    m('.card.card-big', [
                        m('.w-row', [
                            m('.w-col.w-col-8', [
                                m('.fontsize-largest.u-marginbottom-20', I18n.t('find_project', I18nScope())),
                                m('.fontsize-small', I18n.t('with', I18nScope()))
                            ]),
                            m('.w-col.w-col-4.u-text-center', [
                                m('.fontsize-smallest.u-marginbottom-10', `${total} ` + I18n.t('friends_catarse', I18nScope())),
                                m('.u-marginbottom-20', [
                                    _.map(ctrl.mapWithAvatar(), (item) => {
                                        return m(`img.thumb.small.u-round.u-marginbottom-10[src="${item.avatar}"]`);
                                    }),
                                ]),
                                (total > 0 ? m('a.w-button.btn.btn-large[href="/follow-fb-friends"]', I18n.t('search_friends', I18nScope())) : m('a.w-button.btn.btn-fb.btn-large.u-margintop-30.u-marginbottom-10[href="/connect-facebook"]', I18n.t('connect', I18nScope())))
                            ])
                        ])
                    ])
                ])
            ]);
        }
    }
};

export default SignedFriendFacebookConnect;
