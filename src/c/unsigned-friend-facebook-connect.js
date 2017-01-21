import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'fb_connect');

const UnsignedFriendFacebookConnect = {
    controller(args) {
        return {
            largeBg: (() => {
                if (_.isUndefined(args)) {
                    return false;
                } else {
                    return (_.isUndefined(args.largeBg) ? false : args.largeBg);
                }
            })()
        };
    },
    view(ctrl, args) {
        return m(`.w-section.section${(ctrl.largeBg ? '.bg-backs-carrosel.section-large' : '')}`, [
            m('.w-container', [
                m('.card.card-big', [
                    m('.w-row', [
                        m('.w-col.w-col-8', [
                            m('.fontsize-largest.u-marginbottom-20',  I18n.t('find_project', I18nScope())),
                            m('.fontsize-small', I18n.t('with', I18nScope()))
                        ]),
                        m('.w-col.w-col-4', [
                            m('a.w-button.btn.btn-fb.btn-large.u-margintop-30.u-marginbottom-10[href="/connect-facebook"]', I18n.t('connect', I18nScope())),
                            m('.fontsize-smallest.fontcolor-secondary.u-text-center', I18n.t('oath', I18nScope()))
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default UnsignedFriendFacebookConnect;
