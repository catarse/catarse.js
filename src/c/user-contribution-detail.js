import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import paymentStatus from './payment-status';
import rewardReceiver from './reward-receiver';
import contributionVM from '../vms/contribution-vm';

const userContributionDetail = {
    controller(args) {
        const contribution = args.contribution,
            rewardDetails = args.rewardDetails,
            chosenReward = _.findWhere(rewardDetails(), {
                id: contribution.reward_id
            });

        return {
            contribution,
            chosenReward
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution;

        return m('.user-contribution-detail', [
            m('.w-col.w-col-3', [
                m('.fontsize-smallest.lineheight-tight.fontweight-semibold.u-marginbottom-10',
                    'Value of support:'
                ),
                m('.fontsize-large',
                    `Rs${contribution.value}`
                )
            ]),
            m('.w-col.w-col-3',
                m.component(paymentStatus, {
                    item: contribution
                })
            ),
            m('.w-col.w-col-5', [
                m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                    'Reward:'
                ),
                m('.fontsize-smallest.lineheight-tight.u-marginbottom-20',
                    (!_.isUndefined(ctrl.chosenReward) ? [m('.fontsize-smallest.fontweight-semibold',
                        ctrl.chosenReward.title
                    ), m('.fontsize-smallest.fontcolor-secondary',
                        ctrl.chosenReward.description
                    )] : 'No reward selected.')
                ),
                m('.fontsize-smallest.lineheight-looser',
                    (!_.isUndefined(ctrl.chosenReward) ? [
                        m('span.fontweight-semibold',
                            'Estimated delivery: '
                        ),
                        h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')
                    ] : '')
                ),
                contributionVM.canBeDelivered(contribution) ? m('.fontsize-smallest.lineheight-looser', [
                    m('span.fontweight-semibold', 'Delivery status: '),
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
