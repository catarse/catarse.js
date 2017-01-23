import m from 'mithril';
import h from '../h';

const adminReward = {
    view(ctrl, args) {
        const reward = args.reward(),
            available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

        return m('.w-col.w-col-4', [
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Reward'),
            m('.fontsize-smallest.lineheight-looser', reward.id ? [
                'ID: ' + reward.id,
                m('br'),
                'Minimum value: Rs' + h.formatNumber(reward.minimum_value, 2, 3),
                m('br'),
                m.trust('Available: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')),
                m('br'),
                'Waiting confirmation: ' + reward.waiting_payment_count,
                m('br'),
                'Description: ' + reward.description
            ] : 'Support without reward')
        ]);
    }
};

export default adminReward;
