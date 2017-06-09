/**
 * window.root.ProjectsExplore component
 * A root component to show projects according to user defined filters
 *
 * Example:
 * To mount this component just create a DOM element like:
 * <div data-mithril="ProjectsExplore">
 */
import m from 'mithril';
import postgrest from 'mithril-postgrest';
import I18n from 'i18n-js';
import _ from 'underscore';
import h from '../h';
import models from '../models';
import projectFilters from '../vms/project-filters-vm';
import search from '../c/search';
import categoryButton from '../c/category-button';
import projectCard from '../c/project-card';
import tooltip from '../c/tooltip';
import UnsignedFriendFacebookConnect from '../c/unsigned-friend-facebook-connect';

const I18nScope = _.partial(h.i18nScope, 'pages.explore');
// TODO Slim down controller by abstracting logic to view-models where it fits
const projectsExplore = {
    oninit(vnode) {
        const filters = postgrest.filtersVM,
            projectFiltersVM = projectFilters(),
            filtersMap = projectFiltersVM.filters,
            defaultFilter = h.paramByName('filter') || 'all',
            fallbackFilter = 'all',
            currentFilter = console.warn("m.prop has been removed from mithril 1.0") || m.prop(filtersMap[defaultFilter]),
            changeFilter = (newFilter) => {
                currentFilter(filtersMap[newFilter]);
                loadRoute();
            },
            resetContextFilter = () => {
                currentFilter(filtersMap[defaultFilter]);
                projectFiltersVM.setContextFilters(['finished', 'all', 'contributed_by_friends']);
            },
            currentUser = h.getUser() || {},
            hasFBAuth = currentUser.has_fb_auth,
            buildTooltip = tooltipText => m(tooltip, {
                el: '.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary',
                text: tooltipText,
                width: 380
            }),
            hint = () => {
                  // TODO Add copies to i18n.
                let hintText = '',
                    tooltipText = '',
                    hasHint = false;
                if (currentFilter().keyName === 'all') {
                    hasHint = true;
                    hintText = 'Ordenados por popularidade ';
                    tooltipText = 'O nosso fator popularidade é uma mistura da seleção do time do Catarse com um valor que é calculado pela velocidade de arrecadação do projeto';
                } else if (currentFilter().keyName === 'finished') {
                    hasHint = true;
                    hintText = 'Ordenados por R$ alcançado ';
                    tooltipText = 'Os projetos com maior meta de arrecadação alcançada ficam no topo';
                } else if (currentFilter().keyName === 'contributed_by_friends') {
                    hasHint = true;
                    hintText = 'Projetos apoiados por amigos ';
                    tooltipText = 'Projetos apoiados por amigos';
                }

                return hasHint ? m('.fontsize-smaller.fontcolor-secondary', [hintText, buildTooltip(tooltipText)]) : '';
            },
            isSearch = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            categoryCollection = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            categoryId = console.warn("m.prop has been removed from mithril 1.0") || m.prop(),
            findCategory = id => _.find(categoryCollection(), c => c.id === parseInt(id)),
            category = _.compose(findCategory, categoryId),
            loadCategories = () => models.category.getPageWithToken(filters({}).order({ name: 'asc' }).parameters()).then(categoryCollection),
            externalLinkCategories = I18n.translations[I18n.currentLocale()].projects.index.explore_categories,
            hasSpecialFooter = (categoryId) => !_.isUndefined(externalLinkCategories[categoryId]),
              // just small fix when have two scored projects only
            checkForMinScoredProjects = collection => _.size(_.filter(collection, x => x.score >= 1)) >= 3,
              // Fake projects object to be able to render page while loadding (in case of search)
            projects = console.warn("m.prop has been removed from mithril 1.0") || m.prop({ collection: console.warn("m.prop has been removed from mithril 1.0") || m.prop([]), isLoading: () => true, isLastPage: () => true }),
            loadRoute = () => {
                const route = window.location.hash.match(/\#([^\/]*)\/?(\d+)?/),
                    cat = route &&
                            route[2] &&
                            findCategory(route[2]),

                    filterFromRoute = () => {
                        const byCategory = filters({
                            category_id: 'eq'
                        });

                        return route &&
                                route[1] &&
                                filtersMap[route[1]] ||
                                cat &&
                                { title: cat.name, filter: byCategory.category_id(cat.id) };
                    },

                    filter = filterFromRoute() || currentFilter(),
                    search = h.paramByName('pg_search'),

                    searchProjects = () => {
                        const l = postgrest.loaderWithToken(models.projectSearch.postOptions({ query: search })),
                            page = { // We build an object with the same interface as paginationVM
                                collection: console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
                                isLoading: l,
                                isLastPage: () => true,
                                nextPage: () => false
                            };
                        l.load().then(page.collection);
                        return page;
                    },

                    loadProjects = () => {
                        const pages = postgrest.paginationVM(models.project);
                        const parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                            open_for_contributions: 'desc',
                            state_order: 'asc',
                            state: 'desc',
                            score: 'desc',
                            pledged: 'desc'
                        }).parameters());
                        pages.firstPage(parameters);
                        return pages;
                    },

                    loadFinishedProjects = () => {
                        const pages = postgrest.paginationVM(models.finishedProject),
                            parameters = _.extend({}, currentFilter().filter.parameters(), filter.filter.order({
                                state_order: 'asc',
                                state: 'desc',
                                pledged: 'desc'
                            }).parameters());
                        pages.firstPage(parameters);

                        return pages;
                    };

                if (_.isString(search) && search.length > 0 && route === null) {
                    isSearch(true);
                    title(`Busca ${search}`);
                    projects(searchProjects());
                } else if (currentFilter().keyName === 'finished') {
                    isSearch(false);
                    projects(loadFinishedProjects());
                } else {
                    isSearch(false);
                    title(filter.title);
                    if (!_.isNull(route) && route[1] == 'finished') {
                        projects(loadFinishedProjects());
                    } else {
                        projects(loadProjects());
                    }
                }
                categoryId(cat && cat.id);
                route || (_.isString(search) && search.length > 0) ? toggleCategories(false) : toggleCategories(true);
            },
            title = console.warn("m.prop has been removed from mithril 1.0") || m.prop(),
            toggleCategories = h.toggleProp(false, true);

        window.addEventListener('hashchange', () => {
            resetContextFilter();
            loadRoute();
            m.redraw();
        }, false);

        // Initial loads
        resetContextFilter();
        models.project.pageSize(9);
        loadCategories().then(loadRoute);

        if (vnode.attrs.filter) {
            currentFilter(filtersMap[vnode.attrs.filter]);
        }

        if (!currentFilter()) {
            currentFilter(filtersMap[defaultFilter]);
        }

        return {
            categories: categoryCollection,
            changeFilter,
            fallbackFilter,
            projects,
            category,
            title,
            hint,
            filtersMap,
            currentFilter,
            projectFiltersVM,
            toggleCategories,
            isSearch,
            hasFBAuth,
            checkForMinScoredProjects,
            categoryId,
            hasSpecialFooter,
            externalLinkCategories
        };
    },
    view(vnode) {
        const categoryId = vnode.state.categoryId,
            projectsCollection = vnode.state.projects().collection(),
            projectsCount = projectsCollection.length,
            filterKeyName = vnode.state.currentFilter().keyName,
            isContributedByFriendsFilter = (filterKeyName === 'contributed_by_friends'),
            hasSpecialFooter = vnode.state.hasSpecialFooter(categoryId());
        let widowProjects = [];

        if (!vnode.state.projects().isLoading() && _.isEmpty(projectsCollection) && !vnode.state.isSearch()) {
            if (!(isContributedByFriendsFilter && !vnode.state.hasFBAuth)) {
                vnode.state.projectFiltersVM.removeContextFilter(vnode.state.currentFilter());
                vnode.state.changeFilter(vnode.state.fallbackFilter);
            }
        }

        return m('#explore', { config: h.setPageTitle(I18n.t('header_html', I18nScope())) }, [
            m('.w-section.hero-search', [
                m(search),
                m('.w-container.u-marginbottom-10', [
                    m('.u-text-center.u-marginbottom-40', [
                        m('a#explore-open.link-hidden-white.fontweight-light.fontsize-larger[href="javascript:void(0);"]',
                            { onclick: () => vnode.state.toggleCategories.toggle() },
                            ['Explore projetos incríveis ', m(`span#explore-btn.fa.fa-angle-down${vnode.state.toggleCategories() ? '.opened' : ''}`, '')])
                    ]),
                    m(`#categories.category-slider${vnode.state.toggleCategories() ? '.opened' : ''}`, [
                        m('.w-row.u-marginbottom-30', [
                            _.map(vnode.state.categories(), category => m(categoryButton, { category }))
                        ])
                    ]),
                ])
            ]),

            m('.w-section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-9.w-col-small-8.w-col-tiny-8', [
                            m('.fontsize-larger', vnode.state.title()),
                            vnode.state.hint()
                        ]),
                        m('.w-col.w-col-3.w-col-small-4.w-col-tiny-4',
                            !vnode.state.isSearch() ? m('select.w-select.text-field.positive',
                                { onchange: m.withAttr('value', vnode.state.changeFilter) },
                                _.map(vnode.state.projectFiltersVM.getContextFilters(), (pageFilter, idx) => {
                                    const isSelected = vnode.state.currentFilter() === pageFilter;

                                    return m(`option[value="${pageFilter.keyName}"]`, { selected: isSelected }, pageFilter.nicename);
                                })
                            ) : ''
                        )
                    ])
                ])
            ]),

            ((isContributedByFriendsFilter && _.isEmpty(projectsCollection)) ?
             (!vnode.state.hasFBAuth ? m(UnsignedFriendFacebookConnect) : '')
             : ''),
            m('.w-section.section', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-row', _.map(projectsCollection, (project, idx) => {
                            let cardType = 'small',
                                ref = 'ctrse_explore';

                            if (vnode.state.isSearch()) {
                                ref = 'ctrse_explore_pgsearch';
                            } else if (isContributedByFriendsFilter) {
                                ref = 'ctrse_explore_friends';
                            } else if (filterKeyName === 'all') {
                                if (project.score >= 1) {
                                    if (idx === 0) {
                                        cardType = 'big';
                                        ref = 'ctrse_explore_featured_big';
                                        widowProjects = [projectsCount - 1, projectsCount - 2];
                                    } else if (idx === 1 || idx === 2) {
                                        if (vnode.state.checkForMinScoredProjects(projectsCollection)) {
                                            cardType = 'medium';
                                            ref = 'ctrse_explore_featured_medium';
                                            widowProjects = [];
                                        } else {
                                            cardType = 'big';
                                            ref = 'ctrse_explore_featured_big';
                                            widowProjects = [projectsCount - 1];
                                        }
                                    } else {
                                        ref = 'ctrse_explore_featured';
                                    }
                                }
                            }

                            return (_.indexOf(widowProjects, idx) > -1 && !vnode.state.projects().isLastPage()) ? '' : m(
                                projectCard,
                                { project, ref, type: cardType, showFriends: isContributedByFriendsFilter }
                            );
                        })),
                        vnode.state.projects().isLoading() ? h.loader() : (_.isEmpty(projectsCollection) && vnode.state.hasFBAuth ? m('.fontsize-base.w-col.w-col-12', 'Nenhum projeto para mostrar.') : '')
                    ])
                ])
            ]),

            m('.w-section.u-marginbottom-80', [
                m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (vnode.state.projects().isLastPage() || vnode.state.projects().isLoading() || _.isEmpty(projectsCollection)) ? '' : m('a.btn.btn-medium.btn-terciary[href=\'#loadMore\']', { onclick: () => { vnode.state.projects().nextPage(); return false; } }, 'Carregar mais')
                        ]),
                    ])
                ])
            ]),

            m('.w-section.section-large.before-footer.u-margintop-80.bg-gray.divider', [
                m('.w-container.u-text-center', [
                    m('img.u-marginbottom-20.icon-hero', {
                        src: hasSpecialFooter
                                ? vnode.state.externalLinkCategories[categoryId()].icon
                                : 'https://daks2k3a4ib2z.cloudfront.net/54b440b85608e3f4389db387/56f4414d3a0fcc0124ec9a24_icon-launch-explore.png'
                    }),
                    m('h2.fontsize-larger.u-marginbottom-60',
                        hasSpecialFooter ? vnode.state.externalLinkCategories[categoryId()].title : 'Lance sua campanha no Catarse!'),
                    m('.w-row', [
                        m('.w-col.w-col-4.w-col-push-4', [
                            hasSpecialFooter
                                ? m('a.w-button.btn.btn-large', { href: vnode.state.externalLinkCategories[categoryId()].link+'?ref=ctrse_explore' }, vnode.state.externalLinkCategories[categoryId()].cta)
                                : m('a.w-button.btn.btn-large', { href: '/start?ref=ctrse_explore' }, 'Aprenda como')
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default projectsExplore;
