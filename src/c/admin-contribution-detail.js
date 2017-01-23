import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import adminInputAction from './admin-input-action';
import adminRadioAction from './admin-radio-action';
import adminExternalAction from './admin-external-action';
import adminTransaction from './admin-transaction';
import adminTransactionHistory from './admin-transaction-history';
import adminReward from './admin-reward';

const adminContributionDetail = {
    controller(args) {
        let l;
        const loadReward = () => {
            const model = models.rewardDetail,
                reward_id = args.item.reward_id,
                opts = model.getRowOptions(h.idVM.id(reward_id).parameters()),
                reward = m.prop({});

            l = postgrest.loaderWithToken(opts);

            if (reward_id) {
                l.load().then(_.compose(reward, _.first));
            }

            return reward;
        };

        return {
            reward: loadReward(),
            actions: {
                transfer: {
                    property: 'user_id',
                    updateKey: 'id',
                    callToAction: 'Transfer',
                    innerLabel: 'Id of new supporter:',
                    outerLabel: 'Download Support',
                    placeholder: 'ex: 129908',
                    successMessage: 'Support transferred successfully!',
                    errorMessage: 'Support has not been transferred!',
                    model: models.contributionDetail
                },
                reward: {
                    getKey: 'project_id',
                    updateKey: 'contribution_id',
                    selectKey: 'reward_id',
                    radios: 'rewards',
                    callToAction: 'Change Reward',
                    outerLabel: 'Reward',
                    getModel: models.rewardDetail,
                    updateModel: models.contributionDetail,
                    selectedItem: loadReward(),
                    addEmpty: {id: -1, minimum_value: 10, description: 'No reward'},
                    validate(rewards, newRewardID) {
                        let reward = _.findWhere(rewards, {id: newRewardID});
                        return (args.item.value >= reward.minimum_value) ? undefined : 'Minimum reward value is greater than the contribution amount.';
                    }
                },
                refund: {
                    updateKey: 'id',
                    callToAction: 'Direct refund',
                    innerLabel: 'Are you sure you want to reimburse this support?',
                    outerLabel: 'Refund Support',
                    model: models.contributionDetail
                },
                remove: {
                    property: 'state',
                    updateKey: 'id',
                    callToAction: 'Delete',
                    innerLabel: 'Are you sure you want to delete this support?',
                    outerLabel: 'Delete Support',
                    forceValue: 'deleted',
                    successMessage: 'Support removed successfully!',
                    errorMessage: 'Support has not been removed!',
                    model: models.contributionDetail
                }
            },
            l: l
        };
    },
    view(ctrl, args) {
        let actions = ctrl.actions,
            item = args.item,
            reward = ctrl.reward;

        const addOptions = (builder, id) => {
            return _.extend({}, builder, {
                requestOptions: {
                    url: (`/admin/contributions/${id}/gateway_refund`),
                    method: 'PUT'
                }
            });
        };

        return m('#admin-contribution-detail-box', [
            m('.divider.u-margintop-20.u-marginbottom-20'),
            m('.w-row.u-marginbottom-30', [
                m.component(adminInputAction, {
                    data: actions.transfer,
                    item: item
                }),
                (ctrl.l()) ? h.loader :
                m.component(adminRadioAction, {
                    data: actions.reward,
                    item: reward,
                    getKeyValue: item.project_id,
                    updateKeyValue: item.contribution_id
                }),
                m.component(adminExternalAction, {
                    data: addOptions(actions.refund, item.id),
                    item: item
                }),
                m.component(adminInputAction, {
                    data: actions.remove,
                    item: item
                })
            ]),
            m('.w-row.card.card-terciary.u-radius', [
                m.component(adminTransaction, {
                    contribution: item
                }),
                m.component(adminTransactionHistory, {
                    contribution: item
                }),
                (ctrl.l()) ? h.loader :
                m.component(adminReward, {
                    reward: reward,
                    key: item.key
                })
            ])
        ]);
    }
};

export default adminContributionDetail;
