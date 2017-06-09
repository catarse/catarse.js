import m from 'mithril';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectDashboardMenu from '../c/project-dashboard-menu';
import postsPreview from '../c/posts-preview';
import rewardVM from '../vms/reward-vm';
import popNotification from '../c/pop-notification';

const posts = {
    oninit(vnode) {
        let deleteFormSubmit;
        const showPreview = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            showSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            showError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            titleHasError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            commentHasError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            projectPosts = console.warn("m.prop has been removed from mithril 1.0") || m.prop(),
            loader = postgrest.loaderWithToken,
            errors = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            fields = {
                title: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
                comment_html: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
                reward_id: console.warn("m.prop has been removed from mithril 1.0") || m.prop('-1')
            },
            filterVM = postgrest.filtersVM({
                project_id: 'eq'
            }),
            validateTitle = () => {
                const title = String(fields.title());
                if (title.length === 0) {
                    titleHasError(true);
                }

                return !titleHasError();
            },
            validateComment = () => {
                const comment = String(fields.comment_html());
                if (comment.length === 0) {
                    commentHasError(true);
                }

                return !commentHasError();
            },
            togglePreview = () => {
                if (!validateTitle()) {
                    errors('Título não pode ficar em branco.');
                    showError(true);
                } else if (!validateComment()) {
                    errors('Mensagem não pode ficar em branco.');
                    showError(true);
                } else {
                    h.scrollTop();
                    showPreview(true);
                }
                return false;
            },
            project_id = vnode.attrs.project_id,
            projectDetails = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            rewardText = (rewardId) => {
                const reward = _.find(rewardVM.rewards(), r => String(r.id) === String(rewardId));
                return `Apoiadores da recompensa R$${reward.minimum_value} - ${reward.title ? reward.title : `${reward.description.substring(0, 70)}...`}`;
            },
            showRecipientes = (post) => {
                if (post.recipients === 'public') {
                    return 'Todo mundo (apoiadores e não apoiadores)';
                } else if (post.recipients === 'backers') {
                    return 'Todos os apoiadores';
                }
                const reward = _.find(rewardVM.rewards(), r => r.id === post.reward_id);
                if (reward) {
                    return rewardText(reward.id);
                }
                return '...';
            },
            toDeletePost = console.warn("m.prop has been removed from mithril 1.0") || m.prop(-1),
            deletePost = post => () => {
                toDeletePost(post.id);
                console.warn("m.redraw ignores arguments in mithril 1.0") || m.redraw(true);
                deleteFormSubmit();
                return false;
            },
            setPostDeletionForm = (el, isInit) => {
                if (!isInit) {
                    deleteFormSubmit = () => el.submit();
                }
            },
              openedPercentage = post => (Math.floor((post.open_count / post.delivered_count) * 100) || 0);

        models.projectPostDetail.pageSize(false);
        filterVM.project_id(project_id);
        const listVM = postgrest.loaderWithToken(models.projectPostDetail.getPageOptions(_.extend(filterVM.parameters(), { order: 'created_at.desc' }))),
            l = loader(models.projectDetail.getRowOptions(filterVM.parameters()));

        listVM.load().then(projectPosts);


        rewardVM.fetchRewards(project_id);

        l.load().then(projectDetails);

        return {
            listVM,
            l,
            projectPosts,
            showRecipientes,
            fields,
            showPreview,
            togglePreview,
            project_id,
            deletePost,
            rewardText,
            errors,
            showSuccess,
            titleHasError,
            commentHasError,
            showError,
            setPostDeletionForm,
            toDeletePost,
            projectDetails,
            openedPercentage
        };
    },
    view(vnode) {
        const project = _.first(vnode.state.projectDetails()),
            paidRewards = _.filter(rewardVM.rewards(), reward => reward.paid_count > 0);

        return project ? m('.project-posts',
            (project.is_owner_or_admin ? m(projectDashboardMenu, {
                project: console.warn("m.prop has been removed from mithril 1.0") || m.prop(project)
            }) : ''),
            vnode.state.showPreview() ? m(postsPreview, {
                showError: vnode.state.showError,
                showSuccess: vnode.state.showSuccess,
                errors: vnode.state.errors,
                showPreview: vnode.state.showPreview,
                project_id: vnode.state.project_id,
                comment_html: vnode.state.fields.comment_html,
                title: vnode.state.fields.title,
                reward_id: vnode.state.fields.reward_id(),
                rewardText: vnode.state.fields.reward_id() >= 1 ? vnode.state.rewardText(vnode.state.fields.reward_id()) : null
            }) : [
                m(`.w-section.section-product.${project.mode}`),
                (vnode.state.showSuccess() ? m(popNotification, {
                    message: 'Mensagem enviada com sucesso'
                }) : ''),
                (vnode.state.showError() ? m(popNotification, {
                    message: vnode.state.errors(),
                    error: true
                }) : ''),
                m('.dashboard-header.u-text-center',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m('.fontsize-larger.fontweight-semibold.lineheight-tight',
                                    'Envie uma novidade para seus apoiadores'
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    )
                ), m('.section', m('.w-container',
                    m('.w-row', [
                        m('.w-col.w-col-1'),
                        m('.w-col.w-col-10', [
                            m('.u-marginbottom-60.u-text-center',
                                m('._w-inline-block.card.fontsize-small.u-radius', [
                                    m('span.fa.fa-lightbulb-o',
                                        ''
                                    ),
                                    ' Veja ótimo motivos para ',
                                    m('a.alt-link[href=\'https://catarse.attach.io/B1AHAGm1x\'][target=\'_blank\']',
                                        'falar com seus apoiadores agora mesmo!'
                                    )
                                ])
                            ),
                            m('.card.card-terciary.medium.u-marginbottom-80.w-form', [
                                m('form', [
                                    m('label.field-label.fontweight-semibold',
                                        'Destinatários'
                                    ),
                                    m('select.positive.text-field.w-select', {
                                        onchange: m.withAttr('value', vnode.state.fields.reward_id)
                                    }, [
                                        m('option[value=\'-1\']', {
                                            selected: true
                                        },
                                            'Todo mundo (apoiadores e não apoiadores)'
                                        ),
                                        m('option[value=\'0\']',
                                            'Todos os apoiadores'
                                        ),
                                        (_.map(paidRewards, reward => m(`option[value='${reward.id}']`,
                                              vnode.state.rewardText(reward.id)
                                            )))
                                    ]),
                                    m('label.field-label.fontweight-semibold',
                                        'Título'
                                    ),
                                    m('input.positive.text-field.w-input[id=\'post_title\'][maxlength=\'256\'][type=\'text\']', {
                                        name: 'posts[title]',
                                        value: vnode.state.fields.title(),
                                        onfocus: () => vnode.state.titleHasError(false),
                                        class: vnode.state.titleHasError() ? 'error' : '',
                                        onchange: m.withAttr('value', vnode.state.fields.title)
                                    }),
                                    m('label.field-label.fontweight-semibold',
                                        'Texto'
                                    ),
                                    m('.preview-container.u-marginbottom-40', {
                                        class: vnode.state.commentHasError() ? 'error' : '',
                                        onclick: () => vnode.state.commentHasError(false)
                                    }, h.redactor('posts[comment_html]', vnode.state.fields.comment_html)),
                                    m('.u-marginbottom-20.w-row', [
                                        m('.w-col.w-col-3'),
                                        m('._w-sub-col.w-col.w-col-6',
                                            m('button.btn.btn-large', {
                                                onclick: vnode.state.togglePreview
                                            },
                                                'Pré-visualizar'
                                            )
                                        ),
                                        m('.w-col.w-col-3')
                                    ])
                                ])
                            ]),
                            m('.fontsize-large.fontweight-semibold.u-marginbottom-40',
                                'Novidades já enviadas'
                            ),
                            m('.table-outer.u-marginbottom-60', [
                                m('.fontsize-smaller.fontweight-semibold.header.table-row.w-row', [
                                    m('.table-col.w-col.w-col-5',
                                        m('div',
                                            'Título'
                                        )
                                    ),
                                    m('.table-col.u-text-center.w-col.w-col-3',
                                        m('div',
                                            'Enviadas'
                                        )
                                    ),
                                    m('.table-col.u-text-center.w-col.w-col-3',
                                        m('div',
                                            'Abertas'
                                        )
                                    ),
                                    m('.table-col.w-col.w-col-1')
                                ]),
                                (vnode.state.projectPosts() ? m('.fontsize-small.table-inner', [
                                    (_.map(vnode.state.projectPosts(), post => m('.table-row.w-row', [
                                        m('.table-col.w-col.w-col-5', [
                                            m(`a.alt-link.fontsize-base[href='/projects/${project.project_id}/posts/${post.id}#posts'][target='_blank']`,
                                                    post.title
                                                ),
                                            m('.fontcolor-secondary.fontsize-smallest', [
                                                m('span.fontweight-semibold',
                                                        'Enviada em: '
                                                    ),
                                                h.momentify(post.created_at, 'DD/MM/YYYY, h:mm A')
                                            ]),
                                            m('.fontcolor-secondary.fontsize-smallest', [
                                                m('span.fontweight-semibold',
                                                        'Destinatários: '
                                                    ),
                                                vnode.state.showRecipientes(post)
                                            ])
                                        ]),
                                        m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base',
                                                    post.delivered_count
                                                )
                                            ),
                                        m('.table-col.u-text-center.w-col.w-col-3',
                                                m('.fontsize-base', [
                                                    post.open_count,
                                                    m('span.fontcolor-secondary', ` (${vnode.state.openedPercentage(post)}%)`)
                                                ])
                                            ),
                                        m('.table-col.w-col.w-col-1',
                                                m('button.btn.btn-no-border.btn-small.btn-terciary.fa.fa-lg.fa-trash', {
                                                    onclick: vnode.state.deletePost(post)
                                                })
                                            )
                                    ]))),
                                    m('form.w-hidden', {
                                        action: `/pt/projects/${project.project_id}/posts/${vnode.state.toDeletePost()}`,
                                        method: 'POST',
                                        config: vnode.state.setPostDeletionForm
                                    }, [
                                        m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']'),
                                        m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']'),
                                        m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                                    ])

                                ]) : h.loader())
                            ])
                        ]),
                        m('.w-col.w-col-1')
                    ])
                ))
            ]) : h.loader();
    }
};

export default posts;
