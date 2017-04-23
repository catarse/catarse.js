import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';

const I18nScope = _.partial(h.i18nScope, 'projects.publish');

const publish = {
    controller(args) {
        const filtersVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            projectAccount = m.prop([]),
            projectDetails = m.prop([]),
            acceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
            flexAcceptTerm = m.prop([true, true, true, true, true, true, true, true, true]),
            showNextTerm = (index, acceptTerms) => {
                const terms = acceptTerms();
                if (terms[index]) {
                    terms[index] = false;
                    acceptTerms(terms);
                    const nextTerm = document.getElementsByClassName('w-hidden publish-rules');
                    if (nextTerm[0] !== undefined) {
                        nextTerm[0].classList.remove('w-hidden');
                    }
                }
                // show publish button after accepting all rules
                if (index === terms.length - 1) {
                    document.getElementsByClassName('publish-btn-section')[0].classList.remove('w-hidden');
                }
            },
            loader = postgrest.loaderWithToken;

        filtersVM.project_id(args.root.getAttribute('data-id'));

        const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
            accountL = loader(models.projectAccount.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);
        accountL.load().then(projectAccount);

        const expiresAt = () => {
            const project = _.first(projectDetails());
            return moment().add(project.online_days, 'days');
        };

        return {
            l,
            accountL,
            expiresAt,
            filtersVM,
            acceptTerm,
            flexAcceptTerm,
            showNextTerm,
            projectAccount,
            projectDetails
        };
    },
    view(ctrl, args) {
        const project = _.first(ctrl.projectDetails()),
              account = _.first(ctrl.projectAccount()),
              flexTerms = project => [
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                          ' ',
                          m('span.fontweight-semibold', 'What can and can not change on the campaign page after publication?')
                      ]),
                      m('div', [
                          m('span.fontweight-semibold', 'You can not change'),
                          ': The name of the person responsible for the campaign, the financing method, the title of the campaign, the URL of the campaign, the category of the campaign, the collection goal, the deadline, and the rewards that has supporters.',
                          m('br'), m('br'),
                          m('span.fontweight-semibold', 'You can change'),
                          ': The main video of the campaign, the content of the description, the campaign image, the rewards where there are no supports made, in addition to adding new rewards during the collection'
                      ])
                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                          ' ',
                          m('span.fontweight-semibold', 'FLEX Rules')
                      ]),
                      m('div', 'You have chosen the flexible campaign. In this way, you will receive all the funds collected from the supporters at the end of the campaign deadline (discounting the JVN fee) and must comply with the execution of the campaign and with the delivery of the rewards offered regardless of how much you collect.')
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Goal of collection')
                      ]),
                      m('div', 'The goal can not be changed after the campaign has been published.')
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Rates')
                      ]),
                      m('div', [
                          'At the end of the campaign, we will charge 5% ',
                          m('span.fontweight-semibold', 'Total amount collected.')
                      ])
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Campaign deadline')
                      ]),
                      m('div', 'Once set, the closing period can not be changed. If you started the campaign with the deadline, you should set it during the campaign, and you can leave the campaign open for a maximum of 12 months.')
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Deadline for transfer')
                      ]),
                      m('div', m.trust('When the deadline for your project comes to an end, you should verify your bank details. You may change the Bank, Account and the Agency <strong>Only if the new registered account is owned by you</strong>. Upon confirmation, Catarse will deposit into your checking account within 10 business days. The amount deposited will already be considering the 5% discount of the fee.'))
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Responsibility of JVN')
                      ]),
                      [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'JVN is responsible:'), ' The technological development of the platform, attendance of doubts and problems (both of supporters and directors), for hosting the campaign in the platform and for guaranteeing the security of the financial transactions.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'JVN is not responsible:'), ' Financing, disclosure and execution, nor for the delivery of rewards of the registered campaigns.'])]
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                          ' ',
                          m('span.fontweight-semibold', 'Your responsibilities')
                      ]),
                      m('div', 'It is your responsibility to receive the money from the campaign and everything related to formatting the campaign, planning and publicizing the fundraising campaign, mobilizing supporters, executing the campaign, communicating with supporters, and producing and delivering rewards within the estimated time frame.')
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Withdrawals from published campaign')
                      ]),
                      m('div', [m('span.fontweight-semibold'), 'JVN reserves the right, in its sole discretion and once notified, to cancel campaigns and terminate the accounts of CAMPAIGN CREATORS that violate our', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Rules'), ' e ', m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Terms of use'), '.'])
                  ])

              ],

              terms = project => [
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'What can and can not change on the campaign page after publication?')
                      ]),
                      m('div', [
                          m('span.fontweight-semibold', 'You can not change'), ': The name of the person in charge of the campaign, the funding mode, campaign title, campaign URL, campaign category, collection goal, chosen deadline and rewards that has supporters. ',
                          m('br'), m('br'),
                          m('span.fontweight-semibold', 'You can change'), ': The main video of the campaign, the content of the description, the campaign image, the rewards where there are no supports made, in addition to adding new rewards during the collection'
                      ])
                  ]),
                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                          ' ',
                          m('span.fontweight-semibold', 'All or Nothing (AON) rules')
                      ]),
                      m('div', ['You chose the AON campaign. In this way, you will only receive the funds collected ', m('span.fontweight-semibold', 'ff it reaches or exceeds the collection goal'), '. Otherwise, all of your supporters will be reimbursed. You will be responsible for delivering the rewards offered if your campaig reaches the collection goal.'])
                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Goal of collection')
                      ]),
                      m('div', 'The goal can not be changed after the campaign has been published.'),

                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Rates')
                      ]),
                      m('div', [
                          'We charge 5%',
                          m('span.fontweight-semibold', 'Total amount collected'),
                          ' for your campaign if it reaches or exceeds the target within the campaign deadline. If the campaign does not reach the goal, no fee will be charged.',
                          m('span.fontweight-semibold')
                      ])
                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Campaign deadline')
                      ]),
                      m('div', `Your campaign will be in collection in JVN until the day ${h.momentify(ctrl.expiresAt())} at 23h59min59s.This deadline can not be changed after the campaign has been published.`)
                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Transfer and refund rules'),
                          m('div', [
                              m.trust('When the deadline for your campaign comes to an end, you should verify your bank details. You may change the Bank, Account and the Agency <strong>Only if the new registered account is owned by you</strong>. After this confirmation, Catarse will deposit the amount collected, already discounted the fee, into your account in 10 business days. If the project does not reach 100% of the target by the deadline, the Catarse will reimburse the supporters. <a href="http://suporte.catarse.me/hc/pt-br/articles/202365507" target="blank">Learn more about the repayment process</a>')
                          ])
                      ]),
                      m('div', '')
                  ]),


                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Responsibility of JVN')
                      ]),
                      [m('div', [m('span.fontweight-semibold'), m('span.fontweight-semibold', 'JVN is responsible:'), ' The technological development of the platform, attendance of doubts and problems (both of supporters and directors), for hosting the campaign on the platform and for ensuring the security of financial transactions.\ ', m('br'), m('br'), m('span.fontweight-semibold', 'JVN is not responsible:'), ' Financing, dissemination and execution, nor for the delivery of rewards of the campaign registered.'])]]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Your responsibilities')
                      ]),
                      m('div', 'It is your responsibility to receive the money from the campaign and everything related to formatting the campaign, planning and publicizing the fundraising campaign, mobilizing supporters, executing the campaign, communicating with supporters, and producing and delivering rewards within the estimated time frame.')
                  ]),

                  m('.w-col.w-col-11', [
                      m('div', [
                          m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                          ' ',
                          m('span', { style: { 'font-weight': ' 600' } }, 'Withdrawals from published campaign')
                      ]),
                      m('div', [m('span.fontweight-semibold'), 'JVN reserves the right, in its sole discretion and once notified, to cancel campaign and terminate the accounts of CAMPAIGN CREATORS that violate our', m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Rules'), ' and ', m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Terms of use'), '.'])
                  ])

              ];

        return [!ctrl.l() && !ctrl.accountL() ? [
            (project.is_owner_or_admin ? m.component(projectDashboardMenu, {
                project: m.prop(project),
                hidePublish: true
            }) : ''),
            m(`.w-section.section-product.${project.mode}`),
            m('.w-section.section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-3'),
                        m('.w-col.w-col-6', [
                            m('.u-text-center', [
                                m('img.u-marginbottom-20[src=\'/assets/catarse_bootstrap/launch-icon.png\'][width=\'94\']'),
                                m('.fontsize-large.fontweight-semibold.u-marginbottom-20', 'Ready to launch your campaign?'),
                                m('.fontsize-base.u-marginbottom-30', 'We have prepared a list with important information for you to check before putting your campaign online!')
                            ])
                        ]),
                        m('.w-col.w-col-3')
                    ])
                ])
            ]),
            m('.divider'),
            m('.w-section.section-one-column.bg-gray.section.before-footer', [
                m('.w-container', [
                    m('.card.medium.u-marginbottom-60.card-terciary', [
                        m('.w-row', [
                            m('.w-col.w-col-6.w-clearfix', [
                                m(`img.card-project-thumb.u-right[src=${project.large_image}]`)
                            ]),
                            m('.w-col.w-col-6', [
                                m('.u-marginbottom-30.fontsize-base', [
                                    m('div', [m('span.fontweight-semibold', 'Title: '), project.name]),
                                    m('div', [m('span.fontweight-semibold', 'Link: '), `www.myjvn.com/${project.permalink}`]),
                                    m('div', [m('span.fontweight-semibold', 'Type: '), I18n.t(project.mode, I18nScope())]),
                                    m('div', [m('span.fontweight-semibold', 'Goal: '), `Rs ${h.formatNumber(project.goal, 2, 3)}`]),
                                    (project.online_days !== null) ? m('div', [m('span.fontweight-semibold', `Deadline: ${project.online_days} ${(project.online_days > 1) ? 'days' : 'day'}`)]) : ''
                                    // m('div', [m('span.fontweight-semibold', 'Responsável: '), account.owner_name])
                                    // m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])
                                ])
                            ])
                        ]),
                        m('.u-text-center', [
                            m('.w-row', [
                                m('.w-col.w-col-1'),
                                m('.w-col.w-col-10', [
                                    m('.divider.u-marginbottom-10'),
                                    m('.fontsize-small.fontcolor-secondary', 'The above data can not be changed after the campaign goes online. If you need to make changes, navigate the sidebar and come back here when you are done!')
                                ]),
                                m('.w-col.w-col-1')
                            ])
                        ])
                    ]),
                    m('.card.medium.u-radius.u-marginbottom-60', [
                        m('.u-text-center.u-marginbottom-60', [
                            m('.fontsize-large.fontweight-semibold', 'Remember our rules'),
                            m('.w-row', [
                                m('.w-col.w-col-2'),
                                m('.w-col.w-col-8', [
                                    m('.fontsize-small', ['Before posting, click on the circles below and confirm that you are aware of how JVN works.'])
                                ]),
                                m('.w-col.w-col-2')
                            ])
                        ]),
                        _.map(project.mode === 'flex' ? flexTerms(project) : terms(project), (term, index) => m(`.u-marginbottom-30.fontsize-base${index === 0 ? '' : '.w-hidden.publish-rules'}`, [
                            m(`.w-row[id='rule-${index}']`, [
                                m('.w-col.w-col-1.u-text-center', [
                                    m('div', [
                                        m((project.mode === 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? `a.w-inline-block.checkbox-big[href='#rule-${index + 1}']` : `a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href='#rule-${index + 1}']`, { onclick: () => ctrl.showNextTerm(index, (project.mode === 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm)) })
                                    ])
                                ]),
                                term
                            ])
                        ]))

                    ]),
                    m('.w-row.publish-btn-section.w-hidden', [
                        m('.w-col.w-col-4'),
                        m('.w-col.w-col-4', [
                            m(`a.btn.btn-large.u-marginbottom-20[href=/${project.mode === 'flex' ? 'flexible_projects' : 'projects'}/${project.project_id}/push_to_online]`, 'Publish Now!'),
                            m('.u-text-center.fontsize-smaller', [
                                'When you publish your campaign, you are accepting ',
                                m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Terms of use'),
                                ' and ',
                                m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Privacy Policy')
                            ])
                        ]),
                        m('.w-col.w-col-4')
                    ])
                ])
            ]),
            '\
    '
        ] : h.loader()];
    }
};
export default publish;
