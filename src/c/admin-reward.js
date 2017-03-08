import m from 'mithril';
import h from '../h';

const adminReward = {
    view(ctrl, args) {
        const reward = args.reward(),
            contribution = args.contribution,
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

        return m('.w-col.w-col-4', [
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Reward'),
            m('.fontsize-smallest.lineheight-looser', reward.id ? [
                `ID: ${reward.id}`,
                m('br'),
                `Minimum value: Rs${h.formatNumber(reward.minimum_value, 2, 3)}`,
                m('br'),
                m.trust(`Available: ${available} / ${reward.maximum_contributions || '&infin;'}`),
                m('br'),
                `Waiting confirmation: ${reward.waiting_payment_count}`,
                m('br'),
                `Estimated Delivery: ${h.momentify(reward.deliver_at)}`,
                    m('br'),
                    m('div', [
                        'Delivery Status: ',
                        h.contributionStatusBadge(contribution),
                    ]),
                    `Description: ${reward.description}`
            ] : 'Support without reward')
        ]);
    }
};

export default adminReward;
