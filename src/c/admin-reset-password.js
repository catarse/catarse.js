/**
 * window.c.AdminResetPassword component
 * Makes ajax request to update User password.
 *
 * Example:
 * m.component(c.AdminResetPassword, {
 *     data: {},
 *     item: rowFromDatabase
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminResetPassword = {
    oninit(vnode) {
        let builder = vnode.attrs.data,
            complete = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            fail = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            key = builder.property,
            data = {},
            item = vnode.attrs.item;

        builder.requestOptions.config = (xhr) => {
            if (h.authenticityToken()) {
                xhr.setRequestHeader('X-CSRF-Token', h.authenticityToken());
            }
        };

        const l = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            load = () => m.request(_.extend({}, { data }, builder.requestOptions)),
            newPassword = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            error_message = console.warn("m.prop has been removed from mithril 1.0") || m.prop('');

        const requestError = (err) => {
            l(false);
            error_message(err.errors[0]);
            complete(true);
            error(true);
        };
        const updateItem = (res) => {
            l(false);
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        const submit = () => {
            l(true);
            data[key] = newPassword();
            load().then(updateItem, requestError);
            return false;
        };

        const unload = (el, isinit, context) => {};

        return {
            complete,
            error,
            error_message,
            l,
            newPassword,
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
                    m(`input.w-input.text-field[type="text"][name="${data.property}"][placeholder="${data.placeholder}"]`, {
                        onchange: m.withAttr('value', vnode.state.newPassword),
                        value: vnode.state.newPassword()
                    }),
                    m(`input.w-button.btn.btn-small[type="submit"][value="${btnValue}"]`)
                ] : (!vnode.state.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', 'Senha alterada com sucesso.')
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', vnode.state.error_message())
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

export default adminResetPassword;
