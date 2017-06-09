import m from 'mithril';
import h from '../h';
import modalBox from './modal-box';

const InfoProjectContributionLegend = {
    oninit(vnode) {
        return {
            modalToggle: h.toggleProp(false, true)
        };
    },
    view(vnode) {
        return m('span', [
            vnode.attrs.text,
            m.trust('&nbsp;'),
            m('a.fa.fa-question-circle.fontcolor-secondary[href="#"]', {
                onclick: vnode.state.modalToggle.toggle
            }, ''),
            (vnode.state.modalToggle() ? m(modalBox, {
                displayModal: vnode.state.modalToggle,
                content: vnode.attrs.content
            }) : '')
        ]);
    }
};

export default InfoProjectContributionLegend;
