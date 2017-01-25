import m from 'mithril';
import postgrest from 'mithril-postgrest';
import h from '../h';
import models from '../models';
import landingSignup from '../c/landing-signup';
import projectRow from '../c/project-row';
import landingQA from '../c/landing-qa';

const Flex = {
    controller() {
        const stats = m.prop([]),
            projects = m.prop([]),
            l = m.prop(),
            sample3 = _.partial(_.sample, _, 3),
            builder = {
                customAction: 'http://fazum.catarse.me/obrigado-landing-catarse-flex'
            },
            addDisqus = (el, isInitialized) => {
                if (!isInitialized) {
                    h.discuss('https://catarse.me/flex', 'flex_page');
                }
            },
            flexVM = postgrest.filtersVM({
                mode: 'eq',
                state: 'eq',
                recommended: 'eq'
            }),
            statsLoader = postgrest.loaderWithToken(models.statistic.getRowOptions());

        flexVM.mode('flex').state('online').recommended(true);

        const projectsLoader = postgrest.loader(models.project.getPageOptions(flexVM.parameters()));

        statsLoader.load().then(stats);

        projectsLoader.load().then(_.compose(projects, sample3));

        return {
            addDisqus: addDisqus,
            builder: builder,
            statsLoader: statsLoader,
            stats: stats,
            projectsLoader: projectsLoader,
            projects: {
                loader: projectsLoader,
                collection: projects
            }
        };
    },
    view(ctrl, args) {
        let stats = _.first(ctrl.stats());

        return [
            m('.w-section.hero-full.hero-zelo', [
                m('.w-container.u-text-center', [
                    m('img.logo-flex-home[src=\'/assets/logo-flex.png\'][width=\'359\']'),
                    m('.w-row', [
                        m('.w-col.fontsize-large.u-marginbottom-60.w-col-push-2.w-col-8', 'Let`s build a new mode of crowdfunding! Register your email and learn how to register your project on flex!')
                    ]),
                    m('.w-row', [
                        m('.w-col.w-col-2'),
                        m.component(landingSignup, {
                            builder: ctrl.builder
                        }),
                        m('.w-col.w-col-2')
                    ])
                ])
            ]), [
                m('.section', [
                    m('.w-container', [
                        m('.fontsize-largest.u-margintop-40.u-text-center', 'Pra quem será?'), m('.fontsize-base.u-text-center.u-marginbottom-60', 'We will start the testing phase with specific project categories'), m('div', [
                            m('.w-row.u-marginbottom-60', [
                                m('.w-col.w-col-6', [
                                    m('.u-text-center.u-marginbottom-20', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e393a01b66e250aca67cb_icon-zelo-com.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Causes')
                                    ]), m('p.fontsize-base', 'Flexibility for causes of impact! We will be open to campaigns of organizations or individuals for the collection of resources for personal causes, assistance projects, health, humanitarian aid, animal protection, socio-environmental entrepreneurship, activism or anything that unites people to do good.')
                                ]), m('.w-col.w-col-6', [
                                    m('.u-text-center.u-marginbottom-20', [
                                        m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e3929a0daea230a5f12cd_icon-zelo-pessoal.png\'][width=\'210\']'), m('.fontsize-largest.lineheight-loose', 'Kitties')
                                    ]), m('p.fontsize-base', 'Simple campaigns that need the flexibility to raise money with people close to you. We will be open to a variety of personal campaigns that can range from covering study costs to helping those in need of medical treatment. To collect the money to make that party buy presents for someone with the help of the galley.')
                                ])
                            ])
                        ])
                    ])
                ]), m('.w-section.section.bg-greenlime.fontcolor-negative', [
                    m('.w-container', [
                        m('.fontsize-largest.u-margintop-40.u-marginbottom-60.u-text-center', 'Como funcionará?'), m('.w-row.u-marginbottom-40', [
                            m('.w-col.w-col-6', [
                                m('.u-text-center', [
                                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39c578b284493e2a428a_zelo-money.png\'][width=\'180\']')
                                ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'Stay with how much to collect'), m('p.u-text-center.fontsize-base', 'Flex is to drive campaigns where all money is welcome! You get everything you can raise.')
                            ]), m('.w-col.w-col-6', [
                                m('.u-text-center', [
                                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39d37c013d4a3ee687d2_icon-reward.png\'][width=\'180\']')
                                ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'No rewards required'), m('p.u-text-center.fontsize-base', 'No flex offering rewards is optional. You choose whether to offer them makes sense for your project and campaign.')
                            ])
                        ]), m('.w-row.u-marginbottom-40', [
                            m('.w-col.w-col-6', [
                                m('.u-text-center', [
                                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39fb01b66e250aca67e3_icon-curad.png\'][width=\'180\']')
                                ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'You publish your project yourself'), m('p.u-text-center.fontsize-base', 'All projects enrolled in the flex come on the air. Agility and ease for you to capture resources through the internet.')
                            ]), m('.w-col.w-col-6', [
                                m('.u-text-center', [
                                    m('img[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/560e39e77c013d4a3ee687d4_icon-time.png\'][width=\'180\']')
                                ]), m('.fontsize-large.u-marginbottom-10.u-text-center.fontweight-semibold', 'End the campaign anytime'), m('p.u-text-center.fontsize-base', 'There is no capitation time limit. You choose when to close your campaign and receive the amounts collected.')
                            ])
                        ])
                    ])
                ]),
                m('.w-section.section', [
                    m('.w-container', [
                        m('.w-editable.fontsize-larger.u-margintop-40.u-margin-bottom-40.u-text-center', 'Meet some of the first flex projects'),
                        ctrl.projectsLoader() ? h.loader() : m.component(projectRow, {collection: ctrl.projects, ref: 'ctrse_flex', wrapper: '.w-row.u-margintop-40'})
                    ])
                ]),
                m('.w-section.divider'),
                m('.w-section.section', [
                    m('.w-container', [
                        m('.fontsize-larger.u-text-center.u-marginbottom-60.u-margintop-40', 'Doubts'), m('.w-row.u-marginbottom-60', [
                            m('.w-col.w-col-6', [
                                m.component(landingQA, {
                                    question: 'What are the flexible mode fees? ',
                                    answer: 'Like in JVN, sending a project costs nothing! The fee charged on the JVN flex service is 13% on the amount collected.'
                                }),
                                m.component(landingQA, {
                                    question: 'Where does the money from my project come from?',
                                    answer: 'Family, friends, fans and members of communities that you are part of are your greatest contributors. It is they who will spread their campaign to the people they know, and so the circle of supporters is increasing and your campaign is gaining strength.'
                                }),
                                m.component(landingQA, {
                                    question: 'What is the difference between the flexible and the "all or nothing"?',
                                    answer: 'Currently Catarse uses only the "all or nothing" model, where you only get the money if you beat the collection goal within the term of the campaign. The flexible model is different because it allows the director to keep what he has collected, regardless of whether or not he reaches the project goal within the term of the campaign. There will be no time limit for campaigns. Our flexible system will be something new compared to the models that currently exist in the market.'
                                }),
                            ]), m('.w-col.w-col-6', [
                                m.component(landingQA, {
                                    question: 'Can I enter projects for flexible mode already?',
                                    answer: 'Yes. Register your email and learn how to register your project on flex!'
                                }),
                                m.component(landingQA, {
                                    question: 'Why do you want to do the Catarse flex?',
                                    answer: 'We believe that the Brazilian crowdfunding environment still has room for many actions, tests and experiments to really understand what people need. We dream of making collective financing a habit in Brazil. Catarse flex is another step in this direction.'
                                }),
                                m.component(landingQA, {
                                    question: 'When will you launch Catarse flex?',
                                    answer: 'We still do not know when we will open flex for the general public, but you can register your email on this page and receive special material on how to submit your project.'
                                })
                            ])
                        ])
                    ])
                ]),
                m('.w-section.section-large.u-text-center.bg-purple', [
                    m('.w-container.fontcolor-negative', [
                        m('.fontsize-largest', 'Inscreva seu projeto!'), m('.fontsize-base.u-marginbottom-60', 'Register your email and learn how to register your project on flex!'), m('.w-row', [
                            m('.w-col.w-col-2'),
                            m.component(landingSignup, {
                                builder: ctrl.builder
                            }),
                            m('.w-col.w-col-2')
                        ])
                    ])
                ]), m('.w-section.section-one-column.bg-catarse-zelo.section-large[style="min-height: 50vh;"]', [
                    m('.w-container.u-text-center', [
                        m('.w-editable.u-marginbottom-40.fontsize-larger.lineheight-tight.fontcolor-negative', 'Flex is an experiment and initiative of JVN, Nepal`s largest crowdfunding platform.'),
                        m('.w-row.u-text-center', (ctrl.statsLoader()) ? h.loader() : [
                            m('.w-col.w-col-4', [
                                m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_contributors, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'People have already supported at least 01 project in JVN')
                            ]),
                            m('.w-col.w-col-4', [
                                m('.fontsize-jumbo.text-success.lineheight-loose', h.formatNumber(stats.total_projects_success, 0, 3)), m('p.start-stats.fontsize-base.fontcolor-negative', 'Projects have already been funded in JVN')
                            ]),
                            m('.w-col.w-col-4', [
                                m('.fontsize-jumbo.text-success.lineheight-loose', stats.total_contributed.toString().slice(0, 2) + ' millions'), m('p.start-stats.fontsize-base.fontcolor-negative', 'They were invested in ideas published in JVN')
                            ])
                        ])
                    ])
                ]),
                m('.w-section.section.bg-blue-one.fontcolor-negative', [
                    m('.w-container', [
                        m('.fontsize-large.u-text-center.u-marginbottom-20', 'Recommend the Catarse flex for friends! '),
                        m('.w-row', [
                            m('.w-col.w-col-2'),
                            m('.w-col.w-col-8', [
                                m('.w-row', [
                                    m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle', [
                                        m('div', [
                                            m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f66e05eb6144171d8edb_facebook-xxl.png\']'),
                                            m('a.w-button.btn.btn-large.btn-fb[href="http://www.facebook.com/sharer/sharer.php?u=https://www.catarse.me/flex?ref=facebook&title=' + encodeURIComponent('Meet the new JVN Flex!') + '"][target="_blank"]', 'To share')
                                        ])
                                    ]),
                                    m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6', [
                                        m('div', [
                                            m('img.icon-share-mobile[src=\'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/53a3f65105eb6144171d8eda_twitter-256.png\']'),
                                            m('a.w-button.btn.btn-large.btn-tweet[href="https://twitter.com/intent/tweet?text=' + encodeURIComponent('Let`s build a new mode of crowdfunding for Catarse! Join us, sign up for your email!') + 'https://www.catarse.me/flex?ref=twitter"][target="_blank"]', 'To tweet')
                                        ])
                                    ])
                                ])
                            ]),
                            m('.w-col.w-col-2')
                        ])
                    ])
                ]), m('.w-section.section-large.bg-greenlime', [
                    m('.w-container', [
                        m('#participe-do-debate.u-text-center', {config: h.toAnchor()}, [
                            m('h1.fontsize-largest.fontcolor-negative','Build Flex with us'), m('.fontsize-base.u-marginbottom-60.fontcolor-negative', 'Start a conversation, ask, comment, critique and make suggestions!')
                        ]),
                        m('#disqus_thread.card.u-radius[style="min-height: 50vh;"]', {
                            config: ctrl.addDisqus
                        })
                    ])
                ])
            ]
        ];
    }
};

export default Flex;
