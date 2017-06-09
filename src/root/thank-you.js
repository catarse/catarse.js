import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import facebookButton from '../c/facebook-button';
import projectShareBox from '../c/project-share-box';
import projectRow from '../c/project-row';
import userVM from '../vms/user-vm';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions');

const thankYou = {
    oninit(vnode) {
        const recommendedProjects = userVM.getUserRecommendedProjects(),
            isSlip = vnode.attrs.contribution && !_.isEmpty(vnode.attrs.contribution.slip_url);

        const setEvents = (el, isInitialized) => {
            if (!isInitialized) {
                CatarseAnalytics.event({
                    cat: 'contribution_finish',
                    act: 'contribution_finished',
                    lbl: isSlip ? 'slip' : 'creditcard',
                    val: vnode.attrs.contribution.value,
                    extraData: {
                        contribution_id: vnode.attrs.contribution.contribution_id
                    }
                });

                CatarseAnalytics.checkout(
                    `${vnode.attrs.contribution.contribution_id}`,
                    `[${vnode.attrs.contribution.project.permalink}] ${vnode.attrs.contribution.reward.minimum_value} [${isSlip ? 'slip' : 'creditcard'}]`,
                    `${vnode.attrs.contribution.reward.reward_id}`,
                    `${vnode.attrs.contribution.project.category}`,
                    `${vnode.attrs.contribution.value}`,
                    `${vnode.attrs.contribution.value * vnode.attrs.contribution.project.service_fee}`
                );
            }
        };

        return {
            setEvents,
            displayShareBox: h.toggleProp(false, true),
            isSlip,
            recommendedProjects
        };
    },
    view(vnode) {
        return m('#thank-you', { config: vnode.state.setEvents }, [
            m('.page-header.u-marginbottom-30',
              m('.w-container',
                m('.w-row',
                  m('.w-col.w-col-10.w-col-push-1',
                      [
                          m('.u-marginbottom-20.u-text-center',
                          m(`img.big.thumb.u-round[src='${vnode.attrs.contribution.project.user_thumb}']`)
                         ),
                          m('#thank-you.u-text-center', !vnode.state.isSlip ?
                          [
                              m('#creditcard-thank-you.fontsize-larger.text-success.u-marginbottom-20',
                                I18n.t('thank_you.thank_you', I18nScope())
                               ),
                              m('.fontsize-base.u-marginbottom-40',
                                m.trust(
                                    I18n.t('thank_you.thank_you_text_html',
                                           I18nScope({
                                               total: vnode.attrs.contribution.project.total_contributions,
                                               email: vnode.attrs.contribution.contribution_email,
                                               link2: `/pt/users/${h.getUser().user_id}/edit#contributions`,
                                               link_email: `/pt/users/${h.getUser().user_id}/edit#about_me`
                                           })
                                          )
                                )
                               ),
                              m('.fontsize-base.fontweight-semibold.u-marginbottom-20',
                                'Compartilhe com seus amigos e ajude esse projeto a bater a meta!'
                               )
                          ] : [
                              m('#slip-thank-you.fontsize-largest.text-success.u-marginbottom-20', I18n.t('thank_you_slip.thank_you', I18nScope())),
                              m('.fontsize-base.u-marginbottom-40',
                                m.trust(I18n.t('thank_you_slip.thank_you_text_html',
                                               I18nScope({
                                                   email: vnode.attrs.contribution.contribution_email,
                                                   link_email: `/pt/users/${h.getUser().user_id}/edit#about_me`
                                               }))))
                          ]
                         ),
                          vnode.state.isSlip ? '' : m('.w-row',
                              [
                                  m('.w-hidden-small.w-hidden-tiny',
                                      [
                                          m('.w-sub-col.w-col.w-col-4', m(facebookButton, {
                                              url: `https://www.catarse.me/${vnode.attrs.contribution.project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=social&utm_campaign=project_share`,
                                              big: true
                                          })),
                                          m('.w-sub-col.w-col.w-col-4', m(facebookButton, {
                                              messenger: true,
                                              big: true,
                                              url: `https://www.catarse.me/${vnode.attrs.contribution.project.permalink}?ref=ctrse_thankyou&utm_source=facebook.com&utm_medium=messenger&utm_campaign=thanks_share`
                                          })),
                                          m('.w-col.w-col-4', m(`a.btn.btn-large.btn-tweet.u-marginbottom-20[href="https://twitter.com/intent/tweet?text=Acabei%20de%20apoiar%20o%20projeto%20${vnode.attrs.contribution.project.name}%20https://www.catarse.me/${vnode.attrs.contribution.project.permalink}%3Fref%3Dtwitter%26utm_source%3Dtwitter.com%26utm_medium%3Dsocial%26utm_campaign%3Dproject_share"][target="_blank"]`, [
                                              m('span.fa.fa-twitter'), ' Twitter'
                                          ]))
                                      ]
                                                  ),
                                  m('.w-hidden-main.w-hidden-medium', [
                                      m('.u-marginbottom-30.u-text-center-small-only', m('button.btn.btn-large.btn-terciary.u-marginbottom-40', {
                                          onclick: vnode.state.displayShareBox.toggle
                                      }, 'Compartilhe')),
                                      vnode.state.displayShareBox() ? m(projectShareBox, {
                                                         // Mocking a project m.prop
                                          project: console.warn("m.prop has been removed from mithril 1.0") || m.prop({
                                              permalink: vnode.attrs.contribution.project.permalink,
                                              name: vnode.attrs.contribution.project.name
                                          }),
                                          displayShareBox: vnode.state.displayShareBox
                                      }) : ''
                                  ])
                              ]
                                            ),
                      ]
                   )

                 )
               )
             ),
            m('.section.u-marginbottom-40',
              m('.w-container',
                vnode.state.isSlip ? m('.w-row',
                                m('.w-col.w-col-8.w-col-offset-2',
                                  m('iframe.slip', {
                                      src: vnode.attrs.contribution.slip_url,
                                      width: '100%',
                                      height: '905px',
                                      frameborder: '0',
                                      style: 'overflow: hidden;'
                                  })
                                 )
                               ) : [
                                   m('.fontsize-large.fontweight-semibold.u-marginbottom-30.u-text-center',
                                     I18n.t('thank_you.project_recommendations', I18nScope())
                                    ),
                                   m(projectRow, {
                                       collection: vnode.state.recommendedProjects,
                                       ref: 'ctrse_thankyou_r'
                                   })
                               ]
               )
             )
        ]);
    }
};

export default thankYou;
