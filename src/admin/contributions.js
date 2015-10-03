window.c.admin.Contributions = ((m, c, h) => {
  const admin = c.admin;
  return {
    controller: () => {
      const listVM = admin.contributionListVM,
          filterVM = admin.contributionFilterVM,
          contributionsVM = admin.contributionVM,
          error = m.prop(''),
          submit = () => {
            error(false);
            listVM.firstPage(filterVM.parameters()).then(null, (serverError) => {
              error(serverError.message);
            });
            return false;
          };

      return {
        filterVM: filterVM,
        filterBuilder: contributionsVM.filterBuilder,
        itemActions: contributionsVM.itemActions,
        itemBuilder: contributionsVM.itemBuilder,
        listVM: {list: listVM, error: error},
        submit: submit
      };
    },

    view: (ctrl) => {
      return [
        m.component(c.AdminFilter,{form: ctrl.filterVM.formDescriber, filterBuilder: ctrl.filterBuilder, submit: ctrl.submit}),
        m.component(c.AdminList, {vm: ctrl.listVM, itemBuilder: ctrl.itemBuilder, itemActions: ctrl.itemActions})
      ];
    }
  };
})(window.m, window.c, window.c.h);
