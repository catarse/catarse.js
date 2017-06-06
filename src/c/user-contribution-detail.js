import m from 'mithril';
import _ from 'underscore';
import I18n from 'i18n-js';
import h from '../h';
import ownerMessageContent from './owner-message-content';
import paymentStatus from './payment-status';
import rewardReceiver from './reward-receiver';
import contributionVM from '../vms/contribution-vm';
import modalBox from './modal-box';

const I18nScope = _.partial(h.i18nScope, 'projects');

const userContributionDetail = {
    controller(args) {
        const contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _.findWhere(rewardDetails(), {
                id: contribution.reward_id
            }),
            displayModal = h.toggleProp(false, true),
            storeId = 'message',
            project = args.project(),
            sendMessage = () => {
                if (!h.getUser()) {
                    h.storeAction(storeId, project.project_id);
                    return h.navigateToDevise();
                }

                displayModal(true);
            },
            userDetails = m.prop(args.userDetails);

        if (h.callStoredAction(storeId) === project.project_id) {
            displayModal(true);
        }

        return {
            contribution,
            chosenReward,
            sendMessage,
            userDetails,
            displayModal
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution,
            contactModalC = [ownerMessageContent, ctrl.userDetails];

        return m('.user-contribution-detail', ctrl.displayModal() ? m.component(modalBox, {
            displayModal: ctrl.displayModal,
            content: contactModalC
        }) : [
            m('.w-col.w-col-3.u-marginbottom-20',[
                m('.w-row.u-marginbottom-10', [
                    m('.w-col.w-col-4.u-marginbottom-10',
                        m(`a.w-inline-block[href='/${contribution.permalink}']`,
                            m(`img.thumb-project.u-radius[alt='${contribution.project_name}'][src='${contribution.project_image}'][width='50']`)
                        )
                    ),
                    m('.w-col.w-col-8',
                        m('.fontsize-small.fontweight-semibold.lineheight-tight',
                            m(`a.link-hidden[href='/${contribution.permalink}']`,
                                contribution.project_name
                            )
                        )
                    )
                ]),
                m('a.btn.btn-edit.btn-inline.btn-small.w-button[href="#"]', { onclick: ctrl.sendMessage },I18n.t('send_message', I18nScope()))
            ]),
            m('.w-col.w-col-3',
                [
                    m('.fontsize-base.fontweight-semibold.lineheight-looser',
                        `R$${contribution.value}`
                    ),
                    m.component(paymentStatus, {
                        item: contribution
                    })
                ]
            ),
            m('.w-col.w-col-5', [
                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                    'Recompensa:'
                ),
                m('.fontsize-smallest.lineheight-tight.u-marginbottom-20',
                    (!_.isUndefined(ctrl.chosenReward) ? [m('.fontsize-smallest.fontweight-semibold',
                        ctrl.chosenReward.title
                    ), m('.fontsize-smallest.fontcolor-secondary',
                        ctrl.chosenReward.description
                    )] : 'Nenhuma recompensa selecionada.')
                ),
                m('.fontsize-smallest.lineheight-looser',
                    (!_.isUndefined(ctrl.chosenReward) ? [
                        m('span.fontweight-semibold',
                            'Estimativa de entrega: '
                        ),
                        h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')
                    ] : '')
                ),
                contributionVM.canBeDelivered(contribution) ? m('.fontsize-smallest.lineheight-looser', [
                    m('span.fontweight-semibold', 'Status da entrega: '),
                    h.contributionStatusBadge(contribution)
                ]) : ''
            ]),
            m(rewardReceiver, {
                contribution,
                wrapperClass: ''
            })
        ]);
    }
};

export default userContributionDetail;
