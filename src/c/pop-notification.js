import m from 'mithril';
import h from '../h';

const popNotification = {
    oninit(vnode) {
        const displayNotification = vnode.attrs.toggleOpt || h.toggleProp(true, false),
            setPopTimeout = () => {
                setTimeout(() => { displayNotification(false); m.redraw(); }, 3000);
            };
        return {
            displayNotification,
            setPopTimeout
        };
    },
    view(vnode) {
        return vnode.state.displayNotification() ? m('.flash.w-clearfix.card.card-notification.u-radius.zindex-20', {
            config: vnode.state.setPopTimeout,
            class: vnode.attrs.error ? 'card-error' : ''
        }, [
            m('img.icon-close[src="/assets/catarse_bootstrap/x.png"][width="12"][alt="fechar"]', {
                onclick: vnode.state.displayNotification.toggle
            }),
            m('.fontsize-small', m.trust(vnode.attrs.message))
        ]) : m('span');
    }
};

export default popNotification;
