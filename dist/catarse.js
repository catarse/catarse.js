"use strict";

window.c = (function () {
  return {
    models: {},
    pages: {},
    contribution: {},
    admin: {},
    project: {},
    h: {}
  };
})();
'use strict';

window.c.h = (function (m, moment) {
  //Date Helpers
  var momentify = function momentify(date, format) {
    format = format || 'DD/MM/YYYY';
    return date ? moment(date).format(format) : 'no date';
  },
      momentFromString = function momentFromString(date, format) {
    var european = moment(date, format || 'DD/MM/YYYY');
    return european.isValid() ? european : moment(date);
  },

  //Number formatting helpers
  generateFormatNumber = function generateFormatNumber(s, c) {
    return function (number, n, x) {
      if (number === null || number === undefined) {
        return null;
      }

      var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
          num = number.toFixed(Math.max(0, ~ ~n));
      return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
    };
  },
      formatNumber = generateFormatNumber('.', ','),

  //Object manipulation helpers
  generateRemaingTime = function generateRemaingTime(project) {
    var remainingTextObj = m.prop({}),
        translatedTime = {
      days: 'dias',
      minutes: 'minutos',
      hours: 'horas',
      seconds: 'segundos'
    };

    remainingTextObj({
      unit: translatedTime[project.remaining_time.unit || 'seconds'],
      total: project.remaining_time.total
    });

    return remainingTextObj;
  },
      toggleProp = function toggleProp(defaultState, alternateState) {
    var p = m.prop(defaultState);
    p.toggle = function () {
      p(p() === alternateState ? defaultState : alternateState);
    };

    return p;
  },
      idVM = m.postgrest.filtersVM({ id: 'eq' }),
      useAvatarOrDefault = function useAvatarOrDefault(avatarPath) {
    return avatarPath || '/assets/catarse_bootstrap/user.jpg';
  },

  //Templates
  loader = function loader() {
    return m('.u-text-center.u-margintop-30[style="margin-bottom:-110px;"]', [m('img[alt="Loader"][src="https://s3.amazonaws.com/catarse.files/loader.gif"]')]);
  };

  return {
    momentify: momentify,
    momentFromString: momentFromString,
    formatNumber: formatNumber,
    idVM: idVM,
    toggleProp: toggleProp,
    generateRemaingTime: generateRemaingTime,
    loader: loader,
    useAvatarOrDefault: useAvatarOrDefault
  };
})(window.m, window.moment);
'use strict';

window.c.models = (function (m) {
  var contributionDetail = m.postgrest.model('contribution_details'),
      projectDetail = m.postgrest.model('project_details'),
      contributions = m.postgrest.model('contributions'),
      teamTotal = m.postgrest.model('team_totals'),
      projectContributionsPerDay = m.postgrest.model('project_contributions_per_day'),
      projectContributionsPerLocation = m.postgrest.model('project_contributions_per_location'),
      project = m.postgrest.model('projects'),
      category = m.postgrest.model('categories'),
      teamMember = m.postgrest.model('team_members'),
      statistic = m.postgrest.model('statistics');
  teamMember.pageSize(40);
  project.pageSize(3);
  category.pageSize(50);

  return {
    contributionDetail: contributionDetail,
    projectDetail: projectDetail,
    contributions: contributions,
    teamTotal: teamTotal,
    teamMember: teamMember,
    project: project,
    category: category,
    projectContributionsPerDay: projectContributionsPerDay,
    projectContributionsPerLocation: projectContributionsPerLocation,
    statistic: statistic
  };
})(window.m);
'use strict';

window.c.AdminContribution = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var contribution = args.item;
      return m('.w-row.admin-contribution', [m('.fontweight-semibold.lineheight-tighter.u-marginbottom-10.fontsize-small', 'R$' + contribution.value), m('.fontsize-smallest.fontcolor-secondary', h.momentify(contribution.created_at, 'DD/MM/YYYY HH:mm[h]')), m('.fontsize-smallest', ['ID do Gateway: ', m('a.alt-link[target="_blank"][href="https://dashboard.pagar.me/#/transactions/' + contribution.gateway_id + '"]', contribution.gateway_id)])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminDetail = (function (m, _, c) {
  return {
    controller: function controller() {},
    view: function view(ctrl, args) {
      var actions = args.actions,
          item = args.item;
      return m('#admin-contribution-detail-box', [m('.divider.u-margintop-20.u-marginbottom-20'), m('.w-row.u-marginbottom-30', _.map(actions, function (action) {
        return m.component(c[action.component], { data: action.data, item: args.item });
      })), m('.w-row.card.card-terciary.u-radius', [m.component(c.AdminTransaction, { contribution: item }), m.component(c.AdminTransactionHistory, { contribution: item }), m.component(c.AdminReward, { contribution: item, key: item.key })])]);
    }
  };
})(window.m, window._, window.c);
'use strict';

window.c.AdminFilter = (function (c, m, _, h) {
  return {
    controller: function controller() {
      return {
        toggler: h.toggleProp(false, true)
      };
    },
    view: function view(ctrl, args) {
      var filterBuilder = args.filterBuilder,
          main = _.findWhere(filterBuilder, { component: 'FilterMain' });

      return m('#admin-contributions-filter.w-section.page-header', [m('.w-container', [m('.fontsize-larger.u-text-center.u-marginbottom-30', 'Apoios'), m('.w-form', [m('form', {
        onsubmit: args.submit
      }, [_.findWhere(filterBuilder, { component: 'FilterMain' }) ? m.component(c[main.component], main.data) : '', m('.u-marginbottom-20.w-row', m('button.w-col.w-col-12.fontsize-smallest.link-hidden-light[style="background: none; border: none; outline: none; text-align: left;"][type="button"]', {
        onclick: ctrl.toggler.toggle
      }, 'Filtros avançados  >')), ctrl.toggler() ? m('#advanced-search.w-row.admin-filters', [_.map(filterBuilder, function (f) {
        return f.component !== 'FilterMain' ? m.component(c[f.component], f.data) : '';
      })]) : ''])])])]);
    }
  };
})(window.c, window.m, window._, window.c.h);
'use strict';

window.c.AdminInputAction = (function (m, h, c) {
  return {
    controller: function controller(args) {
      var builder = args.data,
          complete = m.prop(false),
          error = m.prop(false),
          fail = m.prop(false),
          data = {},
          item = args.item,
          key = builder.property,
          newValue = m.prop(builder.forceValue || '');

      h.idVM.id(item[builder.updateKey]);

      var l = m.postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

      var updateItem = function updateItem(res) {
        _.extend(item, res[0]);
        complete(true);
        error(false);
      };

      var submit = function submit() {
        data[key] = newValue();
        l.load().then(updateItem, error);
        return false;
      };

      var unload = function unload(el, isinit, context) {
        context.onunload = function () {
          complete(false);
          error(false);
          newValue(builder.forceValue || '');
        };
      };

      return {
        complete: complete,
        error: error,
        l: l,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload
      };
    },
    view: function view(ctrl, args) {
      var data = args.data,
          btnValue = ctrl.l() ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
        onclick: ctrl.toggler.toggle
      }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', { config: ctrl.unload }, [m('form.w-form', {
        onsubmit: ctrl.submit
      }, !ctrl.complete() ? [m('label', data.innerLabel), !data.forceValue ? m('input.w-input.text-field[type="text"][placeholder="' + data.placeholder + '"]', { onchange: m.withAttr('value', ctrl.newValue), value: ctrl.newValue() }) : '', m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Apoio transferido com sucesso!')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição. O apoio não foi transferido!')])])]) : '']);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminItem = (function (m, _, h, c) {
  return {
    controller: function controller(args) {

      var displayDetailBox = h.toggleProp(false, true);

      return {
        displayDetailBox: displayDetailBox
      };
    },

    view: function view(ctrl, args) {
      var item = args.item;

      return m('.w-clearfix.card.u-radius.u-marginbottom-20.results-admin-items', [m('.w-row', [_.map(args.builder, function (desc) {
        return m(desc.wrapperClass, [m.component(c[desc.component], { item: item, key: item.key })]);
      })]), m('button.w-inline-block.arrow-admin.fa.fa-chevron-down.fontcolor-secondary', { onclick: ctrl.displayDetailBox.toggle }), ctrl.displayDetailBox() ? m.component(c.AdminDetail, { item: item, actions: args.actions, key: item.key }) : '']);
    }
  };
})(window.m, window._, window.c.h, window.c);
'use strict';

window.c.AdminList = (function (m, h, c) {
  var admin = c.admin;
  return {
    controller: function controller(args) {
      var list = args.vm.list;
      if (!list.collection().length && list.firstPage) {
        list.firstPage().then(null, function (serverError) {
          args.vm.error(serverError.message);
        });
      }
    },

    view: function view(ctrl, args) {
      var list = args.vm.list,
          error = args.vm.error;
      return m('.w-section.section', [m('.w-container', error() ? m('.card.card-error.u-radius.fontweight-bold', error()) : [m('.w-row.u-marginbottom-20', [m('.w-col.w-col-9', [m('.fontsize-base', list.isLoading() ? 'Buscando apoios...' : [m('span.fontweight-semibold', list.total()), ' apoios encontrados'])])]), m('#admin-contributions-list.w-container', [list.collection().map(function (item) {
        return m.component(c.AdminItem, { builder: args.itemBuilder, actions: args.itemActions, item: item, key: item.key });
      }), m('.w-section.section', [m('.w-container', [m('.w-row', [m('.w-col.w-col-2.w-col-push-5', [!list.isLoading() ? m('button#load-more.btn.btn-medium.btn-terciary', { onclick: list.nextPage }, 'Carregar mais') : h.loader()])])])])])])]);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminProjectDetailsCard = (function (m, h) {
  return {
    controller: function controller(args) {
      var project = args.resource,
          generateStatusText = function generateStatusText() {
        var statusTextObj = m.prop({}),
            statusText = {
          online: { cssClass: 'text-success', text: 'NO AR' },
          successful: { cssClass: 'text-success', text: 'FINANCIADO' },
          failed: { cssClass: 'text-error', text: 'NÃO FINANCIADO' },
          waiting_funds: { cssClass: 'text-waiting', text: 'AGUARDANDO' },
          rejected: { cssClass: 'text-error', text: 'RECUSADO' },
          draft: { cssClass: '', text: 'RASCUNHO' },
          in_analysis: { cssClass: '', text: 'EM ANÁLISE' },
          approved: { cssClass: 'text-success', text: 'APROVADO' }
        };

        statusTextObj(statusText[project.state]);

        return statusTextObj;
      };

      return {
        project: project,
        statusTextObj: generateStatusText(),
        remainingTextObj: h.generateRemaingTime(project)
      };
    },

    view: function view(ctrl) {
      var project = ctrl.project,
          progress = project.progress.toFixed(2),
          statusTextObj = ctrl.statusTextObj(),
          remainingTextObj = ctrl.remainingTextObj();

      return m('.project-details-card.card.u-radius.card-terciary.u-marginbottom-20', [m('div', [m('.fontsize-small.fontweight-semibold', [m('span.fontcolor-secondary', 'Status:'), ' ', m('span', { 'class': statusTextObj.cssClass }, statusTextObj.text), ' ']), (function () {
        if (project.is_published) {
          return [m('.meter.u-margintop-20.u-marginbottom-10', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })]), m('.w-row', [m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', ['R$ ' + h.formatNumber(project.pledged, 2)]), m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')]), m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total), m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' restantes')])])];
        }
      })()])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminProjectDetailsExplanation = (function (m, h) {
  return {
    controller: function controller(args) {
      var explanation = function explanation(resource) {
        var stateText = {
          online: [m('span', 'Você pode receber apoios até 23hs59min59s do dia ' + h.momentify(resource.zone_expires_at) + '. Lembre-se, é tudo-ou-nada e você só levará os recursos captados se bater a meta dentro desse prazo.')],
          successful: [m('span.fontweight-semibold', resource.user.name + ', comemore que você merece!'), ' Seu projeto foi bem sucedido e agora é a hora de iniciar o trabalho de relacionamento com seus apoiadores! ', 'Atenção especial à entrega de recompensas. Prometeu? Entregue! Não deixe de olhar a seção de pós-projeto do ', m('a.alt-link[href="/guides"]', 'Guia dos Realizadores'), ' e de informar-se sobre ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como o repasse do dinheiro será feito.')],
          waiting_funds: [m('span.fontweight-semibold', resource.user.name + ', estamos processando os últimos pagamentos!'), ' Seu projeto foi finalizado em ' + h.momentify(resource.zone_expires_at) + ' e está aguardando confirmação de boletos e pagamentos. ', 'Devido à data de vencimento de boletos, projetos que tiveram apoios de última hora ficam por até 4 dias úteis nesse status, contados a partir da data de finalização do projeto. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'Entenda como o repasse de dinheiro é feito para projetos bem sucedidos.')],
          failed: [m('span.fontweight-semibold', resource.user.name + ', não desanime!'), ' Seu projeto não bateu a meta e sabemos que isso não é a melhor das sensações. Mas não desanime. ', 'Encare o processo como um aprendizado e não deixe de cogitar uma segunda tentativa. Não se preocupe, todos os seus apoiadores receberão o dinheiro de volta. ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202365507-Regras-e-funcionamento-dos-reembolsos-estornos"][target="_blank"]', 'Entenda como fazemos estornos e reembolsos.')],
          rejected: [m('span.fontweight-semibold', resource.user.name + ', infelizmente não foi desta vez.'), ' Você enviou seu projeto para análise do Catarse e entendemos que ele não está de acordo com o perfil do site. ', 'Ter um projeto recusado não impede que você envie novos projetos para avaliação ou reformule seu projeto atual. ', 'Converse com nosso atendimento! Recomendamos que você dê uma boa olhada nos ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202387638-Diretrizes-para-cria%C3%A7%C3%A3o-de-projetos"][target="_blank"]', 'critérios da plataforma'), ' e no ', m('a.alt-link[href="/guides"]', 'guia dos realizadores'), '.'],
          draft: [m('span.fontweight-semibold', resource.user.name + ', construa o seu projeto!'), ' Quanto mais cuidadoso e bem formatado for um projeto, maiores as chances de ele ser bem sucedido na sua campanha de captação. ', 'Antes de enviar seu projeto para a nossa análise, preencha todas as abas ao lado com carinho. Você pode salvar as alterações e voltar ao rascunho de projeto quantas vezes quiser. ', 'Quando tudo estiver pronto, clique no botão ENVIAR e entraremos em contato para avaliar o seu projeto.'],
          in_analysis: [m('span.fontweight-semibold', resource.user.name + ', você enviou seu projeto para análise em ' + h.momentify(resource.sent_to_analysis_at) + ' e receberá nossa avaliação em até 4 dias úteis após o envio!'), ' Enquanto espera a sua resposta, você pode continuar editando o seu projeto. ', 'Recomendamos também que você vá coletando feedback com as pessoas próximas e planejando como será a sua campanha.'],
          approved: [m('span.fontweight-semibold', resource.user.name + ', seu projeto foi aprovado!'), ' Para colocar o seu projeto no ar é preciso apenas que você preencha os dados necessários na aba ', m('a.alt-link[href="#user_settings"]', 'Conta'), '. É importante saber que cobramos a taxa de 13% do valor total arrecadado apenas por projetos bem sucedidos. Entenda ', m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="_blank"]', 'como fazemos o repasse do dinheiro.')]
        };

        return stateText[resource.state];
      };

      return {
        explanation: explanation(args.resource)
      };
    },
    view: function view(ctrl, args) {
      return m('p.' + args.resource.state + '-project-text.fontsize-small.lineheight-loose', ctrl.explanation);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminProject = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var project = args.item;
      return m('.w-row.admin-project', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.thumb-project.u-radius[src=' + project.project_img + '][width=50]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/' + project.permalink + '"]', project.project_name)]), m('.fontsize-smallest.fontweight-semibold', project.project_state), m('.fontsize-smallest.fontcolor-secondary', h.momentify(project.project_online_date) + ' a ' + h.momentify(project.project_expires_at))])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminRadioAction = (function (m, h, c) {
  return {
    controller: function controller(args) {
      var builder = args.data,
          complete = m.prop(false),
          data = {},

      //TODO: Implement a descriptor to abstract the initial description
      description = m.prop(args.item.reward.description || ''),
          error = m.prop(false),
          fail = m.prop(false),
          item = args.item,
          key = builder.getKey,
          newValue = m.prop(''),
          getFilter = {},
          setFilter = {},
          radios = m.prop(),
          getKey = builder.getKey,
          getAttr = builder.radios,
          updateKey = builder.updateKey;

      setFilter[updateKey] = 'eq';
      var setVM = m.postgrest.filtersVM(setFilter);
      setVM[updateKey](item[updateKey]);

      getFilter[getKey] = 'eq';
      var getVM = m.postgrest.filtersVM(getFilter);
      getVM[getKey](item[getKey]);

      var getLoader = m.postgrest.loaderWithToken(builder.getModel.getRowOptions(getVM.parameters()));

      var setLoader = m.postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

      var updateItem = function updateItem(data) {
        _.extend(item, data[0]);
        complete(true);
      };

      var fetch = function fetch() {
        getLoader.load().then(function (item) {
          radios(item[0][getAttr]);
        }, error);
      };

      var submit = function submit() {
        if (newValue()) {
          data[builder.property] = newValue();
          setLoader.load().then(updateItem, error);
        }
        return false;
      };

      var unload = function unload(el, isinit, context) {
        context.onunload = function () {
          complete(false);
          error(false);
          newValue('');
        };
      };

      var setDescription = function setDescription(text) {
        description(text);
        m.redraw();
      };

      fetch();

      return {
        complete: complete,
        description: description,
        setDescription: setDescription,
        error: error,
        setLoader: setLoader,
        getLoader: getLoader,
        newValue: newValue,
        submit: submit,
        toggler: h.toggleProp(false, true),
        unload: unload,
        radios: radios
      };
    },
    view: function view(ctrl, args) {
      var data = args.data,
          btnValue = ctrl.setLoader() || ctrl.getLoader() ? 'por favor, aguarde...' : data.callToAction;

      return m('.w-col.w-col-2', [m('button.btn.btn-small.btn-terciary', {
        onclick: ctrl.toggler.toggle
      }, data.outerLabel), ctrl.toggler() ? m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', { config: ctrl.unload }, [m('form.w-form', {
        onsubmit: ctrl.submit
      }, !ctrl.complete() ? [ctrl.radios() ? _.map(ctrl.radios(), function (radio, index) {
        var set = function set() {
          ctrl.newValue(radio.id);
          ctrl.setDescription(radio.description);
        };
        var selected = radio.id === args.item.reward.id ? true : false;

        return m('.w-radio', [m('input#r-' + index + '.w-radio-input[type=radio][name="admin-radio"][value="' + radio.id + '"]' + (selected ? '[checked]' : ''), {
          onclick: set
        }), m('label.w-form-label[for="r-' + index + '"]', 'R$' + radio.minimum_value)]);
      }) : h.loader(), m('strong', 'Descrição'), m('p', ctrl.description()), m('input.w-button.btn.btn-small[type="submit"][value="' + btnValue + '"]')] : !ctrl.error() ? [m('.w-form-done[style="display:block;"]', [m('p', 'Recompensa alterada com sucesso!')])] : [m('.w-form-error[style="display:block;"]', [m('p', 'Houve um problema na requisição. O apoio não foi transferido!')])])]) : '']);
    }
  };
})(window.m, window.c.h, window.c);
'use strict';

window.c.AdminReward = (function (m, h, _) {
  return {
    view: function view(ctrl, args) {
      var reward = args.contribution.reward || {},
          available = parseInt(reward.paid_count) + parseInt(reward.waiting_payment_count);

      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Recompensa'), m('.fontsize-smallest.lineheight-looser', _.isEmpty(reward) ? 'Apoio sem recompensa.' : ['ID: ' + reward.id, m('br'), 'Valor mínimo: R$' + h.formatNumber(reward.minimum_value, 2, 3), m('br'), m.trust('Disponíveis: ' + available + ' / ' + (reward.maximum_contributions || '&infin;')), m('br'), 'Aguardando confirmação: ' + reward.waiting_payment_count, m('br'), 'Descrição: ' + reward.description])]);
    }
  };
})(window.m, window.c.h, window._);
'use strict';

window.c.AdminTransactionHistory = (function (m, h, _) {
  return {
    controller: function controller(args) {
      var contribution = args.contribution,
          mapEvents = _.reduce([{ date: contribution.paid_at, name: 'Apoio confirmado' }, { date: contribution.pending_refund_at, name: 'Reembolso solicitado' }, { date: contribution.refunded_at, name: 'Estorno realizado' }, { date: contribution.created_at, name: 'Apoio criado' }, { date: contribution.refused_at, name: 'Apoio cancelado' }, { date: contribution.deleted_at, name: 'Apoio excluído' }, { date: contribution.chargeback_at, name: 'Chargeback' }], function (memo, item) {
        if (item.date !== null && item.date !== undefined) {
          item.originalDate = item.date;
          item.date = h.momentify(item.date, 'DD/MM/YYYY, HH:mm');
          return memo.concat(item);
        }

        return memo;
      }, []);

      return {
        orderedEvents: _.sortBy(mapEvents, 'originalDate')
      };
    },

    view: function view(ctrl) {
      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Histórico da transação'), ctrl.orderedEvents.map(function (cEvent) {
        return m('.w-row.fontsize-smallest.lineheight-looser.date-event', [m('.w-col.w-col-6', [m('.fontcolor-secondary', cEvent.date)]), m('.w-col.w-col-6', [m('div', cEvent.name)])]);
      })]);
    }
  };
})(window.m, window.c.h, window._);
'use strict';

window.c.AdminTransaction = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var contribution = args.contribution;
      return m('.w-col.w-col-4', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-20', 'Detalhes do apoio'), m('.fontsize-smallest.lineheight-looser', ['Valor: R$' + h.formatNumber(contribution.value, 2, 3), m('br'), 'Taxa: R$' + h.formatNumber(contribution.gateway_fee, 2, 3), m('br'), 'Aguardando Confirmação: ' + (contribution.waiting_payment ? 'Sim' : 'Não'), m('br'), 'Anônimo: ' + (contribution.anonymous ? 'Sim' : 'Não'), m('br'), 'Id pagamento: ' + contribution.gateway_id, m('br'), 'Apoio: ' + contribution.contribution_id, m('br'), 'Chave: \n', m('br'), contribution.key, m('br'), 'Meio: ' + contribution.gateway, m('br'), 'Operadora: ' + (contribution.gateway_data && contribution.gateway_data.acquirer_name), m('br'), (function () {
        if (contribution.is_second_slip) {
          return [m('a.link-hidden[href="#"]', 'Boleto bancário'), ' ', m('span.badge', '2a via')];
        }
      })()])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.AdminUser = (function (m, h) {
  return {
    view: function view(ctrl, args) {
      var user = args.item;
      return m('.w-row.admin-user', [m('.w-col.w-col-3.w-col-small-3.u-marginbottom-10', [m('img.user-avatar[src="' + h.useAvatarOrDefault(user.user_profile_img) + '"]')]), m('.w-col.w-col-9.w-col-small-9', [m('.fontweight-semibold.fontsize-smaller.lineheight-tighter.u-marginbottom-10', [m('a.alt-link[target="_blank"][href="/users/' + user.user_id + '/edit"]', user.user_name)]), m('.fontsize-smallest', 'Usuário: ' + user.user_id), m('.fontsize-smallest.fontcolor-secondary', 'Catarse: ' + user.email), m('.fontsize-smallest.fontcolor-secondary', 'Gateway: ' + user.payer_email)])]);
    }
  };
})(window.m, window.c.h);
'use strict';

window.c.FilterDateRange = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
        onchange: m.withAttr('value', args.first),
        value: args.first()
      })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
        onchange: m.withAttr('value', args.last),
        value: args.last()
      })])])]);
    }
  };
})(window.m);
'use strict';

window.c.FilterDropdown = (function (m, _) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('select.w-select.text-field.positive[id="' + args.index + '"]', {
        onchange: m.withAttr('value', args.vm),
        value: args.vm()
      }, [_.map(args.options, function (data) {
        return m('option[value="' + data.value + '"]', data.option);
      })])]);
    }
  };
})(window.m, window._);
'use strict';

window.c.FilterMain = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-row', [m('.w-col.w-col-10', [m('input.w-input.text-field.positive.medium[placeholder="' + args.placeholder + '"][type="text"]', { onchange: m.withAttr('value', args.vm), value: args.vm() })]), m('.w-col.w-col-2', [m('input#filter-btn.btn.btn-large.u-marginbottom-10[type="submit"][value="Buscar"]')])]);
    }
  };
})(window.m);
'use strict';

window.c.FilterNumberRange = (function (m) {
  return {
    view: function view(ctrl, args) {
      return m('.w-col.w-col-3.w-col-small-6', [m('label.fontsize-smaller[for="' + args.index + '"]', args.label), m('.w-row', [m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[id="' + args.index + '"][type="text"]', {
        onchange: m.withAttr('value', args.first),
        value: args.first()
      })]), m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [m('.fontsize-smaller.u-text-center.lineheight-looser', 'e')]), m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5', [m('input.w-input.text-field.positive[type="text"]', {
        onchange: m.withAttr('value', args.last),
        value: args.last()
      })])])]);
    }
  };
})(window.m);
'use strict';

