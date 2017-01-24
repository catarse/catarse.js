import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import models from '../models';
import h from '../h';
import projectDashboardMenu from '../c/project-dashboard-menu';
import projectContributionReportHeader from '../c/project-contribution-report-header';
import projectContributionReportContent from '../c/project-contribution-report-content';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';
import FilterMain from '../c/filter-main';
import FilterDropdown from '../c/filter-dropdown';
import InfoProjectContributionStateLegend from '../c/info-project-contribution-state-legend';

const projectContributionReport = {
    controller(args) {
        const listVM = postgrest.paginationVM(models.projectContribution, 'id.desc', {'Prefer': 'count=exact'}),
              filterVM = projectsContributionReportVM,
              project = m.prop([{}]),
              rewards = m.prop([]),
              contributionStateOptions = m.prop([]),
              reloadSelectOptions = (project_state) => {
                  let opts = [{value: '', option: 'All'}];

                  const options_map = {
                      'online': [
                          {value: 'paid', option: 'Confirmed'},
                          {value: 'pending', option: 'Started'},
                          {value: 'refunded,chargeback,deleted,pending_refund', option: 'Contested'},
                      ],
                      'waiting_funds': [
                          {value: 'paid', option: 'Confirmed'},
                          {value: 'pending', option: 'Started'},
                          {value: 'refunded,chargeback,deleted,pending_refund', option: 'Contested'},
                      ],
                      'failed': [
                          {value: 'pending_refund', option: 'Refund in progress'},
                          {value: 'refunded', option: 'Refunded'},
                          {value: 'paid', option: 'Refund not started'},
                      ],
                      'successful': [
                          {value: 'paid', option: 'Confirmed'},
                          {value: 'refunded,chargeback,deleted,pending_refund', option: 'Contested'},
                      ]
                  };

                  opts = opts.concat(options_map[project_state] || []);

                  contributionStateOptions(opts);
              },
              filterBuilder = [
                  {
                      component: FilterMain,
                      data: {
                          inputWrapperClass: '.w-input.text-field',
                          btnClass: '.btn.btn-medium',
                          vm: filterVM.full_text_index,
                          placeholder: 'Search by name or email of the supporter'
                      }
                  }, {
                      label: 'reward_filter',
                      component: FilterDropdown,
                      data: {
                          label: 'Reward',
                          name: 'reward_id',
                          vm: filterVM.reward_id,
                          wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle',
                          options: []
                      }
                  }, {
                      label: 'payment_state',
                      component: FilterDropdown,
                      data: {
                          custom_label: [InfoProjectContributionStateLegend, {
                              text: 'Support Status',
                              project: project
                          }],
                          name: 'state',
                          vm: filterVM.state,
                          wrapper_class: '.w-col.w-col-6.w-col-small-6.w-col-tiny-6.w-sub-col-middle',
                          options: contributionStateOptions
                      }
                  }
              ],
              submit = () => {
                  if (filterVM.reward_id() === 'null') {
                      listVM.firstPage(filterVM.withNullParameters()).then(null);
                  } else {
                      listVM.firstPage(filterVM.parameters()).then(null);
                  }

                  return false;
              };

        filterVM.project_id(args.root.getAttribute('data-id'));

        const lReward = postgrest.loaderWithToken(models.rewardDetail.getPageOptions({project_id: `eq.${filterVM.project_id()}`}));
        const lProject = postgrest.loaderWithToken(models.projectDetail.getPageOptions({project_id: `eq.${filterVM.project_id()}`}));

        lReward.load().then(rewards);
        lProject.load().then((data) => {
            project(data);
            reloadSelectOptions(_.first(data).state);
        });

        const mapRewardsToOptions = () => {
            let options = [];
            if (!lReward()) {
                options = _.map(rewards(), (r) => {
                    return {
                        value: r.id,
                        option: `Rs ${h.formatNumber(r.minimum_value, 2, 3)} - ${r.description.substring(0, 20)}`
                    };
                });
            }

            options.unshift({
                value: null,
                option: 'No reward'
            });

            options.unshift({
                value: '',
                option: 'All'
            });

            return options;
        };

        if (!listVM.collection().length) {
            listVM.firstPage(filterVM.parameters());
        }

        return {
            listVM: listVM,
            filterVM: filterVM,
            filterBuilder: filterBuilder,
            submit: submit,
            lReward: lReward,
            lProject: lProject,
            rewards: rewards,
            project: project,
            mapRewardsToOptions: mapRewardsToOptions
        };
    },
    view(ctrl, args) {
        const list = ctrl.listVM;

        if (!ctrl.lProject()) {
            return [
                m.component(projectDashboardMenu, {project: m.prop(_.first(ctrl.project()))}),
                m.component(projectContributionReportHeader, {
                    submit: ctrl.submit,
                    filterBuilder: ctrl.filterBuilder,
                    form: ctrl.filterVM.formDescriber,
                    mapRewardsToOptions: ctrl.mapRewardsToOptions,
                    filterVM: ctrl.filterVM
                }),
                m('.divider.u-margintop-30'),
                m.component(projectContributionReportContent, {
                    list: list,
                    project: m.prop(_.first(ctrl.project()))
                })
            ];
        } else {
            return h.loader();
        }
    }
};

export default projectContributionReport;
