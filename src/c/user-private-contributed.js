import m from 'mithril';
import models from '../models';
import postgrest from 'mithril-postgrest';
import _ from 'underscore';
import h from '../h';
import contributionVM from '../vms/contribution-vm';
import inlineError from './inline-error';
import userContributedBox from './user-contributed-box';

const userPrivateContributed = {
    oninit(vnode) {
        const user_id = vnode.attrs.userId,
            onlinePages = postgrest.paginationVM(models.userContribution),
            successfulPages = postgrest.paginationVM(models.userContribution),
            failedPages = postgrest.paginationVM(models.userContribution),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            loader = console.warn("m.prop has been removed from mithril 1.0") || m.prop(true),
            handleError = () => {
                error(true);
                loader(false);
                m.redraw();
            },
            contextVM = postgrest.filtersVM({
                user_id: 'eq',
                state: 'in',
                project_state: 'in'
            });

        models.userContribution.pageSize(9);
        contextVM.user_id(user_id).order({
            created_at: 'desc'
        }).state(['refunded', 'pending_refund', 'paid', 'refused', 'pending']);

        contextVM.project_state(['online', 'waiting_funds']);
        onlinePages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['failed']);
        failedPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        contextVM.project_state(['successful']).state(['paid', 'refunded', 'pending_refund']);
        successfulPages.firstPage(contextVM.parameters()).then(() => {
            loader(false);
        }).catch(handleError);

        return {
            onlinePages,
            successfulPages,
            failedPages,
            error,
            loader
        };
    },
    view(vnode) {
        const onlineCollection = vnode.state.onlinePages.collection(),
            successfulCollection = vnode.state.successfulPages.collection(),
            failedCollection = vnode.state.failedPages.collection();

        return m('.content[id=\'private-contributed-tab\']', vnode.state.error() ? m(inlineError, {
            message: 'Erro ao carregar os projetos.'
        }) : vnode.state.loader() ? h.loader() :
            (_.isEmpty(onlineCollection) && _.isEmpty(successfulCollection) && _.isEmpty(failedCollection)) ?
            m('.w-container',
                m('.w-row.u-margintop-30.u-text-center', [
                    m('.w-col.w-col-3'),
                    m('.w-col.w-col-6', [
                        m('.fontsize-large.u-marginbottom-30', [
                            'Você ainda não apoiou nenhum projeto no',
                            m.trust('&nbsp;'),
                            'Catarse...'
                        ]),
                        m('.w-row', [
                            m('.w-col.w-col-3'),
                            m('.w-col.w-col-6',
                                m('a.btn.btn-large[href=\'/pt/explore\']', {
                                    oncreate: m.route.link,
                                    onclick: () => {
                                        m.route.set('/explore');
                                    }
                                },
                                    'Apoie agora!'
                                )
                            ),
                            m('.w-col.w-col-3')
                        ])
                    ]),
                    m('.w-col.w-col-3')
                ])
            ) :
            [
                m(userContributedBox, {
                    title: 'Projetos em andamento',
                    collection: onlineCollection,
                    pagination: vnode.state.onlinePages
                }),
                m(userContributedBox, {
                    title: 'Projetos bem-sucedidos',
                    collection: successfulCollection,
                    pagination: vnode.state.successfulPages
                }),
                m(userContributedBox, {
                    title: 'Projetos não-financiados',
                    collection: failedCollection,
                    pagination: vnode.state.failedPages
                }),

            ]);
    }
};

export default userPrivateContributed;
