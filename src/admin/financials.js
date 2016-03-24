window.c.admin.Financials = (function(m, c, h) {
    var admin = c.admin;
    return {
        controller: function() {
            var listVM = admin.financialListVM,
                filterVM = admin.financialFilterVM,
                error = m.prop(''),
                itemBuilder = [{
                    component: 'AdminUser',
                    wrapperClass: '.w-col.w-col-4'
                }],
                filterBuilder = [{ //name
                    component: 'FilterMain',
                    data: {
                        vm: filterVM.full_text_index,
                        placeholder: 'Busque pelo nome do usuário',
                    },
                }],
                submit = function() {
                    listVM.firstPage(filterVM.parameters()).then(null, function(serverError) {
                        error(serverError.message);
                    });
                    return false;
                };

            return {
                filterVM: filterVM,
                filterBuilder: filterBuilder,
                listVM: {
                    list: listVM,
                    error: error
                },
                submit: submit
            };
        },

        view: function(ctrl) {
            const label = 'Saques';

            return [
                m.component(c.AdminFilter, {
                    form: ctrl.filterVM.formDescriber,
                    filterBuilder: ctrl.filterBuilder,
                    label: label,
                    submit: ctrl.submit
                }),
                m.component(c.AdminList, {
                    vm: ctrl.listVM,
                    label: label,
                    listItem: c.AdminFinancialItem,
                    listDetail: c.AdminFinancialDetail
                })
            ];
        }
    };
}(window.m, window.c, window.c.h));
