import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import paymentStatus from './payment-status';

const userContributionDetail = {
    controller(args) {
        const contribution = args.contribution,
              rewardDetails = args.rewardDetails,
              chosenReward = _.findWhere(rewardDetails(), {id: contribution.reward_id});

        return {
            contribution: contribution,
            chosenReward: chosenReward
        };
    },
    view(ctrl, args) {
        const contribution = args.contribution;

        return m('.user-contribution-detail', [
            m('.w-col.w-col-4',
              [
                  m('.fontsize-smallest.lineheight-tight.fontweight-semibold.u-marginbottom-10',
                    'Value of support:'
                   ),
                  m('.fontsize-large',
                    `Rs${contribution.value}`
                   )
              ]
             ),
            m('.w-col.w-col-4',
              m.component(paymentStatus, {item: contribution})
             ),
            m('.w-col.w-col-4',
              [
                  m('.fontsize-smaller.fontweight-semibold.u-marginbottom-10',
                    'Reward:'
                   ),
                  m('.fontsize-smallest.lineheight-tight.u-marginbottom-20',
                    (!_.isUndefined(ctrl.chosenReward) ? ctrl.chosenReward.description : 'No reward selected.')
                   ),
                  m('.fontsize-smallest.lineheight-looser',
                    (!_.isUndefined(ctrl.chosenReward) ? [
                        m('span.fontweight-semibold',
                          'Estimated delivery: '
                         ),
                        h.momentify(ctrl.chosenReward.deliver_at, 'MMM/YYYY')
                    ] : '')
                   )
              ]
             )
        ]);
    }
};

export default userContributionDetail;
