/**
 * window.c.AdminExternalAction component
 * Makes arbitrary ajax requests and update underlying
 * data from source endpoint.
 *
 * Example:
 * m.component(c.AdminExternalAction, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminExternalAction = {
    oninit(vnode) {
        let builder = vnode.attrs.data,
            complete = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            fail = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            data = {},
            item = vnode.attrs.item;

        builder.requestOptions.config = (xhr) => {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        const reload = _.compose(builder.model.getRowWithToken, h.idVM.id(item[builder.updateKey]).parameters),
            l = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);

        const reloadItem = () => reload().then(updateItem);

        const requestError = (err) => {
            l(false);
            complete(true);
            error(true);
        };

        const updateItem = (res) => {
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        const submit = () => {
            l(true);
            m.request(builder.requestOptions).then(reloadItem, requestError);
            return false;
        };

        const unload = (el, isinit, context) => {};

        return {
            l,
            complete,
            error,
            submit,
            toggler: h.toggleProp(false, true),
            unload
        };
    },

    view(vnode) {
        const data = vnode.attrs.data,
            btnValue = (vnode.state.l()) ? 'por favor, aguarde...' : data.callToAction;

        return m('.w-col.w-col-2', [
            m('button.btn.btn-small.btn-terciary', {
                onclick: vnode.state.toggler.toggle
            }, data.outerLabel), (vnode.state.toggler()) ?
            m('.dropdown-list.card.u-radius.dropdown-list-medium.zindex-10', {
                config: vnode.state.unload
            }, [
                m('form.w-form', {
                    onsubmit: vnode.state.submit
                }, (!vnode.state.complete()) ? [
                    m('label', data.innerLabel),
                    m(`input.w-button.btn.btn-small[type="submit"][value="${btnValue}"]`)
                ] : (!vnode.state.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', 'Requisição feita com sucesso.')
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', 'Houve um problema na requisição.')
                    ])
                ])
            ]) : ''
        ]);
    },

    onremove: function () {
        complete(false);
        error(false);
    }
};

export default adminExternalAction;
