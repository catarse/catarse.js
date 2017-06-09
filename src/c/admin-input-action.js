import m from 'mithril';
import h from '../h';

const adminInputAction = {
    oninit(vnode) {
        const builder = vnode.attrs.data,
            complete = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            fail = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            data = {},
            item = vnode.attrs.item,
            key = builder.property,
            forceValue = builder.forceValue || null,
            newValue = console.warn("m.prop has been removed from mithril 1.0") || m.prop(forceValue);

        h.idVM.id(item[builder.updateKey]);

        const l = postgrest.loaderWithToken(builder.model.patchOptions(h.idVM.parameters(), data));

        const updateItem = function (res) {
            _.extend(item, res[0]);
            complete(true);
            error(false);
        };

        const submit = function () {
            data[key] = newValue();
            l.load().then(updateItem, () => {
                complete(true);
                error(true);
            });
            return false;
        };

        const unload = function (el, isinit, context) {};

        return {
            complete,
            error,
            l,
            newValue,
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
                    m('label', data.innerLabel), (data.forceValue === undefined) ?
                    m(`input.w-input.text-field[type="text"][placeholder="${data.placeholder}"]`, {
                        onchange: m.withAttr('value', vnode.state.newValue),
                        value: vnode.state.newValue()
                    }) : '',
                    m(`input.w-button.btn.btn-small[type="submit"][value="${btnValue}"]`)
                ] : (!vnode.state.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', data.successMessage)
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', `Houve um problema na requisição. ${data.errorMessage}`)
                    ])
                ])
            ]) : ''
        ]);
    },

    onremove: function () {
        complete(false);
        error(false);
        newValue(forceValue);
    }
};

export default adminInputAction;
