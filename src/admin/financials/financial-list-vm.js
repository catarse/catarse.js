window.c.admin.financialListVM = (function(m, models) {
    return m.postgrest.paginationVM(models.balance, 'user_id.desc', {'Prefer': 'count=exact'});
}(window.m, window.c.models));