window.c.PaymentStatus = (function (m) {
  return {
    controller: function controller(args) {
      var payment = args.item,
          card = null,
          displayPaymentMethod,
          paymentMethodClass,
          stateClass;

      card = function () {
        if (payment.gateway_data) {
          switch (payment.gateway.toLowerCase()) {
            case 'moip':
              return {
                first_digits: payment.gateway_data.cartao_bin,
                last_digits: payment.gateway_data.cartao_final,
                brand: payment.gateway_data.cartao_bandeira
              };
            case 'pagarme':
              return {
                first_digits: payment.gateway_data.card_first_digits,
                last_digits: payment.gateway_data.card_last_digits,
                brand: payment.gateway_data.card_brand
              };
          }
        }
      };

      displayPaymentMethod = function () {
        switch (payment.payment_method.toLowerCase()) {
          case 'boletobancario':
            return m('span#boleto-detail', '');
          case 'cartaodecredito':
            var cardData = card();
            if (cardData) {
              return m('#creditcard-detail.fontsize-smallest.fontcolor-secondary.lineheight-tight', [cardData.first_digits + '******' + cardData.last_digits, m('br'), cardData.brand + ' ' + payment.installments + 'x']);
            }
            return '';
        }
      };

      paymentMethodClass = function () {
        switch (payment.payment_method.toLowerCase()) {
          case 'boletobancario':
            return '.fa-barcode';
          case 'cartaodecredito':
            return '.fa-credit-card';
          default:
            return '.fa-question';
        }
      };

      stateClass = function () {
        switch (payment.state) {
          case 'paid':
            return '.text-success';
          case 'refunded':
            return '.text-refunded';
          case 'pending':
          case 'pending_refund':
            return '.text-waiting';
          default:
            return '.text-error';
        }
      };

      return {
        displayPaymentMethod: displayPaymentMethod,
        paymentMethodClass: paymentMethodClass,
        stateClass: stateClass
      };
    },

    view: function view(ctrl, args) {
      var payment = args.item;
      return m('.w-row.payment-status', [m('.fontsize-smallest.lineheight-looser.fontweight-semibold', [m('span.fa.fa-circle' + ctrl.stateClass()), ' ' + payment.state]), m('.fontsize-smallest.fontweight-semibold', [m('span.fa' + ctrl.paymentMethodClass()), ' ', m('a.link-hidden[href="#"]', payment.payment_method)]), m('.fontsize-smallest.fontcolor-secondary.lineheight-tight', [ctrl.displayPaymentMethod()])]);
    }
  };
})(window.m);
'use strict';

window.c.ProjectCard = (function (m, h, models) {
  return {

    view: function view(ctrl, args) {
      var project = args.project,
          progress = project.progress.toFixed(2),
          remainingTextObj = h.generateRemaingTime(project)(),
          link = '/' + project.permalink + (args.ref ? '?ref=' + args.ref : '');

      return m('.w-col.w-col-4', [m('.card-project.card.u-radius', [m('a.card-project-thumb[href="' + link + '"]', { style: { 'background-image': 'url(' + project.project_img + ')', 'display': 'block' } }), m('.card-project-description.alt', [m('.fontweight-semibold.u-text-center-small-only.lineheight-tight.u-marginbottom-10.fontsize-base', [m('a.link-hidden[href="' + link + '"]', project.project_name)]), m('.w-hidden-small.w-hidden-tiny.fontsize-smallest.fontcolor-secondary.u-marginbottom-20', 'por ' + project.owner_name), m('.w-hidden-small.w-hidden-tiny.fontcolor-secondary.fontsize-smaller', [m('a.link-hidden[href="' + link + '"]', project.headline)])]), m('.w-hidden-small.w-hidden-tiny.card-project-author.altt', [m('.fontsize-smallest.fontcolor-secondary', [m('span.fa.fa-map-marker.fa-1', ' '), ' ' + project.city_name + ', ' + project.state_acronym])]), m('.card-project-meter', [m('.meter', [m('.meter-fill', { style: { width: (progress > 100 ? 100 : progress) + '%' } })])]), m('.card-project-stats', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4', [m('.fontsize-base.fontweight-semibold', Math.ceil(project.progress) + '%')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-center-small-only', [m('.fontsize-smaller.fontweight-semibold', 'R$ ' + h.formatNumber(project.pledged)), m('.fontsize-smallest.lineheight-tightest', 'Levantados')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.u-text-right', [m('.fontsize-smaller.fontweight-semibold', remainingTextObj.total + ' ' + remainingTextObj.unit), m('.fontsize-smallest.lineheight-tightest', 'Restantes')])])])])]);
    }
  };
})(window.m, window.c.h, window.c.models);
'use strict';

window.c.ProjectChartContributionAmountPerDay = (function (m, Chart, _, h) {
  return {
    controller: function controller(args) {
      var resource = args.collection()[0],
          mountDataset = function mountDataset() {
        return [{
          label: 'R$ arrecadados por dia',
          fillColor: 'rgba(126,194,69,0.2)',
          strokeColor: 'rgba(126,194,69,1)',
          pointColor: 'rgba(126,194,69,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: _.map(resource.source, function (item) {
            return item.total_amount;
          })
        }];
      },
          renderChart = function renderChart(element, isInitialized) {
        if (isInitialized) {
          return;
        }

        Object.defineProperty(element, 'offsetHeight', {
          get: function get() {
            return element.height;
          }
        });
        Object.defineProperty(element, 'offsetWidth', {
          get: function get() {
            return element.width;
          }
        });
        var ctx = element.getContext('2d');

        new Chart(ctx).Line({
          labels: _.map(resource.source, function (item) {
            return h.momentify(item.paid_at);
          }),
          datasets: mountDataset()
        });
      };

      return {
        renderChart: renderChart
      };
    },
    view: function view(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'R$ arrecadados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
    }
  };
})(window.m, window.Chart, window._, window.c.h);
'use strict';

window.c.ProjectChartContributionTotalPerDay = (function (m, Chart, _, h) {
  return {
    controller: function controller(args) {
      var resource = args.collection()[0],
          mountDataset = function mountDataset() {
        return [{
          label: 'Apoios confirmados por dia',
          fillColor: 'rgba(126,194,69,0.2)',
          strokeColor: 'rgba(126,194,69,1)',
          pointColor: 'rgba(126,194,69,1)',
          pointStrokeColor: '#fff',
          pointHighlightFill: '#fff',
          pointHighlightStroke: 'rgba(220,220,220,1)',
          data: _.map(resource.source, function (item) {
            return item.total;
          })
        }];
      },
          renderChart = function renderChart(element, isInitialized) {
        if (isInitialized) {
          return;
        }

        Object.defineProperty(element, 'offsetHeight', {
          get: function get() {
            return element.height;
          }
        });
        Object.defineProperty(element, 'offsetWidth', {
          get: function get() {
            return element.width;
          }
        });
        var ctx = element.getContext('2d');

        new Chart(ctx).Line({
          labels: _.map(resource.source, function (item) {
            return h.momentify(item.paid_at);
          }),
          datasets: mountDataset()
        });
      };

      return {
        renderChart: renderChart
      };
    },
    view: function view(ctrl) {
      return m('.card.u-radius.medium.u-marginbottom-30', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Apoios confirmados por dia'), m('.w-row', [m('.w-col.w-col-12.overflow-auto', [m('canvas[id="chart"][width="860"][height="300"]', { config: ctrl.renderChart })])])]);
    }
  };
})(window.m, window.Chart, window._, window.c.h);
'use strict';

window.c.ProjectContributionsPerLocationTable = (function (m, models, h, _) {
  return {
    controller: function controller(args) {
      var vm = m.postgrest.filtersVM({ project_id: 'eq' }),
          contributionsPerLocation = m.prop([]),
          generateSort = function generateSort(field) {
        return function () {
          var collection = contributionsPerLocation(),
              resource = collection[0],
              orderedSource = _.sortBy(resource.source, field);

          if (resource.orderFilter === undefined) {
            resource.orderFilter = 'DESC';
          }

          if (resource.orderFilter === 'DESC') {
            orderedSource = orderedSource.reverse();
          }

          resource.source = orderedSource;
          resource.orderFilter = resource.orderFilter === 'DESC' ? 'ASC' : 'DESC';
          contributionsPerLocation(collection);
        };
      };

      vm.project_id(args.resourceId);

      models.projectContributionsPerLocation.getRow(vm.parameters()).then(function (data) {
        contributionsPerLocation(data);
        generateSort('total_contributed')();
      });

      return {
        contributionsPerLocation: contributionsPerLocation,
        generateSort: generateSort
      };
    },
    view: function view(ctrl) {
      return m('.project-contributions-per-location', [m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', 'Localização geográfica dos apoios'), ctrl.contributionsPerLocation().map(function (contributionLocation) {
        return m('.table-outer.u-marginbottom-60', [m('.w-row.table-row.fontweight-semibold.fontsize-smaller.header', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', 'Estado')]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', { onclick: ctrl.generateSort('total_contributions') }, ['Apoios  ', m('span.fa.fa-sort')])]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col[data-ix="sort-arrows"]', [m('a.link-hidden[href="javascript:void(0);"]', { onclick: ctrl.generateSort('total_contributed') }, ['R$ apoiados ', m('span.w-hidden-small.w-hidden-tiny', '(% do total) '), ' ', m('span.fa.fa-sort')])])]), m('.table-inner.fontsize-small', [_.map(contributionLocation.source, function (source) {
          return m('.w-row.table-row', [m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.state_acronym)]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', source.total_contributions)]), m('.w-col.w-col-4.w-col-small-4.w-col-tiny-4.table-col', [m('div', ['R$ ', h.formatNumber(source.total_contributed, 2, 3), m('span.w-hidden-small.w-hidden-tiny', '  (' + source.total_on_percentage.toFixed(2) + '%)')])])]);
        })])]);
      })]);
    }
  };
})(window.m, window.c.models, window.c.h, window._);
'use strict';

window.c.ProjectReminderCount = (function (m) {
  return {
    view: function view(ctrl, args) {
      var project = args.resource;
      return m('#project-reminder-count.card.u-radius.u-text-center.medium.u-marginbottom-80', [m('.fontsize-large.fontweight-semibold', 'Total de pessoas que clicaram no botão Lembrar-me'), m('.fontsize-smaller.u-marginbottom-30', 'Um lembrete por email é enviado 48 horas antes do término da sua campanha'), m('.fontsize-jumbo', project.reminder_count)]);
    }
  };
})(window.m);
'use strict';

window.c.ProjectRow = (function (m) {
  return {

    view: function view(ctrl, args) {
      var collection = args.collection,
          ref = args.ref;
      return collection.collection().length > 0 ? m('.w-section.section.u-marginbottom-40', [m('.w-container', [m('.w-row.u-marginbottom-30', [m('.w-col.w-col-10.w-col-small-6.w-col-tiny-6', [m('.fontsize-large.lineheight-looser', collection.title)]), m('.w-col.w-col-2.w-col-small-6.w-col-tiny-6', [m('a.btn.btn-small.btn-terciary[href="/pt/explore?ref=' + ref + '#' + collection.hash + '"]', 'Ver todos')])]), m('.w-row', _.map(collection.collection(), function (project) {
        return m.component(c.ProjectCard, { project: project, ref: ref });
      }))])]) : m('');
    } };
})(window.m);
'use strict';

window.c.TeamMembers = (function (_, m, models) {
  return {
    controller: function controller() {
      var vm = { collection: m.prop([]) },
          groupCollection = function groupCollection(collection, groupTotal) {
        return _.map(_.range(Math.ceil(collection.length / groupTotal)), function (i) {
          return collection.slice(i * groupTotal, (i + 1) * groupTotal);
        });
      };

      models.teamMember.getPage().then(function (data) {
        vm.collection(groupCollection(data, 4));
      });

      return {
        vm: vm
      };
    },

    view: function view(ctrl) {
      return m('#team-members-static.w-section.section', [m('.w-container', [_.map(ctrl.vm.collection(), function (group) {
        return m('.w-row.u-text-center', [_.map(group, function (member) {
          return m('.team-member.w-col.w-col-3.w-col-small-3.w-col-tiny-6.u-marginbottom-40', [m('a.alt-link[href="/users/' + member.id + '"]', [m('img.thumb.big.u-round.u-marginbottom-10[src="' + member.img + '"]'), m('.fontweight-semibold.fontsize-base', member.name)]), m('.fontsize-smallest.fontcolor-secondary', 'Apoiou ' + member.total_contributed_projects + ' projetos')]);
        })]);
      })])]);
    }
  };
})(window._, window.m, window.c.models);
'use strict';

window.c.TeamTotal = (function (m, h, models) {
  return {
    controller: function controller() {
      var vm = { collection: m.prop([]) };

      models.teamTotal.getRow().then(function (data) {
        vm.collection(data);
      });

      return {
        vm: vm
      };
    },

    view: function view(ctrl) {
      return m('#team-total-static.w-section.section-one-column.u-margintop-40.u-text-center.u-marginbottom-20', [ctrl.vm.collection().map(function (teamTotal) {
        return m('.w-container', [m('.w-row', [m('.w-col.w-col-2'), m('.w-col.w-col-8', [m('.fontsize-base.u-marginbottom-30', 'Hoje somos ' + teamTotal.member_count + ' pessoas espalhadas por ' + teamTotal.total_cities + ' cidades em ' + teamTotal.countries.length + ' países (' + teamTotal.countries.toString() + ')! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.'), m('.fontsize-larger.lineheight-tight.text-success', 'Nossa equipe, junta, já apoiou R$' + h.formatNumber(teamTotal.total_amount) + ' para ' + teamTotal.total_contributed_projects + ' projetos!')]), m('.w-col.w-col-2')])]);
      })]);
    }
  };
})(window.m, window.c.h, window.c.models);
'use strict';

window.c.admin.Contributions = (function (m, c, h) {
  var admin = c.admin;
  return {
    controller: function controller() {
      var listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          error = m.prop(''),
          itemBuilder = [{
        component: 'AdminUser',
        wrapperClass: '.w-col.w-col-4'
      }, {
        component: 'AdminProject',
        wrapperClass: '.w-col.w-col-4'
      }, {
        component: 'AdminContribution',
        wrapperClass: '.w-col.w-col-2'
      }, {
        component: 'PaymentStatus',
        wrapperClass: '.w-col.w-col-2'
      }],
          itemActions = [{
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
      }, {
        component: 'AdminRadioAction',
        data: {
          getKey: 'project_id',
          updateKey: 'contribution_id',
          property: 'reward_id',
          radios: 'rewards',
          callToAction: 'Alterar Recompensa',
          outerLabel: 'Recompensa',
          getModel: c.models.projectDetail,
          updateModel: c.models.contributionDetail
        }
      }, {
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
      }],
          filterBuilder = [{ //full_text_index
        component: 'FilterMain',
        data: {
          vm: filterVM.full_text_index,
          placeholder: 'Busque por projeto, email, Ids do usuário e do apoio...'
        }
      }, { //state
        component: 'FilterDropdown',
        data: {
          label: 'Com o estado',
          name: 'state',
          vm: filterVM.state,
          options: [{ value: '', option: 'Qualquer um' }, { value: 'paid', option: 'paid' }, { value: 'refused', option: 'refused' }, { value: 'pending', option: 'pending' }, { value: 'pending_refund', option: 'pending_refund' }, { value: 'refunded', option: 'refunded' }, { value: 'chargeback', option: 'chargeback' }, { value: 'deleted', option: 'deleted' }]
        }
      }, { //gateway
        component: 'FilterDropdown',
        data: {
          label: 'gateway',
          name: 'gateway',
          vm: filterVM.gateway,
          options: [{ value: '', option: 'Qualquer um' }, { value: 'Pagarme', option: 'Pagarme' }, { value: 'MoIP', option: 'MoIP' }, { value: 'PayPal', option: 'PayPal' }, { value: 'Credits', option: 'Créditos' }]
        }
      }, { //value
        component: 'FilterNumberRange',
        data: {
          label: 'Valores entre',
          first: filterVM.value.gte,
          last: filterVM.value.lte
        }
      }, { //created_at
        component: 'FilterDateRange',
        data: {
          label: 'Período do apoio',
          first: filterVM.created_at.gte,
          last: filterVM.created_at.lte
        }
      }],
          submit = function submit() {
        listVM.firstPage(filterVM.parameters()).then(null, function (serverError) {
          error(serverError.message);
        });
        return false;
      };

      return {
        filterVM: filterVM,
        filterBuilder: filterBuilder,
        itemActions: itemActions,
        itemBuilder: itemBuilder,
        listVM: { list: listVM, error: error },
        submit: submit
      };
    },

    view: function view(ctrl) {
      return [m.component(c.AdminFilter, { form: ctrl.filterVM.formDescriber, filterBuilder: ctrl.filterBuilder, submit: ctrl.submit }), m.component(c.AdminList, { vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions })];
    }
  };
})(window.m, window.c, window.c.h);
'use strict';

