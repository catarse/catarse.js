import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import popNotification from './pop-notification';
import projectContributionReportContentCard from './project-contribution-report-content-card';
import projectsContributionReportVM from '../vms/projects-contribution-report-vm';
import modalBox from '../c/modal-box';
import deliverContributionModalContent from '../c/deliver-contribution-modal-content';
import errorContributionModalContent from '../c/error-contribution-modal-content';

const projectContributionReportContent = {
    oninit(vnode) {
        const showSelectedMenu = h.toggleProp(false, true),
            selectedAny = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            showSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            loading = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            displayDeliverModal = h.toggleProp(false, true),
            displayErrorModal = h.toggleProp(false, true),
            selectedContributions = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            deliveryMessage = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            selectAll = () => {
                projectsContributionReportVM.getAllContributions(vnode.attrs.filterVM).then((data) => {
                    const exceptReceived = _.filter(data, contrib => contrib.delivery_status !== 'received');
                    selectedContributions().push(..._.pluck(exceptReceived, 'id'));
                    selectedAny(!_.isEmpty(exceptReceived));
                });
            },
            unselectAll = () => {
                selectedContributions([]);
                selectedAny(false);
            },
            updateStatus = (status) => {
                const data = {
                    contributions: selectedContributions(),
                    message: deliveryMessage(),
                    delivery_status: status
                };
                if (status === 'delivered') {
                    displayDeliverModal.toggle();
                } else if (status === 'error') {
                    displayErrorModal.toggle();
                }
                loading(true);
                showSelectedMenu.toggle();
                m.redraw();
                projectsContributionReportVM.updateStatus(data).then(() => {
                    loading(false);
                    showSuccess(true);
                    // update status so we don't have to reload the page
                    _.map(_.filter(vnode.attrs.list.collection(), contrib => _.contains(selectedContributions(), contrib.id)),
                          item => item.delivery_status = status);
                }).catch(() => {
                    m.redraw();
                });
                return false;
            };

        return {
            showSuccess,
            selectAll,
            unselectAll,
            deliveryMessage,
            displayDeliverModal,
            displayErrorModal,
            updateStatus,
            loading,
            showSelectedMenu,
            selectedAny,
            selectedContributions
        };
    },
    view(vnode) {
        const list = vnode.attrs.list;
        const isFailed = vnode.attrs.project().state === 'failed';

        return m('.w-section.bg-gray.before-footer.section', vnode.state.loading() ? h.loader() : [
              (vnode.state.displayErrorModal() ? m(modalBox, {
                  displayModal: vnode.state.displayErrorModal,
                  hideCloseButton: false,
                  content: [errorContributionModalContent, { project: vnode.attrs.project, displayModal: vnode.state.displayErrorModal, amount: vnode.state.selectedContributions().length, updateStatus: vnode.state.updateStatus, message: vnode.state.deliveryMessage }]
              }) : ''),
              (vnode.state.displayDeliverModal() ? m(modalBox, {
                  displayModal: vnode.state.displayDeliverModal,
                  hideCloseButton: false,
                  content: [deliverContributionModalContent, { project: vnode.attrs.project, displayModal: vnode.state.displayDeliverModal, amount: vnode.state.selectedContributions().length, updateStatus: vnode.state.updateStatus, message: vnode.state.deliveryMessage }]
              }) : ''),

            (vnode.state.showSuccess() ? m(popNotification, {
                message: 'As informações foram atualizadas'
            }) : ''),
            m('.w-container', [
                m('.u-marginbottom-40',
                    m('.w-row', [
                        m('.u-text-center-small-only.w-col.w-col-2',
                            m('.fontsize-base.u-marginbottom-10', [
                                m('span.fontweight-semibold',
                                    (list.isLoading() ? '' : list.total())
                                ),
                                ' apoios'
                            ])
                        ),
                        m('.w-col.w-col-6', isFailed ? '' : [
                            (!vnode.state.selectedAny() ?
                                m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                                    onclick: vnode.state.selectAll
                                },
                                    'Selecionar todos'
                                ) :
                                m('button.btn.btn-inline.btn-small.btn-terciary.u-marginright-20.w-button', {
                                    onclick: vnode.state.unselectAll
                                },
                                    'Desmarcar todos'
                                )
                            ),
                            (vnode.state.selectedAny() ?
                                m('.w-inline-block', [
                                    m('button.btn.btn-inline.btn-small.btn-terciary.w-button', {
                                        onclick: vnode.state.showSelectedMenu.toggle
                                    }, [
                                        'Marcar ',
                                        m('span.w-hidden-tiny',
                                            'entrega'
                                        ),
                                        ' como'
                                    ]),
                                    (vnode.state.showSelectedMenu() ?
                                        m('.card.dropdown-list.dropdown-list-medium.u-radius.zindex-10[id=\'transfer\']', [
                                            m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                                onclick: () => vnode.state.displayDeliverModal.toggle()
                                            },
                                                'Enviada'
                                            ),
                                            m('a.dropdown-link.fontsize-smaller[href=\'#\']', {
                                                onclick: () => vnode.state.displayErrorModal.toggle()
                                            },
                                                'Erro no envio'
                                            )
                                        ]) : '')
                                ]) : '')
                        ]),
                        m('.w-clearfix.w-col.w-col-4',
                            m('a.alt-link.fontsize-small.lineheight-looser.u-right', { onclick: () => vnode.attrs.showDownloads(true) }, [
                                m('span.fa.fa-download',
                                    ''
                                ),
                                ' Baixar relatórios'
                            ])
                        )
                    ])
                ),

                _.map(list.collection(), (item) => {
                    const contribution = console.warn("m.prop has been removed from mithril 1.0") || m.prop(item);
                    return m(projectContributionReportContentCard, {
                        project: vnode.attrs.project,
                        contribution,
                        selectedContributions: vnode.state.selectedContributions,
                        selectedAny: vnode.state.selectedAny
                    });
                })
            ]),
            m('.w-section.section.bg-gray', [
                m('.w-container', [
                    m('.w-row.u-marginbottom-60', [
                        m('.w-col.w-col-2.w-col-push-5', [
                            (!list.isLoading() ?
                                (list.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                                    onclick: list.nextPage
                                }, 'Carregar mais')) : h.loader())
                        ])
                    ])

                ])
            ])

        ]);
    }
};

export default projectContributionReportContent;
