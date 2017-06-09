import m from 'mithril';
import creditCardVM from '../vms/credit-card-vm';

const creditCardInput = {
    oninit(vnode) {
        const cardType = vnode.attrs.type || (console.warn("m.prop has been removed from mithril 1.0") || m.prop('unknown'));
      // TODO: move all input logic to vdom paradigm
      // CreditCard Input still handle events on a dom-based model.
        const setCreditCardHandlers = (el, isInitialized) => {
            if (!isInitialized) {
                creditCardVM.setEvents(el, cardType, vnode.attrs.value);
            }
        };

        return {
            setCreditCardHandlers,
            cardType
        };
    },
    view(vnode) {
        return m(`input.w-input.text-field[name="${vnode.attrs.name}"][required="required"][type="tel"]`, {
            onfocus: vnode.attrs.onfocus,
            class: vnode.attrs.class,
            config: vnode.state.setCreditCardHandlers,
            onblur: vnode.attrs.onblur
        });
    }
};

export default creditCardInput;
