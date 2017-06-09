/**
 * window.c.loadMoreBtn component
 * Button to paginate collection
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.loadMoreBtn, {collection: collection, cssClass: 'class'})
 *   ...
 * }
 */
import m from 'mithril';
import h from '../h';

const loadMoreBtn = {
    view(vnode) {
        const collection = vnode.attrs.collection,
            cssClass = vnode.attrs.cssClass;
        return m(`.w-col.w-col-2${cssClass}`, [
              (!collection.isLoading() ?
               (collection.isLastPage() ? '' : m('button#load-more.btn.btn-medium.btn-terciary', {
                   onclick: collection.nextPage
               }, 'Carregar mais')) : h.loader())
        ]);
    }
};

export default loadMoreBtn;
