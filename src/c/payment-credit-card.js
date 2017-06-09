import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import tooltip from './tooltip';
import creditCardVM from '../vms/credit-card-vm';
import creditCardInput from './credit-card-input';
import inlineError from './inline-error';

const I18nScope = _.partial(h.i18nScope, 'projects.contributions.edit');
const I18nIntScope = _.partial(h.i18nScope, 'projects.contributions.edit_international');

const paymentCreditCard = {
    oninit(vnode) {
        const vm = vnode.attrs.vm,
            loadingInstallments = console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
            loadingSavedCreditCards = console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
            selectedCreditCard = console.warn("m.prop has been removed from mithril 1.0") || m.prop({ id: -1 }),
            selectedInstallment = console.warn("m.prop has been removed from mithril 1.0") || m.prop('1'),
            showForm = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            creditCardType = console.warn("m.prop has been removed from mithril 1.0") || m.prop('unknown'),
            documentMask = _.partial(h.mask, '999.999.999-99'),
            documentCompanyMask = _.partial(h.mask, '99.999.999/9999-99');

        const onSubmit = () => {
            if (selectedCreditCard().id === -1) {
                checkExpiry();
                checkcvv();
                checkCreditCard();
                checkCreditCardName();
            } else {
                vm.creditCardFields.errors([]);
            }

            if (vm.creditCardFields.errors().length === 0) {
                vm.sendPayment(selectedCreditCard, selectedInstallment, vnode.attrs.contribution_id, vnode.attrs.project_id);
            }

            return false;
        };

        const handleValidity = (isValid, errorObj) => {
            if (!isValid) {
                vm.creditCardFields.errors().push(errorObj);
            } else {
                const errorsWithout = _.reject(vm.creditCardFields.errors(), err => _.isEqual(err, errorObj));
                vm.creditCardFields.errors(errorsWithout);
            }
        };

        const checkcvv = () => {
            const isValid = creditCardVM.validateCardcvv(vm.creditCardFields.cvv(), creditCardType()),
                errorObj = { field: 'cvv', message: I18n.t('errors.inline.creditcard_cvv', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkExpiry = () => {
            const isValid = creditCardVM.validateCardExpiry(vm.creditCardFields.expMonth(), vm.creditCardFields.expYear()),
                errorObj = { field: 'expiry', message: I18n.t('errors.inline.creditcard_expiry', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkCreditCard = () => {
            const isValid = creditCardVM.validateCardNumber(vm.creditCardFields.number()),
                errorObj = { field: 'number', message: I18n.t('errors.inline.creditcard_number', scope()) };

            handleValidity(isValid, errorObj);
        };

        const checkCardOwnerDocument = () => {
            const document = vm.creditCardFields.cardOwnerDocument(),
                striped = String(document).replace(/[\.|\-|\/]*/g, '');
            let isValid = false,
                errorMessage = '';

            if (document.length > 14) {
                isValid = h.validateCnpj(document);
                errorMessage = 'CNPJ inválido.';
            } else {
                isValid = h.validateCpf(striped);
                errorMessage = 'CPF inválido.';
            }

            handleValidity(isValid, { field: 'cardOwnerDocument', message: errorMessage });
        };

        const checkCreditCardName = () => {
            const trimmedString = vm.creditCardFields.name().replace(/ /g, '');
            const charsOnly = /^[a-zA-Z]*$/;
            const errorObj = { field: 'name', message: I18n.t('errors.inline.creditcard_name', scope()) };
            const isValid = !(_.isEmpty(trimmedString) || !charsOnly.test(trimmedString));

            handleValidity(isValid, errorObj);
        };

        const applyCreditCardNameMask = _.compose(vm.creditCardFields.name, h.noNumbersMask);

        const applyCvvMask = (value) => {
            const setValue = h.numbersOnlyMask(value.substr(0, 4));

            return vm.creditCardFields.cvv(setValue);
        };

        const applyDocumentMask = (value) => {
            if (value.length > 14) {
                vm.creditCardFields.cardOwnerDocument(documentCompanyMask(value));
            } else {
                vm.creditCardFields.cardOwnerDocument(documentMask(value));
            }
        };


        const fieldHasError = (fieldName) => {
            const fieldWithError = _.findWhere(vm.creditCardFields.errors(), { field: fieldName });

            return fieldWithError ? m(inlineError, { message: fieldWithError.message }) : '';
        };

        const buildTooltip = tooltipText => m(tooltip, {
            el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
            text: tooltipText,
            width: 380
        });

        const isCreditCardSelected = (card, idx) => selectedCreditCard() === card;

        const loadPagarme = (el, isInit) => {
            if (!isInit) {
                const script = document.createElement('script');
                script.src = '//assets.pagar.me/js/pagarme.min.js';
                document.body.appendChild(script);
                script.onload = () => {
                    vm.pagarme(window.PagarMe);
                };
            }
        };

        const selectCreditCard = (card) => {
            selectedCreditCard(card);

            if (card.id === -1) {
                showForm(true);
            } else {
                showForm(false);
            }
        };

        const scope = attr => vm.isInternational()
                   ? I18nIntScope(attr)
                   : I18nScope(attr);

        vm.getInstallments(vnode.attrs.contribution_id)
            .then(() => {
                loadingInstallments(false);
                m.redraw();
            });

        vm.getSavedCreditCards(vnode.attrs.user_id)
            .then((savedCards) => {
                loadingSavedCreditCards(false);
                selectCreditCard(savedCards[0]);
                m.redraw();
            });

        return {
            vm,
            onSubmit,
            fieldHasError,
            buildTooltip,
            loadingInstallments,
            loadingSavedCreditCards,
            installments: vm.installments,
            selectedInstallment,
            savedCreditCards: vm.savedCreditCards,
            creditCard: vm.creditCardFields,
            creditCardType,
            checkCreditCard,
            checkCreditCardName,
            applyCreditCardNameMask,
            applyCreditCardMask: vm.applyCreditCardMask,
            applyDocumentMask,
            checkCardOwnerDocument,
            applyCvvMask,
            checkcvv,
            selectCreditCard,
            isCreditCardSelected,
            expMonths: vm.expMonthOptions(),
            expYears: vm.expYearOptions(),
            loadPagarme,
            scope,
            showForm
        };
    },
    view(vnode) {
        const isInternational = vnode.state.vm.isInternational();

        return m('.w-form.u-marginbottom-40', {
            config: vnode.state.loadPagarme
        }, [
            m('form[name="email-form"]', {
                onsubmit: vnode.state.onSubmit
            }, [
                (!vnode.state.loadingSavedCreditCards() && (vnode.state.savedCreditCards().length > 1)) ? m('.my-credit-cards.w-form.back-payment-form-creditcard.records-choice.u-marginbottom-40',
                    _.map(vnode.state.savedCreditCards(), (card, idx) => m(`div#credit-card-record-${idx}.w-row.creditcard-records`, {
                        style: 'cursor:pointer;',
                        onclick: () => vnode.state.selectCreditCard(card)
                    }, [
                        m('.w-col.w-col-1.w-sub-col',
                                    m('.w-radio.w-clearfix.back-payment-credit-card-radio-field',
                                        m('input', {
                                            checked: vnode.state.isCreditCardSelected(card, idx),
                                            name: 'payment_subscription_card',
                                            type: 'radio',
                                            value: card.card_key
                                        })
                                    )
                                ),
                        card.id === -1 ? m('.w-col.w-col-11',
                                        m('.fontsize-small.fontweight-semibold.fontcolor-secondary', I18n.t('credit_card.use_another', vnode.state.scope()))
                                    ) : [
                                        m('.w-col.w-col-2.w-sub-col.w-sub-col-middle',
                                            m('.fontsize-small.fontweight-semibold.text-success', card.card_brand.toUpperCase())
                                        ),
                                        m('.w-col.w-col-5.w-sub-col.w-sub-col-middle',
                                            m('.fontsize-small.fontweight-semibold.u-marginbottom-20', `XXXX.XXXX.XXXX.${card.last_digits}`)
                                        ),
                                        m('.w-col.w-col-4',
                                            (vnode.state.loadingInstallments() || (vnode.state.installments().length <= 1)) ? '' :
                                                m('select.w-select.text-field.text-field-creditcard', {
                                                    onchange: m.withAttr('value', vnode.state.selectedInstallment),
                                                    value: vnode.state.selectedInstallment()
                                                }, _.map(vnode.state.installments(), installment => m(`option[value="${installment.number}"]`,
                                                        `${installment.number} X R$ ${installment.amount}`
                                                    ))
                                            )
                                    )
                                    ]
                    ]))
                ) : vnode.state.loadingSavedCreditCards() ? m('.fontsize-small.u-marginbottom-40', I18n.t('credit_card.loading', vnode.state.scope())) : '',
                !vnode.state.showForm() ? '' : m('#credit-card-payment-form.u-marginbottom-40', [
                    m('div#credit-card-name', [
                        m('.w-row', [
                            m((isInternational ? '.w-col.w-col-12' : '.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle'), [
                                m('label.field-label.fontweight-semibold[for="credit-card-name"]',
                                  I18n.t('credit_card.name', vnode.state.scope())
                                 ),
                                m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                                  I18n.t('credit_card.name_tip', vnode.state.scope())
                                 ),
                                m('input.w-input.text-field[name="credit-card-name"][type="text"]', {
                                    onfocus: vnode.state.vm.resetCreditCardFieldError('name'),
                                    class: vnode.state.fieldHasError('name') ? 'error' : '',
                                    onblur: vnode.state.checkCreditCardName,
                                    onkeyup: m.withAttr('value', vnode.state.applyCreditCardNameMask),
                                    value: vnode.state.creditCard.name()
                                }),
                                vnode.state.fieldHasError('name')
                            ]),
                            (!isInternational ?
                             m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle', [
                                 m('label.field-label.fontweight-semibold[for="credit-card-document"]',
                                   I18n.t('credit_card.document', vnode.state.scope())
                                  ),
                                 m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                                   I18n.t('credit_card.document_tip', vnode.state.scope())
                                  ),
                                 m('input.w-input.text-field[name="credit-card-document"]', {
                                     onfocus: vnode.state.vm.resetCreditCardFieldError('cardOwnerDocument'),
                                     class: vnode.state.fieldHasError('cardOwnerDocument') ? 'error' : '',
                                     onblur: vnode.state.checkCardOwnerDocument,
                                     onkeyup: m.withAttr('value', vnode.state.applyDocumentMask),
                                     value: vnode.state.creditCard.cardOwnerDocument()
                                 }),
                                 vnode.state.fieldHasError('cardOwnerDocument')
                             ]) : '')
                        ]),
                    ]),
                    m('div#credit-card-number', [
                        m('label.field-label.fontweight-semibold[for="credit-card-number"]',
                            I18n.t('credit_card.number', vnode.state.scope())
                        ),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.number_tip', vnode.state.scope())
                        ),
                        m(creditCardInput, {
                            onfocus: vnode.state.vm.resetCreditCardFieldError('number'),
                            onblur: vnode.state.checkCreditCard,
                            class: vnode.state.fieldHasError('number') ? 'error' : '',
                            value: vnode.state.creditCard.number,
                            name: 'credit-card-number',
                            type: vnode.state.creditCardType
                        }),
                        vnode.state.fieldHasError('number')
                    ]),
                    m('div#credit-card-date', [
                        m('label.field-label.fontweight-semibold[for="expiration-date"]', [
                            I18n.t('credit_card.expiry', vnode.state.scope())
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.expiry_tip', vnode.state.scope())
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-6.w-col-tiny-6.w-sub-col-middle',
                                m('select.w-select.text-field[name="expiration-date_month"]', {
                                    onfocus: vnode.state.vm.resetCreditCardFieldError('expiry'),
                                    class: vnode.state.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', vnode.state.creditCard.expMonth),
                                    value: vnode.state.creditCard.expMonth()
                                }, _.map(vnode.state.expMonths, month => m('option', { value: month[0] }, month[1])))
                            ),
                            m('.w-col.w-col-6.w-col-tiny-6',
                                m('select.w-select.text-field[name="expiration-date_year"]', {
                                    onfocus: vnode.state.vm.resetCreditCardFieldError('expiry'),
                                    class: vnode.state.fieldHasError('expiry') ? 'error' : '',
                                    onchange: m.withAttr('value', vnode.state.creditCard.expYear),
                                    onblur: vnode.state.checkExpiry,
                                    value: vnode.state.creditCard.expYear()
                                }, _.map(vnode.state.expYears, year => m('option', { value: year }, year)))
                            ),
                            m('.w-col.w-col-12', vnode.state.fieldHasError('expiry'))
                        ])
                    ]),
                    m('div#credit-card-cvv', [
                        m('label.field-label.fontweight-semibold[for="credit-card-cvv"]', [
                            I18n.t('credit_card.cvv', vnode.state.scope()),
                            vnode.state.buildTooltip(I18n.t('credit_card.cvv_tooltip', vnode.state.scope()))
                        ]),
                        m('.fontsize-smallest.fontcolor-terciary.u-marginbottom-10.field-label-tip.u-marginbottom-10',
                            I18n.t('credit_card.cvv_tip', vnode.state.scope())
                        ),
                        m('.w-row', [
                            m('.w-col.w-col-8.w-col-tiny-6.w-sub-col-middle',
                                m('input.w-input.text-field[name="credit-card-cvv"][type="tel"]', {
                                    onfocus: vnode.state.vm.resetCreditCardFieldError('cvv'),
                                    class: vnode.state.fieldHasError('cvv') ? 'error' : '',
                                    onkeyup: m.withAttr('value', vnode.state.applyCvvMask),
                                    onblur: vnode.state.checkcvv,
                                    value: vnode.state.creditCard.cvv()
                                }),
                                vnode.state.fieldHasError('cvv')
                            ),
                            m('.w-col.w-col-4.w-col-tiny-6.u-text-center',
                                m('img[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/57298c1c7e99926e77127bdd_cvv-card.jpg"][width="176"]')
                            )
                        ])
                    ]),
                    (vnode.state.loadingInstallments() || (vnode.state.installments().length <= 1)) ? '' : m('.w-row', [
                        m('.w-col.w-col-6', [
                            m('label.field-label.fontweight-semibold[for="split"]',
                                I18n.t('credit_card.installments', vnode.state.scope())
                            ),
                            m('select.w-select.text-field[name="split"]', {
                                onchange: m.withAttr('value', vnode.state.selectedInstallment),
                                value: vnode.state.selectedInstallment()
                            }, _.map(vnode.state.installments(), installment => m(`option[value="${installment.number}"]`,
                                     `${installment.number} X R$ ${installment.amount}`
                                 )))
                        ]),
                        m('.w-col.w-col-6')
                    ]),
                    m('.w-checkbox.w-clearfix', [
                        m('input#payment_save_card.w-checkbox-input[type="checkbox"][name="payment_save_card"]', {
                            onchange: m.withAttr('checked', vnode.state.creditCard.save),
                            checked: vnode.state.creditCard.save()
                        }),
                        m('label.w-form-label[for="payment_save_card"]',
                            I18n.t('credit_card.save_card', vnode.state.scope())
                        )
                    ])
                ]),
                m('.w-row', [
                    m('.w-col.w-col-8.w-col-push-2', [
                        !_.isEmpty(vnode.state.vm.submissionError()) ? m('.card.card-error.u-radius.zindex-10.u-marginbottom-30.fontsize-smaller',
                            m('.u-marginbottom-10.fontweight-bold', m.trust(vnode.state.vm.submissionError()))) : '',
                        vnode.state.vm.isLoading() ? h.loader() : m('input.btn.btn-large.u-marginbottom-20[type="submit"]', { value: I18n.t('credit_card.finish_payment', vnode.state.scope()) }),
                        m('.fontsize-smallest.u-text-center.u-marginbottom-30',
                            m.trust(
                                I18n.t('credit_card.terms_of_use_agreement', vnode.state.scope())
                            )
                        )
                    ])
                ])
            ])
        ]);
    }
};

export default paymentCreditCard;
