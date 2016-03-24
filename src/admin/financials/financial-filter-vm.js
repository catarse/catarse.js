window.c.admin.financialFilterVM = ((m, replaceDiacritics) => {
    const vm = m.postgrest.filtersVM({
            full_text_index: '@@'
        }),

        paramToString = function(p) {
            return (p || '').toString().trim();
        };

    vm.order({
        created_at: 'desc'
    });

    vm.full_text_index.toFilter = function() {
        const filter = paramToString(vm.full_text_index());
        return filter && replaceDiacritics(filter) || undefined;
    };

    return vm;
}(window.m, window.replaceDiacritics));
