import m from 'mithril';
import h from '../h';

const adminTransaction = {
    view(ctrl, args) {
        const contribution = args.contribution;
        return m('.w-col.w-col-4', [
            m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'),
            m('.fontsize-smallest.lineheight-looser', [
                'Value: Rs' + h.formatNumber(contribution.value, 2, 3),
                m('br'),
                'Rate: Rs' + h.formatNumber(contribution.gateway_fee, 2, 3),
                m('br'),
                'Waiting confirmation: ' + (contribution.waiting_payment ? 'Yes' : 'No'),
                m('br'),
                'Anonymous: ' + (contribution.anonymous ? 'Yes' : 'No'),
                m('br'),
                'Id payment: ' + contribution.gateway_id,
                m('br'),
                'Support: ' + contribution.contribution_id,
                m('br'),
                'Key: \n',
                m('br'),
                contribution.key,
                m('br'),
                'Medium: ' + contribution.gateway,
                m('br'),
                'Operator: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name),
                m('br'),
                contribution.is_second_slip ? [m('a.link-hidden[href="#"]', 'Bank slip'), ' ', m('span.badge', '2nd route')] : ''
            ])
        ]);
    }
};

export default adminTransaction;
