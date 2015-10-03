window.c.admin.contributionVM = ((m, c) => {
  const filterVM = c.admin.contributionFilterVM;
  const itemBuilder = [
    {
      component: 'AdminUser',
      wrapperClass: '.w-col.w-col-4'
    },
    {
      component: 'AdminProject',
      wrapperClass: '.w-col.w-col-4'
    },
    {
      component: 'AdminContribution',
      wrapperClass: '.w-col.w-col-2'
    },
    {
      component: 'PaymentStatus',
      wrapperClass: '.w-col.w-col-2'
    }
  ];
  const itemActions = [
    {
      component: 'AdminInputAction',
      data: {
        property: 'user_id',
        updateKey: 'id',
        callToAction: 'Transferir',
        innerLabel: 'Id do novo apoiador:',
        outerLabel: 'Transferir Apoio',
        placeholder: 'ex: 129908',
        model: c.models.contributionDetail
      }
    },
    {
      component: 'AdminRadioAction',
      data: {
        getKey: 'project_id',
        updateKey: 'contribution_id',
        property: 'reward_id',
        radios: 'rewards',
        callToAction: 'Alterar Recompensa',
        outerLabel: 'Recompensa',
        getModel: c.models.rewardDetail,
        updateModel: c.models.contributionDetail,
        validator: (contribution, rewards, newRewardId) => {
          var newReward = _.find(rewards, function(reward){
            if (reward.id === newRewardId){
              return reward;
            }
            return false;
          });
          if (contribution.value <= newReward.minimum_value) {
            return false;
          }
          return true;
        },
        validatorErrorMessage: 'A recompensa selecionada tem valor mínimo maior do que a contribuição.'
      }
    },
    {
      component: 'AdminInputAction',
      data: {
        property: 'state',
        updateKey: 'id',
        callToAction: 'Apagar',
        innerLabel: 'Tem certeza que deseja apagar esse apoio?',
        outerLabel: 'Apagar Apoio',
        forceValue: 'deleted',
        model: c.models.contributionDetail
      }
    }
  ];
  const filterBuilder = [
    { //full_text_index
      component: 'FilterMain',
      data: {
        vm: filterVM.full_text_index,
        placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
      }
    },
    { //state
      component: 'FilterDropdown',
      data: {
        label: 'Com o estado',
        name: 'state',
        vm: filterVM.state,
        options: [
          {value: '', option: 'Qualquer um'},
          {value: 'paid', option: 'paid'},
          {value: 'refused', option: 'refused'},
          {value: 'pending', option: 'pending'},
          {value: 'pending_refund', option: 'pending_refund'},
          {value: 'refunded', option: 'refunded'},
          {value: 'chargeback', option: 'chargeback'},
          {value: 'deleted', option: 'deleted'}
        ]
      }
    },
    { //gateway
      component: 'FilterDropdown',
      data: {
        label: 'gateway',
        name: 'gateway',
        vm: filterVM.gateway,
        options: [
          {value: '', option: 'Qualquer um'},
          {value: 'Pagarme', option: 'Pagarme'},
          {value: 'MoIP', option: 'MoIP'},
          {value: 'PayPal', option: 'PayPal'},
          {value: 'Credits', option: 'Créditos'}
        ]
      }
    },
    { //value
      component: 'FilterNumberRange',
      data: {
        label: 'Valores entre',
        first: filterVM.value.gte,
        last: filterVM.value.lte
      }
    },
    { //created_at
      component: 'FilterDateRange',
      data: {
        label: 'Período do apoio',
        first: filterVM.created_at.gte,
        last: filterVM.created_at.lte
      }
    }
  ];
  return {
    filterBuilder: filterBuilder,
    itemActions: itemActions,
    itemBuilder: itemBuilder
  };
})(window.m, window.c);
