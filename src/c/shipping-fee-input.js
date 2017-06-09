import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import inlineError from '../c/inline-error';

const shippingFeeInput = {
    oninit(vnode) {
        const states = vnode.attrs.states;
        const fee = vnode.attrs.fee,
            fees = vnode.attrs.fees,
            feeIndex = vnode.attrs.feeIndex,
            deleted = h.toggleProp(false, true),
            feeValue = console.warn("m.prop has been removed from mithril 1.0") || m.prop(fee.value || 0),
            feeDestination = console.warn("m.prop has been removed from mithril 1.0") || m.prop(fee.destination),
            index = vnode.attrs.index,
            stateInUse = state => state.acronym !== feeDestination() && _.contains(_.pluck(fees(), 'destination'), state.acronym),
            updateFees = () => {
                const feeToUpdateIndex = _.indexOf(fees(), fee);
                fee.destination = feeDestination();
                fees()[feeToUpdateIndex] = fee;
            };

        return {
            fee,
            fees,
            deleted,
            feeValue,
            stateInUse,
            feeDestination,
            updateFees,
            feeIndex,
            index,
            states
        };
    },
    view(vnode) {
        const feeIndex = vnode.state.feeIndex,
            index = vnode.state.index,
            deleted = vnode.state.deleted,
            othersCount = _.filter(vnode.state.fees(), fee => fee.destination !== 'others' && fee.destination !== 'international').length,
            states = vnode.state.states;

        return m(`div${deleted() ? '.w-hidden' : ''}`, [
            m('.u-marginbottom-10.w-row', [
                m('.w-col.w-col-6',

                    (
                        vnode.state.feeDestination() === 'others' ? [

                            m('input[type=\'hidden\']', {
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                                value: 'others'
                            }),
                            m('label.field-label.fontsize-smallest',
                                (othersCount > 0 ? 'Resto do Brasil' : 'Todos os estados do Brasil')
                            )
                        ] :

                        vnode.state.feeDestination() === 'international' ?

                        [
                            m('input[type=\'hidden\']', {
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                                value: 'international'
                            }),
                            m('label.field-label.fontsize-smallest',
                                'Internacional'
                            )
                        ] :

                        m(`select.fontsize-smallest.text-field.text-field-light.w-select[id='project_rewards_shipping_fees_attributes_${index}_destination']`, {
                            class: vnode.state.fee.error ? 'error' : false,
                            name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][destination]`,
                            value: vnode.state.feeDestination(),
                            onchange: (e) => {
                                vnode.state.feeDestination(e.target.value);
                                vnode.state.updateFees();
                            }
                        }, [
                            (_.map(states(), state =>
                                m(`option[value='${state.acronym}']`, {
                                    disabled: vnode.state.stateInUse(state)
                                },
                                    state.name
                                )))
                        ]))
                ),
                m('.w-col.w-col-1'),
                m('.w-col.w-col-4',
                    m('.w-row', [
                        m('.no-hover.positive.prefix.text-field.w-col.w-col-3',
                            m('.fontcolor-secondary.fontsize-mini.u-text-center',
                                'R$'
                            )
                        ),
                        m('.w-col.w-col-9',
                            m("input.positive.postfix.text-field.w-input[type='text']", {
                                value: vnode.state.feeValue(),
                                name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][value]`,
                                oninput: m.withAttr('value', vnode.state.feeValue)
                            })
                        )
                    ])
                ),
                m('.w-col.w-col-1', [
                    m(`input[id='project_rewards_shipping_fees_attributes_${index}__destroy'][type='hidden']`, {
                        value: vnode.state.deleted(),
                        name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][_destroy]`
                    }),

                    (vnode.state.feeDestination() === 'others' || vnode.state.feeDestination() === 'international' ? '' :
                        m('a.btn.btn-no-border.btn-small.btn-terciary.fa.fa-1.fa-trash', {
                            onclick: () => vnode.state.deleted.toggle()
                        }))
                ]),

                m(`input[type='hidden'][id='project_rewards_shipping_fees_attributes_${feeIndex}_id']`, {
                    name: `project[rewards_attributes][${index}][shipping_fees_attributes][${feeIndex}][id]`,
                    value: vnode.state.fee.id || null
                })

            ],
            vnode.state.fee.error ? m(inlineError, { message: 'Estado não pode ficar em branco.' }) : ''
            ), m('.divider.u-marginbottom-10')
        ]);
    }
};

export default shippingFeeInput;