window.c.contribution.ProjectsExplore = (function (m, c) {
  return {

    controller: function controller() {
      var vm = {
        categoryCollection: m.prop([]),
        projectCollection: m.prop([]),
        categoryName: m.prop(),
        categoryFollowers: m.prop(),

        loadCategory: function loadCategory(category) {
          var byCategoryId = m.postgrest.filtersVM({ category_id: 'eq' });
          vm.categoryName(category.name_pt);
          vm.categoryFollowers(category.followers);
          byCategoryId.category_id(category.id);
          project.getPage(byCategoryId.parameters()).then(vm.projectCollection);
        },

        loadProjects: function loadProjects(filter) {
          vm.categoryName(filter.title);
          vm.categoryFollowers(null);
          project.getPage(filter.filter.parameters()).then(vm.projectCollection);
        }
      },
          project = c.models.project,
          category = c.models.category,
          categories = m.postgrest.filtersVM({}),
          expiring = m.postgrest.filtersVM({ expires_at: 'lte', state: 'eq' }),
          recents = m.postgrest.filtersVM({ online_date: 'gte', state: 'eq' }),
          recommended = m.postgrest.filtersVM({ recommended: 'eq', state: 'eq' }),
          online = m.postgrest.filtersVM({ state: 'eq' }),
          successful = m.postgrest.filtersVM({ state: 'eq' });

      expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
      recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
      recents.state('online');
      expiring.state('online');
      online.state('online');
      successful.state('successful');
      recommended.recommended('true').state('online');

      project.pageSize(9);
      category.getPage(categories.parameters()).then(vm.categoryCollection);

      var filters = [{
        title: 'Recomendados',
        filter: recommended
      }, {
        title: 'No ar',
        filter: online
      }, {
        title: 'Reta final',
        filter: expiring
      }, {
        title: 'Bem-sucedidos',
        filter: successful
      }, {
        title: 'Recentes',
        filter: recents
      }, {
        title: 'Próximos a mim',
        filter: successful
      }];

      return {
        categories: vm.categoryCollection,
        projects: vm.projectCollection,
        categoryName: vm.categoryName,
        categoryFollowers: vm.categoryFollowers,
        filters: filters,
        vm: vm
      };
    },

    view: function view(ctrl) {
      return [m(".w-section.hero-search", [m(".w-container.u-marginbottom-10", [m(".w-row.w-hidden-main.w-hidden-medium", [m(".w-col.w-col-11", [m(".header-search", [m(".w-row", [m(".w-col.w-col-10.w-col-small-10.w-col-tiny-10", [m(".w-form", [m("form[data-name='Email Form'][id='email-form'][name='email-form']", [m("input.w-input.text-field.prefix.negative[data-name='form-search'][id='form-search'][name='form-search'][placeholder='Busque projetos'][type='text']")])]), m(".search-pre-result", [m(".w-row.u-marginbottom-10", [m(".w-col.w-col-3.w-hidden-small.w-hidden-tiny", [m("img.thumb.small.u-radius[src='../images/project_thumb_open-uri20141210-2-fc9lvc.jpeg']")]), m(".w-col.w-col-9", [m(".fontsize-smallest.fontweight-semibold.lineheight-tighter.u-marginbottom-10", "Um título de projeto aqui"), m(".meter.small", [m(".meter-fill")]), m(".w-row", [m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6", [m(".fontsize-small.fontweight-semibold.lineheight-tightest", "35%")]), m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6.u-text-center-small-only", [m(".fontsize-smallest.lineheight-tightest", "27 dias"), m(".fontsize-smallest.lineheight-tightest", "Restantes")])])])]), m(".divider.u-marginbottom-10"), m(".w-row.u-marginbottom-10", [m(".w-col.w-col-3.w-hidden-small.w-hidden-tiny", [m("img.thumb.small.u-radius[src='../images/project_thumb_open-uri20141210-2-fc9lvc.jpeg']")]), m(".w-col.w-col-9", [m(".fontsize-smallest.fontweight-semibold.lineheight-tighter.u-marginbottom-10", "Um título de projeto aqui"), m(".meter.small", [m(".meter-fill")]), m(".w-row", [m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6", [m(".fontsize-small.fontweight-semibold.lineheight-tightest", "35%")]), m(".w-col.w-col-6.w-col-small-6.w-col-tiny-6.u-text-center-small-only", [m(".fontsize-smallest.lineheight-tightest", "27 dias"), m(".fontsize-smallest.lineheight-tightest", "Restantes")])])])]), m(".divider.u-marginbottom-10"), m("a.btn.btn-small.btn-terciary[href='#']", "ver todos")])]), m(".w-col.w-col-2.w-col-small-2.w-col-tiny-2", [m("a.w-inline-block.btn.btn-attached.postfix.btn-dark[href='#']", [m("img.header-lupa[src='../images/lupa.png']")])])])])]), m(".w-col.w-col-1")])]), m(".w-container.u-marginbottom-10", [m(".u-text-center.u-marginbottom-40", [m("a.link-hidden-white.fontweight-light.fontsize-larger[href='#']", ["Explore projetos incríveis ", m("span.fa.fa-angle-down", "")])]), m(".w-row", [_.map(ctrl.categories(), function (category) {
        return m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [m('a.w-inline-block.btn-category' + (category.name_pt.length > 13 ? '.double-line' : '') + '[href=\'#by_category_id/#' + category.id + '\']', { onclick: ctrl.vm.loadCategory.bind(ctrl, category) }, [m("div", [category.name_pt, m("span.badge.explore", category.online_projects)])])]);
      })]), m(".w-row.u-marginbottom-30", [_.map(ctrl.filters, function (filter) {
        return m(".w-col.w-col-2.w-col-small-6.w-col-tiny-6", [m("a.w-inline-block.btn-category.filters[href='#recommended']", { onclick: ctrl.vm.loadProjects.bind(ctrl, filter) }, [m("div", [filter.title])])]);
      })])])]), m(".w-section", [m(".w-container", [m(".w-row", [m(".w-col.w-col-6.w-col-tiny-6", [m(".fontsize-larger", ctrl.categoryName())]), m(".w-col.w-col-6.w-col-tiny-6", [m(".w-row", [m(".w-col.w-col-9.w-col-tiny-6.w-clearfix", [m(".following.fontsize-small.fontcolor-secondary.u-right", ctrl.categoryFollowers() + ' seguidores')]), m(".w-col.w-col-3.w-col-tiny-6", [m("a.btn.btn-small[href='#']", "Seguindo ")])])])])])]), m(".w-section.section", [m(".w-container", [m(".w-row", [m('.w-row', _.map(ctrl.projects(), function (project) {
        return m.component(c.ProjectCard, { project: project });
      }))])])]), m(".w-section.section.loadmore", [m(".w-container", [m(".w-row", [m(".w-col.w-col-5"), m(".w-col.w-col-2", [m("a.btn.btn-medium.btn-terciary[href='#']", "Carregar mais")]), m(".w-col.w-col-5")])])])];
    }
  };
})(window.m, window.c);
'use strict';

window.c.contribution.ProjectsHome = (function (m, c) {
  return {
    controller: function controller() {
      var vm = {
        recommendedCollection: m.prop([]),
        recentCollection: m.prop([]),
        nearMeCollection: m.prop([]),
        expiringCollection: m.prop([])
      },
          project = c.models.project,
          expiring = m.postgrest.filtersVM({ expires_at: 'lte', state: 'eq' }),
          nearMe = m.postgrest.filtersVM({ near_me: 'eq', state: 'eq' }),
          recents = m.postgrest.filtersVM({ online_date: 'gte', state: 'eq' }),
          recommended = m.postgrest.filtersVM({ recommended: 'eq', state: 'eq' });

      expiring.expires_at(moment().add(14, 'days').format('YYYY-MM-DD'));
      expiring.state('online');

      nearMe.near_me('true').state('online');

      recents.online_date(moment().subtract(5, 'days').format('YYYY-MM-DD'));
      recents.state('online');

      recommended.recommended('true').state('online');

      project.getPageWithToken(nearMe.parameters()).then(vm.nearMeCollection);
      project.getPage(recommended.parameters()).then(vm.recommendedCollection);
      project.getPage(recents.parameters()).then(vm.recentCollection);
      project.getPage(expiring.parameters()).then(vm.expiringCollection);

      var collections = [{
        title: 'Próximos a você',
        hash: 'near_of',
        collection: vm.nearMeCollection
      }, {
        title: 'Recomendados',
        hash: 'recommended',
        collection: vm.recommendedCollection
      }, {
        title: 'Na reta final',
        hash: 'expiring',
        collection: vm.expiringCollection
      }, {
        title: 'Recentes',
        hash: 'recent',
        collection: vm.recentCollection
      }];

      return {
        collections: collections
      };
    },

    view: function view(ctrl) {
      return _.map(ctrl.collections, function (collection) {
        return m.component(c.ProjectRow, { collection: collection, ref: 'home_' + collection.hash });
      });
    }
  };
})(window.m, window.c);
'use strict';

window.c.pages.LiveStatistics = (function (m, models, h, _, JSON) {
  return {
    controller: function controller() {
      var args = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var pageStatistics = m.prop([]),
          notificationData = m.prop({});

      models.statistic.getRow().then(pageStatistics);
      // args.socket is a socket provided by socket.io
      // can see there https://github.com/catarse/catarse-live/blob/master/public/index.js#L8
      if (args.socket && _.isFunction(args.socket.on)) {
        args.socket.on('new_paid_contributions', function (msg) {
          notificationData(JSON.parse(msg.payload));
          models.statistic.getRow().then(pageStatistics);
          m.redraw();
        });
      }

      return {
        pageStatistics: pageStatistics,
        notificationData: notificationData
      };
    },
    view: function view(ctrl) {
      var data = ctrl.notificationData();

      return m('.w-section.bg-stats.section.min-height-100', [m('.w-container.u-text-center', _.map(ctrl.pageStatistics(), function (stat) {
        return [m('img.u-marginbottom-60[src="https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/55ada5dd11b36a52616d97df_symbol-catarse.png"]'), m('.fontcolor-negative.u-marginbottom-40', [m('.fontsize-megajumbo.fontweight-semibold', 'R$ ' + h.formatNumber(stat.total_contributed, 2, 3)), m('.fontsize-large', 'Doados para projetos publicados por aqui')]), m('.fontcolor-negative.u-marginbottom-60', [m('.fontsize-megajumbo.fontweight-semibold', stat.total_contributors), m('.fontsize-large', 'Pessoas já apoiaram pelo menos 1 projeto no Catarse')])];
      })), !_.isEmpty(data) ? m('.w-container', [m('div', [m('.card.u-radius.u-marginbottom-60.medium', [m('.w-row', [m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb.u-round[src="' + h.useAvatarOrDefault(data.user_image) + '"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.user_name)])])]), m('.w-col.w-col-4.u-text-center.fontsize-base.u-margintop-20', [m('div', 'acabou de apoiar o')]), m('.w-col.w-col-4', [m('.w-row', [m('.w-col.w-col-4.w-col-small-4', [m('img.thumb-project.u-radius[src="' + data.project_image + '"][width="75"]')]), m('.w-col.w-col-8.w-col-small-8', [m('.fontsize-large.lineheight-tight', data.project_name)])])])])])])]) : '', m('.u-text-center.fontsize-large.u-marginbottom-10.fontcolor-negative', [m('a.link-hidden.fontcolor-negative[href="https://github.com/catarse"][target="_blank"]', [m('span.fa.fa-github', '.'), ' Open Source com orgulho! '])])]);
    }
  };
})(window.m, window.c.models, window.c.h, window._, window.JSON);
'use strict';

window.c.pages.Team = (function (m, c) {
  return {
    view: function view() {
      return m('#static-team-app', [m.component(c.TeamTotal), m.component(c.TeamMembers)]);
    }
  };
})(window.m, window.c);
'use strict';

window.c.project.Insights = (function (m, c, models, _) {
  return {
    controller: function controller(args) {
      var vm = m.postgrest.filtersVM({ project_id: 'eq' }),
          projectDetails = m.prop([]),
          contributionsPerDay = m.prop([]);

      vm.project_id(args.root.getAttribute('data-id'));

      models.projectDetail.getRow(vm.parameters()).then(projectDetails);
      models.projectContributionsPerDay.getRow(vm.parameters()).then(contributionsPerDay);

      return {
        vm: vm,
        projectDetails: projectDetails,
        contributionsPerDay: contributionsPerDay
      };
    },
    view: function view(ctrl) {
      return _.map(ctrl.projectDetails(), function (project) {
        return m('.project-insights', [m('.w-container', [m('.w-row.u-marginbottom-40', [m('.w-col.w-col-2'), m('.w-col.w-col-8.dashboard-header.u-text-center', [m('.fontweight-semibold.fontsize-larger.lineheight-looser.u-marginbottom-10', 'Minha campanha'), m.component(c.AdminProjectDetailsCard, { resource: project }), m.component(c.AdminProjectDetailsExplanation, { resource: project })]), m('.w-col.w-col-2')])]), (function (project) {
          if (project.is_published) {
            return [m('.divider'), m('.w-section.section-one-column.bg-gray.before-footer', [m('.w-container', [m('.w-row', [m('.w-col.w-col-12.u-text-center', { style: { 'min-height': '300px' } }, [m.component(c.ProjectChartContributionTotalPerDay, { collection: ctrl.contributionsPerDay })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', { style: { 'min-height': '300px' } }, [m.component(c.ProjectChartContributionAmountPerDay, { collection: ctrl.contributionsPerDay })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectContributionsPerLocationTable, { resourceId: ctrl.vm.project_id() })])]), m('.w-row', [m('.w-col.w-col-12.u-text-center', [m.component(c.ProjectReminderCount, { resource: project })])])])])];
          }
        })(project)]);
      });
    }
  };
})(window.m, window.c, window.c.models, window._);
'use strict';

window.c.admin.contributionFilterVM = (function (m, h, replaceDiacritics) {
  var vm = m.postgrest.filtersVM({
    full_text_index: '@@',
    state: 'eq',
    gateway: 'eq',
    value: 'between',
    created_at: 'between'
  }),
      paramToString = function paramToString(p) {
    return (p || '').toString().trim();
  };

  // Set default values
  vm.state('');
  vm.gateway('');
  vm.order({ id: 'desc' });

  vm.created_at.lte.toFilter = function () {
    var filter = paramToString(vm.created_at.lte());
    return filter && h.momentFromString(filter).endOf('day').format('');
  };

  vm.created_at.gte.toFilter = function () {
    var filter = paramToString(vm.created_at.gte());
    return filter && h.momentFromString(filter).format();
  };

  vm.full_text_index.toFilter = function () {
    var filter = paramToString(vm.full_text_index());
    return filter && replaceDiacritics(filter) || undefined;
  };

  return vm;
})(window.m, window.c.h, window.replaceDiacritics);
"use strict";

window.c.admin.contributionListVM = (function (m, models) {
  return m.postgrest.paginationVM(models.contributionDetail.getPageWithToken);
})(window.m, window.c.models);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImMuanMiLCJoLmpzIiwibW9kZWxzLmpzIiwiYWRtaW4tY29udHJpYnV0aW9uLmpzIiwiYWRtaW4tZGV0YWlsLmpzIiwiYWRtaW4tZmlsdGVyLmpzIiwiYWRtaW4taW5wdXQtYWN0aW9uLmpzIiwiYWRtaW4taXRlbS5qcyIsImFkbWluLWxpc3QuanMiLCJhZG1pbi1wcm9qZWN0LWRldGFpbHMtY2FyZC5qcyIsImFkbWluLXByb2plY3QtZGV0YWlscy1leHBsYW5hdGlvbi5qcyIsImFkbWluLXByb2plY3QuanMiLCJhZG1pbi1yYWRpby1hY3Rpb24uanMiLCJhZG1pbi1yZXdhcmQuanMiLCJhZG1pbi10cmFuc2FjdGlvbi1oaXN0b3J5LmpzIiwiYWRtaW4tdHJhbnNhY3Rpb24uanMiLCJhZG1pbi11c2VyLmpzIiwiZmlsdGVyLWRhdGUtcmFuZ2UuanMiLCJmaWx0ZXItZHJvcGRvd24uanMiLCJmaWx0ZXItbWFpbi5qcyIsImZpbHRlci1udW1iZXItcmFuZ2UuanMiLCJwYXltZW50LXN0YXR1cy5qcyIsInByb2plY3QtY2FyZC5qcyIsInByb2plY3QtY2hhcnQtY29udHJpYnV0aW9uLWFtb3VudC1wZXItZGF5LmpzIiwicHJvamVjdC1jaGFydC1jb250cmlidXRpb24tdG90YWwtcGVyLWRheS5qcyIsInByb2plY3QtY29udHJpYnV0aW9ucy1wZXItbG9jYXRpb24tdGFibGUuanMiLCJwcm9qZWN0LXJlbWluZGVyLWNvdW50LmpzIiwicHJvamVjdC1yb3cuanMiLCJ0ZWFtLW1lbWJlcnMuanMiLCJ0ZWFtLXRvdGFsLmpzIiwiYWRtaW4vY29udHJpYnV0aW9ucy5qcyIsImNvbnRyaWJ1dGlvbi9wcm9qZWN0cy1leHBsb3JlLmpzIiwiY29udHJpYnV0aW9uL3Byb2plY3RzLWhvbWUuanMiLCJwYWdlcy9saXZlLXN0YXRpc3RpY3MuanMiLCJwYWdlcy90ZWFtLmpzIiwicHJvamVjdC9pbnNpZ2h0cy5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWZpbHRlci12bS5qcyIsImFkbWluL2NvbnRyaWJ1dGlvbnMvY29udHJpYnV0aW9uLWxpc3Qtdm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLENBQUMsQ0FBQyxHQUFJLENBQUEsWUFBVTtBQUNwQixTQUFPO0FBQ0wsVUFBTSxFQUFFLEVBQUU7QUFDVixTQUFLLEVBQUUsRUFBRTtBQUNULGdCQUFZLEVBQUUsRUFBRTtBQUNoQixTQUFLLEVBQUUsRUFBRTtBQUNULFdBQU8sRUFBRSxFQUFFO0FBQ1gsS0FBQyxFQUFFLEVBQUU7R0FDTixDQUFDO0NBQ0gsQ0FBQSxFQUFFLEFBQUMsQ0FBQzs7O0FDVEwsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUksQ0FBQSxVQUFTLENBQUMsRUFBRSxNQUFNLEVBQUM7O0FBRS9CLE1BQUksU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFZLElBQUksRUFBRSxNQUFNLEVBQUM7QUFDcEMsVUFBTSxHQUFHLE1BQU0sSUFBSSxZQUFZLENBQUM7QUFDaEMsV0FBTyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7R0FDdkQ7TUFFRCxnQkFBZ0IsR0FBRyxTQUFuQixnQkFBZ0IsQ0FBWSxJQUFJLEVBQUUsTUFBTSxFQUFDO0FBQ3ZDLFFBQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxJQUFJLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFdBQU8sUUFBUSxDQUFDLE9BQU8sRUFBRSxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDckQ7OztBQUdELHNCQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFZLENBQUMsRUFBRSxDQUFDLEVBQUM7QUFDbkMsV0FBTyxVQUFTLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzVCLFVBQUksTUFBTSxLQUFLLElBQUksSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzNDLGVBQU8s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QyxDQUFDLE1BQU0sQ0FBQyxBQUFDLENBQUMiLCJmaWxlIjoiY2F0YXJzZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIndpbmRvdy5jID0gKGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgbW9kZWxzOiB7fSxcbiAgICBwYWdlczoge30sXG4gICAgY29udHJpYnV0aW9uOiB7fSxcbiAgICBhZG1pbjoge30sXG4gICAgcHJvamVjdDoge30sXG4gICAgaDoge31cbiAgfTtcbn0oKSk7XG4iLCJ3aW5kb3cuYy5oID0gKGZ1bmN0aW9uKG0sIG1vbWVudCl7XG4gIC8vRGF0ZSBIZWxwZXJzXG4gIHZhciBtb21lbnRpZnkgPSBmdW5jdGlvbihkYXRlLCBmb3JtYXQpe1xuICAgIGZvcm1hdCA9IGZvcm1hdCB8fCAnREQvTU0vWVlZWSc7XG4gICAgcmV0dXJuIGRhdGUgPyBtb21lbnQoZGF0ZSkuZm9ybWF0KGZvcm1hdCkgOiAnbm8gZGF0ZSc7XG4gIH0sXG5cbiAgbW9tZW50RnJvbVN0cmluZyA9IGZ1bmN0aW9uKGRhdGUsIGZvcm1hdCl7XG4gICAgdmFyIGV1cm9wZWFuID0gbW9tZW50KGRhdGUsIGZvcm1hdCB8fCAnREQvTU0vWVlZWScpO1xuICAgIHJldHVybiBldXJvcGVhbi5pc1ZhbGlkKCkgPyBldXJvcGVhbiA6IG1vbWVudChkYXRlKTtcbiAgfSxcblxuICAvL051bWJlciBmb3JtYXR0aW5nIGhlbHBlcnNcbiAgZ2VuZXJhdGVGb3JtYXROdW1iZXIgPSBmdW5jdGlvbihzLCBjKXtcbiAgICByZXR1cm4gZnVuY3Rpb24obnVtYmVyLCBuLCB4KSB7XG4gICAgICBpZiAobnVtYmVyID09PSBudWxsIHx8IG51bWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmUgPSAnXFxcXGQoPz0oXFxcXGR7JyArICh4IHx8IDMpICsgJ30pKycgKyAobiA+IDAgPyAnXFxcXEQnIDogJyQnKSArICcpJyxcbiAgICAgICAgICBudW0gPSBudW1iZXIudG9GaXhlZChNYXRoLm1heCgwLCB+fm4pKTtcbiAgICAgIHJldHVybiAoYyA/IG51bS5yZXBsYWNlKCcuJywgYykgOiBudW0pLnJlcGxhY2UobmV3IFJlZ0V4cChyZSwgJ2cnKSwgJyQmJyArIChzIHx8ICcsJykpO1xuICAgIH07XG4gIH0sXG4gIGZvcm1hdE51bWJlciA9IGdlbmVyYXRlRm9ybWF0TnVtYmVyKCcuJywgJywnKSxcblxuICAvL09iamVjdCBtYW5pcHVsYXRpb24gaGVscGVyc1xuICBnZW5lcmF0ZVJlbWFpbmdUaW1lID0gZnVuY3Rpb24ocHJvamVjdCkge1xuICAgIHZhciByZW1haW5pbmdUZXh0T2JqID0gbS5wcm9wKHt9KSxcbiAgICAgICAgdHJhbnNsYXRlZFRpbWUgPSB7XG4gICAgICAgICAgZGF5czogJ2RpYXMnLFxuICAgICAgICAgIG1pbnV0ZXM6ICdtaW51dG9zJyxcbiAgICAgICAgICBob3VyczogJ2hvcmFzJyxcbiAgICAgICAgICBzZWNvbmRzOiAnc2VndW5kb3MnXG4gICAgICAgIH07XG5cbiAgICByZW1haW5pbmdUZXh0T2JqKHtcbiAgICAgIHVuaXQ6IHRyYW5zbGF0ZWRUaW1lW3Byb2plY3QucmVtYWluaW5nX3RpbWUudW5pdCB8fCAnc2Vjb25kcyddLFxuICAgICAgdG90YWw6IHByb2plY3QucmVtYWluaW5nX3RpbWUudG90YWxcbiAgICB9KTtcblxuICAgIHJldHVybiByZW1haW5pbmdUZXh0T2JqO1xuICB9LFxuXG4gIHRvZ2dsZVByb3AgPSBmdW5jdGlvbihkZWZhdWx0U3RhdGUsIGFsdGVybmF0ZVN0YXRlKXtcbiAgICB2YXIgcCA9IG0ucHJvcChkZWZhdWx0U3RhdGUpO1xuICAgIHAudG9nZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgIHAoKChwKCkgPT09IGFsdGVybmF0ZVN0YXRlKSA/IGRlZmF1bHRTdGF0ZSA6IGFsdGVybmF0ZVN0YXRlKSk7XG4gICAgfTtcblxuICAgIHJldHVybiBwO1xuICB9LFxuXG4gIGlkVk0gPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe2lkOiAnZXEnfSksXG5cbiAgdXNlQXZhdGFyT3JEZWZhdWx0ID0gZnVuY3Rpb24oYXZhdGFyUGF0aCkge1xuICAgIHJldHVybiBhdmF0YXJQYXRoIHx8ICcvYXNzZXRzL2NhdGFyc2VfYm9vdHN0cmFwL3VzZXIuanBnJztcbiAgfSxcblxuICAvL1RlbXBsYXRlc1xuICBsb2FkZXIgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBtKCcudS10ZXh0LWNlbnRlci51LW1hcmdpbnRvcC0zMFtzdHlsZT1cIm1hcmdpbi1ib3R0b206LTExMHB4O1wiXScsIFtcbiAgICAgIG0oJ2ltZ1thbHQ9XCJMb2FkZXJcIl1bc3JjPVwiaHR0cHM6Ly9zMy5hbWF6b25hd3MuY29tL2NhdGFyc2UuZmlsZXMvbG9hZGVyLmdpZlwiXScpXG4gICAgXSk7XG4gIH07XG5cbiAgcmV0dXJuIHtcbiAgICBtb21lbnRpZnk6IG1vbWVudGlmeSxcbiAgICBtb21lbnRGcm9tU3RyaW5nOiBtb21lbnRGcm9tU3RyaW5nLFxuICAgIGZvcm1hdE51bWJlcjogZm9ybWF0TnVtYmVyLFxuICAgIGlkVk06IGlkVk0sXG4gICAgdG9nZ2xlUHJvcDogdG9nZ2xlUHJvcCxcbiAgICBnZW5lcmF0ZVJlbWFpbmdUaW1lOiBnZW5lcmF0ZVJlbWFpbmdUaW1lLFxuICAgIGxvYWRlcjogbG9hZGVyLFxuICAgIHVzZUF2YXRhck9yRGVmYXVsdDogdXNlQXZhdGFyT3JEZWZhdWx0XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cubW9tZW50KSk7XG4iLCJ3aW5kb3cuYy5tb2RlbHMgPSAoZnVuY3Rpb24obSl7XG4gIHZhciBjb250cmlidXRpb25EZXRhaWwgPSBtLnBvc3RncmVzdC5tb2RlbCgnY29udHJpYnV0aW9uX2RldGFpbHMnKSxcblxuICBwcm9qZWN0RGV0YWlsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfZGV0YWlscycpLFxuICBjb250cmlidXRpb25zID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NvbnRyaWJ1dGlvbnMnKSxcbiAgdGVhbVRvdGFsID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3RlYW1fdG90YWxzJyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RfY29udHJpYnV0aW9uc19wZXJfZGF5JyksXG4gIHByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb24gPSBtLnBvc3RncmVzdC5tb2RlbCgncHJvamVjdF9jb250cmlidXRpb25zX3Blcl9sb2NhdGlvbicpLFxuICBwcm9qZWN0ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3Byb2plY3RzJyksXG4gIGNhdGVnb3J5ID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ2NhdGVnb3JpZXMnKSxcbiAgdGVhbU1lbWJlciA9IG0ucG9zdGdyZXN0Lm1vZGVsKCd0ZWFtX21lbWJlcnMnKSxcbiAgc3RhdGlzdGljID0gbS5wb3N0Z3Jlc3QubW9kZWwoJ3N0YXRpc3RpY3MnKTtcbiAgdGVhbU1lbWJlci5wYWdlU2l6ZSg0MCk7XG4gIHByb2plY3QucGFnZVNpemUoMyk7XG4gIGNhdGVnb3J5LnBhZ2VTaXplKDUwKTtcblxuICByZXR1cm4ge1xuICAgIGNvbnRyaWJ1dGlvbkRldGFpbDogY29udHJpYnV0aW9uRGV0YWlsLFxuICAgIHByb2plY3REZXRhaWw6IHByb2plY3REZXRhaWwsXG4gICAgY29udHJpYnV0aW9uczogY29udHJpYnV0aW9ucyxcbiAgICB0ZWFtVG90YWw6IHRlYW1Ub3RhbCxcbiAgICB0ZWFtTWVtYmVyOiB0ZWFtTWVtYmVyLFxuICAgIHByb2plY3Q6IHByb2plY3QsXG4gICAgY2F0ZWdvcnk6IGNhdGVnb3J5LFxuICAgIHByb2plY3RDb250cmlidXRpb25zUGVyRGF5OiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckRheSxcbiAgICBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBwcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLFxuICAgIHN0YXRpc3RpYzogc3RhdGlzdGljXG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5BZG1pbkNvbnRyaWJ1dGlvbiA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1jb250cmlidXRpb24nLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1zbWFsbCcsICdSJCcgKyBjb250cmlidXRpb24udmFsdWUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkoY29udHJpYnV0aW9uLmNyZWF0ZWRfYXQsICdERC9NTS9ZWVlZIEhIOm1tW2hdJykpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdCcsIFtcbiAgICAgICAgICAgICdJRCBkbyBHYXRld2F5OiAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cImh0dHBzOi8vZGFzaGJvYXJkLnBhZ2FyLm1lLyMvdHJhbnNhY3Rpb25zLycgKyBjb250cmlidXRpb24uZ2F0ZXdheV9pZCArICdcIl0nLCBjb250cmlidXRpb24uZ2F0ZXdheV9pZClcbiAgICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5EZXRhaWwgPSAoZnVuY3Rpb24obSwgXywgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGFjdGlvbnMgPSBhcmdzLmFjdGlvbnMsXG4gICAgICAgICAgaXRlbSA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9uLWRldGFpbC1ib3gnLCBbXG4gICAgICAgIG0oJy5kaXZpZGVyLnUtbWFyZ2ludG9wLTIwLnUtbWFyZ2luYm90dG9tLTIwJyksXG4gICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgXy5tYXAoYWN0aW9ucywgZnVuY3Rpb24oYWN0aW9uKXtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjW2FjdGlvbi5jb21wb25lbnRdLCB7ZGF0YTogYWN0aW9uLmRhdGEsIGl0ZW06IGFyZ3MuaXRlbX0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICksXG4gICAgICAgIG0oJy53LXJvdy5jYXJkLmNhcmQtdGVyY2lhcnkudS1yYWRpdXMnLFtcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb24sIHtjb250cmlidXRpb246IGl0ZW19KSxcbiAgICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluVHJhbnNhY3Rpb25IaXN0b3J5LCB7Y29udHJpYnV0aW9uOiBpdGVtfSksXG4gICAgICAgICAgbS5jb21wb25lbnQoYy5BZG1pblJld2FyZCwge2NvbnRyaWJ1dGlvbjogaXRlbSwga2V5OiBpdGVtLmtleX0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXywgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLkFkbWluRmlsdGVyID0gKGZ1bmN0aW9uKGMsIG0sIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b2dnbGVyOiBoLnRvZ2dsZVByb3AoZmFsc2UsIHRydWUpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZmlsdGVyQnVpbGRlciA9IGFyZ3MuZmlsdGVyQnVpbGRlcixcbiAgICAgICAgICBtYWluID0gXy5maW5kV2hlcmUoZmlsdGVyQnVpbGRlciwge2NvbXBvbmVudDogJ0ZpbHRlck1haW4nfSk7XG5cbiAgICAgIHJldHVybiBtKCcjYWRtaW4tY29udHJpYnV0aW9ucy1maWx0ZXIudy1zZWN0aW9uLnBhZ2UtaGVhZGVyJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlci51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTMwJywgJ0Fwb2lvcycpLFxuICAgICAgICAgIG0oJy53LWZvcm0nLCBbXG4gICAgICAgICAgICBtKCdmb3JtJywge1xuICAgICAgICAgICAgICBvbnN1Ym1pdDogYXJncy5zdWJtaXRcbiAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgKF8uZmluZFdoZXJlKGZpbHRlckJ1aWxkZXIsIHtjb21wb25lbnQ6ICdGaWx0ZXJNYWluJ30pKSA/IG0uY29tcG9uZW50KGNbbWFpbi5jb21wb25lbnRdLCBtYWluLmRhdGEpIDogJycsXG4gICAgICAgICAgICAgIG0oJy51LW1hcmdpbmJvdHRvbS0yMC53LXJvdycsXG4gICAgICAgICAgICAgICAgbSgnYnV0dG9uLnctY29sLnctY29sLTEyLmZvbnRzaXplLXNtYWxsZXN0LmxpbmstaGlkZGVuLWxpZ2h0W3N0eWxlPVwiYmFja2dyb3VuZDogbm9uZTsgYm9yZGVyOiBub25lOyBvdXRsaW5lOiBub25lOyB0ZXh0LWFsaWduOiBsZWZ0O1wiXVt0eXBlPVwiYnV0dG9uXCJdJywge1xuICAgICAgICAgICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICAgICAgICAgIH0sICdGaWx0cm9zIGF2YW7Dp2Fkb3MgwqA+JykpLCAoY3RybC50b2dnbGVyKCkgP1xuICAgICAgICAgICAgICAgIG0oJyNhZHZhbmNlZC1zZWFyY2gudy1yb3cuYWRtaW4tZmlsdGVycycsIFtcbiAgICAgICAgICAgICAgICAgIF8ubWFwKGZpbHRlckJ1aWxkZXIsIGZ1bmN0aW9uKGYpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGYuY29tcG9uZW50ICE9PSAnRmlsdGVyTWFpbicpID8gbS5jb21wb25lbnQoY1tmLmNvbXBvbmVudF0sIGYuZGF0YSkgOiAnJztcbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgXSkgOiAnJ1xuICAgICAgICAgICAgICApXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5jLCB3aW5kb3cubSwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluSW5wdXRBY3Rpb24gPSAoZnVuY3Rpb24obSwgaCwgYyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgYnVpbGRlciA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBjb21wbGV0ZSA9IG0ucHJvcChmYWxzZSksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGRhdGEgPSB7fSxcbiAgICAgICAgICBpdGVtID0gYXJncy5pdGVtLFxuICAgICAgICAgIGtleSA9IGJ1aWxkZXIucHJvcGVydHksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoYnVpbGRlci5mb3JjZVZhbHVlIHx8ICcnKTtcblxuICAgICAgaC5pZFZNLmlkKGl0ZW1bYnVpbGRlci51cGRhdGVLZXldKTtcblxuICAgICAgdmFyIGwgPSBtLnBvc3RncmVzdC5sb2FkZXJXaXRoVG9rZW4oYnVpbGRlci5tb2RlbC5wYXRjaE9wdGlvbnMoaC5pZFZNLnBhcmFtZXRlcnMoKSwgZGF0YSkpO1xuXG4gICAgICB2YXIgdXBkYXRlSXRlbSA9IGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgIF8uZXh0ZW5kKGl0ZW0sIHJlc1swXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICB9O1xuXG4gICAgICB2YXIgc3VibWl0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZGF0YVtrZXldID0gbmV3VmFsdWUoKTtcbiAgICAgICAgbC5sb2FkKCkudGhlbih1cGRhdGVJdGVtLCBlcnJvcik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH07XG5cbiAgICAgIHZhciB1bmxvYWQgPSBmdW5jdGlvbihlbCwgaXNpbml0LCBjb250ZXh0KXtcbiAgICAgICAgY29udGV4dC5vbnVubG9hZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY29tcGxldGUoZmFsc2UpO1xuICAgICAgICAgIGVycm9yKGZhbHNlKTtcbiAgICAgICAgICBuZXdWYWx1ZShidWlsZGVyLmZvcmNlVmFsdWUgfHwgJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgIGw6IGwsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgZGF0YSA9IGFyZ3MuZGF0YSxcbiAgICAgICAgICBidG5WYWx1ZSA9IChjdHJsLmwoKSkgPyAncG9yIGZhdm9yLCBhZ3VhcmRlLi4uJyA6IGRhdGEuY2FsbFRvQWN0aW9uO1xuXG4gICAgICByZXR1cm4gbSgnLnctY29sLnctY29sLTInLFtcbiAgICAgICAgbSgnYnV0dG9uLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5Jywge1xuICAgICAgICAgIG9uY2xpY2s6IGN0cmwudG9nZ2xlci50b2dnbGVcbiAgICAgICAgfSwgZGF0YS5vdXRlckxhYmVsKSxcbiAgICAgICAgKGN0cmwudG9nZ2xlcigpKSA/XG4gICAgICAgICAgbSgnLmRyb3Bkb3duLWxpc3QuY2FyZC51LXJhZGl1cy5kcm9wZG93bi1saXN0LW1lZGl1bS56aW5kZXgtMTAnLCB7Y29uZmlnOiBjdHJsLnVubG9hZH0sW1xuICAgICAgICAgICAgbSgnZm9ybS53LWZvcm0nLCB7XG4gICAgICAgICAgICAgIG9uc3VibWl0OiBjdHJsLnN1Ym1pdFxuICAgICAgICAgICAgfSwgKCFjdHJsLmNvbXBsZXRlKCkpID8gW1xuICAgICAgICAgICAgICAgICAgbSgnbGFiZWwnLCBkYXRhLmlubmVyTGFiZWwpLFxuICAgICAgICAgICAgICAgICAgKCFkYXRhLmZvcmNlVmFsdWUpID9cbiAgICAgICAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZFt0eXBlPVwidGV4dFwiXVtwbGFjZWhvbGRlcj1cIicgKyBkYXRhLnBsYWNlaG9sZGVyICsgJ1wiXScsIHtvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBjdHJsLm5ld1ZhbHVlKSwgdmFsdWU6IGN0cmwubmV3VmFsdWUoKX0pIDogJycsXG4gICAgICAgICAgICAgICAgICBtKCdpbnB1dC53LWJ1dHRvbi5idG4uYnRuLXNtYWxsW3R5cGU9XCJzdWJtaXRcIl1bdmFsdWU9XCInICsgYnRuVmFsdWUgKyAnXCJdJylcbiAgICAgICAgICAgICAgICBdIDogKCFjdHJsLmVycm9yKCkpID8gW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWRvbmVbc3R5bGU9XCJkaXNwbGF5OmJsb2NrO1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCdwJywgJ0Fwb2lvIHRyYW5zZmVyaWRvIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5JdGVtID0gKGZ1bmN0aW9uKG0sIF8sIGgsIGMpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3Mpe1xuXG4gICAgICB2YXIgZGlzcGxheURldGFpbEJveCA9IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRpc3BsYXlEZXRhaWxCb3g6IGRpc3BsYXlEZXRhaWxCb3hcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBpdGVtID0gYXJncy5pdGVtO1xuXG4gICAgICByZXR1cm4gbSgnLnctY2xlYXJmaXguY2FyZC51LXJhZGl1cy51LW1hcmdpbmJvdHRvbS0yMC5yZXN1bHRzLWFkbWluLWl0ZW1zJyxbXG4gICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgIF8ubWFwKGFyZ3MuYnVpbGRlciwgZnVuY3Rpb24oZGVzYyl7XG4gICAgICAgICAgICByZXR1cm4gbShkZXNjLndyYXBwZXJDbGFzcywgW1xuICAgICAgICAgICAgICBtLmNvbXBvbmVudChjW2Rlc2MuY29tcG9uZW50XSwge2l0ZW06IGl0ZW0sIGtleTogaXRlbS5rZXl9KVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJ2J1dHRvbi53LWlubGluZS1ibG9jay5hcnJvdy1hZG1pbi5mYS5mYS1jaGV2cm9uLWRvd24uZm9udGNvbG9yLXNlY29uZGFyeScsIHtvbmNsaWNrOiBjdHJsLmRpc3BsYXlEZXRhaWxCb3gudG9nZ2xlfSksXG4gICAgICAgIGN0cmwuZGlzcGxheURldGFpbEJveCgpID8gbS5jb21wb25lbnQoYy5BZG1pbkRldGFpbCwge2l0ZW06IGl0ZW0sIGFjdGlvbnM6IGFyZ3MuYWN0aW9ucywga2V5OiBpdGVtLmtleX0pIDogJydcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5fLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5MaXN0ID0gKGZ1bmN0aW9uKG0sIGgsIGMpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0O1xuICAgICAgaWYgKCFsaXN0LmNvbGxlY3Rpb24oKS5sZW5ndGggJiYgbGlzdC5maXJzdFBhZ2UpIHtcbiAgICAgICAgbGlzdC5maXJzdFBhZ2UoKS50aGVuKG51bGwsIGZ1bmN0aW9uKHNlcnZlckVycm9yKSB7XG4gICAgICAgICAgYXJncy52bS5lcnJvcihzZXJ2ZXJFcnJvci5tZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBsaXN0ID0gYXJncy52bS5saXN0LFxuICAgICAgICAgIGVycm9yID0gYXJncy52bS5lcnJvcjtcbiAgICAgIHJldHVybiBtKCcudy1zZWN0aW9uLnNlY3Rpb24nLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsXG4gICAgICAgICAgZXJyb3IoKSA/XG4gICAgICAgICAgICBtKCcuY2FyZC5jYXJkLWVycm9yLnUtcmFkaXVzLmZvbnR3ZWlnaHQtYm9sZCcsIGVycm9yKCkpIDpcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgbSgnLnctcm93LnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC05JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWJhc2UnLFxuICAgICAgICAgICAgICAgICAgICBsaXN0LmlzTG9hZGluZygpID9cbiAgICAgICAgICAgICAgICAgICAgICAnQnVzY2FuZG8gYXBvaW9zLi4uJyA6XG4gICAgICAgICAgICAgICAgICAgICAgW20oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIGxpc3QudG90YWwoKSksICcgYXBvaW9zIGVuY29udHJhZG9zJ11cbiAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgIG0oJyNhZG1pbi1jb250cmlidXRpb25zLWxpc3Qudy1jb250YWluZXInLFtcbiAgICAgICAgICAgICAgICBsaXN0LmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuQWRtaW5JdGVtLCB7YnVpbGRlcjogYXJncy5pdGVtQnVpbGRlciwgYWN0aW9uczogYXJncy5pdGVtQWN0aW9ucywgaXRlbTogaXRlbSwga2V5OiBpdGVtLmtleX0pO1xuICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbicsW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXB1c2gtNScsW1xuICAgICAgICAgICAgICAgICAgICAgICAgIWxpc3QuaXNMb2FkaW5nKCkgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtKCdidXR0b24jbG9hZC1tb3JlLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeScsIHtvbmNsaWNrOiBsaXN0Lm5leHRQYWdlfSwgJ0NhcnJlZ2FyIG1haXMnKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF1cbiAgICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblByb2plY3REZXRhaWxzQ2FyZCA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGFyZ3MucmVzb3VyY2UsXG4gICAgICAgICAgZ2VuZXJhdGVTdGF0dXNUZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc3RhdHVzVGV4dE9iaiA9IG0ucHJvcCh7fSksXG4gICAgICAgICAgICAgICAgc3RhdHVzVGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgIG9ubGluZToge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ05PIEFSJ30sXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzZnVsOiB7Y3NzQ2xhc3M6ICd0ZXh0LXN1Y2Nlc3MnLCB0ZXh0OiAnRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgZmFpbGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ07Dg08gRklOQU5DSUFETyd9LFxuICAgICAgICAgICAgICAgICAgd2FpdGluZ19mdW5kczoge2Nzc0NsYXNzOiAndGV4dC13YWl0aW5nJywgdGV4dDogJ0FHVUFSREFORE8nfSxcbiAgICAgICAgICAgICAgICAgIHJlamVjdGVkOiB7Y3NzQ2xhc3M6ICd0ZXh0LWVycm9yJywgdGV4dDogJ1JFQ1VTQURPJ30sXG4gICAgICAgICAgICAgICAgICBkcmFmdDoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ1JBU0NVTkhPJ30sXG4gICAgICAgICAgICAgICAgICBpbl9hbmFseXNpczoge2Nzc0NsYXNzOiAnJywgdGV4dDogJ0VNIEFOw4FMSVNFJ30sXG4gICAgICAgICAgICAgICAgICBhcHByb3ZlZDoge2Nzc0NsYXNzOiAndGV4dC1zdWNjZXNzJywgdGV4dDogJ0FQUk9WQURPJ31cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzdGF0dXNUZXh0T2JqKHN0YXR1c1RleHRbcHJvamVjdC5zdGF0ZV0pO1xuXG4gICAgICAgICAgICByZXR1cm4gc3RhdHVzVGV4dE9iajtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBwcm9qZWN0OiBwcm9qZWN0LFxuICAgICAgICBzdGF0dXNUZXh0T2JqOiBnZW5lcmF0ZVN0YXR1c1RleHQoKSxcbiAgICAgICAgcmVtYWluaW5nVGV4dE9iajogaC5nZW5lcmF0ZVJlbWFpbmdUaW1lKHByb2plY3QpXG4gICAgICB9O1xuICAgIH0sXG5cbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICB2YXIgcHJvamVjdCA9IGN0cmwucHJvamVjdCxcbiAgICAgICAgICBwcm9ncmVzcyA9IHByb2plY3QucHJvZ3Jlc3MudG9GaXhlZCgyKSxcbiAgICAgICAgICBzdGF0dXNUZXh0T2JqID0gY3RybC5zdGF0dXNUZXh0T2JqKCksXG4gICAgICAgICAgcmVtYWluaW5nVGV4dE9iaiA9IGN0cmwucmVtYWluaW5nVGV4dE9iaigpO1xuXG4gICAgICByZXR1cm4gbSgnLnByb2plY3QtZGV0YWlscy1jYXJkLmNhcmQudS1yYWRpdXMuY2FyZC10ZXJjaWFyeS51LW1hcmdpbmJvdHRvbS0yMCcsIFtcbiAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkJywgW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ1N0YXR1czonKSwnwqAnLG0oJ3NwYW4nLCB7Y2xhc3M6IHN0YXR1c1RleHRPYmouY3NzQ2xhc3N9LCBzdGF0dXNUZXh0T2JqLnRleHQpLCfCoCdcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGlmIChwcm9qZWN0LmlzX3B1Ymxpc2hlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIG0oJy5tZXRlci51LW1hcmdpbnRvcC0yMC51LW1hcmdpbmJvdHRvbS0xMCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy5tZXRlci1maWxsJywge3N0eWxlOiB7d2lkdGg6IChwcm9ncmVzcyA+IDEwMCA/IDEwMCA6IHByb2dyZXNzKSArICclJ319KVxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgcHJvZ3Jlc3MgKyAnJScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwudS1tYXJnaW5ib3R0b20tMTAnLCAnZmluYW5jaWFkbycpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgW1xuICAgICAgICAgICAgICAgICAgICAgICdSJCAnICsgaC5mb3JtYXROdW1iZXIocHJvamVjdC5wbGVkZ2VkLCAyKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHRlci5mb250c2l6ZS1zbWFsbC51LW1hcmdpbmJvdHRvbS0xMCcsICdsZXZhbnRhZG9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBwcm9qZWN0LnRvdGFsX2NvbnRyaWJ1dGlvbnMpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udGNvbG9yLXNlY29uZGFyeS5saW5laGVpZ2h0LXRpZ2h0ZXIuZm9udHNpemUtc21hbGwnLCAnYXBvaW9zJylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTMudy1jb2wtc21hbGwtMy53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCByZW1haW5pbmdUZXh0T2JqLnRvdGFsKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodGVyLmZvbnRzaXplLXNtYWxsJywgcmVtYWluaW5nVGV4dE9iai51bml0ICsgJyByZXN0YW50ZXMnKVxuICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0oKSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciBleHBsYW5hdGlvbiA9IGZ1bmN0aW9uKHJlc291cmNlKSB7XG4gICAgICAgIHZhciBzdGF0ZVRleHQgPSB7XG4gICAgICAgICAgb25saW5lOiBbXG4gICAgICAgICAgICBtKCdzcGFuJywgJ1ZvY8OqIHBvZGUgcmVjZWJlciBhcG9pb3MgYXTDqSAyM2hzNTltaW41OXMgZG8gZGlhICcgKyBoLm1vbWVudGlmeShyZXNvdXJjZS56b25lX2V4cGlyZXNfYXQpICsgJy4gTGVtYnJlLXNlLCDDqSB0dWRvLW91LW5hZGEgZSB2b2PDqiBzw7MgbGV2YXLDoSBvcyByZWN1cnNvcyBjYXB0YWRvcyBzZSBiYXRlciBhIG1ldGEgZGVudHJvIGRlc3NlIHByYXpvLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBzdWNjZXNzZnVsOiBbXG4gICAgICAgICAgICBtKCdzcGFuLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCByZXNvdXJjZS51c2VyLm5hbWUgKyAnLCBjb21lbW9yZSBxdWUgdm9jw6ogbWVyZWNlIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgYmVtIHN1Y2VkaWRvIGUgYWdvcmEgw6kgYSBob3JhIGRlIGluaWNpYXIgbyB0cmFiYWxobyBkZSByZWxhY2lvbmFtZW50byBjb20gc2V1cyBhcG9pYWRvcmVzISAnLFxuICAgICAgICAgICAgJ0F0ZW7Dp8OjbyBlc3BlY2lhbCDDoCBlbnRyZWdhIGRlIHJlY29tcGVuc2FzLiBQcm9tZXRldT8gRW50cmVndWUhIE7Do28gZGVpeGUgZGUgb2xoYXIgYSBzZcOnw6NvIGRlIHDDs3MtcHJvamV0byBkbyAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiL2d1aWRlc1wiXScsICdHdWlhIGRvcyBSZWFsaXphZG9yZXMnKSxcbiAgICAgICAgICAgICfCoGUgZGUgaW5mb3JtYXItc2Ugc29icmXCoCcsbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIwMzc0OTMtRklOQU5DSUFETy1Db21vLXNlciVDMyVBMS1mZWl0by1vLXJlcGFzc2UtZG8tZGluaGVpcm8tXCJdW3RhcmdldD1cIl9ibGFua1wiXScsICdjb21vIG8gcmVwYXNzZSBkbyBkaW5oZWlybyBzZXLDoSBmZWl0by4nKVxuICAgICAgICAgIF0sXG4gICAgICAgICAgd2FpdGluZ19mdW5kczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgZXN0YW1vcyBwcm9jZXNzYW5kbyBvcyDDumx0aW1vcyBwYWdhbWVudG9zIScpLFxuICAgICAgICAgICAgJyBTZXUgcHJvamV0byBmb2kgZmluYWxpemFkbyBlbSAnICsgaC5tb21lbnRpZnkocmVzb3VyY2Uuem9uZV9leHBpcmVzX2F0KSArICcgZSBlc3TDoSBhZ3VhcmRhbmRvIGNvbmZpcm1hw6fDo28gZGUgYm9sZXRvcyBlIHBhZ2FtZW50b3MuICcsXG4gICAgICAgICAgICAnRGV2aWRvIMOgIGRhdGEgZGUgdmVuY2ltZW50byBkZSBib2xldG9zLCBwcm9qZXRvcyBxdWUgdGl2ZXJhbSBhcG9pb3MgZGUgw7psdGltYSBob3JhIGZpY2FtIHBvciBhdMOpIDQgZGlhcyDDunRlaXMgbmVzc2Ugc3RhdHVzLCBjb250YWRvcyBhIHBhcnRpciBkYSBkYXRhIGRlIGZpbmFsaXphw6fDo28gZG8gcHJvamV0by7CoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ0VudGVuZGEgY29tbyBvIHJlcGFzc2UgZGUgZGluaGVpcm8gw6kgZmVpdG8gcGFyYSBwcm9qZXRvcyBiZW0gc3VjZWRpZG9zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICBmYWlsZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIG7Do28gZGVzYW5pbWUhJyksXG4gICAgICAgICAgICAnIFNldSBwcm9qZXRvIG7Do28gYmF0ZXUgYSBtZXRhIGUgc2FiZW1vcyBxdWUgaXNzbyBuw6NvIMOpIGEgbWVsaG9yIGRhcyBzZW5zYcOnw7Vlcy4gTWFzIG7Do28gZGVzYW5pbWUuICcsXG4gICAgICAgICAgICAnRW5jYXJlIG8gcHJvY2Vzc28gY29tbyB1bSBhcHJlbmRpemFkbyBlIG7Do28gZGVpeGUgZGUgY29naXRhciB1bWEgc2VndW5kYSB0ZW50YXRpdmEuIE7Do28gc2UgcHJlb2N1cGUsIHRvZG9zIG9zIHNldXMgYXBvaWFkb3JlcyByZWNlYmVyw6NvIG8gZGluaGVpcm8gZGUgdm9sdGEuwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiaHR0cDovL3N1cG9ydGUuY2F0YXJzZS5tZS9oYy9wdC1ici9hcnRpY2xlcy8yMDIzNjU1MDctUmVncmFzLWUtZnVuY2lvbmFtZW50by1kb3MtcmVlbWJvbHNvcy1lc3Rvcm5vc1wiXVt0YXJnZXQ9XCJfYmxhbmtcIl0nLCAnRW50ZW5kYSBjb21vIGZhemVtb3MgZXN0b3Jub3MgZSByZWVtYm9sc29zLicpXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZWplY3RlZDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgaW5mZWxpem1lbnRlIG7Do28gZm9pIGRlc3RhIHZlei4nKSxcbiAgICAgICAgICAgICcgVm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZG8gQ2F0YXJzZSBlIGVudGVuZGVtb3MgcXVlIGVsZSBuw6NvIGVzdMOhIGRlIGFjb3JkbyBjb20gbyBwZXJmaWwgZG8gc2l0ZS4gJyxcbiAgICAgICAgICAgICdUZXIgdW0gcHJvamV0byByZWN1c2FkbyBuw6NvIGltcGVkZSBxdWUgdm9jw6ogZW52aWUgbm92b3MgcHJvamV0b3MgcGFyYSBhdmFsaWHDp8OjbyBvdSByZWZvcm11bGUgc2V1IHByb2pldG8gYXR1YWwuICcsXG4gICAgICAgICAgICAnQ29udmVyc2UgY29tIG5vc3NvIGF0ZW5kaW1lbnRvISBSZWNvbWVuZGFtb3MgcXVlIHZvY8OqIGTDqiB1bWEgYm9hIG9saGFkYSBub3PCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjM4NzYzOC1EaXJldHJpemVzLXBhcmEtY3JpYSVDMyVBNyVDMyVBM28tZGUtcHJvamV0b3NcIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NyaXTDqXJpb3MgZGEgcGxhdGFmb3JtYScpLFxuICAgICAgICAgICAgJ8KgZSBub8KgJyxcbiAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi9ndWlkZXNcIl0nLCAnZ3VpYSBkb3MgcmVhbGl6YWRvcmVzJyksJy4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBkcmFmdDogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgY29uc3RydWEgbyBzZXUgcHJvamV0byEnKSxcbiAgICAgICAgICAgICfCoFF1YW50byBtYWlzIGN1aWRhZG9zbyBlIGJlbSBmb3JtYXRhZG8gZm9yIHVtIHByb2pldG8sIG1haW9yZXMgYXMgY2hhbmNlcyBkZSBlbGUgc2VyIGJlbSBzdWNlZGlkbyBuYSBzdWEgY2FtcGFuaGEgZGUgY2FwdGHDp8Ojby4gJyxcbiAgICAgICAgICAgICdBbnRlcyBkZSBlbnZpYXIgc2V1IHByb2pldG8gcGFyYSBhIG5vc3NhIGFuw6FsaXNlLCBwcmVlbmNoYSB0b2RhcyBhcyBhYmFzIGFvIGxhZG8gY29tIGNhcmluaG8uIFZvY8OqIHBvZGUgc2FsdmFyIGFzIGFsdGVyYcOnw7VlcyBlIHZvbHRhciBhbyByYXNjdW5obyBkZSBwcm9qZXRvIHF1YW50YXMgdmV6ZXMgcXVpc2VyLiAnLFxuICAgICAgICAgICAgJ1F1YW5kbyB0dWRvIGVzdGl2ZXIgcHJvbnRvLCBjbGlxdWUgbm8gYm90w6NvIEVOVklBUiBlIGVudHJhcmVtb3MgZW0gY29udGF0byBwYXJhIGF2YWxpYXIgbyBzZXUgcHJvamV0by4nXG4gICAgICAgICAgXSxcbiAgICAgICAgICBpbl9hbmFseXNpczogW1xuICAgICAgICAgICAgbSgnc3Bhbi5mb250d2VpZ2h0LXNlbWlib2xkJywgcmVzb3VyY2UudXNlci5uYW1lICsgJywgdm9jw6ogZW52aW91IHNldSBwcm9qZXRvIHBhcmEgYW7DoWxpc2UgZW0gJyArIGgubW9tZW50aWZ5KHJlc291cmNlLnNlbnRfdG9fYW5hbHlzaXNfYXQpICsgJyBlIHJlY2ViZXLDoSBub3NzYSBhdmFsaWHDp8OjbyBlbSBhdMOpIDQgZGlhcyDDunRlaXMgYXDDs3MgbyBlbnZpbyEnKSxcbiAgICAgICAgICAgICfCoEVucXVhbnRvIGVzcGVyYSBhIHN1YSByZXNwb3N0YSwgdm9jw6ogcG9kZSBjb250aW51YXIgZWRpdGFuZG8gbyBzZXUgcHJvamV0by4gJyxcbiAgICAgICAgICAgICdSZWNvbWVuZGFtb3MgdGFtYsOpbSBxdWUgdm9jw6ogdsOhIGNvbGV0YW5kbyBmZWVkYmFjayBjb20gYXMgcGVzc29hcyBwcsOzeGltYXMgZSBwbGFuZWphbmRvIGNvbW8gc2Vyw6EgYSBzdWEgY2FtcGFuaGEuJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgYXBwcm92ZWQ6IFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZm9udHdlaWdodC1zZW1pYm9sZCcsIHJlc291cmNlLnVzZXIubmFtZSArICcsIHNldSBwcm9qZXRvIGZvaSBhcHJvdmFkbyEnKSxcbiAgICAgICAgICAgICfCoFBhcmEgY29sb2NhciBvIHNldSBwcm9qZXRvIG5vIGFyIMOpIHByZWNpc28gYXBlbmFzIHF1ZSB2b2PDqiBwcmVlbmNoYSBvcyBkYWRvcyBuZWNlc3PDoXJpb3MgbmEgYWJhwqAnLFxuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1tocmVmPVwiI3VzZXJfc2V0dGluZ3NcIl0nLCAnQ29udGEnKSxcbiAgICAgICAgICAgICcuIMOJIGltcG9ydGFudGUgc2FiZXIgcXVlIGNvYnJhbW9zIGEgdGF4YSBkZSAxMyUgZG8gdmFsb3IgdG90YWwgYXJyZWNhZGFkbyBhcGVuYXMgcG9yIHByb2pldG9zIGJlbSBzdWNlZGlkb3MuIEVudGVuZGHCoCcsXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW2hyZWY9XCJodHRwOi8vc3Vwb3J0ZS5jYXRhcnNlLm1lL2hjL3B0LWJyL2FydGljbGVzLzIwMjAzNzQ5My1GSU5BTkNJQURPLUNvbW8tc2VyJUMzJUExLWZlaXRvLW8tcmVwYXNzZS1kby1kaW5oZWlyby1cIl1bdGFyZ2V0PVwiX2JsYW5rXCJdJywgJ2NvbW8gZmF6ZW1vcyBvIHJlcGFzc2UgZG8gZGluaGVpcm8uJylcbiAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBzdGF0ZVRleHRbcmVzb3VyY2Uuc3RhdGVdO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZXhwbGFuYXRpb246IGV4cGxhbmF0aW9uKGFyZ3MucmVzb3VyY2UpXG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgcmV0dXJuIG0oJ3AuJyArIGFyZ3MucmVzb3VyY2Uuc3RhdGUgKyAnLXByb2plY3QtdGV4dC5mb250c2l6ZS1zbWFsbC5saW5laGVpZ2h0LWxvb3NlJywgY3RybC5leHBsYW5hdGlvbik7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5Qcm9qZWN0ID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5pdGVtO1xuICAgICAgcmV0dXJuIG0oJy53LXJvdy5hZG1pbi1wcm9qZWN0JyxbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTMudS1tYXJnaW5ib3R0b20tMTAnLFtcbiAgICAgICAgICBtKCdpbWcudGh1bWItcHJvamVjdC51LXJhZGl1c1tzcmM9JyArIHByb2plY3QucHJvamVjdF9pbWcgKyAnXVt3aWR0aD01MF0nKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLnctY29sLnctY29sLTkudy1jb2wtc21hbGwtOScsW1xuICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwJywgW1xuICAgICAgICAgICAgbSgnYS5hbHQtbGlua1t0YXJnZXQ9XCJfYmxhbmtcIl1baHJlZj1cIi8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAnXCJdJywgcHJvamVjdC5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBwcm9qZWN0LnByb2plY3Rfc3RhdGUpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X29ubGluZV9kYXRlKSArICcgYSAnICsgaC5tb21lbnRpZnkocHJvamVjdC5wcm9qZWN0X2V4cGlyZXNfYXQpKVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCkpO1xuIiwid2luZG93LmMuQWRtaW5SYWRpb0FjdGlvbiA9IChmdW5jdGlvbihtLCBoLCBjKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICAgIHZhciBidWlsZGVyID0gYXJncy5kYXRhLFxuICAgICAgICAgIGNvbXBsZXRlID0gbS5wcm9wKGZhbHNlKSxcbiAgICAgICAgICBkYXRhID0ge30sXG4gICAgICAgICAgLy9UT0RPOiBJbXBsZW1lbnQgYSBkZXNjcmlwdG9yIHRvIGFic3RyYWN0IHRoZSBpbml0aWFsIGRlc2NyaXB0aW9uXG4gICAgICAgICAgZGVzY3JpcHRpb24gPSBtLnByb3AoYXJncy5pdGVtLnJld2FyZC5kZXNjcmlwdGlvbiB8fCAnJyksXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGZhaWwgPSBtLnByb3AoZmFsc2UpLFxuICAgICAgICAgIGl0ZW0gPSBhcmdzLml0ZW0sXG4gICAgICAgICAga2V5ID0gYnVpbGRlci5nZXRLZXksXG4gICAgICAgICAgbmV3VmFsdWUgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGdldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHNldEZpbHRlciA9IHt9LFxuICAgICAgICAgIHJhZGlvcyA9IG0ucHJvcCgpLFxuICAgICAgICAgIGdldEtleSA9IGJ1aWxkZXIuZ2V0S2V5LFxuICAgICAgICAgIGdldEF0dHIgPSBidWlsZGVyLnJhZGlvcyxcbiAgICAgICAgICB1cGRhdGVLZXkgPSBidWlsZGVyLnVwZGF0ZUtleTtcblxuICAgICAgc2V0RmlsdGVyW3VwZGF0ZUtleV0gPSAnZXEnO1xuICAgICAgdmFyIHNldFZNID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHNldEZpbHRlcik7XG4gICAgICBzZXRWTVt1cGRhdGVLZXldKGl0ZW1bdXBkYXRlS2V5XSk7XG5cbiAgICAgIGdldEZpbHRlcltnZXRLZXldID0gJ2VxJztcbiAgICAgIHZhciBnZXRWTSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTShnZXRGaWx0ZXIpO1xuICAgICAgZ2V0Vk1bZ2V0S2V5XShpdGVtW2dldEtleV0pO1xuXG4gICAgICB2YXIgZ2V0TG9hZGVyID0gbS5wb3N0Z3Jlc3QubG9hZGVyV2l0aFRva2VuKGJ1aWxkZXIuZ2V0TW9kZWwuZ2V0Um93T3B0aW9ucyhnZXRWTS5wYXJhbWV0ZXJzKCkpKTtcblxuICAgICAgdmFyIHNldExvYWRlciA9IG0ucG9zdGdyZXN0LmxvYWRlcldpdGhUb2tlbihidWlsZGVyLnVwZGF0ZU1vZGVsLnBhdGNoT3B0aW9ucyhzZXRWTS5wYXJhbWV0ZXJzKCksIGRhdGEpKTtcblxuICAgICAgdmFyIHVwZGF0ZUl0ZW0gPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgXy5leHRlbmQoaXRlbSwgZGF0YVswXSk7XG4gICAgICAgIGNvbXBsZXRlKHRydWUpO1xuICAgICAgfTtcblxuICAgICAgdmFyIGZldGNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZ2V0TG9hZGVyLmxvYWQoKS50aGVuKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgIHJhZGlvcyhpdGVtWzBdW2dldEF0dHJdKTtcbiAgICAgICAgfSwgZXJyb3IpO1xuICAgICAgfTtcblxuICAgICAgdmFyIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChuZXdWYWx1ZSgpKSB7XG4gICAgICAgICAgZGF0YVtidWlsZGVyLnByb3BlcnR5XSA9IG5ld1ZhbHVlKCk7XG4gICAgICAgICAgc2V0TG9hZGVyLmxvYWQoKS50aGVuKHVwZGF0ZUl0ZW0sIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9O1xuXG4gICAgICB2YXIgdW5sb2FkID0gZnVuY3Rpb24oZWwsIGlzaW5pdCwgY29udGV4dCl7XG4gICAgICAgIGNvbnRleHQub251bmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgIGNvbXBsZXRlKGZhbHNlKTtcbiAgICAgICAgICBlcnJvcihmYWxzZSk7XG4gICAgICAgICAgbmV3VmFsdWUoJycpO1xuICAgICAgICB9O1xuICAgICAgfTtcblxuICAgICAgdmFyIHNldERlc2NyaXB0aW9uID0gZnVuY3Rpb24odGV4dCl7XG4gICAgICAgIGRlc2NyaXB0aW9uKHRleHQpO1xuICAgICAgICBtLnJlZHJhdygpO1xuICAgICAgfTtcblxuICAgICAgZmV0Y2goKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29tcGxldGU6IGNvbXBsZXRlLFxuICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gICAgICAgIHNldERlc2NyaXB0aW9uOiBzZXREZXNjcmlwdGlvbixcbiAgICAgICAgZXJyb3I6IGVycm9yLFxuICAgICAgICBzZXRMb2FkZXI6IHNldExvYWRlcixcbiAgICAgICAgZ2V0TG9hZGVyOiBnZXRMb2FkZXIsXG4gICAgICAgIG5ld1ZhbHVlOiBuZXdWYWx1ZSxcbiAgICAgICAgc3VibWl0OiBzdWJtaXQsXG4gICAgICAgIHRvZ2dsZXI6IGgudG9nZ2xlUHJvcChmYWxzZSwgdHJ1ZSksXG4gICAgICAgIHVubG9hZDogdW5sb2FkLFxuICAgICAgICByYWRpb3M6IHJhZGlvc1xuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgdmFyIGRhdGEgPSBhcmdzLmRhdGEsXG4gICAgICAgICAgYnRuVmFsdWUgPSAoY3RybC5zZXRMb2FkZXIoKSB8fCBjdHJsLmdldExvYWRlcigpKSA/ICdwb3IgZmF2b3IsIGFndWFyZGUuLi4nIDogZGF0YS5jYWxsVG9BY3Rpb247XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMicsW1xuICAgICAgICBtKCdidXR0b24uYnRuLmJ0bi1zbWFsbC5idG4tdGVyY2lhcnknLCB7XG4gICAgICAgICAgb25jbGljazogY3RybC50b2dnbGVyLnRvZ2dsZVxuICAgICAgICB9LCBkYXRhLm91dGVyTGFiZWwpLFxuICAgICAgICAoY3RybC50b2dnbGVyKCkpID9cbiAgICAgICAgICBtKCcuZHJvcGRvd24tbGlzdC5jYXJkLnUtcmFkaXVzLmRyb3Bkb3duLWxpc3QtbWVkaXVtLnppbmRleC0xMCcsIHtjb25maWc6IGN0cmwudW5sb2FkfSxbXG4gICAgICAgICAgICBtKCdmb3JtLnctZm9ybScsIHtcbiAgICAgICAgICAgICAgb25zdWJtaXQ6IGN0cmwuc3VibWl0XG4gICAgICAgICAgICB9LCAoIWN0cmwuY29tcGxldGUoKSkgPyBbXG4gICAgICAgICAgICAgICAgICAoY3RybC5yYWRpb3MoKSkgP1xuICAgICAgICAgICAgICAgICAgICBfLm1hcChjdHJsLnJhZGlvcygpLCBmdW5jdGlvbihyYWRpbywgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5uZXdWYWx1ZShyYWRpby5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldERlc2NyaXB0aW9uKHJhZGlvLmRlc2NyaXB0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBzZWxlY3RlZCA9IChyYWRpby5pZCA9PT0gYXJncy5pdGVtLnJld2FyZC5pZCkgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbSgnLnctcmFkaW8nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKCdpbnB1dCNyLScgKyBpbmRleCArICcudy1yYWRpby1pbnB1dFt0eXBlPXJhZGlvXVtuYW1lPVwiYWRtaW4tcmFkaW9cIl1bdmFsdWU9XCInICsgcmFkaW8uaWQgKyAnXCJdJyArICgoc2VsZWN0ZWQpID8gJ1tjaGVja2VkXScgOiAnJykse1xuICAgICAgICAgICAgICAgICAgICAgICAgICBvbmNsaWNrOiBzZXRcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbSgnbGFiZWwudy1mb3JtLWxhYmVsW2Zvcj1cInItJyArIGluZGV4ICsgJ1wiXScsICdSJCcgKyByYWRpby5taW5pbXVtX3ZhbHVlKVxuICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICB9KSA6IGgubG9hZGVyKCksXG4gICAgICAgICAgICAgICAgICBtKCdzdHJvbmcnLCAnRGVzY3Jpw6fDo28nKSxcbiAgICAgICAgICAgICAgICAgIG0oJ3AnLCBjdHJsLmRlc2NyaXB0aW9uKCkpLFxuICAgICAgICAgICAgICAgICAgbSgnaW5wdXQudy1idXR0b24uYnRuLmJ0bi1zbWFsbFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiJyArIGJ0blZhbHVlICsgJ1wiXScpXG4gICAgICAgICAgICAgICAgXSA6ICghY3RybC5lcnJvcigpKSA/IFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctZm9ybS1kb25lW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdSZWNvbXBlbnNhIGFsdGVyYWRhIGNvbSBzdWNlc3NvIScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBtKCcudy1mb3JtLWVycm9yW3N0eWxlPVwiZGlzcGxheTpibG9jaztcIl0nLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgncCcsICdIb3V2ZSB1bSBwcm9ibGVtYSBuYSByZXF1aXNpw6fDo28uIE8gYXBvaW8gbsOjbyBmb2kgdHJhbnNmZXJpZG8hJylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIClcbiAgICAgICAgICBdKVxuICAgICAgICA6ICcnXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuQWRtaW5SZXdhcmQgPSAoZnVuY3Rpb24obSwgaCwgXyl7XG4gIHJldHVybiB7XG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncykge1xuICAgICAgdmFyIHJld2FyZCA9IGFyZ3MuY29udHJpYnV0aW9uLnJld2FyZCB8fCB7fSxcbiAgICAgICAgICBhdmFpbGFibGUgPSBwYXJzZUludChyZXdhcmQucGFpZF9jb3VudCkgKyBwYXJzZUludChyZXdhcmQud2FpdGluZ19wYXltZW50X2NvdW50KTtcblxuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ1JlY29tcGVuc2EnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyJywgKF8uaXNFbXB0eShyZXdhcmQpKSA/ICdBcG9pbyBzZW0gcmVjb21wZW5zYS4nIDogW1xuICAgICAgICAgICAgJ0lEOiAnICsgcmV3YXJkLmlkLFxuICAgICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAgICdWYWxvciBtw61uaW1vOiBSJCcgKyBoLmZvcm1hdE51bWJlcihyZXdhcmQubWluaW11bV92YWx1ZSwgMiwgMyksXG4gICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgbS50cnVzdCgnRGlzcG9uw612ZWlzOiAnICsgYXZhaWxhYmxlICsgJyAvICcgKyAocmV3YXJkLm1heGltdW1fY29udHJpYnV0aW9ucyB8fCAnJmluZmluOycpKSxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnQWd1YXJkYW5kbyBjb25maXJtYcOnw6NvOiAnICsgcmV3YXJkLndhaXRpbmdfcGF5bWVudF9jb3VudCxcbiAgICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgICAnRGVzY3Jpw6fDo286ICcgKyByZXdhcmQuZGVzY3JpcHRpb25cbiAgICAgICAgICBdXG4gICAgICAgIClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uSGlzdG9yeSA9IChmdW5jdGlvbihtLCBoLCBfKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgY29udHJpYnV0aW9uID0gYXJncy5jb250cmlidXRpb24sXG4gICAgICAgICAgbWFwRXZlbnRzID0gXy5yZWR1Y2UoW1xuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnBhaWRfYXQsIG5hbWU6ICdBcG9pbyBjb25maXJtYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucGVuZGluZ19yZWZ1bmRfYXQsIG5hbWU6ICdSZWVtYm9sc28gc29saWNpdGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLnJlZnVuZGVkX2F0LCBuYW1lOiAnRXN0b3JubyByZWFsaXphZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jcmVhdGVkX2F0LCBuYW1lOiAnQXBvaW8gY3JpYWRvJ30sXG4gICAgICAgIHtkYXRlOiBjb250cmlidXRpb24ucmVmdXNlZF9hdCwgbmFtZTogJ0Fwb2lvIGNhbmNlbGFkbyd9LFxuICAgICAgICB7ZGF0ZTogY29udHJpYnV0aW9uLmRlbGV0ZWRfYXQsIG5hbWU6ICdBcG9pbyBleGNsdcOtZG8nfSxcbiAgICAgICAge2RhdGU6IGNvbnRyaWJ1dGlvbi5jaGFyZ2ViYWNrX2F0LCBuYW1lOiAnQ2hhcmdlYmFjayd9LFxuICAgICAgXSwgZnVuY3Rpb24obWVtbywgaXRlbSl7XG4gICAgICAgIGlmIChpdGVtLmRhdGUgIT09IG51bGwgJiYgaXRlbS5kYXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpdGVtLm9yaWdpbmFsRGF0ZSA9IGl0ZW0uZGF0ZTtcbiAgICAgICAgICBpdGVtLmRhdGUgPSBoLm1vbWVudGlmeShpdGVtLmRhdGUsICdERC9NTS9ZWVlZLCBISDptbScpO1xuICAgICAgICAgIHJldHVybiBtZW1vLmNvbmNhdChpdGVtKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgfSwgW10pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBvcmRlcmVkRXZlbnRzOiBfLnNvcnRCeShtYXBFdmVudHMsICdvcmlnaW5hbERhdGUnKVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC00JyxbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLXNtYWxsZXIubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTIwJywgJ0hpc3TDs3JpY28gZGEgdHJhbnNhw6fDo28nKSxcbiAgICAgICAgY3RybC5vcmRlcmVkRXZlbnRzLm1hcChmdW5jdGlvbihjRXZlbnQpIHtcbiAgICAgICAgICByZXR1cm4gbSgnLnctcm93LmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtbG9vc2VyLmRhdGUtZXZlbnQnLFtcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJy5mb250Y29sb3Itc2Vjb25kYXJ5JywgY0V2ZW50LmRhdGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC02JyxbXG4gICAgICAgICAgICAgIG0oJ2RpdicsIGNFdmVudC5uYW1lKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5BZG1pblRyYW5zYWN0aW9uID0gKGZ1bmN0aW9uKG0sIGgpe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBjb250cmlidXRpb24gPSBhcmdzLmNvbnRyaWJ1dGlvbjtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmxpbmVoZWlnaHQtdGlnaHRlci51LW1hcmdpbmJvdHRvbS0yMCcsICdEZXRhbGhlcyBkbyBhcG9pbycpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC1sb29zZXInLFtcbiAgICAgICAgICAnVmFsb3I6IFIkJyArIGguZm9ybWF0TnVtYmVyKGNvbnRyaWJ1dGlvbi52YWx1ZSwgMiwgMyksXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICAnVGF4YTogUiQnICsgaC5mb3JtYXROdW1iZXIoY29udHJpYnV0aW9uLmdhdGV3YXlfZmVlLCAyLCAzKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBZ3VhcmRhbmRvIENvbmZpcm1hw6fDo286ICcgKyAoY29udHJpYnV0aW9uLndhaXRpbmdfcGF5bWVudCA/ICdTaW0nIDogJ07Do28nKSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdBbsO0bmltbzogJyArIChjb250cmlidXRpb24uYW5vbnltb3VzID8gJ1NpbScgOiAnTsOjbycpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0lkIHBhZ2FtZW50bzogJyArIGNvbnRyaWJ1dGlvbi5nYXRld2F5X2lkLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ0Fwb2lvOiAnICsgY29udHJpYnV0aW9uLmNvbnRyaWJ1dGlvbl9pZCxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdDaGF2ZTrCoFxcbicsXG4gICAgICAgICAgbSgnYnInKSxcbiAgICAgICAgICBjb250cmlidXRpb24ua2V5LFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgJ01laW86ICcgKyBjb250cmlidXRpb24uZ2F0ZXdheSxcbiAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICdPcGVyYWRvcmE6ICcgKyAoY29udHJpYnV0aW9uLmdhdGV3YXlfZGF0YSAmJiBjb250cmlidXRpb24uZ2F0ZXdheV9kYXRhLmFjcXVpcmVyX25hbWUpLFxuICAgICAgICAgIG0oJ2JyJyksXG4gICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBpZiAoY29udHJpYnV0aW9uLmlzX3NlY29uZF9zbGlwKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbbSgnYS5saW5rLWhpZGRlbltocmVmPVwiI1wiXScsICdCb2xldG8gYmFuY8OhcmlvJyksICcgJywgbSgnc3Bhbi5iYWRnZScsICcyYSB2aWEnKV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSgpKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkFkbWluVXNlciA9IChmdW5jdGlvbihtLCBoKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKSB7XG4gICAgICB2YXIgdXNlciA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cuYWRtaW4tdXNlcicsW1xuICAgICAgICBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnUtbWFyZ2luYm90dG9tLTEwJyxbXG4gICAgICAgICAgbSgnaW1nLnVzZXItYXZhdGFyW3NyYz1cIicgKyBoLnVzZUF2YXRhck9yRGVmYXVsdCh1c2VyLnVzZXJfcHJvZmlsZV9pbWcpICsgJ1wiXScpXG4gICAgICAgIF0pLFxuICAgICAgICBtKCcudy1jb2wudy1jb2wtOS53LWNvbC1zbWFsbC05JyxbXG4gICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQuZm9udHNpemUtc21hbGxlci5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTAnLCBbXG4gICAgICAgICAgICBtKCdhLmFsdC1saW5rW3RhcmdldD1cIl9ibGFua1wiXVtocmVmPVwiL3VzZXJzLycgKyB1c2VyLnVzZXJfaWQgKyAnL2VkaXRcIl0nLCB1c2VyLnVzZXJfbmFtZSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QnLCAnVXN1w6FyaW86ICcgKyB1c2VyLnVzZXJfaWQpLFxuICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0NhdGFyc2U6ICcgKyB1c2VyLmVtYWlsKSxcbiAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlc3QuZm9udGNvbG9yLXNlY29uZGFyeScsICdHYXRld2F5OiAnICsgdXNlci5wYXllcl9lbWFpbClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLkZpbHRlckRhdGVSYW5nZSA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTUudy1jb2wtc21hbGwtNS53LWNvbC10aW55LTUnLCBbXG4gICAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmVbaWQ9XCInICsgYXJncy5pbmRleCArICdcIl1bdHlwZT1cInRleHRcIl0nLCB7XG4gICAgICAgICAgICAgIG9uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3MuZmlyc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5maXJzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIudS10ZXh0LWNlbnRlci5saW5laGVpZ2h0LWxvb3NlcicsICdlJylcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5sYXN0KSxcbiAgICAgICAgICAgICAgdmFsdWU6IGFyZ3MubGFzdCgpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tKSk7XG4iLCJ3aW5kb3cuYy5GaWx0ZXJEcm9wZG93biA9IChmdW5jdGlvbihtLCBfKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC02JywgW1xuICAgICAgICBtKCdsYWJlbC5mb250c2l6ZS1zbWFsbGVyW2Zvcj1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIGFyZ3MubGFiZWwpLFxuICAgICAgICBtKCdzZWxlY3Qudy1zZWxlY3QudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXScsIHtcbiAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLnZtKSxcbiAgICAgICAgICB2YWx1ZTogYXJncy52bSgpXG4gICAgICAgIH0sW1xuICAgICAgICAgIF8ubWFwKGFyZ3Mub3B0aW9ucywgZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICByZXR1cm4gbSgnb3B0aW9uW3ZhbHVlPVwiJyArIGRhdGEudmFsdWUgKyAnXCJdJywgZGF0YS5vcHRpb24pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuXykpO1xuIiwid2luZG93LmMuRmlsdGVyTWFpbiA9IChmdW5jdGlvbihtKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsLCBhcmdzKXtcbiAgICAgIHJldHVybiBtKCcudy1yb3cnLCBbXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0xMCcsIFtcbiAgICAgICAgICBtKCdpbnB1dC53LWlucHV0LnRleHQtZmllbGQucG9zaXRpdmUubWVkaXVtW3BsYWNlaG9sZGVyPVwiJyArIGFyZ3MucGxhY2Vob2xkZXIgKyAnXCJdW3R5cGU9XCJ0ZXh0XCJdJywge29uY2hhbmdlOiBtLndpdGhBdHRyKCd2YWx1ZScsIGFyZ3Mudm0pLCB2YWx1ZTogYXJncy52bSgpfSlcbiAgICAgICAgXSksXG4gICAgICAgIG0oJy53LWNvbC53LWNvbC0yJywgW1xuICAgICAgICAgIG0oJ2lucHV0I2ZpbHRlci1idG4uYnRuLmJ0bi1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMFt0eXBlPVwic3VibWl0XCJdW3ZhbHVlPVwiQnVzY2FyXCJdJylcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLkZpbHRlck51bWJlclJhbmdlID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3Mpe1xuICAgICAgcmV0dXJuIG0oJy53LWNvbC53LWNvbC0zLnctY29sLXNtYWxsLTYnLCBbXG4gICAgICAgIG0oJ2xhYmVsLmZvbnRzaXplLXNtYWxsZXJbZm9yPVwiJyArIGFyZ3MuaW5kZXggKyAnXCJdJywgYXJncy5sYWJlbCksXG4gICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNS53LWNvbC1zbWFsbC01LnctY29sLXRpbnktNScsIFtcbiAgICAgICAgICAgIG0oJ2lucHV0LnctaW5wdXQudGV4dC1maWVsZC5wb3NpdGl2ZVtpZD1cIicgKyBhcmdzLmluZGV4ICsgJ1wiXVt0eXBlPVwidGV4dFwiXScsIHtcbiAgICAgICAgICAgICAgb25jaGFuZ2U6IG0ud2l0aEF0dHIoJ3ZhbHVlJywgYXJncy5maXJzdCksXG4gICAgICAgICAgICAgIHZhbHVlOiBhcmdzLmZpcnN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTIudy1jb2wtc21hbGwtMi53LWNvbC10aW55LTInLCBbXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LXRleHQtY2VudGVyLmxpbmVoZWlnaHQtbG9vc2VyJywgJ2UnKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWNvbC53LWNvbC01LnctY29sLXNtYWxsLTUudy1jb2wtdGlueS01JywgW1xuICAgICAgICAgICAgbSgnaW5wdXQudy1pbnB1dC50ZXh0LWZpZWxkLnBvc2l0aXZlW3R5cGU9XCJ0ZXh0XCJdJywge1xuICAgICAgICAgICAgICBvbmNoYW5nZTogbS53aXRoQXR0cigndmFsdWUnLCBhcmdzLmxhc3QpLFxuICAgICAgICAgICAgICB2YWx1ZTogYXJncy5sYXN0KClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXSlcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlBheW1lbnRTdGF0dXMgPSAoZnVuY3Rpb24obSl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbSwgY2FyZCA9IG51bGwsXG4gICAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QsIHBheW1lbnRNZXRob2RDbGFzcywgc3RhdGVDbGFzcztcblxuICAgICAgY2FyZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmIChwYXltZW50LmdhdGV3YXlfZGF0YSl7XG4gICAgICAgICAgc3dpdGNoIChwYXltZW50LmdhdGV3YXkudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgICBjYXNlICdtb2lwJzpcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBmaXJzdF9kaWdpdHM6ICBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fYmluLFxuICAgICAgICAgICAgICAgIGxhc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJ0YW9fZmluYWwsXG4gICAgICAgICAgICAgICAgYnJhbmQ6IHBheW1lbnQuZ2F0ZXdheV9kYXRhLmNhcnRhb19iYW5kZWlyYVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgY2FzZSAncGFnYXJtZSc6XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZmlyc3RfZGlnaXRzOiBwYXltZW50LmdhdGV3YXlfZGF0YS5jYXJkX2ZpcnN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBsYXN0X2RpZ2l0czogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBicmFuZDogcGF5bWVudC5nYXRld2F5X2RhdGEuY2FyZF9icmFuZFxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgZGlzcGxheVBheW1lbnRNZXRob2QgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQucGF5bWVudF9tZXRob2QudG9Mb3dlckNhc2UoKSl7XG4gICAgICAgICAgY2FzZSAnYm9sZXRvYmFuY2FyaW8nOlxuICAgICAgICAgICAgcmV0dXJuIG0oJ3NwYW4jYm9sZXRvLWRldGFpbCcsICcnKTtcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgdmFyIGNhcmREYXRhID0gY2FyZCgpO1xuICAgICAgICAgICAgaWYgKGNhcmREYXRhKXtcbiAgICAgICAgICAgICAgcmV0dXJuIG0oJyNjcmVkaXRjYXJkLWRldGFpbC5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LmxpbmVoZWlnaHQtdGlnaHQnLCBbXG4gICAgICAgICAgICAgICAgY2FyZERhdGEuZmlyc3RfZGlnaXRzICsgJyoqKioqKicgKyBjYXJkRGF0YS5sYXN0X2RpZ2l0cyxcbiAgICAgICAgICAgICAgICBtKCdicicpLFxuICAgICAgICAgICAgICAgIGNhcmREYXRhLmJyYW5kICsgJyAnICsgcGF5bWVudC5pbnN0YWxsbWVudHMgKyAneCdcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHBheW1lbnRNZXRob2RDbGFzcyA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIHN3aXRjaCAocGF5bWVudC5wYXltZW50X21ldGhvZC50b0xvd2VyQ2FzZSgpKXtcbiAgICAgICAgICBjYXNlICdib2xldG9iYW5jYXJpbyc6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1iYXJjb2RlJztcbiAgICAgICAgICBjYXNlICdjYXJ0YW9kZWNyZWRpdG8nOlxuICAgICAgICAgICAgcmV0dXJuICcuZmEtY3JlZGl0LWNhcmQnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy5mYS1xdWVzdGlvbic7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHN0YXRlQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgICBzd2l0Y2ggKHBheW1lbnQuc3RhdGUpe1xuICAgICAgICAgIGNhc2UgJ3BhaWQnOlxuICAgICAgICAgICAgcmV0dXJuICcudGV4dC1zdWNjZXNzJztcbiAgICAgICAgICBjYXNlICdyZWZ1bmRlZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXJlZnVuZGVkJztcbiAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICBjYXNlICdwZW5kaW5nX3JlZnVuZCc6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LXdhaXRpbmcnO1xuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gJy50ZXh0LWVycm9yJztcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGlzcGxheVBheW1lbnRNZXRob2Q6IGRpc3BsYXlQYXltZW50TWV0aG9kLFxuICAgICAgICBwYXltZW50TWV0aG9kQ2xhc3M6IHBheW1lbnRNZXRob2RDbGFzcyxcbiAgICAgICAgc3RhdGVDbGFzczogc3RhdGVDbGFzc1xuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCwgYXJncyl7XG4gICAgICB2YXIgcGF5bWVudCA9IGFyZ3MuaXRlbTtcbiAgICAgIHJldHVybiBtKCcudy1yb3cucGF5bWVudC1zdGF0dXMnLCBbXG4gICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LWxvb3Nlci5mb250d2VpZ2h0LXNlbWlib2xkJyxbXG4gICAgICAgICAgbSgnc3Bhbi5mYS5mYS1jaXJjbGUnICsgY3RybC5zdGF0ZUNsYXNzKCkpLCAnwqAnICsgcGF5bWVudC5zdGF0ZVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQnLFtcbiAgICAgICAgICBtKCdzcGFuLmZhJyArIGN0cmwucGF5bWVudE1ldGhvZENsYXNzKCkpLCAnICcsIG0oJ2EubGluay1oaWRkZW5baHJlZj1cIiNcIl0nLCBwYXltZW50LnBheW1lbnRfbWV0aG9kKVxuICAgICAgICBdKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmZvbnRjb2xvci1zZWNvbmRhcnkubGluZWhlaWdodC10aWdodCcsIFtcbiAgICAgICAgICBjdHJsLmRpc3BsYXlQYXltZW50TWV0aG9kKClcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RDYXJkID0gKChtLCBoLCBtb2RlbHMpID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCBwcm9qZWN0ID0gYXJncy5wcm9qZWN0LFxuICAgICAgICAgIHByb2dyZXNzID0gcHJvamVjdC5wcm9ncmVzcy50b0ZpeGVkKDIpLFxuICAgICAgICAgIHJlbWFpbmluZ1RleHRPYmogPSBoLmdlbmVyYXRlUmVtYWluZ1RpbWUocHJvamVjdCkoKSxcbiAgICAgICAgICBsaW5rID0gJy8nICsgcHJvamVjdC5wZXJtYWxpbmsgKyAoYXJncy5yZWYgPyAnP3JlZj0nICsgYXJncy5yZWYgOiAnJyk7XG5cbiAgICAgIHJldHVybiBtKCcudy1jb2wudy1jb2wtNCcsIFtcbiAgICAgICAgbSgnLmNhcmQtcHJvamVjdC5jYXJkLnUtcmFkaXVzJywgW1xuICAgICAgICAgIG0oYGEuY2FyZC1wcm9qZWN0LXRodW1iW2hyZWY9XCIke2xpbmt9XCJdYCwge3N0eWxlOiB7J2JhY2tncm91bmQtaW1hZ2UnOiBgdXJsKCR7cHJvamVjdC5wcm9qZWN0X2ltZ30pYCwgJ2Rpc3BsYXknOiAnYmxvY2snfX0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3QtZGVzY3JpcHRpb24uYWx0JywgW1xuICAgICAgICAgICAgbSgnLmZvbnR3ZWlnaHQtc2VtaWJvbGQudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5LmxpbmVoZWlnaHQtdGlnaHQudS1tYXJnaW5ib3R0b20tMTAuZm9udHNpemUtYmFzZScsIFtcbiAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QucHJvamVjdF9uYW1lKVxuICAgICAgICAgICAgXVxuICAgICAgICAgICksXG4gICAgICAgICAgICBtKCcudy1oaWRkZW4tc21hbGwudy1oaWRkZW4tdGlueS5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5LnUtbWFyZ2luYm90dG9tLTIwJywgYHBvciAke3Byb2plY3Qub3duZXJfbmFtZX1gKSxcbiAgICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmZvbnRjb2xvci1zZWNvbmRhcnkuZm9udHNpemUtc21hbGxlcicsIFtcbiAgICAgICAgICAgICAgbShgYS5saW5rLWhpZGRlbltocmVmPVwiJHtsaW5rfVwiXWAsIHByb2plY3QuaGVhZGxpbmUpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55LmNhcmQtcHJvamVjdC1hdXRob3IuYWx0dCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgW20oJ3NwYW4uZmEuZmEtbWFwLW1hcmtlci5mYS0xJywgJyAnKSwgYCAke3Byb2plY3QuY2l0eV9uYW1lfSwgJHtwcm9qZWN0LnN0YXRlX2Fjcm9ueW19YF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmNhcmQtcHJvamVjdC1tZXRlcicsIFtcbiAgICAgICAgICAgIG0oJy5tZXRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLm1ldGVyLWZpbGwnLCB7c3R5bGU6IHt3aWR0aDogYCR7KHByb2dyZXNzID4gMTAwID8gMTAwIDogcHJvZ3Jlc3MpfSVgfX0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5jYXJkLXByb2plY3Qtc3RhdHMnLCBbXG4gICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQudy1jb2wtdGlueS00JywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1iYXNlLmZvbnR3ZWlnaHQtc2VtaWJvbGQnLCBgJHtNYXRoLmNlaWwocHJvamVjdC5wcm9ncmVzcyl9JWApXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtY2VudGVyLXNtYWxsLW9ubHknLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGBSJCAke2guZm9ybWF0TnVtYmVyKHByb2plY3QucGxlZGdlZCl9YCksXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3QnLCAnTGV2YW50YWRvcycpXG4gICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtNC53LWNvbC1zbWFsbC00LnctY29sLXRpbnktNC51LXRleHQtcmlnaHQnLCBbXG4gICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLXNtYWxsZXIuZm9udHdlaWdodC1zZW1pYm9sZCcsIGAke3JlbWFpbmluZ1RleHRPYmoudG90YWx9ICR7cmVtYWluaW5nVGV4dE9iai51bml0fWApLFxuICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0JywgJ1Jlc3RhbnRlcycpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cuYy5tb2RlbHMpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5ID0gKGZ1bmN0aW9uKG0sIENoYXJ0LCBfLCBoKXtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXIgcmVzb3VyY2UgPSBhcmdzLmNvbGxlY3Rpb24oKVswXSxcbiAgICAgICAgICBtb3VudERhdGFzZXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgICBsYWJlbDogJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsX2Ftb3VudDt9KVxuICAgICAgICAgICAgfV07XG4gICAgICAgICAgfSxcbiAgICAgICAgICByZW5kZXJDaGFydCA9IGZ1bmN0aW9uKGVsZW1lbnQsIGlzSW5pdGlhbGl6ZWQpe1xuICAgICAgICAgICAgaWYgKGlzSW5pdGlhbGl6ZWQpe3JldHVybjt9XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0SGVpZ2h0Jywge1xuICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkgeyByZXR1cm4gZWxlbWVudC5oZWlnaHQ7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbGVtZW50LCAnb2Zmc2V0V2lkdGgnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LndpZHRoOyB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgY3R4ID0gZWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICBuZXcgQ2hhcnQoY3R4KS5MaW5lKHtcbiAgICAgICAgICAgICAgbGFiZWxzOiBfLm1hcChyZXNvdXJjZS5zb3VyY2UsIGZ1bmN0aW9uKGl0ZW0pIHtyZXR1cm4gaC5tb21lbnRpZnkoaXRlbS5wYWlkX2F0KTt9KSxcbiAgICAgICAgICAgICAgZGF0YXNldHM6IG1vdW50RGF0YXNldCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9O1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICByZW5kZXJDaGFydDogcmVuZGVyQ2hhcnRcbiAgICAgIH07XG4gICAgfSxcbiAgICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgICByZXR1cm4gbSgnLmNhcmQudS1yYWRpdXMubWVkaXVtLnUtbWFyZ2luYm90dG9tLTMwJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ1IkIGFycmVjYWRhZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcblxuIiwid2luZG93LmMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXkgPSAoZnVuY3Rpb24obSwgQ2hhcnQsIF8sIGgpe1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIHZhciByZXNvdXJjZSA9IGFyZ3MuY29sbGVjdGlvbigpWzBdLFxuICAgICAgICAgIG1vdW50RGF0YXNldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIFt7XG4gICAgICAgICAgICAgIGxhYmVsOiAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnLFxuICAgICAgICAgICAgICBmaWxsQ29sb3I6ICdyZ2JhKDEyNiwxOTQsNjksMC4yKScsXG4gICAgICAgICAgICAgIHN0cm9rZUNvbG9yOiAncmdiYSgxMjYsMTk0LDY5LDEpJyxcbiAgICAgICAgICAgICAgcG9pbnRDb2xvcjogJ3JnYmEoMTI2LDE5NCw2OSwxKScsXG4gICAgICAgICAgICAgIHBvaW50U3Ryb2tlQ29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgcG9pbnRIaWdobGlnaHRGaWxsOiAnI2ZmZicsXG4gICAgICAgICAgICAgIHBvaW50SGlnaGxpZ2h0U3Ryb2tlOiAncmdiYSgyMjAsMjIwLDIyMCwxKScsXG4gICAgICAgICAgICAgIGRhdGE6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBpdGVtLnRvdGFsO30pXG4gICAgICAgICAgICB9XTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIHJlbmRlckNoYXJ0ID0gZnVuY3Rpb24oZWxlbWVudCwgaXNJbml0aWFsaXplZCl7XG4gICAgICAgICAgICBpZiAoaXNJbml0aWFsaXplZCl7cmV0dXJuO31cblxuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRIZWlnaHQnLCB7XG4gICAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBlbGVtZW50LmhlaWdodDsgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVsZW1lbnQsICdvZmZzZXRXaWR0aCcsIHtcbiAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIGVsZW1lbnQud2lkdGg7IH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBjdHggPSBlbGVtZW50LmdldENvbnRleHQoJzJkJyk7XG5cbiAgICAgICAgICAgIG5ldyBDaGFydChjdHgpLkxpbmUoe1xuICAgICAgICAgICAgICBsYWJlbHM6IF8ubWFwKHJlc291cmNlLnNvdXJjZSwgZnVuY3Rpb24oaXRlbSkge3JldHVybiBoLm1vbWVudGlmeShpdGVtLnBhaWRfYXQpO30pLFxuICAgICAgICAgICAgICBkYXRhc2V0czogbW91bnREYXRhc2V0KClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlckNoYXJ0OiByZW5kZXJDaGFydFxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcuY2FyZC51LXJhZGl1cy5tZWRpdW0udS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLnUtbWFyZ2luYm90dG9tLTEwLmZvbnRzaXplLWxhcmdlLnUtdGV4dC1jZW50ZXInLCAnQXBvaW9zIGNvbmZpcm1hZG9zIHBvciBkaWEnKSxcbiAgICAgICAgbSgnLnctcm93JyxbXG4gICAgICAgICAgbSgnLnctY29sLnctY29sLTEyLm92ZXJmbG93LWF1dG8nLCBbXG4gICAgICAgICAgICBtKCdjYW52YXNbaWQ9XCJjaGFydFwiXVt3aWR0aD1cIjg2MFwiXVtoZWlnaHQ9XCIzMDBcIl0nLCB7Y29uZmlnOiBjdHJsLnJlbmRlckNoYXJ0fSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgXSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5DaGFydCwgd2luZG93Ll8sIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLlByb2plY3RDb250cmlidXRpb25zUGVyTG9jYXRpb25UYWJsZSA9IChmdW5jdGlvbihtLCBtb2RlbHMsIGgsIF8pIHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKSB7XG4gICAgICB2YXJcdHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uID0gbS5wcm9wKFtdKSxcbiAgICAgICAgICBnZW5lcmF0ZVNvcnQgPSBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciBjb2xsZWN0aW9uID0gY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKCksXG4gICAgICAgICAgICAgICAgICByZXNvdXJjZSA9IGNvbGxlY3Rpb25bMF0sXG4gICAgICAgICAgICAgICAgICBvcmRlcmVkU291cmNlID0gXy5zb3J0QnkocmVzb3VyY2Uuc291cmNlLCBmaWVsZCk7XG5cbiAgICAgICAgICAgICAgaWYgKHJlc291cmNlLm9yZGVyRmlsdGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXNvdXJjZS5vcmRlckZpbHRlciA9ICdERVNDJztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChyZXNvdXJjZS5vcmRlckZpbHRlciA9PT0gJ0RFU0MnKSB7XG4gICAgICAgICAgICAgICAgb3JkZXJlZFNvdXJjZSA9IG9yZGVyZWRTb3VyY2UucmV2ZXJzZSgpO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcmVzb3VyY2Uuc291cmNlID0gb3JkZXJlZFNvdXJjZTtcbiAgICAgICAgICAgICAgcmVzb3VyY2Uub3JkZXJGaWx0ZXIgPSAocmVzb3VyY2Uub3JkZXJGaWx0ZXIgPT09ICdERVNDJyA/ICdBU0MnIDogJ0RFU0MnKTtcbiAgICAgICAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uKGNvbGxlY3Rpb24pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9O1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3MucmVzb3VyY2VJZCk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0Q29udHJpYnV0aW9uc1BlckxvY2F0aW9uLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbihkYXRhKTtcbiAgICAgICAgZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpKCk7XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29udHJpYnV0aW9uc1BlckxvY2F0aW9uOiBjb250cmlidXRpb25zUGVyTG9jYXRpb24sXG4gICAgICAgIGdlbmVyYXRlU29ydDogZ2VuZXJhdGVTb3J0XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIG0oJy5wcm9qZWN0LWNvbnRyaWJ1dGlvbnMtcGVyLWxvY2F0aW9uJywgW1xuICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC51LW1hcmdpbmJvdHRvbS0xMC5mb250c2l6ZS1sYXJnZS51LXRleHQtY2VudGVyJywgJ0xvY2FsaXphw6fDo28gZ2VvZ3LDoWZpY2EgZG9zIGFwb2lvcycpLFxuICAgICAgICBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvbigpLm1hcChmdW5jdGlvbihjb250cmlidXRpb25Mb2NhdGlvbil7XG4gICAgICAgICAgcmV0dXJuIG0oJy50YWJsZS1vdXRlci51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy50YWJsZS1yb3cuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1zbWFsbGVyLmhlYWRlcicsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgIG0oJ2RpdicsICdFc3RhZG8nKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRpb25zJyl9LCBbXG4gICAgICAgICAgICAgICAgICAnQXBvaW9zwqDCoCcsbSgnc3Bhbi5mYS5mYS1zb3J0JylcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sW2RhdGEtaXg9XCJzb3J0LWFycm93c1wiXScsIFtcbiAgICAgICAgICAgICAgICBtKCdhLmxpbmstaGlkZGVuW2hyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMCk7XCJdJywge29uY2xpY2s6IGN0cmwuZ2VuZXJhdGVTb3J0KCd0b3RhbF9jb250cmlidXRlZCcpfSwgW1xuICAgICAgICAgICAgICAgICAgJ1IkIGFwb2lhZG9zICcsXG4gICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCcoJSBkbyB0b3RhbCnCoCcpLFxuICAgICAgICAgICAgICAgICAgJyAnLG0oJ3NwYW4uZmEuZmEtc29ydCcpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbSgnLnRhYmxlLWlubmVyLmZvbnRzaXplLXNtYWxsJywgW1xuICAgICAgICAgICAgICBfLm1hcChjb250cmlidXRpb25Mb2NhdGlvbi5zb3VyY2UsIGZ1bmN0aW9uKHNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudy1yb3cudGFibGUtcm93JywgW1xuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2Uuc3RhdGVfYWNyb255bSlcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBzb3VyY2UudG90YWxfY29udHJpYnV0aW9ucylcbiAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudy1jb2wtc21hbGwtNC53LWNvbC10aW55LTQudGFibGUtY29sJywgW1xuICAgICAgICAgICAgICAgICAgICBtKCdkaXYnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgJ1IkICcsXG4gICAgICAgICAgICAgICAgICAgICAgaC5mb3JtYXROdW1iZXIoc291cmNlLnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSxcbiAgICAgICAgICAgICAgICAgICAgICBtKCdzcGFuLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnknLCAnwqDCoCgnICsgc291cmNlLnRvdGFsX29uX3BlcmNlbnRhZ2UudG9GaXhlZCgyKSArICclKScpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKTtcbiAgICAgICAgfSlcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscywgd2luZG93LmMuaCwgd2luZG93Ll8pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSZW1pbmRlckNvdW50ID0gKGZ1bmN0aW9uKG0pe1xuICByZXR1cm4ge1xuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwsIGFyZ3MpIHtcbiAgICAgIHZhciBwcm9qZWN0ID0gYXJncy5yZXNvdXJjZTtcbiAgICAgIHJldHVybiBtKCcjcHJvamVjdC1yZW1pbmRlci1jb3VudC5jYXJkLnUtcmFkaXVzLnUtdGV4dC1jZW50ZXIubWVkaXVtLnUtbWFyZ2luYm90dG9tLTgwJywgW1xuICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UuZm9udHdlaWdodC1zZW1pYm9sZCcsICdUb3RhbCBkZSBwZXNzb2FzIHF1ZSBjbGljYXJhbSBubyBib3TDo28gTGVtYnJhci1tZScpLFxuICAgICAgICBtKCcuZm9udHNpemUtc21hbGxlci51LW1hcmdpbmJvdHRvbS0zMCcsICdVbSBsZW1icmV0ZSBwb3IgZW1haWwgw6kgZW52aWFkbyA0OCBob3JhcyBhbnRlcyBkbyB0w6lybWlubyBkYSBzdWEgY2FtcGFuaGEnKSxcbiAgICAgICAgbSgnLmZvbnRzaXplLWp1bWJvJywgcHJvamVjdC5yZW1pbmRlcl9jb3VudClcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0pKTtcbiIsIndpbmRvdy5jLlByb2plY3RSb3cgPSAoKG0pID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIHZpZXc6IChjdHJsLCBhcmdzKSA9PiB7XG4gICAgICBjb25zdCBjb2xsZWN0aW9uID0gYXJncy5jb2xsZWN0aW9uLFxuICAgICAgICAgIHJlZiA9IGFyZ3MucmVmO1xuICAgICAgcmV0dXJuIGNvbGxlY3Rpb24uY29sbGVjdGlvbigpLmxlbmd0aCA+IDAgPyBtKCcudy1zZWN0aW9uLnNlY3Rpb24udS1tYXJnaW5ib3R0b20tNDAnLCBbXG4gICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICBtKCcudy1yb3cudS1tYXJnaW5ib3R0b20tMzAnLCBbXG4gICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTAudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYnLCBbXG4gICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LWxvb3NlcicsIGNvbGxlY3Rpb24udGl0bGUpXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTYudy1jb2wtdGlueS02JywgW1xuICAgICAgICAgICAgICBtKGBhLmJ0bi5idG4tc21hbGwuYnRuLXRlcmNpYXJ5W2hyZWY9XCIvcHQvZXhwbG9yZT9yZWY9JHtyZWZ9IyR7Y29sbGVjdGlvbi5oYXNofVwiXWAsICdWZXIgdG9kb3MnKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjb2xsZWN0aW9uLmNvbGxlY3Rpb24oKSwgKHByb2plY3QpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBtLmNvbXBvbmVudChjLlByb2plY3RDYXJkLCB7cHJvamVjdDogcHJvamVjdCwgcmVmOiByZWZ9KTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgXSlcbiAgICAgIF0pIDogbSgnJyk7XG4gICAgfX07XG59KHdpbmRvdy5tKSk7XG5cbiIsIndpbmRvdy5jLlRlYW1NZW1iZXJzID0gKGZ1bmN0aW9uKF8sIG0sIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX0sXG5cbiAgICAgICAgZ3JvdXBDb2xsZWN0aW9uID0gZnVuY3Rpb24oY29sbGVjdGlvbiwgZ3JvdXBUb3RhbCkge1xuICAgICAgICByZXR1cm4gXy5tYXAoXy5yYW5nZShNYXRoLmNlaWwoY29sbGVjdGlvbi5sZW5ndGggLyBncm91cFRvdGFsKSksIGZ1bmN0aW9uKGkpe1xuICAgICAgICAgIHJldHVybiBjb2xsZWN0aW9uLnNsaWNlKGkgKiBncm91cFRvdGFsLCAoaSArIDEpICogZ3JvdXBUb3RhbCk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcblxuICAgICAgbW9kZWxzLnRlYW1NZW1iZXIuZ2V0UGFnZSgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgIHZtLmNvbGxlY3Rpb24oZ3JvdXBDb2xsZWN0aW9uKGRhdGEsIDQpKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS1tZW1iZXJzLXN0YXRpYy53LXNlY3Rpb24uc2VjdGlvbicsIFtcbiAgICAgICAgbSgnLnctY29udGFpbmVyJyxbXG4gICAgICAgICAgXy5tYXAoY3RybC52bS5jb2xsZWN0aW9uKCksIGZ1bmN0aW9uKGdyb3VwKSB7XG4gICAgICAgICAgICByZXR1cm4gbSgnLnctcm93LnUtdGV4dC1jZW50ZXInLFtcbiAgICAgICAgICAgICAgXy5tYXAoZ3JvdXAsIGZ1bmN0aW9uKG1lbWJlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCcudGVhbS1tZW1iZXIudy1jb2wudy1jb2wtMy53LWNvbC1zbWFsbC0zLnctY29sLXRpbnktNi51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgICAgIG0oJ2EuYWx0LWxpbmtbaHJlZj1cIi91c2Vycy8nICsgbWVtYmVyLmlkICsgJ1wiXScsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLmJpZy51LXJvdW5kLnUtbWFyZ2luYm90dG9tLTEwW3NyYz1cIicgKyBtZW1iZXIuaW1nICsgJ1wiXScpLFxuICAgICAgICAgICAgICAgICAgICBtKCcuZm9udHdlaWdodC1zZW1pYm9sZC5mb250c2l6ZS1iYXNlJywgbWVtYmVyLm5hbWUpXG4gICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1zbWFsbGVzdC5mb250Y29sb3Itc2Vjb25kYXJ5JywgJ0Fwb2lvdSAnICsgbWVtYmVyLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcycpXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9KVxuICAgICAgICBdKVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cuXywgd2luZG93Lm0sIHdpbmRvdy5jLm1vZGVscykpO1xuIiwid2luZG93LmMuVGVhbVRvdGFsID0gKGZ1bmN0aW9uKG0sIGgsIG1vZGVscyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdm0gPSB7Y29sbGVjdGlvbjogbS5wcm9wKFtdKX07XG5cbiAgICAgIG1vZGVscy50ZWFtVG90YWwuZ2V0Um93KCkudGhlbihmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdm0uY29sbGVjdGlvbihkYXRhKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB2bTogdm1cbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICAgIHJldHVybiBtKCcjdGVhbS10b3RhbC1zdGF0aWMudy1zZWN0aW9uLnNlY3Rpb24tb25lLWNvbHVtbi51LW1hcmdpbnRvcC00MC51LXRleHQtY2VudGVyLnUtbWFyZ2luYm90dG9tLTIwJywgW1xuICAgICAgICBjdHJsLnZtLmNvbGxlY3Rpb24oKS5tYXAoZnVuY3Rpb24odGVhbVRvdGFsKXtcbiAgICAgICAgICByZXR1cm4gbSgnLnctY29udGFpbmVyJywgW1xuICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpLFxuICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOCcsIFtcbiAgICAgICAgICAgICAgICBtKCcuZm9udHNpemUtYmFzZS51LW1hcmdpbmJvdHRvbS0zMCcsXG4gICAgICAgICAgICAgICAgICAnSG9qZSBzb21vcyAnICsgdGVhbVRvdGFsLm1lbWJlcl9jb3VudCArICcgcGVzc29hcyBlc3BhbGhhZGFzIHBvciAnICsgdGVhbVRvdGFsLnRvdGFsX2NpdGllcyArICcgY2lkYWRlcyBlbSAnICsgdGVhbVRvdGFsLmNvdW50cmllcy5sZW5ndGggK1xuICAgICAgICAgICAgICAgICAgICAnIHBhw61zZXMgKCcgKyB0ZWFtVG90YWwuY291bnRyaWVzLnRvU3RyaW5nKCkgKyAnKSEgTyBDYXRhcnNlIMOpIGluZGVwZW5kZW50ZSwgc2VtIGludmVzdGlkb3JlcywgZGUgY8OzZGlnbyBhYmVydG8gZSBjb25zdHJ1w61kbyBjb20gYW1vci4gTm9zc2EgcGFpeMOjbyDDqSBjb25zdHJ1aXIgdW0gYW1iaWVudGUgb25kZSBjYWRhIHZleiBtYWlzIHByb2pldG9zIHBvc3NhbSBnYW5oYXIgdmlkYS4nKSxcbiAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZXIubGluZWhlaWdodC10aWdodC50ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgICAgICAgICAnTm9zc2EgZXF1aXBlLCBqdW50YSwgasOhIGFwb2lvdSBSJCcgKyBoLmZvcm1hdE51bWJlcih0ZWFtVG90YWwudG90YWxfYW1vdW50KSArICcgcGFyYSAnICsgdGVhbVRvdGFsLnRvdGFsX2NvbnRyaWJ1dGVkX3Byb2plY3RzICsgJyBwcm9qZXRvcyEnKV0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMicpXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pO1xuICAgICAgICB9KVxuICAgICAgXSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMuaCwgd2luZG93LmMubW9kZWxzKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5Db250cmlidXRpb25zID0gKGZ1bmN0aW9uKG0sIGMsIGgpe1xuICB2YXIgYWRtaW4gPSBjLmFkbWluO1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgbGlzdFZNID0gYWRtaW4uY29udHJpYnV0aW9uTGlzdFZNLFxuICAgICAgICAgIGZpbHRlclZNID0gYWRtaW4uY29udHJpYnV0aW9uRmlsdGVyVk0sXG4gICAgICAgICAgZXJyb3IgPSBtLnByb3AoJycpLFxuICAgICAgICAgIGl0ZW1CdWlsZGVyID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblVzZXInLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtNCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0FkbWluUHJvamVjdCcsXG4gICAgICAgICAgICAgIHdyYXBwZXJDbGFzczogJy53LWNvbC53LWNvbC00J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5Db250cmlidXRpb24nLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ1BheW1lbnRTdGF0dXMnLFxuICAgICAgICAgICAgICB3cmFwcGVyQ2xhc3M6ICcudy1jb2wudy1jb2wtMidcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGl0ZW1BY3Rpb25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pbklucHV0QWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAndXNlcl9pZCcsXG4gICAgICAgICAgICAgICAgdXBkYXRlS2V5OiAnaWQnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ1RyYW5zZmVyaXInLFxuICAgICAgICAgICAgICAgIGlubmVyTGFiZWw6ICdJZCBkbyBub3ZvIGFwb2lhZG9yOicsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1RyYW5zZmVyaXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnZXg6IDEyOTkwOCcsXG4gICAgICAgICAgICAgICAgbW9kZWw6IGMubW9kZWxzLmNvbnRyaWJ1dGlvbkRldGFpbFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdBZG1pblJhZGlvQWN0aW9uJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGdldEtleTogJ3Byb2plY3RfaWQnLFxuICAgICAgICAgICAgICAgIHVwZGF0ZUtleTogJ2NvbnRyaWJ1dGlvbl9pZCcsXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdyZXdhcmRfaWQnLFxuICAgICAgICAgICAgICAgIHJhZGlvczogJ3Jld2FyZHMnLFxuICAgICAgICAgICAgICAgIGNhbGxUb0FjdGlvbjogJ0FsdGVyYXIgUmVjb21wZW5zYScsXG4gICAgICAgICAgICAgICAgb3V0ZXJMYWJlbDogJ1JlY29tcGVuc2EnLFxuICAgICAgICAgICAgICAgIGdldE1vZGVsOiBjLm1vZGVscy5wcm9qZWN0RGV0YWlsLFxuICAgICAgICAgICAgICAgIHVwZGF0ZU1vZGVsOiBjLm1vZGVscy5jb250cmlidXRpb25EZXRhaWxcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgY29tcG9uZW50OiAnQWRtaW5JbnB1dEFjdGlvbicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ3N0YXRlJyxcbiAgICAgICAgICAgICAgICB1cGRhdGVLZXk6ICdpZCcsXG4gICAgICAgICAgICAgICAgY2FsbFRvQWN0aW9uOiAnQXBhZ2FyJyxcbiAgICAgICAgICAgICAgICBpbm5lckxhYmVsOiAnVGVtIGNlcnRlemEgcXVlIGRlc2VqYSBhcGFnYXIgZXNzZSBhcG9pbz8nLFxuICAgICAgICAgICAgICAgIG91dGVyTGFiZWw6ICdBcGFnYXIgQXBvaW8nLFxuICAgICAgICAgICAgICAgIGZvcmNlVmFsdWU6ICdkZWxldGVkJyxcbiAgICAgICAgICAgICAgICBtb2RlbDogYy5tb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIGZpbHRlckJ1aWxkZXIgPSBbXG4gICAgICAgICAgICB7IC8vZnVsbF90ZXh0X2luZGV4XG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlck1haW4nLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgdm06IGZpbHRlclZNLmZ1bGxfdGV4dF9pbmRleCxcbiAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0J1c3F1ZSBwb3IgcHJvamV0bywgZW1haWwsIElkcyBkbyB1c3XDoXJpbyBlIGRvIGFwb2lvLi4uJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeyAvL3N0YXRlXG4gICAgICAgICAgICAgIGNvbXBvbmVudDogJ0ZpbHRlckRyb3Bkb3duJyxcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIGxhYmVsOiAnQ29tIG8gZXN0YWRvJyxcbiAgICAgICAgICAgICAgICBuYW1lOiAnc3RhdGUnLFxuICAgICAgICAgICAgICAgIHZtOiBmaWx0ZXJWTS5zdGF0ZSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGFpZCcsIG9wdGlvbjogJ3BhaWQnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ3JlZnVzZWQnLCBvcHRpb246ICdyZWZ1c2VkJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdwZW5kaW5nJywgb3B0aW9uOiAncGVuZGluZyd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncGVuZGluZ19yZWZ1bmQnLCBvcHRpb246ICdwZW5kaW5nX3JlZnVuZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAncmVmdW5kZWQnLCBvcHRpb246ICdyZWZ1bmRlZCd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnY2hhcmdlYmFjaycsIG9wdGlvbjogJ2NoYXJnZWJhY2snfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ2RlbGV0ZWQnLCBvcHRpb246ICdkZWxldGVkJ31cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vZ2F0ZXdheVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEcm9wZG93bicsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ2dhdGV3YXknLFxuICAgICAgICAgICAgICAgIG5hbWU6ICdnYXRld2F5JyxcbiAgICAgICAgICAgICAgICB2bTogZmlsdGVyVk0uZ2F0ZXdheSxcbiAgICAgICAgICAgICAgICBvcHRpb25zOiBbXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICcnLCBvcHRpb246ICdRdWFscXVlciB1bSd9LFxuICAgICAgICAgICAgICAgICAge3ZhbHVlOiAnUGFnYXJtZScsIG9wdGlvbjogJ1BhZ2FybWUnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ01vSVAnLCBvcHRpb246ICdNb0lQJ30sXG4gICAgICAgICAgICAgICAgICB7dmFsdWU6ICdQYXlQYWwnLCBvcHRpb246ICdQYXlQYWwnfSxcbiAgICAgICAgICAgICAgICAgIHt2YWx1ZTogJ0NyZWRpdHMnLCBvcHRpb246ICdDcsOpZGl0b3MnfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHsgLy92YWx1ZVxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJOdW1iZXJSYW5nZScsXG4gICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICBsYWJlbDogJ1ZhbG9yZXMgZW50cmUnLFxuICAgICAgICAgICAgICAgIGZpcnN0OiBmaWx0ZXJWTS52YWx1ZS5ndGUsXG4gICAgICAgICAgICAgICAgbGFzdDogZmlsdGVyVk0udmFsdWUubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7IC8vY3JlYXRlZF9hdFxuICAgICAgICAgICAgICBjb21wb25lbnQ6ICdGaWx0ZXJEYXRlUmFuZ2UnLFxuICAgICAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICAgICAgbGFiZWw6ICdQZXLDrW9kbyBkbyBhcG9pbycsXG4gICAgICAgICAgICAgICAgZmlyc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQuZ3RlLFxuICAgICAgICAgICAgICAgIGxhc3Q6IGZpbHRlclZNLmNyZWF0ZWRfYXQubHRlXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdLFxuICAgICAgICAgIHN1Ym1pdCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsaXN0Vk0uZmlyc3RQYWdlKGZpbHRlclZNLnBhcmFtZXRlcnMoKSkudGhlbihudWxsLCBmdW5jdGlvbihzZXJ2ZXJFcnJvcil7XG4gICAgICAgICAgICAgIGVycm9yKHNlcnZlckVycm9yLm1lc3NhZ2UpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZmlsdGVyVk06IGZpbHRlclZNLFxuICAgICAgICBmaWx0ZXJCdWlsZGVyOiBmaWx0ZXJCdWlsZGVyLFxuICAgICAgICBpdGVtQWN0aW9uczogaXRlbUFjdGlvbnMsXG4gICAgICAgIGl0ZW1CdWlsZGVyOiBpdGVtQnVpbGRlcixcbiAgICAgICAgbGlzdFZNOiB7bGlzdDogbGlzdFZNLCBlcnJvcjogZXJyb3J9LFxuICAgICAgICBzdWJtaXQ6IHN1Ym1pdFxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgICByZXR1cm4gW1xuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluRmlsdGVyLHtmb3JtOiBjdHJsLmZpbHRlclZNLmZvcm1EZXNjcmliZXIsIGZpbHRlckJ1aWxkZXI6IGN0cmwuZmlsdGVyQnVpbGRlciwgc3VibWl0OiBjdHJsLnN1Ym1pdH0pLFxuICAgICAgICBtLmNvbXBvbmVudChjLkFkbWluTGlzdCwge3ZtOiBjdHJsLmxpc3RWTSwgaXRlbUJ1aWxkZXI6IGN0cmwuaXRlbUJ1aWxkZXIsIGl0ZW1BY3Rpb25zOiBjdHJsLml0ZW1BY3Rpb25zfSlcbiAgICAgIF07XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMsIHdpbmRvdy5jLmgpKTtcbiIsIndpbmRvdy5jLmNvbnRyaWJ1dGlvbi5Qcm9qZWN0c0V4cGxvcmUgPSAoKG0sIGMpID0+IHtcbiAgcmV0dXJuIHtcblxuICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgIGxldCB2bSA9IHtcbiAgICAgICAgY2F0ZWdvcnlDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICBwcm9qZWN0Q29sbGVjdGlvbjogbS5wcm9wKFtdKSxcbiAgICAgICAgY2F0ZWdvcnlOYW1lOiBtLnByb3AoKSxcbiAgICAgICAgY2F0ZWdvcnlGb2xsb3dlcnM6IG0ucHJvcCgpLFxuXG4gICAgICAgIGxvYWRDYXRlZ29yeTogKGNhdGVnb3J5KSA9PiB7XG4gICAgICAgICAgbGV0IGJ5Q2F0ZWdvcnlJZCA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7Y2F0ZWdvcnlfaWQ6ICdlcSd9KTtcbiAgICAgICAgICB2bS5jYXRlZ29yeU5hbWUoY2F0ZWdvcnkubmFtZV9wdCk7XG4gICAgICAgICAgdm0uY2F0ZWdvcnlGb2xsb3dlcnMoY2F0ZWdvcnkuZm9sbG93ZXJzKTtcbiAgICAgICAgICBieUNhdGVnb3J5SWQuY2F0ZWdvcnlfaWQoY2F0ZWdvcnkuaWQpO1xuICAgICAgICAgIHByb2plY3QuZ2V0UGFnZShieUNhdGVnb3J5SWQucGFyYW1ldGVycygpKS50aGVuKHZtLnByb2plY3RDb2xsZWN0aW9uKTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2FkUHJvamVjdHM6IChmaWx0ZXIpID0+IHtcbiAgICAgICAgICB2bS5jYXRlZ29yeU5hbWUoZmlsdGVyLnRpdGxlKTtcbiAgICAgICAgICB2bS5jYXRlZ29yeUZvbGxvd2VycyhudWxsKTtcbiAgICAgICAgICBwcm9qZWN0LmdldFBhZ2UoZmlsdGVyLmZpbHRlci5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ucHJvamVjdENvbGxlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9LFxuXG4gICAgICBwcm9qZWN0ID0gYy5tb2RlbHMucHJvamVjdCxcbiAgICAgIGNhdGVnb3J5ID0gYy5tb2RlbHMuY2F0ZWdvcnksXG4gICAgICBjYXRlZ29yaWVzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHt9KSxcblxuXG4gICAgICBleHBpcmluZyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7ZXhwaXJlc19hdDogJ2x0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNlbnRzID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtvbmxpbmVfZGF0ZTogJ2d0ZScsIHN0YXRlOiAnZXEnfSksXG4gICAgICByZWNvbW1lbmRlZCA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7cmVjb21tZW5kZWQ6ICdlcScsIHN0YXRlOiAnZXEnfSksXG4gICAgICBvbmxpbmUgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3N0YXRlOiAnZXEnfSksXG4gICAgICBzdWNjZXNzZnVsID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtzdGF0ZTogJ2VxJ30pO1xuXG4gICAgICBleHBpcmluZy5leHBpcmVzX2F0KG1vbWVudCgpLmFkZCgxNCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICAgICByZWNlbnRzLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgcmVjZW50cy5zdGF0ZSgnb25saW5lJyk7XG4gICAgICBleHBpcmluZy5zdGF0ZSgnb25saW5lJyk7XG4gICAgICBvbmxpbmUuc3RhdGUoJ29ubGluZScpO1xuICAgICAgc3VjY2Vzc2Z1bC5zdGF0ZSgnc3VjY2Vzc2Z1bCcpO1xuICAgICAgcmVjb21tZW5kZWQucmVjb21tZW5kZWQoJ3RydWUnKS5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHByb2plY3QucGFnZVNpemUoOSk7XG4gICAgICBjYXRlZ29yeS5nZXRQYWdlKGNhdGVnb3JpZXMucGFyYW1ldGVycygpKS50aGVuKHZtLmNhdGVnb3J5Q29sbGVjdGlvbik7XG5cbiAgICAgIGxldCBmaWx0ZXJzID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNvbWVuZGFkb3MnLFxuICAgICAgICAgIGZpbHRlcjogcmVjb21tZW5kZWRcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnTm8gYXInLFxuICAgICAgICAgIGZpbHRlcjogb25saW5lXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JldGEgZmluYWwnLFxuICAgICAgICAgIGZpbHRlcjogZXhwaXJpbmdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnQmVtLXN1Y2VkaWRvcycsXG4gICAgICAgICAgZmlsdGVyOiBzdWNjZXNzZnVsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0aXRsZTogJ1JlY2VudGVzJyxcbiAgICAgICAgICBmaWx0ZXI6IHJlY2VudHNcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnUHLDs3hpbW9zIGEgbWltJyxcbiAgICAgICAgICBmaWx0ZXI6IHN1Y2Nlc3NmdWxcbiAgICAgICAgfVxuICAgICAgXTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2F0ZWdvcmllczogdm0uY2F0ZWdvcnlDb2xsZWN0aW9uLFxuICAgICAgICBwcm9qZWN0czogdm0ucHJvamVjdENvbGxlY3Rpb24sXG4gICAgICAgIGNhdGVnb3J5TmFtZTogdm0uY2F0ZWdvcnlOYW1lLFxuICAgICAgICBjYXRlZ29yeUZvbGxvd2Vyczogdm0uY2F0ZWdvcnlGb2xsb3dlcnMsXG4gICAgICAgIGZpbHRlcnM6IGZpbHRlcnMsXG4gICAgICAgIHZtOiB2bVxuICAgICAgfTtcbiAgICB9LFxuXG4gICAgdmlldzogKGN0cmwpID0+IHtcbiAgICAgIHJldHVybiBbXG5cbiAgICAgIG0oXCIudy1zZWN0aW9uLmhlcm8tc2VhcmNoXCIsIFtcblxuXG4gICAgICBtKFwiLnctY29udGFpbmVyLnUtbWFyZ2luYm90dG9tLTEwXCIsIFtcbiAgICAgICAgbShcIi53LXJvdy53LWhpZGRlbi1tYWluLnctaGlkZGVuLW1lZGl1bVwiLCBbXG4gICAgICAgICAgbShcIi53LWNvbC53LWNvbC0xMVwiLCBbXG4gICAgICAgICAgICBtKFwiLmhlYWRlci1zZWFyY2hcIiwgW1xuICAgICAgICAgICAgICBtKFwiLnctcm93XCIsIFtcbiAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTEwLnctY29sLXNtYWxsLTEwLnctY29sLXRpbnktMTBcIiwgW1xuICAgICAgICAgICAgICAgICAgbShcIi53LWZvcm1cIiwgW1xuICAgICAgICAgICAgICAgICAgICBtKFwiZm9ybVtkYXRhLW5hbWU9J0VtYWlsIEZvcm0nXVtpZD0nZW1haWwtZm9ybSddW25hbWU9J2VtYWlsLWZvcm0nXVwiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbShcImlucHV0LnctaW5wdXQudGV4dC1maWVsZC5wcmVmaXgubmVnYXRpdmVbZGF0YS1uYW1lPSdmb3JtLXNlYXJjaCddW2lkPSdmb3JtLXNlYXJjaCddW25hbWU9J2Zvcm0tc2VhcmNoJ11bcGxhY2Vob2xkZXI9J0J1c3F1ZSBwcm9qZXRvcyddW3R5cGU9J3RleHQnXVwiKVxuICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICBtKFwiLnNlYXJjaC1wcmUtcmVzdWx0XCIsIFtcbiAgICAgICAgICAgICAgICAgICAgbShcIi53LXJvdy51LW1hcmdpbmJvdHRvbS0xMFwiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC0zLnctaGlkZGVuLXNtYWxsLnctaGlkZGVuLXRpbnlcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbShcImltZy50aHVtYi5zbWFsbC51LXJhZGl1c1tzcmM9Jy4uL2ltYWdlcy9wcm9qZWN0X3RodW1iX29wZW4tdXJpMjAxNDEyMTAtMi1mYzlsdmMuanBlZyddXCIpXG4gICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC05XCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXIudS1tYXJnaW5ib3R0b20tMTBcIiwgXCJVbSB0w610dWxvIGRlIHByb2pldG8gYXF1aVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIubWV0ZXIuc21hbGxcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLm1ldGVyLWZpbGxcIilcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbShcIi53LXJvd1wiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbC5mb250d2VpZ2h0LXNlbWlib2xkLmxpbmVoZWlnaHQtdGlnaHRlc3RcIiwgXCIzNSVcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtNi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNi51LXRleHQtY2VudGVyLXNtYWxsLW9ubHlcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdFwiLCBcIjI3IGRpYXNcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5mb250c2l6ZS1zbWFsbGVzdC5saW5laGVpZ2h0LXRpZ2h0ZXN0XCIsIFwiUmVzdGFudGVzXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKFwiLmRpdmlkZXIudS1tYXJnaW5ib3R0b20tMTBcIiksXG4gICAgICAgICAgICAgICAgICAgIG0oXCIudy1yb3cudS1tYXJnaW5ib3R0b20tMTBcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtMy53LWhpZGRlbi1zbWFsbC53LWhpZGRlbi10aW55XCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oXCJpbWcudGh1bWIuc21hbGwudS1yYWRpdXNbc3JjPScuLi9pbWFnZXMvcHJvamVjdF90aHVtYl9vcGVuLXVyaTIwMTQxMjEwLTItZmM5bHZjLmpwZWcnXVwiKVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1jb2wudy1jb2wtOVwiLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0LmZvbnR3ZWlnaHQtc2VtaWJvbGQubGluZWhlaWdodC10aWdodGVyLnUtbWFyZ2luYm90dG9tLTEwXCIsIFwiVW0gdMOtdHVsbyBkZSBwcm9qZXRvIGFxdWlcIiksXG4gICAgICAgICAgICAgICAgICAgICAgICBtKFwiLm1ldGVyLnNtYWxsXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbShcIi5tZXRlci1maWxsXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIudy1yb3dcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTZcIiwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGwuZm9udHdlaWdodC1zZW1pYm9sZC5saW5laGVpZ2h0LXRpZ2h0ZXN0XCIsIFwiMzUlXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTYudy1jb2wtc21hbGwtNi53LWNvbC10aW55LTYudS10ZXh0LWNlbnRlci1zbWFsbC1vbmx5XCIsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtKFwiLmZvbnRzaXplLXNtYWxsZXN0LmxpbmVoZWlnaHQtdGlnaHRlc3RcIiwgXCIyNyBkaWFzXCIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0oXCIuZm9udHNpemUtc21hbGxlc3QubGluZWhlaWdodC10aWdodGVzdFwiLCBcIlJlc3RhbnRlc1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbShcIi5kaXZpZGVyLnUtbWFyZ2luYm90dG9tLTEwXCIpLFxuICAgICAgICAgICAgICAgICAgICBtKFwiYS5idG4uYnRuLXNtYWxsLmJ0bi10ZXJjaWFyeVtocmVmPScjJ11cIiwgXCJ2ZXIgdG9kb3NcIilcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC0yLnctY29sLXNtYWxsLTIudy1jb2wtdGlueS0yXCIsIFtcbiAgICAgICAgICAgICAgICAgIG0oXCJhLnctaW5saW5lLWJsb2NrLmJ0bi5idG4tYXR0YWNoZWQucG9zdGZpeC5idG4tZGFya1tocmVmPScjJ11cIiwgW1xuICAgICAgICAgICAgICAgICAgICBtKFwiaW1nLmhlYWRlci1sdXBhW3NyYz0nLi4vaW1hZ2VzL2x1cGEucG5nJ11cIilcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbShcIi53LWNvbC53LWNvbC0xXCIpXG4gICAgICAgIF0pXG4gICAgICBdKSxcbiAgICAgIG0oXCIudy1jb250YWluZXIudS1tYXJnaW5ib3R0b20tMTBcIiwgW1xuICAgICAgICBtKFwiLnUtdGV4dC1jZW50ZXIudS1tYXJnaW5ib3R0b20tNDBcIiwgW1xuICAgICAgICAgIG0oXCJhLmxpbmstaGlkZGVuLXdoaXRlLmZvbnR3ZWlnaHQtbGlnaHQuZm9udHNpemUtbGFyZ2VyW2hyZWY9JyMnXVwiLCBbXCJFeHBsb3JlIHByb2pldG9zIGluY3LDrXZlaXMgXCIsbShcInNwYW4uZmEuZmEtYW5nbGUtZG93blwiLCBcIlwiKV0pXG4gICAgICAgIF0pLFxuXG5cbiAgICAgICAgbShcIi53LXJvd1wiLCBbXG4gICAgICAgICAgXy5tYXAoY3RybC5jYXRlZ29yaWVzKCksIChjYXRlZ29yeSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oXCIudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgIG0oYGEudy1pbmxpbmUtYmxvY2suYnRuLWNhdGVnb3J5JHtjYXRlZ29yeS5uYW1lX3B0Lmxlbmd0aCA+IDEzID8gJy5kb3VibGUtbGluZScgOiAnJ31baHJlZj0nI2J5X2NhdGVnb3J5X2lkLyMke2NhdGVnb3J5LmlkfSddYCxcbiAgICAgICAgICAgICAgICB7b25jbGljazogY3RybC52bS5sb2FkQ2F0ZWdvcnkuYmluZChjdHJsLCBjYXRlZ29yeSl9LCBbXG4gICAgICAgICAgICAgICAgbShcImRpdlwiLCBbXG4gICAgICAgICAgICAgICAgICBjYXRlZ29yeS5uYW1lX3B0LFxuICAgICAgICAgICAgICAgICAgbShcInNwYW4uYmFkZ2UuZXhwbG9yZVwiLCBjYXRlZ29yeS5vbmxpbmVfcHJvamVjdHMpXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgIH0pXG4gICAgICAgIF0pLFxuXG4gICAgICAgIG0oXCIudy1yb3cudS1tYXJnaW5ib3R0b20tMzBcIiwgW1xuICAgICAgICAgIF8ubWFwKGN0cmwuZmlsdGVycywgKGZpbHRlcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG0oXCIudy1jb2wudy1jb2wtMi53LWNvbC1zbWFsbC02LnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgIG0oXCJhLnctaW5saW5lLWJsb2NrLmJ0bi1jYXRlZ29yeS5maWx0ZXJzW2hyZWY9JyNyZWNvbW1lbmRlZCddXCIsIHtvbmNsaWNrOiBjdHJsLnZtLmxvYWRQcm9qZWN0cy5iaW5kKGN0cmwsIGZpbHRlcil9LCBbXG4gICAgICAgICAgICAgICAgbShcImRpdlwiLCBbXG4gICAgICAgICAgICAgICAgICBmaWx0ZXIudGl0bGVcbiAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSlcblxuICAgICAgICBdKVxuICAgICAgXSlcbiAgICBdKSxcblxuICAgIG0oXCIudy1zZWN0aW9uXCIsIFtcbiAgICAgIG0oXCIudy1jb250YWluZXJcIiwgW1xuICAgICAgICBtKFwiLnctcm93XCIsIFtcbiAgICAgICAgICBtKFwiLnctY29sLnctY29sLTYudy1jb2wtdGlueS02XCIsIFtcbiAgICAgICAgICAgIG0oXCIuZm9udHNpemUtbGFyZ2VyXCIsIGN0cmwuY2F0ZWdvcnlOYW1lKCkpXG4gICAgICAgICAgXSksXG5cbiAgICAgICAgICBtKFwiLnctY29sLnctY29sLTYudy1jb2wtdGlueS02XCIsIFtcbiAgICAgICAgICAgIG0oXCIudy1yb3dcIiwgW1xuICAgICAgICAgICAgICBtKFwiLnctY29sLnctY29sLTkudy1jb2wtdGlueS02LnctY2xlYXJmaXhcIiwgW1xuICAgICAgICAgICAgICAgIG0oXCIuZm9sbG93aW5nLmZvbnRzaXplLXNtYWxsLmZvbnRjb2xvci1zZWNvbmRhcnkudS1yaWdodFwiLCBgJHtjdHJsLmNhdGVnb3J5Rm9sbG93ZXJzKCl9IHNlZ3VpZG9yZXNgKVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbShcIi53LWNvbC53LWNvbC0zLnctY29sLXRpbnktNlwiLCBbXG4gICAgICAgICAgICAgICAgbShcImEuYnRuLmJ0bi1zbWFsbFtocmVmPScjJ11cIiwgXCJTZWd1aW5kb8KgXCIpXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG5cbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXSksXG5cbiAgICBtKFwiLnctc2VjdGlvbi5zZWN0aW9uXCIsIFtcbiAgICAgIG0oXCIudy1jb250YWluZXJcIiwgW1xuICAgICAgICBtKFwiLnctcm93XCIsIFtcbiAgICAgICAgICBtKCcudy1yb3cnLCBfLm1hcChjdHJsLnByb2plY3RzKCksIChwcm9qZWN0KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbS5jb21wb25lbnQoYy5Qcm9qZWN0Q2FyZCwge3Byb2plY3Q6IHByb2plY3R9KTtcbiAgICAgICAgICB9KSlcbiAgICAgICAgXSlcbiAgICAgIF0pXG4gICAgXSksXG5cbiAgICBtKFwiLnctc2VjdGlvbi5zZWN0aW9uLmxvYWRtb3JlXCIsIFtcbiAgICAgIG0oXCIudy1jb250YWluZXJcIiwgW1xuICAgICAgICBtKFwiLnctcm93XCIsIFtcbiAgICAgICAgICBtKFwiLnctY29sLnctY29sLTVcIiksXG4gICAgICAgICAgbShcIi53LWNvbC53LWNvbC0yXCIsIFtcbiAgICAgICAgICAgIG0oXCJhLmJ0bi5idG4tbWVkaXVtLmJ0bi10ZXJjaWFyeVtocmVmPScjJ11cIiwgXCJDYXJyZWdhciBtYWlzXCIpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbShcIi53LWNvbC53LWNvbC01XCIpXG4gICAgICAgIF0pXG4gICAgICBdKVxuICAgIF0pXTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYykpO1xuIiwid2luZG93LmMuY29udHJpYnV0aW9uLlByb2plY3RzSG9tZSA9ICgobSwgYykgPT4ge1xuICByZXR1cm4ge1xuICAgIGNvbnRyb2xsZXI6ICgpID0+IHtcbiAgICAgIGxldCB2bSA9IHtcbiAgICAgICAgcmVjb21tZW5kZWRDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICByZWNlbnRDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICBuZWFyTWVDb2xsZWN0aW9uOiBtLnByb3AoW10pLFxuICAgICAgICBleHBpcmluZ0NvbGxlY3Rpb246IG0ucHJvcChbXSlcbiAgICAgIH0sXG4gICAgICBwcm9qZWN0ID0gYy5tb2RlbHMucHJvamVjdCxcblxuICAgICAgZXhwaXJpbmcgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe2V4cGlyZXNfYXQ6ICdsdGUnLCBzdGF0ZTogJ2VxJ30pLFxuICAgICAgbmVhck1lID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtuZWFyX21lOiAnZXEnLCBzdGF0ZTogJ2VxJ30pLFxuICAgICAgcmVjZW50cyA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7b25saW5lX2RhdGU6ICdndGUnLCBzdGF0ZTogJ2VxJ30pLFxuICAgICAgcmVjb21tZW5kZWQgPSBtLnBvc3RncmVzdC5maWx0ZXJzVk0oe3JlY29tbWVuZGVkOiAnZXEnLCBzdGF0ZTogJ2VxJ30pO1xuXG4gICAgICBleHBpcmluZy5leHBpcmVzX2F0KG1vbWVudCgpLmFkZCgxNCwgJ2RheXMnKS5mb3JtYXQoJ1lZWVktTU0tREQnKSk7XG4gICAgICBleHBpcmluZy5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIG5lYXJNZS5uZWFyX21lKCd0cnVlJykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICByZWNlbnRzLm9ubGluZV9kYXRlKG1vbWVudCgpLnN1YnRyYWN0KDUsICdkYXlzJykuZm9ybWF0KCdZWVlZLU1NLUREJykpO1xuICAgICAgcmVjZW50cy5zdGF0ZSgnb25saW5lJyk7XG5cbiAgICAgIHJlY29tbWVuZGVkLnJlY29tbWVuZGVkKCd0cnVlJykuc3RhdGUoJ29ubGluZScpO1xuXG4gICAgICBwcm9qZWN0LmdldFBhZ2VXaXRoVG9rZW4obmVhck1lLnBhcmFtZXRlcnMoKSkudGhlbih2bS5uZWFyTWVDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShyZWNvbW1lbmRlZC5wYXJhbWV0ZXJzKCkpLnRoZW4odm0ucmVjb21tZW5kZWRDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShyZWNlbnRzLnBhcmFtZXRlcnMoKSkudGhlbih2bS5yZWNlbnRDb2xsZWN0aW9uKTtcbiAgICAgIHByb2plY3QuZ2V0UGFnZShleHBpcmluZy5wYXJhbWV0ZXJzKCkpLnRoZW4odm0uZXhwaXJpbmdDb2xsZWN0aW9uKTtcblxuICAgICAgbGV0IGNvbGxlY3Rpb25zID0gW1xuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdQcsOzeGltb3MgYSB2b2PDqicsXG4gICAgICAgICAgaGFzaDogJ25lYXJfb2YnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLm5lYXJNZUNvbGxlY3Rpb25cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRpdGxlOiAnUmVjb21lbmRhZG9zJyxcbiAgICAgICAgICBoYXNoOiAncmVjb21tZW5kZWQnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLnJlY29tbWVuZGVkQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdOYSByZXRhIGZpbmFsJyxcbiAgICAgICAgICBoYXNoOiAnZXhwaXJpbmcnLFxuICAgICAgICAgIGNvbGxlY3Rpb246IHZtLmV4cGlyaW5nQ29sbGVjdGlvblxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGl0bGU6ICdSZWNlbnRlcycsXG4gICAgICAgICAgaGFzaDogJ3JlY2VudCcsXG4gICAgICAgICAgY29sbGVjdGlvbjogdm0ucmVjZW50Q29sbGVjdGlvblxuICAgICAgICB9XG4gICAgICBdO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBjb2xsZWN0aW9uczogY29sbGVjdGlvbnNcbiAgICAgIH07XG4gICAgfSxcblxuICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICByZXR1cm4gXy5tYXAoY3RybC5jb2xsZWN0aW9ucywgKGNvbGxlY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIG0uY29tcG9uZW50KGMuUHJvamVjdFJvdywge2NvbGxlY3Rpb246IGNvbGxlY3Rpb24sIHJlZjogYGhvbWVfJHtjb2xsZWN0aW9uLmhhc2h9YH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufSh3aW5kb3cubSwgd2luZG93LmMpKTtcbiIsIndpbmRvdy5jLnBhZ2VzLkxpdmVTdGF0aXN0aWNzID0gKChtLCBtb2RlbHMsIGgsIF8sIEpTT04pID0+IHtcbiAgcmV0dXJuIHtcbiAgICBjb250cm9sbGVyOiAoYXJncyA9IHt9KSA9PiB7XG4gICAgICBsZXQgcGFnZVN0YXRpc3RpY3MgPSBtLnByb3AoW10pLFxuICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEgPSBtLnByb3Aoe30pO1xuXG4gICAgICBtb2RlbHMuc3RhdGlzdGljLmdldFJvdygpLnRoZW4ocGFnZVN0YXRpc3RpY3MpO1xuICAgICAgLy8gYXJncy5zb2NrZXQgaXMgYSBzb2NrZXQgcHJvdmlkZWQgYnkgc29ja2V0LmlvXG4gICAgICAvLyBjYW4gc2VlIHRoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlL2NhdGFyc2UtbGl2ZS9ibG9iL21hc3Rlci9wdWJsaWMvaW5kZXguanMjTDhcbiAgICAgIGlmIChhcmdzLnNvY2tldCAmJiBfLmlzRnVuY3Rpb24oYXJncy5zb2NrZXQub24pKSB7XG4gICAgICAgIGFyZ3Muc29ja2V0Lm9uKCduZXdfcGFpZF9jb250cmlidXRpb25zJywgKG1zZykgPT4ge1xuICAgICAgICAgIG5vdGlmaWNhdGlvbkRhdGEoSlNPTi5wYXJzZShtc2cucGF5bG9hZCkpO1xuICAgICAgICAgIG1vZGVscy5zdGF0aXN0aWMuZ2V0Um93KCkudGhlbihwYWdlU3RhdGlzdGljcyk7XG4gICAgICAgICAgbS5yZWRyYXcoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBhZ2VTdGF0aXN0aWNzOiBwYWdlU3RhdGlzdGljcyxcbiAgICAgICAgbm90aWZpY2F0aW9uRGF0YTogbm90aWZpY2F0aW9uRGF0YVxuICAgICAgfTtcbiAgICB9LFxuICAgIHZpZXc6IChjdHJsKSA9PiB7XG4gICAgICBsZXQgZGF0YSA9IGN0cmwubm90aWZpY2F0aW9uRGF0YSgpO1xuXG4gICAgICByZXR1cm4gbSgnLnctc2VjdGlvbi5iZy1zdGF0cy5zZWN0aW9uLm1pbi1oZWlnaHQtMTAwJywgW1xuICAgICAgICBtKCcudy1jb250YWluZXIudS10ZXh0LWNlbnRlcicsIF8ubWFwKGN0cmwucGFnZVN0YXRpc3RpY3MoKSwgKHN0YXQpID0+IHtcbiAgICAgICAgICByZXR1cm4gW20oJ2ltZy51LW1hcmdpbmJvdHRvbS02MFtzcmM9XCJodHRwczovL2Rha3MyazNhNGliMnouY2xvdWRmcm9udC5uZXQvNTRiNDQwYjg1NjA4ZTNmNDM4OWRiMzg3LzU1YWRhNWRkMTFiMzZhNTI2MTZkOTdkZl9zeW1ib2wtY2F0YXJzZS5wbmdcIl0nKSxcbiAgICAgICAgICBtKCcuZm9udGNvbG9yLW5lZ2F0aXZlLnUtbWFyZ2luYm90dG9tLTQwJywgW1xuICAgICAgICAgICAgbSgnLmZvbnRzaXplLW1lZ2FqdW1iby5mb250d2VpZ2h0LXNlbWlib2xkJywgJ1IkICcgKyBoLmZvcm1hdE51bWJlcihzdGF0LnRvdGFsX2NvbnRyaWJ1dGVkLCAyLCAzKSksXG4gICAgICAgICAgICBtKCcuZm9udHNpemUtbGFyZ2UnLCAnRG9hZG9zIHBhcmEgcHJvamV0b3MgcHVibGljYWRvcyBwb3IgYXF1aScpXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvbnRjb2xvci1uZWdhdGl2ZS51LW1hcmdpbmJvdHRvbS02MCcsIFtcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1tZWdhanVtYm8uZm9udHdlaWdodC1zZW1pYm9sZCcsIHN0YXQudG90YWxfY29udHJpYnV0b3JzKSxcbiAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZScsICdQZXNzb2FzIGrDoSBhcG9pYXJhbSBwZWxvIG1lbm9zIDEgcHJvamV0byBubyBDYXRhcnNlJylcbiAgICAgICAgICBdKV07XG4gICAgICAgIH0pKSxcbiAgICAgICAgKCFfLmlzRW1wdHkoZGF0YSkgPyBtKCcudy1jb250YWluZXInLCBbXG4gICAgICAgICAgbSgnZGl2JywgW1xuICAgICAgICAgICAgbSgnLmNhcmQudS1yYWRpdXMudS1tYXJnaW5ib3R0b20tNjAubWVkaXVtJywgW1xuICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLnUtcm91bmRbc3JjPVwiJyArIGgudXNlQXZhdGFyT3JEZWZhdWx0KGRhdGEudXNlcl9pbWFnZSkgKyAnXCJdJylcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC04LnctY29sLXNtYWxsLTgnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnLmZvbnRzaXplLWxhcmdlLmxpbmVoZWlnaHQtdGlnaHQnLCBkYXRhLnVzZXJfbmFtZSlcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQudS10ZXh0LWNlbnRlci5mb250c2l6ZS1iYXNlLnUtbWFyZ2ludG9wLTIwJywgW1xuICAgICAgICAgICAgICAgICAgbSgnZGl2JywgJ2FjYWJvdSBkZSBhcG9pYXIgbycpXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTQnLCBbXG4gICAgICAgICAgICAgICAgICBtKCcudy1yb3cnLCBbXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC00LnctY29sLXNtYWxsLTQnLCBbXG4gICAgICAgICAgICAgICAgICAgICAgbSgnaW1nLnRodW1iLXByb2plY3QudS1yYWRpdXNbc3JjPVwiJyArIGRhdGEucHJvamVjdF9pbWFnZSArICdcIl1bd2lkdGg9XCI3NVwiXScpXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtOC53LWNvbC1zbWFsbC04JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy5mb250c2l6ZS1sYXJnZS5saW5laGVpZ2h0LXRpZ2h0JywgZGF0YS5wcm9qZWN0X25hbWUpXG4gICAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICBdKVxuICAgICAgICAgIF0pXG4gICAgICAgIF0pIDogJycpLFxuICAgICAgICBtKCcudS10ZXh0LWNlbnRlci5mb250c2l6ZS1sYXJnZS51LW1hcmdpbmJvdHRvbS0xMC5mb250Y29sb3ItbmVnYXRpdmUnLCBbXG4gICAgICAgICAgbSgnYS5saW5rLWhpZGRlbi5mb250Y29sb3ItbmVnYXRpdmVbaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS9jYXRhcnNlXCJdW3RhcmdldD1cIl9ibGFua1wiXScsIFtcbiAgICAgICAgICAgIG0oJ3NwYW4uZmEuZmEtZ2l0aHViJywgJy4nKSwnIE9wZW4gU291cmNlIGNvbSBvcmd1bGhvISAnXG4gICAgICAgICAgXSlcbiAgICAgICAgXSksXG4gICAgICBdKTtcbiAgICB9XG4gIH07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5jLmgsIHdpbmRvdy5fLCB3aW5kb3cuSlNPTikpO1xuIiwid2luZG93LmMucGFnZXMuVGVhbSA9IChmdW5jdGlvbihtLCBjKXtcbiAgcmV0dXJuIHtcbiAgICB2aWV3OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBtKCcjc3RhdGljLXRlYW0tYXBwJyxbXG4gICAgICAgIG0uY29tcG9uZW50KGMuVGVhbVRvdGFsKSxcbiAgICAgICAgbS5jb21wb25lbnQoYy5UZWFtTWVtYmVycylcbiAgICAgIF0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jKSk7XG4iLCJ3aW5kb3cuYy5wcm9qZWN0Lkluc2lnaHRzID0gKGZ1bmN0aW9uKG0sIGMsIG1vZGVscywgXyl7XG4gIHJldHVybiB7XG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24oYXJncykge1xuICAgICAgdmFyIHZtID0gbS5wb3N0Z3Jlc3QuZmlsdGVyc1ZNKHtwcm9qZWN0X2lkOiAnZXEnfSksXG4gICAgICAgICAgcHJvamVjdERldGFpbHMgPSBtLnByb3AoW10pLFxuICAgICAgICAgIGNvbnRyaWJ1dGlvbnNQZXJEYXkgPSBtLnByb3AoW10pO1xuXG4gICAgICB2bS5wcm9qZWN0X2lkKGFyZ3Mucm9vdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaWQnKSk7XG5cbiAgICAgIG1vZGVscy5wcm9qZWN0RGV0YWlsLmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4ocHJvamVjdERldGFpbHMpO1xuICAgICAgbW9kZWxzLnByb2plY3RDb250cmlidXRpb25zUGVyRGF5LmdldFJvdyh2bS5wYXJhbWV0ZXJzKCkpLnRoZW4oY29udHJpYnV0aW9uc1BlckRheSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZtOiB2bSxcbiAgICAgICAgcHJvamVjdERldGFpbHM6IHByb2plY3REZXRhaWxzLFxuICAgICAgICBjb250cmlidXRpb25zUGVyRGF5OiBjb250cmlidXRpb25zUGVyRGF5XG4gICAgICB9O1xuICAgIH0sXG4gICAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgICAgcmV0dXJuIF8ubWFwKGN0cmwucHJvamVjdERldGFpbHMoKSwgZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgIHJldHVybiBtKCcucHJvamVjdC1pbnNpZ2h0cycsW1xuICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgIG0oJy53LXJvdy51LW1hcmdpbmJvdHRvbS00MCcsIFtcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTguZGFzaGJvYXJkLWhlYWRlci51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgIG0oJy5mb250d2VpZ2h0LXNlbWlib2xkLmZvbnRzaXplLWxhcmdlci5saW5laGVpZ2h0LWxvb3Nlci51LW1hcmdpbmJvdHRvbS0xMCcsICdNaW5oYSBjYW1wYW5oYScpLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0NhcmQsIHtyZXNvdXJjZTogcHJvamVjdH0pLFxuICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuQWRtaW5Qcm9qZWN0RGV0YWlsc0V4cGxhbmF0aW9uLCB7cmVzb3VyY2U6IHByb2plY3R9KVxuICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgbSgnLnctY29sLnctY29sLTInKVxuICAgICAgICAgICAgXSlcbiAgICAgICAgICBdKSxcbiAgICAgICAgICAoZnVuY3Rpb24ocHJvamVjdCl7XG4gICAgICAgICAgICBpZiAocHJvamVjdC5pc19wdWJsaXNoZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBtKCcuZGl2aWRlcicpLFxuICAgICAgICAgICAgICAgIG0oJy53LXNlY3Rpb24uc2VjdGlvbi1vbmUtY29sdW1uLmJnLWdyYXkuYmVmb3JlLWZvb3RlcicsIFtcbiAgICAgICAgICAgICAgICAgIG0oJy53LWNvbnRhaW5lcicsIFtcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge3N0eWxlOiB7J21pbi1oZWlnaHQnOiAnMzAwcHgnfX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uVG90YWxQZXJEYXksIHtjb2xsZWN0aW9uOiBjdHJsLmNvbnRyaWJ1dGlvbnNQZXJEYXl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywge3N0eWxlOiB7J21pbi1oZWlnaHQnOiAnMzAwcHgnfX0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENoYXJ0Q29udHJpYnV0aW9uQW1vdW50UGVyRGF5LCB7Y29sbGVjdGlvbjogY3RybC5jb250cmlidXRpb25zUGVyRGF5fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIG0oJy53LXJvdycsIFtcbiAgICAgICAgICAgICAgICAgICAgICBtKCcudy1jb2wudy1jb2wtMTIudS10ZXh0LWNlbnRlcicsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIG0uY29tcG9uZW50KGMuUHJvamVjdENvbnRyaWJ1dGlvbnNQZXJMb2NhdGlvblRhYmxlLCB7cmVzb3VyY2VJZDogY3RybC52bS5wcm9qZWN0X2lkKCl9KVxuICAgICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgbSgnLnctcm93JywgW1xuICAgICAgICAgICAgICAgICAgICAgIG0oJy53LWNvbC53LWNvbC0xMi51LXRleHQtY2VudGVyJywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgbS5jb21wb25lbnQoYy5Qcm9qZWN0UmVtaW5kZXJDb3VudCwge3Jlc291cmNlOiBwcm9qZWN0fSlcbiAgICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KHByb2plY3QpKVxuICAgICAgICBdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn0od2luZG93Lm0sIHdpbmRvdy5jLCB3aW5kb3cuYy5tb2RlbHMsIHdpbmRvdy5fKSk7XG4iLCJ3aW5kb3cuYy5hZG1pbi5jb250cmlidXRpb25GaWx0ZXJWTSA9IChmdW5jdGlvbihtLCBoLCByZXBsYWNlRGlhY3JpdGljcyl7XG4gIHZhciB2bSA9IG0ucG9zdGdyZXN0LmZpbHRlcnNWTSh7XG4gICAgZnVsbF90ZXh0X2luZGV4OiAnQEAnLFxuICAgIHN0YXRlOiAnZXEnLFxuICAgIGdhdGV3YXk6ICdlcScsXG4gICAgdmFsdWU6ICdiZXR3ZWVuJyxcbiAgICBjcmVhdGVkX2F0OiAnYmV0d2VlbidcbiAgfSksXG5cbiAgcGFyYW1Ub1N0cmluZyA9IGZ1bmN0aW9uKHApe1xuICAgIHJldHVybiAocCB8fCAnJykudG9TdHJpbmcoKS50cmltKCk7XG4gIH07XG5cbiAgLy8gU2V0IGRlZmF1bHQgdmFsdWVzXG4gIHZtLnN0YXRlKCcnKTtcbiAgdm0uZ2F0ZXdheSgnJyk7XG4gIHZtLm9yZGVyKHtpZDogJ2Rlc2MnfSk7XG5cbiAgdm0uY3JlYXRlZF9hdC5sdGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQubHRlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZW5kT2YoJ2RheScpLmZvcm1hdCgnJyk7XG4gIH07XG5cbiAgdm0uY3JlYXRlZF9hdC5ndGUudG9GaWx0ZXIgPSBmdW5jdGlvbigpe1xuICAgIHZhciBmaWx0ZXIgPSBwYXJhbVRvU3RyaW5nKHZtLmNyZWF0ZWRfYXQuZ3RlKCkpO1xuICAgIHJldHVybiBmaWx0ZXIgJiYgaC5tb21lbnRGcm9tU3RyaW5nKGZpbHRlcikuZm9ybWF0KCk7XG4gIH07XG5cbiAgdm0uZnVsbF90ZXh0X2luZGV4LnRvRmlsdGVyID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgZmlsdGVyID0gcGFyYW1Ub1N0cmluZyh2bS5mdWxsX3RleHRfaW5kZXgoKSk7XG4gICAgcmV0dXJuIGZpbHRlciAmJiByZXBsYWNlRGlhY3JpdGljcyhmaWx0ZXIpIHx8IHVuZGVmaW5lZDtcbiAgfTtcblxuICByZXR1cm4gdm07XG59KHdpbmRvdy5tLCB3aW5kb3cuYy5oLCB3aW5kb3cucmVwbGFjZURpYWNyaXRpY3MpKTtcbiIsIndpbmRvdy5jLmFkbWluLmNvbnRyaWJ1dGlvbkxpc3RWTSA9IChmdW5jdGlvbihtLCBtb2RlbHMpIHtcbiAgcmV0dXJuIG0ucG9zdGdyZXN0LnBhZ2luYXRpb25WTShtb2RlbHMuY29udHJpYnV0aW9uRGV0YWlsLmdldFBhZ2VXaXRoVG9rZW4pO1xufSh3aW5kb3cubSwgd2luZG93LmMubW9kZWxzKSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=