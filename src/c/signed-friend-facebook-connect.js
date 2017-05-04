import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'fb_connect');

const SignedFriendFacebookConnect = {
    controller(args) {
        const mapWithAvatar = () => _.sample(_.filter(args.friendListVM.collection(), item => !_.isNull(item.avatar)), 8);

        return {
            mapWithAvatar
        };
    },
    view(ctrl, args) {
        if (args.friendListVM.isLoading()) {
            return h.loader();
        }
        const total = args.friendListVM.total();
        return m('.w-section.section.bg-backs-carrosel.section-large', [
            m('.w-container', [
                m('.card.card-big', [
                    m('.w-row', [
                        m('.w-col.w-col-8', [
                            m('.fontsize-largest.u-marginbottom-20', 'Find Amazing Campaigns With Your Friends'),
                            m('.fontsize-small', 'Discover incredible campaigns with Grasruts and your Facebook network')
                        ]),
                        m('.w-col.w-col-4.u-text-center', [
                            m('.fontsize-smallest.u-marginbottom-10', `${total} of your friends are in Grasruts!`),
                            m('.u-marginbottom-20', [
                                _.map(ctrl.mapWithAvatar(), item => m(`img.thumb.small.u-round.u-marginbottom-10[src="${item.avatar}"]`)),
                            ]),
                                (total > 0 ? m('a.w-button.btn.btn-large[href="/follow-fb-friends"]', 'Search for your friends') : m('a.w-button.btn.btn-fb.btn-large.u-margintop-30.u-marginbottom-10[href="/connect-facebook"]', 'Connect your facebook'))
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default SignedFriendFacebookConnect;
