import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import h from '../h';
import shippingFeeInput from '../c/shipping-fee-input';
import rewardVM from '../vms/reward-vm';

const editRewardCard = {
    oninit(vnode) {
        const reward = vnode.attrs.reward(),
            fields = {
                title: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.title),
                shipping_options: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.shipping_options),
                minimumValue: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.minimum_value),
                description: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.description),
                deliverAt: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.deliver_at),
                maximumContributions: console.warn("m.prop has been removed from mithril 1.0") || m.prop(reward.maximum_contributions)
            },
            destroyed = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            acceptNumeric = (e) => {
                fields.minimumValue(e.target.value.replace(/[^0-9]/g, ''));
                return true;
            },
            confirmDelete = () => {
                const r = confirm('Você tem certeza?');
                if (r) {
                    return m.request({
                        method: 'DELETE',
                        url: `/projects/${vnode.attrs.project_id}/rewards/${reward.id}`,
                        config: h.setCsrfToken
                    }).then(() => {
                        destroyed(true);
                        m.redraw();
                    });
                }
                return false;
            },
            descriptionError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            minimumValueError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            deliverAtError = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            index = vnode.attrs.index,
            showTips = h.toggleProp(false, true),
            states = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            fees = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            statesLoader = rewardVM.statesLoader,
            updateOptions = () => {
                if (((fields.shipping_options() === 'national' || fields.shipping_options() === 'international') && !_.contains(_.pluck(fees(), 'destination'), 'others'))) {
                    fees().push({
                        value: 0,
                        destination: 'others'
                    });
                }
                if (fields.shipping_options() === 'national') {
                    fees(_.reject(fees(), fee => fee.destination === 'international'));
                } else if (fields.shipping_options() === 'international' && !_.contains(_.pluck(fees(), 'destination'), 'international')) {
                    fees().push({
                        value: 0,
                        destination: 'international'
                    });
                }
            };

        statesLoader.load().then((data) => {
            states(data);
            states().unshift({
                acronym: null,
                name: 'Estado'
            });

            if (!reward.newReward) {
                rewardVM.getFees(reward).then((feeData) => {
                    fees(feeData);
                    updateOptions();
                });
            }
        });

        _.extend(vnode.attrs.reward(), {
            validate: () => {
                descriptionError(false);
                minimumValueError(false);
                deliverAtError(false);
                if (reward.newReward && moment(fields.deliverAt()).isBefore(moment().date(-1))) {
                    vnode.attrs.error(true);
                    deliverAtError(true);
                }
                if (_.isEmpty(fields.description())) {
                    vnode.attrs.error(true);
                    descriptionError(true);
                }
                if (!fields.minimumValue() || parseInt(fields.minimumValue()) < 10) {
                    vnode.attrs.error(true);
                    minimumValueError(true);
                }
                _.map(fees(), (fee) => {
                    _.extend(fee, { error: false });
                    if (fee.destination === null) {
                        vnode.attrs.error(true);
                        _.extend(fee, { error: true });
                    }
                });
            }
        });

        return {
            fields,
            minimumValueError,
            deliverAtError,
            descriptionError,
            confirmDelete,
            acceptNumeric,
            updateOptions,
            showTips,
            destroyed,
            states,
            reward,
            index,
            fees
        };
    },
    view(vnode) {
        const index = vnode.state.index,
            newFee = {
                value: null,
                destination: null
            },
            fees = vnode.state.fees(),
            reward = vnode.attrs.reward(),
            inlineError = message => m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle',
                m('span',
                    message
                )
            );

        return vnode.state.destroyed() ? m('div', '') : m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
            m('.w-col.w-col-5.w-sub-col', [
                m('.fontweight-semibold.fontsize-smallest.u-marginbottom-10', [
                    'Editar recompensa',
                    m.trust('&nbsp;'),
                    m('a.link-edit.fa.fa-question-circle', {
                        onclick: () => vnode.state.showTips.toggle()
                    })
                ]),
                (vnode.state.showTips() ?
                    m('.fontsize-smallest.fontcolor-secondary.reward-explanation.u-marginbottom-20',
                        'Descreva o valor da recompensa e coloque uma previsão de data de entrega real para os apoiadores. Você também pode limitar uma recompensa e quando o limite é atingido ela aparece como ESGOTADA. Se quiser mudar a ordem que as recompensas aparecem em seu projeto, basta fazer isso arrastando-as para cima ou para baixo.'
                    ) : '')
            ]),
            m('.w-col.w-col-7',
                m('.card',
                    m('.w-form', [
                        m('.w-row', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Título:'
                                )
                            ),
                            m('.w-col.w-col-7',
                                m(`input.w-input.text-field.positive[aria-required='true'][autocomplete='off'][type='tel'][id='project_rewards_attributes_${index}_title']`, {
                                    name: `project[rewards_attributes][${index}][title]`,
                                    value: vnode.state.fields.title(),
                                    onchange: m.withAttr('value', vnode.state.fields.title)
                                })
                            )
                        ]),
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Valor mínimo:'
                                )
                            ),
                            m('.w-col.w-col-7', [
                                m('.w-row', [
                                    m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3.text-field.positive.prefix.no-hover',
                                        m('.fontsize-smallest.fontcolor-secondary.u-text-center',
                                            'R$'
                                        )
                                    ),
                                    m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                        m(`input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required='true'][autocomplete='off'][required='required'][type='tel'][id='project_rewards_attributes_${index}_minimum_value']`, {
                                            name: `project[rewards_attributes][${index}][minimum_value]`,

                                            class: vnode.state.minimumValueError() ? 'error' : false,
                                            value: vnode.state.fields.minimumValue(),
                                            oninput: e => vnode.state.acceptNumeric(e)
                                        })
                                    )
                                ]),
                                vnode.state.minimumValueError() ? inlineError('Valor deve ser igual ou superior a R$10.') : '',

                                m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']",
                                    'Informe um valor mínimo maior ou igual a 10'
                                )
                            ])
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-5',
                                m('label.fontsize-smaller',
                                    'Previsão de entrega:'
                                )
                            ),
                            m('.w-col.w-col-7',
                                m('.w-row',
                                    m('.w-col.w-col-12',
                                        m('.w-row', [
                                            m(`input[id='project_rewards_attributes_${index}_deliver_at_3i'][type='hidden'][value='1']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(3i)]`
                                            }),
                                            m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_2i']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(2i)]`,
                                                class: vnode.state.deliverAtError() ? 'error' : false,
                                                onchange: (e) => {
                                                    vnode.state.fields.deliverAt(moment(vnode.state.fields.deliverAt()).month(parseInt(e.target.value) - 1).format());
                                                }
                                            }, [
                                                _.map(moment.monthsShort(), (month, monthIndex) => m(`option[value='${monthIndex + 1}']`, {
                                                    selected: moment(vnode.state.fields.deliverAt()).format('M') == monthIndex + 1
                                                },
                                                    h.capitalize(month)
                                                ))
                                            ]),
                                            m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_1i']`, {
                                                name: `project[rewards_attributes][${index}][deliver_at(1i)]`,
                                                class: vnode.state.deliverAtError() ? 'error' : false,
                                                onchange: (e) => {
                                                    vnode.state.fields.deliverAt(moment(reward.deliverAt).year(parseInt(e.target.value)).format());
                                                }
                                            }, [
                                                _.map(_.range(moment().year(), moment().year() + 6), year =>
                                                    m(`option[value='${year}']`, {
                                                        selected: moment(vnode.state.fields.deliverAt()).format('YYYY') === String(year)
                                                    },
                                                        year
                                                    )
                                                )
                                            ])
                                        ])
                                    )
                                ),
                                vnode.state.deliverAtError() ? inlineError('Data de entrega não pode ser no passado.') : '',
                            )
                        ]),
                        m('.w-row',
                            m('label.fontsize-smaller',
                                'Descrição:'
                            )
                        ),
                        m('.w-row', [
                            m(`textarea.text.required.w-input.text-field.positive.height-medium[aria-required='true'][placeholder='Descreva sua recompensa'][required='required'][id='project_rewards_attributes_${index}_description']`, {
                                name: `project[rewards_attributes][${index}][description]`,
                                value: vnode.state.fields.description(),
                                class: vnode.state.descriptionError() ? 'error' : false,
                                onchange: m.withAttr('value', vnode.state.fields.description)
                            }),
                            m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']",
                                'Descrição não pode ficar em branco'
                            )
                        ]),
                        vnode.state.descriptionError() ? inlineError('Descrição não pode ficar em branco.') : '', ,
                        m('.u-marginbottom-30.w-row', [
                            m('.w-col.w-col-3',
                                m("label.fontsize-smaller[for='field-2']",
                                    'Tipo de entrega'
                                )
                            ),
                            m('.w-col.w-col-9', [
                                m(`select.positive.text-field.w-select[id='project_rewards_attributes_${index}_shipping_options']`, {
                                    name: `project[rewards_attributes][${index}][shipping_options]`,
                                    value: vnode.state.fields.shipping_options() || 'free',
                                    onchange: (e) => {
                                        vnode.state.fields.shipping_options(e.target.value);
                                        vnode.state.updateOptions();
                                    }
                                }, [
                                    m('option[value=\'international\']',
                                        'Frete Nacional e Internacional'
                                    ),
                                    m('option[value=\'national\']',
                                        'Frete Nacional'
                                    ),
                                    m('option[value=\'free\']',
                                        'Sem frete envolvido'
                                    ),
                                    m('option[value=\'presential\']',
                                        'Retirada presencial'
                                    )
                                ]),

                                ((vnode.state.fields.shipping_options() === 'national' || vnode.state.fields.shipping_options() === 'international') ?
                                    m('.card.card-terciary', [

                                        // state fees
                                        (_.map(fees, (fee, feeIndex) => [m(shippingFeeInput, {
                                            fee,
                                            fees: vnode.state.fees,
                                            index,
                                            feeIndex,
                                            states: vnode.state.states
                                        }),

                                        ])),
                                        m('.u-margintop-20',
                                            m("a.alt-link[href='#']", {
                                                onclick: () => {
                                                    vnode.state.fees().push(newFee);
                                                    return false;
                                                }
                                            },
                                                'Adicionar destino'
                                            )
                                        )
                                    ]) : '')
                            ])
                        ]),
                        m('.w-row.u-marginbottom-20', [
                            m('.w-col.w-col-5',
                                m('.w-checkbox', [
                                    m('.w-checkbox-input',
                                        m('input.limit_reward[type=\'checkbox\'][id=\'limit_reward\']', {
                                            checked: reward.limited(),
                                            onclick: () => {
                                                reward.limited.toggle();
                                            }
                                        })
                                    ),
                                    m('label.w-form-label',
                                        'Limitar recompensa'
                                    )
                                ])
                            ),
                            (reward.limited() ?
                                m('.w-col.w-col-7.reward_maximum_contributions',
                                    m(`input.string.tel.optional.w-input.text-field.u-marginbottom-30.positive[placeholder='Quantidade disponível'][type='tel'][id='project_rewards_attributes_${index}_maximum_contributions']`, {
                                        name: `project[rewards_attributes][${index}][maximum_contributions]`,
                                        value: vnode.state.fields.maximumContributions(),
                                        onchange: m.withAttr('value', vnode.state.fields.maximumContributions)
                                    })
                                ) :
                                '')
                        ]),
                        m('.w-row.u-margintop-30', [
                            (reward.newReward ? '' :
                                m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                    m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Fechar']", {
                                        onclick: () => {
                                            reward.edit.toggle();
                                        }
                                    })
                                )),
                            m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', [
                                m(`input[id='project_rewards_attributes_${index}__destroy'][type='hidden'][value='false']`, {
                                    name: `project[rewards_attributes][${index}][_destroy]`
                                }),
                                m('a.remove_fields.existing', { onclick: vnode.state.confirmDelete },
                                    m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border')
                                )
                            ])
                        ])
                    ])
                )
            )
        ]);
    }
};

export default editRewardCard;
