import m from 'mithril';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'layouts.footer');
const footer = {
    view() {
        return m('footer.main-footer.main-footer-neg',
            [
                m('section.w-container',
                    m('.w-row',
                        [
                            m('.w-col.w-col-9',
                                m('.w-row',
                                    [
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.w-hidden-tiny',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('titles.contact', I18nScope())
                                                ),
                                                // m('a.link-footer[href=\'https://www.catarse.me/en/flex?ref=ctrse_footer\']',
                                                //     ' Grasruts flex'
                                                // ),
                                                m('a.link-footer[href=\'/team?ref=ctrse_footer\']',
                                                    [
                                                        I18n.t('links.team', I18nScope()),
                                                        m.trust(' &lt;'),
                                                        '3'
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'https://www.facebook.com/grasruts\'][target=\'__blank\']',
                                                    ' Facebook'
                                                ),
                                                m('a.link-footer[href=\'https://twitter.com/grasruts\'][target=\'__blank\']',
                                                    ' Twitter'
                                                ),
                                                m('a.link-footer[href=\'http://instagram.com/the_grasruts/\'][target=\'__blank\']',
                                                    ' Instagram'
                                                ),
                                                m('a.link-footer[href=\'https://www.pinterest.com/grasruts\'][target=\'__blank\']',
                                                    ' Pinterest'
                                                ),
                                                m('a.link-footer[href=\'https://github.com/sushant12/jvn\'][target=\'__blank\']',
                                                    ' Github'
                                                ),
                                                m('a.link-footer[href=\'https://medium.com/grasruts\'][target=\'__blank\']',
                                                    ' Blog'
                                                ),
                                                m('a.link-footer[href=\'/jobs?ref=ctrse_footer\']',
                                                    I18n.t('links.jobs', I18nScope())
                                                )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-firstcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('titles.about', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'#?ref=ctrse_footer\']',
                                                    [
                                                        I18n.t('links.how_it_works', I18nScope()),
                                                        m.trust('&nbsp;')
                                                    ]
                                                ),
                                                m('a.link-footer[href=\'https://grasruts.zendesk.com/hc/en-us/requests/new\'][target="_BLANK"]',
                                                    I18n.t('links.contact', I18nScope())
                                                ),
                                                // m('a.link-footer[href=\'http://crowdfunding.catarse.me/nossa-taxa?ref=ctrse_footer\']',
                                                //     [
                                                //         I18n.t('links.rate', I18nScope()),
                                                //         m.trust('&nbsp;')
                                                //     ]
                                                // ),
                                                // m('a.link-footer[href=\'/press?ref=ctrse_footer\']',
                                                //     I18n.t('links.press', I18nScope())
                                                // ),
                                                m('a.link-footer[href=\'https://grasruts.zendesk.com/hc/en-us/\'][target="_BLANK"]',
                                                    I18n.t('links.help_support', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'/en/terms-of-use?ref=ctrse_footer\']',
                                                    I18n.t('links.terms', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'/en/privacy-policy?ref=ctrse_footer\']',
                                                    I18n.t('links.privacy', I18nScope())
                                                )
                                            ]
                                        ),
                                        m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.footer-full-lastcolumn',
                                            [
                                                m('.footer-full-signature-text.fontsize-small',
                                                    I18n.t('titles.sitemap', I18nScope())
                                                ),
                                                m('a.w-hidden-small.w-hidden-tiny.link-footer[href=\'/en/start?ref=ctrse_footer\']',
                                                    I18n.t('links.submit', I18nScope())
                                                ),
                                                m('a.link-footer[href=\'/en/explore?ref=ctrse_footer\']',
                                                    I18n.t('links.discover', I18nScope())
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'https://medium.com/grasruts?ref=ctrse_footer\']',
                                                    ' Blog'
                                                ),
                                                m('a.w-hidden-main.w-hidden-medium.w-hidden-small.link-footer[href=\'#\']',
                                                    I18n.t('links.contact', I18nScope())
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=score&ref=ctrse_footer\']',
                                                    I18n.t('links.score', I18nScope())
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=online&ref=ctrse_footer\']',
                                                    I18n.t('links.online', I18nScope())
                                                ),
                                                m('a.w-hidden-tiny.link-footer[href=\'/en/explore?filter=finished&ref=ctrse_footer\']',
                                                    I18n.t('links.finished', I18nScope())
                                                )
                                            ]
                                        )
                                    ]
                                )
                            ),
                            m('.w-col.w-col-3.column-social-media-footer',
                                [
                                    m('.footer-full-signature-text.fontsize-small',
                                        I18n.t('titles.newsletter', I18nScope())
                                    ),
                                    m('.w-form',
                                        m(`form[accept-charset='UTF-8'][action='${h.getMailchimpUrl()}'][id='mailee-form'][method='post']`,
                                            [
                                                m('.w-form.footer-newsletter',
                                                    m('input.w-input.text-field.prefix[id=\'EMAIL\'][label=\'email\'][name=\'EMAIL\'][placeholder=\''+I18n.t('texts.email', I18nScope())+'\'][type=\'email\']')
                                                ),
                                                m('button.w-inline-block.btn.btn-edit.postfix.btn-attached[style="padding:0;"]',
                                                    m('img.footer-news-icon[alt=\'Icon newsletter\'][src=\'/assets/catarse_bootstrap/icon-newsletter.png\']')
                                                )
                                            ]
                                        )
                                    ),
                                    // m('.footer-full-signature-text.fontsize-small',
                                    //     I18n.t('titles.social', I18nScope())
                                    // ),
                                    // m('.w-widget.w-widget-facebook.u-marginbottom-20',
                                    //     m('.facebook',
                                    //         m('.fb-like[data-colorscheme=\'dark\'][data-href=\'http://facebook.com/grasruts\'][data-layout=\'button_count\'][data-send=\'false\'][data-show-faces=\'false\'][data-title=\'\'][data-width=\'260\']')
                                    //     )
                                    // ),
                                    // m('.w-widget.w-widget-twitter', [
                                    //     m(`a.twitter-follow-button[href="httṕ://twitter.com/grasruts"][data-button="blue"][data-text-color="#FFFFFF][data-link-color="#FFFFFF"][data-width="224px"]`)
                                    // ]),
                                    m('.u-margintop-30',
                                        [
                                            m('.footer-full-signature-text.fontsize-small',
                                                'Change language'
                                            ),
                                            m('[id=\'google_translate_element\']')
                                        ]
                                    )
                                ]
                            )
                        ]
                    )
                ),
                m('.w-container',
                    m('.footer-full-copyleft',
                        [
                            m('img.u-marginbottom-20[alt=\'Logo footer\'][src=\'/assets/logo-footer.png\']'),
                            m('.lineheight-loose',
                                m('a.link-footer-inline[href=\'https://github.com/sushant12/jvn\'][target=\'blank\']',
                                    I18n.t('texts.copyleft', I18nScope()) + ` | ${new Date().getFullYear()} | Open Source`
                                )
                            )
                        ]
                    )
                )
            ]
        );
    }
};

export default footer;
