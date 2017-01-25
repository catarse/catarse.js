import m from 'mithril';
import moment from 'moment';
import postgrest from 'mithril-postgrest';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'projects');

const projectFiltersVM = () => {
    const filtersVM = postgrest.filtersVM,
        all = filtersVM({
            state: 'eq'
        }).state('online'),

        nearMe = filtersVM({
            near_me: 'eq',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').near_me(true),

        expiring = filtersVM({
            expires_at: 'lte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').expires_at(moment().add(14, 'days').format('YYYY-MM-DD')),

        recent = filtersVM({
            online_date: 'gte',
            open_for_contributions: 'eq'
        }).open_for_contributions('true').online_date(moment().subtract(5, 'days').format('YYYY-MM-DD')),

        score = filtersVM({
            score: 'gte',
            open_for_contributions: 'eq'
        }).score('1').open_for_contributions('true'),

        online = filtersVM({
            open_for_contributions: 'eq'
        }).open_for_contributions('true'),

        contributed_by_friends = filtersVM({
            open_for_contributions: 'eq',
            contributed_by_friends: 'eq'
        }).open_for_contributions('true').contributed_by_friends(true),

        successful = filtersVM({
            state: 'eq'
        }).state('successful'),

        finished = filtersVM({}),

        filters = {
            all: {
              title: 'All categories',
              filter: all,
              nicename: 'Online',
              isContextual: false,
              keyName: 'all'
          },
            score: {
              title: 'All categories',
              filter: score,
              nicename: I18n.t('home.row_title', I18nScope()),
              isContextual: false,
              keyName: 'score'
          },
            contributed_by_friends: {
              title: 'Friends',
              filter: contributed_by_friends,
              nicename: 'Friends',
              isContextual: false,
              keyName: 'contributed_by_friends'
          },
            online: {
              title: 'Online',
              filter: online,
              isContextual: false,
              keyName: 'online'
          },
            expiring: {
              title: 'Final stretch',
              filter: expiring,
              isContextual: false,
              keyName: 'expiring'
          },
            successful: {
              title: 'All categories',
              filter: successful,
              nicename: 'Financed',
              isContextual: false,
              keyName: 'successful'
          },
            finished: {
              title: 'All categories',
              filter: finished,
              nicename: 'Finalized',
              isContextual: false,
              keyName: 'finished'
          },
            recent: {
              title: 'Recent',
              filter: recent,
              isContextual: false,
              keyName: 'recent'
          },
            near_me: {
              title: 'Next to me',
              filter: nearMe,
              isContextual: false,
              keyName: 'near_me'
          }
        };

    const setContextFilters = (contextFilters) => {
        _.map(contextFilters, (filterKey) => filters[filterKey].isContextual = true);

        return filters;
    },
            getContextFilters = () => {
                return _.filter(filters, (filter) => filter.isContextual);
            },
            removeContextFilter = (filter) => {
                filters[filter.keyName].isContextual = false;

                return filters;
            };

    return {
            filters: filters,
            setContextFilters: setContextFilters,
            getContextFilters: getContextFilters,
            removeContextFilter: removeContextFilter
        };
};

export default projectFiltersVM;
