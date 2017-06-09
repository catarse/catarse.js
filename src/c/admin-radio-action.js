import m from 'mithril';
import _ from 'underscore';
import h from '../h';

const adminRadioAction = {
    oninit(vnode) {
        const builder = vnode.attrs.data,
            complete = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            data = {},
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            fail = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false),
            item = vnode.attrs.item(),
            description = console.warn("m.prop has been removed from mithril 1.0") || m.prop(item.description || ''),
            key = builder.getKey,
            newID = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            getFilter = {},
            setFilter = {},
            radios = console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
            getAttr = builder.radios,
            getKey = builder.getKey,
            getKeyValue = vnode.attrs.getKeyValue,
            updateKey = builder.updateKey,
            updateKeyValue = vnode.attrs.updateKeyValue,
            validate = builder.validate,
            selectedItem = builder.selectedItem || (console.warn("m.prop has been removed from mithril 1.0") || m.prop());

        setFilter[updateKey] = 'eq';
        const setVM = postgrest.filtersVM(setFilter);
        setVM[updateKey](updateKeyValue);

        getFilter[getKey] = 'eq';
        const getVM = postgrest.filtersVM(getFilter);
        getVM[getKey](getKeyValue);

        const getLoader = postgrest.loaderWithToken(builder.getModel.getPageOptions(getVM.parameters()));

        const setLoader = postgrest.loaderWithToken(builder.updateModel.patchOptions(setVM.parameters(), data));

        const updateItem = (data) => {
            if (data.length > 0) {
                const newItem = _.findWhere(radios(), {
                    id: data[0][builder.selectKey]
                });
                selectedItem(newItem);
            } else {
                error({
                    message: 'Nenhum item atualizado'
                });
            }
            complete(true);
        };

        const populateRadios = (data) => {
            const emptyState = builder.addEmpty;

            radios(data);

            if (!_.isUndefined(emptyState)) {
                radios().unshift(emptyState);
            }
        };

        const fetch = () => {
            getLoader.load().then(populateRadios, error);
        };

        const submit = () => {
            if (newID()) {
                const validation = validate(radios(), newID());
                if (_.isUndefined(validation)) {
                    data[builder.selectKey] = newID() === -1 ? null : newID();
                    setLoader.load().then(updateItem, error);
                } else {
                    complete(true);
                    error({
                        message: validation
                    });
                }
            }
            return false;
        };

        const unload = (el, isinit, context) => {};

        const setDescription = (text) => {
            description(text);
            m.redraw();
        };

        fetch();

        return {
            complete,
            description,
            setDescription,
            error,
            setLoader,
            getLoader,
            newID,
            submit,
            toggler: h.toggleProp(false, true),
            unload,
            radios
        };
    },

    view(vnode) {
        const data = vnode.attrs.data,
            item = vnode.attrs.item(),
            btnValue = (vnode.state.setLoader() || vnode.state.getLoader()) ? 'por favor, aguarde...' : data.callToAction;

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
                    (vnode.state.radios()) ?
                    _.map(vnode.state.radios(), (radio, index) => m('.w-radio', [
                        m(`input#r-${index}.w-radio-input[type=radio][name="admin-radio"][value="${radio.id}"]`, {
                            checked: radio.id === (item[data.selectKey] || item.id),
                            onclick: () => {
                                vnode.state.newID(radio.id);
                                vnode.state.setDescription(radio.description);
                            }
                        }),
                        m(`label.w-form-label[for="r-${index}"]`, `R$${radio.minimum_value}`)
                    ])) : h.loader(),
                    m('strong', 'Descrição'),
                    m('p', vnode.state.description()),
                    m(`input.w-button.btn.btn-small[type="submit"][value="${btnValue}"]`)
                ] : (!vnode.state.error()) ? [
                    m('.w-form-done[style="display:block;"]', [
                        m('p', 'Recompensa alterada com sucesso!')
                    ])
                ] : [
                    m('.w-form-error[style="display:block;"]', [
                        m('p', vnode.state.error().message)
                    ])
                ])
            ]) : ''
        ]);
    },

    onremove: () => {
        complete(false);
        error(false);
        newID('');
    }
};

export default adminRadioAction;
