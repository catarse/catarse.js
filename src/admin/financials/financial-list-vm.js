window.c.admin.financialListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.balance, 'amount.desc', {'Prefer': 'count=exact'});
}(window.m, window.c.models));
