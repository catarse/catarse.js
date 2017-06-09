/**
 * copyTextInput component
 * Displays a text input that copies it's content on click
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(copyTextInput, {value: 'some value'})
 *   ...
 * }
 */
import m from 'mithril';
import popNotification from './pop-notification';

const copyTextInput = {
    oninit(vnode) {
        const showSuccess = console.warn("m.prop has been removed from mithril 1.0") || m.prop(false);

        const select = (el) => {
            let range,
                selection;

            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(el);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(el);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        const setClickHandler = (el, isInitialized) => {
            let copy;
            if (!isInitialized) {
                const textarea = el.parentNode.previousSibling.firstChild;

                textarea.innerText = vnode.attrs.value; //This fixes an issue when instantiating multiple copy clipboard components

                el.onclick = () => {
                    select(textarea);
                    copy = document.execCommand('copy');
                    if (copy) {
                        showSuccess(true);
                        m.redraw();
                    } else {
                        textarea.blur();
                    }
                    return false;
                };
            }
        };

        return {
            setClickHandler,
            showSuccess
        };
    },
    view(vnode) {
        return m('.clipboard.w-row', [
            m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', m('textarea.copy-textarea.text-field.w-input', {
                style: 'margin-bottom:0;'
            }, vnode.attrs.value)),
            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', m('button.btn.btn-medium.btn-no-border.btn-terciary.fa.fa-clipboard.w-button', {
                config: vnode.state.setClickHandler
            })),
            vnode.state.showSuccess() ? m(popNotification, { message: 'Link copiado' }) : ''
        ]);
    }
};

export default copyTextInput;
