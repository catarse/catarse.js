import m from 'mithril';
import h from '../h';
import adminItem from './admin-item';

const adminList = {
    oninit(vnode) {
        const list = vnode.attrs.vm.list;

        if (!list.collection().length && list.firstPage) {
            list.firstPage().then(null, (serverError) => {
                vnode.attrs.vm.error(serverError.message);
            });
        }
    },
    view(vnode) {
        const list = vnode.attrs.vm.list,
              error = vnode.attrs.vm.error,
              label = vnode.attrs.label || '',
              itemComponent = vnode.attrs.itemComponent || adminItem;

        return m('.w-section.section', [
            m('.w-container',
                error() ?
                m('.card.card-error.u-radius.fontweight-bold', error()) : [
                    m('.w-row.u-marginbottom-20', [
                        m('.w-col.w-col-9', [
                            m('.fontsize-base',
                                list.isLoading() ?
                              `Carregando ${label.toLowerCase()}...` : [
                                  m('.w-row', [
                                      m('.w-col.w-col-3', [
                                          m('.fontweight-semibold', list.total()),
                                          ` ${label.toLowerCase()} encontrados`
                                      ]),
                                      (vnode.attrs.vm && vnode.attrs.vm.hasInputAction ? m('.w-col-9.w-col', vnode.attrs.vm.inputActions()) : '')
                                  ])
                              ]
                            )
                        ])
                    ]),
                    m('#admin-contributions-list.w-container', [
                        list.collection().map(item => m(itemComponent, {
                            listItem: vnode.attrs.listItem,
                            listDetail: vnode.attrs.listDetail,
                            listWrapper: vnode.attrs.vm,
                            item,
                            key: item.id
                        })),
                        m('.w-section.section', [
                            m('.w-container', [
                                m('.w-row', [
                                    m('.w-col.w-col-2.w-col-push-5', [
                                        list.isLoading() ?
                                        h.loader() :
                                        m('button#load-more.btn.btn-medium.btn-terciary', {
                                            onclick: list.nextPage
                                        }, 'Carregar mais'),
                                    ])
                                ])
                            ])
                        ])
                    ])
                ]
            )
        ]);
    }
};

export default adminList;
