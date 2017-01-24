import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';

const I18nScope = _.partial(h.i18nScope, 'projects.publish');

const publish = {
    controller(args) {
        let filtersVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            projectAccount = m.prop([]),
            projectDetails = m.prop([]),
            acceptTerm = m.prop([true,true,true,true,true,true,true,true,true]),
            flexAcceptTerm = m.prop([true,true,true,true,true,true,true,true,true]),
            showNextTerm = (index, acceptTerms) => {
                var terms = acceptTerms();
                if (terms[index]) {
                    terms[index] = false;
                    acceptTerms(terms);
                    var nextTerm = document.getElementsByClassName('w-hidden publish-rules');
                    if (nextTerm[0] !== undefined) {
                        nextTerm[0].classList.remove('w-hidden');
                    }
                }
                //show publish button after accepting all rules
                if (index === terms.length - 1){
                    document.getElementsByClassName('publish-btn-section')[0].classList.remove('w-hidden');
                }
            },
            loader = postgrest.loaderWithToken;

        filtersVM.project_id(args.root.getAttribute('data-id'));

        const l = loader(models.projectDetail.getRowOptions(filtersVM.parameters())),
            accountL = loader(models.projectAccount.getRowOptions(filtersVM.parameters()));
        l.load().then(projectDetails);
        accountL.load().then(projectAccount);

        let expiresAt = () => {
            const project = _.first(projectDetails());
            return moment().add(project.online_days, 'days');
        };

        return {
            l: l,
            accountL: accountL,
            expiresAt: expiresAt,
            filtersVM: filtersVM,
            acceptTerm: acceptTerm,
            flexAcceptTerm: flexAcceptTerm,
            showNextTerm: showNextTerm,
            projectAccount: projectAccount,
            projectDetails: projectDetails
        };
    },
    view(ctrl, args) {
        const project = _.first(ctrl.projectDetails()),
          account = _.first(ctrl.projectAccount()),
          flexTerms = (project) => {
              return [
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                        ' ',
                      m('span.fontweight-semibold', 'FLEX Rules')
                    ]),
                    m('div', 'You have chosen the flexible campaign. In this way, you will receive all the funds collected from the supporters at the end of the campaign term (discounting the JVN fee) and must comply with the execution of the project and with the delivery of the rewards offered regardless of how much to collect.')
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Goal of collection')
                    ]),
                    m('div', 'The goal can not be changed after the project has been published.')
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Rates')
                    ]),
                    m('div', [
                      'At the end of the campaign, we will charge 13%',
                      m('span.fontweight-semibold', 'Total amount collected. ')
                    ])
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Campaign deadline')
                    ]),
                    m('div', 'Once set, the closing period can not be changed. If you started the campaign with the deadline, you must set it during the campaign, and you can leave the campaign open for a maximum of 12 months.')
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Deadline for transfer')
                    ]),
                      m('div', 'When the deadline for your project comes to an end, you should verify your bank details. After this confirmation, Catarse will deposit into your checking account within 10 business days. The amount deposited will already be considering the 13% discount of the fee.')
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                        ' ',
                      m('span.fontweight-semibold', 'What can and can not change on the project page from publication?')
                    ]),
                  [m('div', [m('span.fontweight-semibold', 'You may not:'),' Change the type of funding, project name, project URL, category chosen, collection goal, deadline (if you have already defined it), rewards where existing support is available, and registered bank account.\
                    '                          ,m('br'),m('br'),m('span.fontweight-semibold', 'You will be able to: '),'Edit the content of the project description, change the main campaign video, project image, effect phrase, rewards where there are no supports made, and add new rewards during fundraising.'])]
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Responsibility of JVN')
                    ]),
                  [m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold', 'Catarse is responsible for:'),' By the technological development of the platform, attendance of doubts and problems (both of supporters and directors), by hosting the project in the platform and by guaranteeing the security of the financial transactions.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'Catarse is not responsible for:'),' Financing, dissemination and execution, nor for the delivery of rewards of the projects registered.'])]
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                        ' ',
                      m('span.fontweight-semibold', 'Your responsibilities')
                    ]),
                    m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold'),'It is your responsibility for all aspects of project formatting, planning and dissemination of the fundraising campaign, mobilizing supporters, executing the project, producing and delivering rewards within the estimated deadline, and communicating with supporters.'])
                  ]),
                  m('.w-col.w-col-11', [
                    m('div', [
                      m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                      ' ',
                      m('span', {style: {'font-weight': ' 600'}}, 'Withdrawals from projects in the air')
                    ]),
                    m('div', [m('span.fontweight-semibold'),'JVN reserves the right, in its sole discretion and once notified, to cancel projects and terminate the accounts of PROJECT CREATORS that violate our ',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Game rules'),' e ',m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Terms of use'),'.'])
                  ])

          ];
          },

          terms = (project) => {
              return [m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '1/9'),
                        ' ',
                        m('span.fontweight-semibold', 'Rules of the All-or-nothing mode')
                      ]),
                      m('div', ['You chose the all-or-nothing campaign. In this way, you will only receive the funds raised ',m('span.fontweight-semibold', 'If it reaches or exceeds the collection goal'),'. Otherwise, all of your supporters will be reimbursed. You will be responsible for delivering the rewards offered if your project reaches the collection goal.'])
                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '2/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Goal of collection')
                      ]),
                      m('div', 'The goal can not be changed after the project has been published.'),

                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '3/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Rates')
                      ]),
                      m('div', [
                        'We charge 13% ',
                        m('span.fontweight-semibold', 'Total amount collected'),
                        ' For your project if it reaches or exceeds the target within the campaign deadline. If the project does not reach the goal, no fee will be charged.',
                        m('span.fontweight-semibold')
                      ])
                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '4/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Campaign deadline')
                      ]),
                      m('div', `Your project will be in collection at the Catarse until the ${h.momentify(ctrl.expiresAt())}At 11:50 p.m. This deadline can not be changed after the project has been published.`)
                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '5/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Transfer and refund rules')
                      ]),
                        m('div', ['When the deadline for your project comes to an end, you should verify your bank details. After this confirmation, JVN will deposit the amount collected, with the discount of the rate, into your checking account within 10 business days. If the project does not reach 100% of the target by the deadline, the JVN will reimburse the supporters. ',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202365507\'][target=\'_blank\']', 'Learn more about the refund process'),'.'])
                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '6/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'What can and can not change on the project page from publication?')
                      ]),
                    [m('div', [m('span.fontweight-semibold', 'You can not:'),' Change the name of the project, the URL (link) of the project, the category chosen, the type of financing, the bank account, the collection goal, the term chosen and the rewards where existing support already exists.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'You will be able to: '),'Edit the content of the project description, change the main campaign video, project image, effect phrase, rewards where there are no supports made, and add new rewards during fundraising.'])]]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '7/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Responsibility of JVN')
                      ]),
                    [m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold', 'JVN is responsible:'),' By the technological development of the platform, attendance of doubts and problems (both of supporters and directors), by hosting the project in the platform and by guaranteeing the security of the financial transactions.\ ',m('br'),m('br'),m('span.fontweight-semibold', 'JVN is not responsible for:'),' Financing, dissemination and execution, nor for the delivery of rewards of the projects registered.'])]]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '8/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Your responsibilities')
                      ]),
                      m('div', [m('span.fontweight-semibold'),m('span.fontweight-semibold'),'It is your responsibility for all aspects of project formatting, planning and dissemination of the fundraising campaign, mobilizing supporters, executing the project, producing and delivering rewards within the estimated deadline, and communicating with supporters.'])
                    ]),

                    m('.w-col.w-col-11', [
                      m('div', [
                        m('span.fontsize-smallest.fontcolor-secondary', '9/9'),
                        ' ',
                        m('span', {style: {'font-weight': ' 600'}}, 'Withdrawals from projects in the air')
                      ]),
                      m('div', [m('span.fontweight-semibold'),'JVN reserves the right, in its sole discretion and once notified, to cancel projects and terminate the accounts of PROJECT CREATORS that violate our',m('a.alt-link[href=\'http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos\'][target=\'_blank\']', 'Game rules'),' e ',m('a.alt-link[href=\'http://www.catarse.me/terms-of-use\'][target=\'_blank\']', 'Terms of use'),'.'])
                    ])

              ];
          };

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
                  m('.fontsize-base.u-marginbottom-30', 'We`ve prepared a list with important information for you to check before putting your project on the air!')
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
                  m('img.card-project-thumb.u-right[src=' + project.large_image + ']')
                ]),
                m('.w-col.w-col-6', [
                  m('.u-marginbottom-30.fontsize-base', [
                    m('div', [m('span.fontweight-semibold', 'Title: '), project.name]),
                    m('div', [m('span.fontweight-semibold', 'Link: '),`www.catarse.me/${project.permalink}`]),
                    m('div', [m('span.fontweight-semibold', 'Method of financing: '), I18n.t(project.mode, I18nScope())]),
                    m('div', [m('span.fontweight-semibold', 'Goal of collection: '),`Rs ${h.formatNumber(project.goal, 2, 3)}`]),
                    (project.online_days !== null) ? m('div', [m('span.fontweight-semibold', `Deadline: ${project.online_days} ${(project.online_days > 1) ? 'days' : 'days' }`)]) : '',
                    m('div', [m('span.fontweight-semibold', 'Responsible: '), account.owner_name]),
                    m('div', [m('span.fontweight-semibold', 'CPF/CNPJ: '), account.owner_document])
                  ])
                ])
              ]),
              m('.u-text-center', [
                m('.w-row', [
                  m('.w-col.w-col-1'),
                  m('.w-col.w-col-10', [
                    m('.divider.u-marginbottom-10'),
                    m('.fontsize-small.fontcolor-secondary', 'The above data can not be changed after the project goes live. If you need to make changes, navigate the sidebar and come back here when you`re done!')
                  ]),
                  m('.w-col.w-col-1')
                ])
              ])
            ]),
            m('.card.medium.u-radius.u-marginbottom-60', [
              m('.u-text-center.u-marginbottom-60', [
                m('.fontsize-large.fontweight-semibold', 'Relembre nossas regras'),
                m('.w-row', [
                  m('.w-col.w-col-2'),
                  m('.w-col.w-col-8', [
                    m('.fontsize-small', ['Before posting, click on the circles below and confirm that you are aware of how JVN works. Any doubt, ',m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/requests/new"][target="_blank"]', 'contact'),'!'])
                  ]),
                  m('.w-col.w-col-2')
                ])
              ]),

              _.map(project.mode == 'flex' ? flexTerms(project) : terms(project), (term, index) => {
                  return m(`.u-marginbottom-30.fontsize-base${index == 0 ? '' : '.w-hidden.publish-rules'}`, [
                    m(`.w-row[id='rule-${index}']`, [
                      m('.w-col.w-col-1.u-text-center', [
                        m('div', [
                          m((project.mode == 'flex' ? ctrl.flexAcceptTerm() : ctrl.acceptTerm())[index] ? `a.w-inline-block.checkbox-big[href='#rule-${index + 1}']` : `a.w-inline-block.checkbox-big.checkbox--selected.fa.fa-check.fa-lg[href='#rule-${index + 1}']`, {onclick: () => ctrl.showNextTerm(index, (project.mode == 'flex' ? ctrl.flexAcceptTerm : ctrl.acceptTerm))})
                        ])
                      ]),
                      term
                    ])
                ]);
              })

            ]),
            m('.w-row.publish-btn-section.w-hidden', [
              m('.w-col.w-col-4'),
              m('.w-col.w-col-4', [
                m(`a.btn.btn-large.u-marginbottom-20[href=/${project.mode == 'flex' ? 'flexible_projects' : 'projects'}/${project.project_id}/push_to_online]`, 'Publish now!'),
                m('.u-text-center.fontsize-smaller', [
                  'When you publish your project, you are accepting ',
                  m('a.alt-link[href=\'/terms-of-use\'][target=\'_blank\']', 'Terms of use'),
                  ' and ',
                  m('a.alt-link[href=\'/privacy-policy\'][target=\'_blank\']', 'Privacy policy')
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
