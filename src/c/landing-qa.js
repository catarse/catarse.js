/**
 * window.c.landingQA component
 * A visual component that displays a question/answer box with toggle
 *
 * Example:
 * view: () => {
 *      ...
 *      m.component(c.landingQA, {
 *          question: 'Whats your name?',
 *          answer: 'Darth Vader.'
 *      })
 *      ...
 *  }
 */
import m from 'mithril';
import h from '../h';

const landingQA = {
    oninit(vnode) {
        return {
            showAnswer: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        return m('.card.qa-card.u-marginbottom-20.u-radius.btn-terciary', [
            m('.fontsize-base', {
                onclick: () => {
                    vnode.state.showAnswer.toggle();
                    vnode.attrs.onclick && vnode.attrs.onclick();
                }
            }, vnode.attrs.question),
            vnode.state.showAnswer() ? m('p.u-margintop-20.fontsize-small', m.trust(vnode.attrs.answer)) : ''
        ]);
    }
};

export default landingQA;
