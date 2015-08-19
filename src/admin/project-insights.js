window.c.admin.ProjectInsights = (function(m, c, models){
  return {
    controller: function(args) {
      var vm = m.postgrest.filtersVM({project_id: 'eq'}),
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
    view: function(ctrl) {
      return m('.project-insights',[
        m('.w-row.u-marginbottom-40', [
          m('.w-col.w-col-2'),
          m('.w-col.w-col-8.dashboard-header.u-text-center', [
            m.component(c.AdminProjectDetailsCard, {collection: ctrl.projectDetails}),
            m.component(c.AdminProjectDetailsExplanation, {collection: ctrl.projectDetails})
          ]),
          m('.w-col.w-col-2')
        ]),
        m('.divider'),
        m('.w-section.section-one-column.bg-gray.before-footer',[
          m('.w-row', [
            m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
              m.component(c.ProjectChartContributionTotalPerDay, {collection: ctrl.contributionsPerDay})
            ]),
          ]),
          m('.w-row', [
            m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
              m.component(c.ProjectChartContributionAmountPerDay, {collection: ctrl.contributionsPerDay})
            ]),
          ]),
          m('.w-row', [
            m('.w-col.w-col-12.dashboard-header.u-text-center', {style: {'min-height': '300px'}}, [
              m.component(c.ProjectReminderCount, {collection: ctrl.projectDetails})
            ]),
          ])
        ])
      ]);
    }
  };
}(window.m, window.c, window.c.models));
