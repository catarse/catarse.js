import m from 'mithril';
import _ from 'underscore';
import moment from 'moment';
import I18n from 'i18n-js';
import h from '../h';
import rewardVM from '../vms/reward-vm';
import userVM from '../vms/user-vm';
import editRewardCard from '../c/edit-reward-card';
import dashboardRewardCard from '../c/dashboard-reward-card';
import projectEditSaveBtn from '../c/project-edit-save-btn';
import popNotification from '../c/pop-notification';

const I18nScope = _.partial(h.i18nScope, 'projects.reward_fields');

const projectEditReward = {
    oninit(vnode) {
        const rewards = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            loading = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            errors = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            showSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            availableCount = reward => reward.maximum_contributions - reward.paid_count,
            updateRewardData = () => {
                const data = $('#reward_form').serialize();
                loading(true);
                // m.request won't serialize params properly here
                return $.ajax({
                    type: 'PATCH',
                    url: `/pt/projects/${vnode.attrs.project_id}'`,
                    data,
                    dataType: 'JSON'
                }).done(() => {
                    error(false);
                    showSuccess(true);
                    loadRewards();
                    m.redraw();
                }).fail((json) => {
                    error(true);
                    showSuccess(false);
                    const messages = JSON.parse(json.responseText).errors.join('</br>');
                    errors(messages);
                }).always(() => {
                    loading(false);
                    m.redraw();
                });
            },
            onSubmit = () => {
                error(false);
                errors('Erro ao salvar informações. Confira os dados informados.');
                _.map(rewards(), (reward) => {
                    if (reward().validate) {
                        reward().validate();
                    }
                });
                if (!error()) {
                    updateRewardData();
                }

                return false;
            },
            newReward = () => ({
                id: null,
                minimum_value: null,
                title: null,
                deliver_at: moment().date(1).format(),
                description: null,
                paid_count: 0,
                edit: console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
                limited: h.toggleProp(false, true),
                maximum_contributions: null,
                newReward: true,
                row_order: 999999999 + (rewards().length * 20) // we need large and spaced apart numbers
            });

        const updateRewardSortPosition = (rewardId, position) => m.request({
            method: 'POST',
            url: `/pt/projects/${vnode.attrs.project_id}/rewards/${rewardId}/sort?reward[row_order_position]=${position}`,
            onupdate: (vnode) => {
                if (h.authenticityToken()) {
                    vnode.dom.setRequestHeader('X-CSRF-Token', h.authenticityToken());
                    vnode.dom.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                }
            }
        });

        const setSorting = (el, isInit) => {
            if (!isInit && window.$) {
                window.$(el).sortable({
                    update: (event, ui) => {
                        const rewardId = ui.item[0].id;
                        updateRewardSortPosition(rewardId, ui.item.index());
                    }
                });
            }
        };

        const loadRewards = () => rewardVM.fetchRewards(vnode.attrs.project_id).then(() => {
            rewards([]);
            _.map(rewardVM.rewards(), (reward) => {
                const limited = reward.maximum_contributions !== null;
                _.extend(reward, {
                    edit: h.toggleProp(false, true),
                    limited: h.toggleProp(limited, !limited)
                });
                rewards().push(console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward));
            });

            if (rewardVM.rewards().length === 0) {
                rewards().push(console.warn("m.prop has been removed from mithril 1.0") || m.prop(newReward()));
            }
        });

        const tips = I18n.translations[I18n.currentLocale()].projects.reward_fields.faq;

        loadRewards();

        return {
            loading,
            error,
            errors,
            showSuccess,
            rewards,
            onSubmit,
            user: userVM.fetchUser(vnode.attrs.user_id),
            availableCount,
            newReward,
            setSorting,
            tips
        };
    },

    view(vnode) {
        const error = vnode.state.error,
              project = vnode.attrs.project;

        return m("[id='dashboard-rewards-tab']",
                 (project() ? [
            m('.w-section.section',
                m('.w-container', [
                    (vnode.state.showSuccess() ? m(popNotification, {
                        message: 'Recompensas salvas com sucesso'
                    }) : ''),
                    (vnode.state.error() ? m(popNotification, {
                        message: vnode.state.errors(),
                        error: true
                    }) : ''),
                    m('.w-row',
                        m('.w-col.w-col-8.w-col-push-2',
                            m('.u-marginbottom-60.u-text-center',
                                m('.w-inline-block.card.fontsize-small.u-radius',
                                    [
                                        m('span.fa.fa-lightbulb-o'),
                                        m.trust(` ${I18n.t('reward_know_more_cta_html', I18nScope())}`)
                                    ]
                                )
                            )
                        )
                    ),
                    m('.w-row',
                        [
                            m('.w-col.w-col-9',
                                m('form.simple_form.project-form.w-form[id=\'reward_form\']', {
                                    onsubmit: vnode.state.onSubmit
                                }, [
                                    m("input[name='utf8'][type='hidden'][value='✓']"),
                                    m("input[name='_method'][type='hidden'][value='patch']"),
                                    m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                                    m(`input[id='project_id'][name='project_id'][type='hidden'][value='${vnode.attrs.project_id}']`),
                                    m("input[id='anchor'][name='anchor'][type='hidden'][value='reward']"),
                                    m("[id='dashboard-rewards']", [

                                        vnode.state.rewards().length === 0 ? '' : m(".ui-sortable[id='rewards']", {
                                            config: vnode.state.setSorting
                                        }, [
                                            _.map(_.sortBy(vnode.state.rewards(), reward => Number(reward().row_order)), (reward, index) => m(`div[id=${reward().id}]`, [m('.nested-fields',
                                                    m('.reward-card', [
                                                        (!reward().edit() ?
                                                            m(dashboardRewardCard, {
                                                                reward: reward(),
                                                                user: vnode.state.user(),
                                                                project_id: vnode.attrs.project_id,
                                                                project_state: project().state
                                                            }) :
                                                            m(editRewardCard, {
                                                                project_id: vnode.attrs.project_id,
                                                                error,
                                                                reward,
                                                                index
                                                            }))
                                                    ])
                                                ),
                                                m(`input.ui-sortable-handle[id='project_rewards_attributes_${index}_id'][type='hidden']`, {
                                                    name: `project[rewards_attributes][${index}][id]`,
                                                    value: reward().id
                                                })
                                            ]))
                                        ]),

                                    ])
                                ]),
                              rewardVM.canAdd(project().state) ? [
                                    m('button.btn.btn-large.btn-message.show_reward_form.new_reward_button.add_fields', {
                                        onclick: () => vnode.state.rewards().push(console.warn("m.prop has been removed from mithril 1.0") || m.prop(vnode.state.newReward()))
                                    },
                                        I18n.t('add_reward', I18nScope())
                                    )

                              ] : ''
                            ),
                            m('.w-col.w-col-3', [
                                I18n.t('reward_faq_intro', I18nScope()),
                                m('br'),
                                m('br'),
                                I18n.t('reward_faq_sub_intro', I18nScope()),
                                m('br'),
                                m('br'),
                                _.map(vnode.state.tips, tip => [
                                    m('.fontweight-semibold', tip.title),
                                    m.trust(tip.description),
                                    m('br'),
                                    m('br')
                                ])
                            ])
                        ]
                    )
                ]),
                rewardVM.canAdd(project().state) ? [
                    m(projectEditSaveBtn, {
                        loading: vnode.state.loading,
                        onSubmit: vnode.state.onSubmit
                    })
                ] : ''
            )] : h.loader())
        );
    }
};

export default projectEditReward;
