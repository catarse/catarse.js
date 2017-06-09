import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import usersVM from '../vms/user-vm';
import faqBox from '../c/faq-box';
import paymentForm from '../c/payment-form';
import inlineError from '../c/inline-error';
import UserOwnerBox from '../c/user-owner-box';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const projectsPayment = {
    oninit(vnode) {
        const project = projectVM.currentProject,
              vm = paymentVM(),
              showPaymentForm = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
              contribution = contributionVM.getCurrentContribution(),
              reward = console.warn("m.prop has been removed from mithril 1.0") || m.prop(contribution().reward),
              value = contribution().value,
              phoneMask = _.partial(h.mask, '(99) 9999-99999'),
              documentMask = _.partial(h.mask, '999.999.999-99'),
              documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99'),
              zipcodeMask = _.partial(h.mask, '99999-999'),
              isCnpj = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
              currentUserID = h.getUserID(),
              user = usersVM.getCurrentUser();

        const shippingFee = () => _.findWhere(rewardVM.fees(), { id: contribution().shipping_fee_id });

        const validateForm = () => {
            if (vm.validate()) {
                vm.similityExecute(contribution().id);
                showPaymentForm(true);
            }
        };

        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.fields.errors(), {
                field: fieldName
            });

            return fieldWithError ? m(inlineError, {
                message: fieldWithError.message
            }) : '';
        };

        const setStateOther = (el, isInit) => {
            if (!isInit) {
                vm.fields.userState('');
            }
        };

        const applyDocumentMask = (value) => {
            if (value.length > 14) {
                isCnpj(true);
                vm.fields.ownerDocument(documentCompanyMask(value));
            } else {
                isCnpj(false);
                vm.fields.ownerDocument(documentMask(value));
            }
        };

        const applyZipcodeMask = _.compose(vm.fields.zipCode, zipcodeMask);

        const applyPhoneMask = _.compose(vm.fields.phone, phoneMask);

        const addressChange = fn => (e) => {
            CatarseAnalytics.oneTimeEvent({
                cat: 'contribution_finish',
                act: vm.isInternational ? 'contribution_address_br' : 'contribution_address_int'
            });

            if (_.isFunction(fn)) {
                fn(e);
            }
        };

        const scope = attr => vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        const isLongDescription = reward => reward.description && reward.description.length > 110;

        if (_.isNull(currentUserID)) {
            return h.navigateToDevise();
        }
        rewardVM.getStates();
        rewardVM.getFees(reward()).then(rewardVM.fees);
        vm.similityExecute(contribution().id);
        projectVM.getCurrentProject();

        return {
            addressChange,
            applyDocumentMask,
            applyZipcodeMask,
            applyPhoneMask,
            fieldHasError,
            setStateOther,
            validateForm,
            showPaymentForm,
            contribution,
            reward,
            value,
            scope,
            isCnpj,
            vm,
            user,
            project,
            shippingFee,
            isLongDescription,
            toggleDescription: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        const user = vnode.state.user(),
              project = vnode.state.project(),
              formatedValue = h.formatNumber(Number(vnode.state.value), 2, 3);

        return m('#project-payment.w-section.w-clearfix.section', !_.isEmpty(project) ? [
            m('.w-col',
                m('.w-clearfix.w-hidden-main.w-hidden-medium.card.u-radius.u-marginbottom-20', [
                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                        I18n.t('selected_reward.value', vnode.state.scope())
                    ),
                    m('.w-clearfix',
                        [
                            m('.fontsize-larger.text-success.u-left',
                                `R$ ${formatedValue}`
                            ),
                            m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${vnode.state.reward().id ? `?reward_id=${vnode.state.reward().id}` : ''}"]`,
                                'Editar'
                            )
                        ]
                    ),
                    m('.divider.u-marginbottom-10.u-margintop-10'),
                    m('.back-payment-info-reward', [
                        m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                            I18n.t('selected_reward.reward', vnode.state.scope())
                        ),
                        m('.fontsize-smallest.fontweight-semibold',
                            vnode.state.reward().title
                        ),
                        m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                            class: vnode.state.isLongDescription(vnode.state.reward())
                                       ? vnode.state.toggleDescription() ? 'extended' : ''
                                       : 'extended'
                        }, vnode.state.reward().description
                                ? vnode.state.reward().description
                                : m.trust(
                                    I18n.t('selected_reward.review_without_reward_html',
                                        vnode.state.scope(
                                            _.extend({ value: formatedValue })
                                        )
                                    )
                                )
                        ),
                        vnode.state.isLongDescription(vnode.state.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                            onclick: vnode.state.toggleDescription.toggle
                        }, [
                            vnode.state.toggleDescription() ? 'menos ' : 'mais ',
                            m('span.fa.fa-angle-down', {
                                class: vnode.state.toggleDescription() ? 'reversed' : ''
                            })
                        ]) : '',
                        vnode.state.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10',
                            [
                                m('span.fontweight-semibold',
                                    'Entrega prevista:'
                                ),
                                ` ${h.momentify(vnode.state.reward().deliver_at, 'MMM/YYYY')}`
                            ]
                        ) : '',
                        (rewardVM.hasShippingOptions(vnode.state.reward()) || vnode.state.reward().shipping_options === 'presential')
                            ? m('.fontcolor-secondary.fontsize-smallest', [
                                m('span.fontweight-semibold',
                                    'Forma de envio: '
                                ),
                                I18n.t(`shipping_options.${vnode.state.reward().shipping_options}`, { scope: 'projects.contributions' })
                            ])
                            : ''
                    ])
                ])
            ),

            m('.w-container',
                m('.w-row', [
                    m('.w-col.w-col-8', [
                        m('.w-form', [
                            m('form.u-marginbottom-40', [
                                m('.u-marginbottom-40.u-text-center-small-only', [
                                    m('.fontweight-semibold.lineheight-tight.fontsize-large',
                                        I18n.t('title', vnode.state.scope())
                                    ),
                                    m('.fontsize-smaller',
                                        I18n.t('required', vnode.state.scope())
                                    )
                                ]),
                                user.name && user.owner_document ? m(UserOwnerBox, { user, project }) : '',
                                m('.w-row.u-marginbottom-30', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'country\']', [
                                            'País / ',
                                            m('em', 'Country'),
                                            ' *'
                                        ]),
                                        m('select.w-select.text-field[id=\'country\']', {
                                            onfocus: vnode.state.vm.resetFieldError('userCountryId'),
                                            class: vnode.state.fieldHasError('userCountryId') ? 'error' : false,
                                            onchange: m.withAttr('value', vnode.state.vm.fields.userCountryId),
                                            value: vnode.state.vm.fields.userCountryId()
                                        },
                                            _.map(vnode.state.vm.fields.countries(), (country, idx) => m('option', {
                                                value: country.id,
                                                key: idx,
                                                selected: country.id === vnode.state.vm.fields.userCountryId()
                                            }, country.name_en))
                                        ),
                                        vnode.state.fieldHasError('userCountryId')
                                    ]),
                                    m('.w-col.w-col-5')
                                ]),
                                ((user.name && user.owner_document) ? '' : m('.w-row', [
                                    m('.w-col.w-col-7.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'complete-name\']',
                                          I18n.t('fields.complete_name', vnode.state.scope())
                                         ),
                                        m('input.w-input.text-field[id=\'complete-name\'][name=\'complete-name\']', {
                                            onfocus: vnode.state.vm.resetFieldError('completeName'),
                                            class: vnode.state.fieldHasError('completeName') ? 'error' : false,
                                            type: 'text',
                                            onchange: m.withAttr('value', vnode.state.vm.fields.completeName),
                                            value: vnode.state.vm.fields.completeName(),
                                            placeholder: 'Nome Completo'
                                        }),
                                        vnode.state.fieldHasError('completeName')
                                    ]),
                                    m('.w-col.w-col-5', (vnode.state.vm.isInternational() ? '' : [
                                        m('label.field-label.fontweight-semibold[for=\'document\']',
                                          I18n.t('fields.owner_document', vnode.state.scope())
                                         ),
                                        m('input.w-input.text-field[id=\'document\']', {
                                            onfocus: vnode.state.vm.resetFieldError('ownerDocument'),
                                            class: vnode.state.fieldHasError('ownerDocument') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', vnode.state.applyDocumentMask),
                                            value: vnode.state.vm.fields.ownerDocument()
                                        }),
                                        vnode.state.fieldHasError('ownerDocument')
                                    ])),
                                ])),
                                m('.w-checkbox.w-clearfix', [
                                    m('input.w-checkbox-input[id=\'anonymous\'][name=\'anonymous\'][type=\'checkbox\']', {
                                        onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_anonymous_change' }),
                                        onchange: m.withAttr('value', vnode.state.vm.fields.anonymous),
                                        checked: vnode.state.vm.fields.anonymous(),
                                    }),
                                    m('label.w-form-label.fontsize-smallest[for=\'anonymous\']',
                                        I18n.t('fields.anonymous', vnode.state.scope())
                                    )
                                ]),
                                vnode.state.vm.fields.anonymous() ? m('.card.card-message.u-radius.zindex-10.fontsize-smallest',
                                    m('div', [
                                        m('span.fontweight-bold', [
                                            I18n.t('anonymous_confirmation_title', vnode.state.scope()),
                                            m('br')
                                        ]),
                                        m('br'),
                                        I18n.t('anonymous_confirmation', vnode.state.scope())
                                    ])
                                ) : ''
                            ])
                        ]),
                        m('.u-marginbottom-40',
                            m('.w-form', [
                                m('label.field-label.fontweight-semibold[for=\'street\']',
                                    I18n.t('fields.street', vnode.state.scope())
                                ),
                                m('input.w-input.text-field[id=\'street\']', {
                                    type: 'text',
                                    onfocus: vnode.state.vm.resetFieldError('street'),
                                    class: vnode.state.fieldHasError('street') ? 'error' : false,
                                    onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.street)),
                                    value: vnode.state.vm.fields.street(),
                                    placeholder: 'Rua Da Minha Casa'
                                }),
                                vnode.state.fieldHasError('street'),
                                m('.w-row', vnode.state.vm.isInternational() ? '' : [
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'number\']',
                                            I18n.t('fields.street_number', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'number\']', {
                                            onfocus: vnode.state.vm.resetFieldError('number'),
                                            class: vnode.state.fieldHasError('number') ? 'error' : false,
                                            type: 'text',
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.number)),
                                            value: vnode.state.vm.fields.number(),
                                            placeholder: '421'
                                        }),
                                        vnode.state.fieldHasError('number')
                                    ]),
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'address-complement\']',
                                            I18n.t('fields.street_complement', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'address-complement\']', {
                                            onfocus: vnode.state.vm.resetFieldError('addressComplement'),
                                            class: vnode.state.fieldHasError('addressComplement') ? 'error' : false,
                                            type: 'text',
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.addressComplement)),
                                            value: vnode.state.vm.fields.addressComplement(),
                                            placeholder: 'Residencial 123'
                                        }),
                                        vnode.state.fieldHasError('addressComplement')
                                    ]),
                                    m('.w-col.w-col-4', vnode.state.vm.isInternational() ? '' : [
                                        m('label.field-label.fontweight-semibold[for=\'neighbourhood\']',
                                            I18n.t('fields.neighbourhood', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'neighbourhood\']', {
                                            onfocus: vnode.state.vm.resetFieldError('neighbourhood'),
                                            class: vnode.state.fieldHasError('neighbourhood') ? 'error' : false,
                                            type: 'text',
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.neighbourhood)),
                                            value: vnode.state.vm.fields.neighbourhood(),
                                            placeholder: 'São José'
                                        }),
                                        vnode.state.fieldHasError('neighbourhood')
                                    ])
                                ]),
                                m('.w-row', [
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'zip-code\']',
                                            I18n.t('fields.zipcode', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'zip-code\']', {
                                            type: 'tel',
                                            onfocus: vnode.state.vm.resetFieldError('zipCode'),
                                            class: vnode.state.fieldHasError('zipCode') ? 'error' : false,
                                            onchange: vnode.state.addressChange(),
                                            onkeyup: m.withAttr('value', value => !vnode.state.vm.isInternational() ? vnode.state.applyZipcodeMask(value) : vnode.state.vm.fields.zipCode(value)),
                                            value: vnode.state.vm.fields.zipCode(),
                                            placeholder: '42100000'
                                        }),
                                        vnode.state.fieldHasError('zipCode')
                                    ]),
                                    m('.w-col.w-col-4.w-sub-col', [
                                        m('label.field-label.fontweight-semibold[for=\'city\']',
                                            I18n.t('fields.city', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'city\']', {
                                            onfocus: vnode.state.vm.resetFieldError('city'),
                                            class: vnode.state.fieldHasError('city') ? 'error' : false,
                                            type: 'text',
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.city)),
                                            value: vnode.state.vm.fields.city(),
                                            placeholder: 'Cidade'
                                        }),
                                        vnode.state.fieldHasError('city')
                                    ]),
                                    m('.w-col.w-col-4', [
                                        m('label.field-label.fontweight-semibold[for=\'state\']',
                                            I18n.t('fields.state', vnode.state.scope())
                                        ),
                                        vnode.state.vm.isInternational() ? m('input.w-input.text-field[id=\'address-state\']', {
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.userState)),
                                            class: vnode.state.fieldHasError('userState') ? 'error' : false,
                                            value: vnode.state.vm.fields.userState()
                                        }) : m('select.w-select.text-field[id=\'address-state\']', {
                                            onfocus: vnode.state.vm.resetFieldError('userState'),
                                            class: vnode.state.fieldHasError('userState') ? 'error' : false,
                                            onchange: vnode.state.addressChange(m.withAttr('value', vnode.state.vm.fields.userState)),
                                            value: vnode.state.vm.fields.userState()
                                        }, _.map(vnode.state.vm.fields.states(), (state, idx) => m('option', {
                                            value: state.acronym,
                                            selected: state.acronym === vnode.state.vm.fields.userState()
                                        }, state.name))
                                        ),
                                        vnode.state.fieldHasError('userState')
                                    ])
                                ]),
                                !vnode.state.vm.isInternational() ? m('.w-row', [
                                    m('.w-col.w-col-6', [
                                        m('label.field-label.fontweight-semibold[for=\'phone\']',
                                            I18n.t('fields.phone', vnode.state.scope())
                                        ),
                                        m('input.w-input.text-field[id=\'phone\']', {
                                            onfocus: vnode.state.vm.resetFieldError('phone'),
                                            class: vnode.state.fieldHasError('phone') ? 'error' : false,
                                            type: 'tel',
                                            onkeyup: m.withAttr('value', vnode.state.applyPhoneMask),
                                            value: vnode.state.vm.fields.phone()
                                        }),
                                        vnode.state.fieldHasError('phone')
                                    ])
                                ]) : ''
                            ])
                        ),
                        m('.w-row.u-marginbottom-40',
                            !vnode.state.showPaymentForm() ? m('.w-col.w-col-push-3.w-col-6',
                                m('button.btn.btn-large', {
                                    onclick: () => CatarseAnalytics.event({ cat: 'contribution_finish', act: 'contribution_next_click' }, vnode.state.validateForm)
                                },
                                    I18n.t('next_step', vnode.state.scope())
                                )
                            ) : ''
                        ),
                        vnode.state.showPaymentForm() ? m(paymentForm, {
                            vm: vnode.state.vm,
                            contribution_id: vnode.state.contribution().id,
                            project_id: projectVM.currentProject().project_id,
                            user_id: user.id
                        }) : ''
                    ]),
                    m('.w-col.w-col-4', [
                        m('.card.u-marginbottom-20.u-radius.w-hidden-small.w-hidden-tiny',
                            [
                                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-20',
                                    I18n.t('selected_reward.value', vnode.state.scope())
                                ),
                                m('.w-clearfix',
                                    [
                                        m('.fontsize-larger.text-success.u-left',
                                            `R$ ${formatedValue}`
                                        ),
                                        m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${vnode.state.reward().id ? `?reward_id=${vnode.state.reward().id}` : ''}"]`,
                                            'Editar'
                                        )
                                    ]
                                ),
                                m('.divider.u-marginbottom-10.u-margintop-10'),
                                m('.back-payment-info-reward', [
                                    m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                                        I18n.t('selected_reward.reward', vnode.state.scope())
                                    ),
                                    m('.fontsize-smallest.fontweight-semibold',
                                        vnode.state.reward().title
                                    ),
                                    m('.fontsize-smallest.reward-description.opened.fontcolor-secondary', {
                                        class: vnode.state.isLongDescription(vnode.state.reward())
                                                   ? vnode.state.toggleDescription() ? 'extended' : ''
                                                   : 'extended'
                                    }, vnode.state.reward().description
                                            ? vnode.state.reward().description
                                            : m.trust(
                                                I18n.t('selected_reward.review_without_reward_html',
                                                    vnode.state.scope(
                                                        _.extend({ value: Number(vnode.state.value).toFixed() })
                                                    )
                                                )
                                            )
                                    ),
                                    vnode.state.isLongDescription(vnode.state.reward()) ? m('a[href="javascript:void(0);"].link-hidden.link-more.u-marginbottom-20', {
                                        onclick: vnode.state.toggleDescription.toggle
                                    }, [
                                        vnode.state.toggleDescription() ? 'menos ' : 'mais ',
                                        m('span.fa.fa-angle-down', {
                                            class: vnode.state.toggleDescription() ? 'reversed' : ''
                                        })
                                    ]) : '',
                                    vnode.state.reward().deliver_at ? m('.fontcolor-secondary.fontsize-smallest.u-margintop-10',
                                        [
                                            m('span.fontweight-semibold',
                                                'Entrega prevista:'
                                            ),
                                            ` ${h.momentify(vnode.state.reward().deliver_at, 'MMM/YYYY')}`
                                        ]
                                    ) : '',
                                    (rewardVM.hasShippingOptions(vnode.state.reward()) || vnode.state.reward().shipping_options === 'presential')
                                        ? m('.fontcolor-secondary.fontsize-smallest', [
                                            m('span.fontweight-semibold',
                                                'Forma de envio: '
                                            ),
                                            I18n.t(`shipping_options.${vnode.state.reward().shipping_options}`, { scope: 'projects.contributions' })
                                        ])
                                        : '',
                                    m('div',
                                        // ctrl.contribution().shipping_fee_id ? [
                                        //     m('.divider.u-marginbottom-10.u-margintop-10'),
                                        //     m('.fontsize-smaller.fontweight-semibold',
                                        //         'Destino da recompensa:'
                                        //     ),
                                        //     m(`a.alt-link.fontsize-smaller.u-right[href="/projects/${projectVM.currentProject().project_id}/contributions/new${ctrl.reward().id ? `?reward_id=${ctrl.reward().id}` : ''}"]`,
                                        //         'Editar'
                                        //     ),
                                        //     m('.fontsize-smaller', { style: 'padding-right: 42px;' },
                                        //         `${rewardVM.feeDestination(ctrl.reward(), ctrl.contribution().shipping_fee_id)}`
                                        //     ),
                                        //     m('p.fontsize-smaller', `(R$ ${rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id) ? rewardVM.shippingFeeById(ctrl.contribution().shipping_fee_id).value : '...'})`)
                                        // ] : ''
                                    )
                                ]),
                        ]),
                        m(faqBox, {
                            mode: project.mode,
                            vm: vnode.state.vm,
                            faq: vnode.state.vm.faq(project.mode),
                            projectUserId: project.user_id
                        })
                    ])
                ])
            )
        ] : h.loader());
    }
};

export default projectsPayment;
