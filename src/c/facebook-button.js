import m from 'mithril';

const facebookButton = {
    oninit(vnode) {
        const share = () => {
            if (FB) {
                FB.ui({
                    method: vnode.attrs.messenger ? 'send' : 'share',
                    link: vnode.attrs.url,
                    href: vnode.attrs.url,
                });
            }
        };

        return {
            share
        };
    },
    view(vnode) {
        const buttonCss = () => {
            if (vnode.attrs.mobile) {
                return 'w-hidden-main w-hidden-medium u-marginbottom-20 btn btn-medium btn-fb';
            } else if (vnode.attrs.big) {
                return 'btn btn-fb btn-large u-marginbottom-20 w-button';
            } else if (vnode.attrs.medium) {
                return `btn ${vnode.attrs.messenger ? 'btn-messenger' : 'btn-fb'} btn-medium u-marginbottom-20 w-button`;
            }
            return 'btn btn-inline btn-medium btn-terciary u-marginright-20';
        };

        return m('button', {
            class: buttonCss(),
            onclick: vnode.state.share
        }, [
            m('span.fa', {
                class: vnode.attrs.messenger ? 'fa-comment' : 'fa-facebook'
            }),
            vnode.attrs.messenger ? ' Messenger' : ' Facebook'
        ]);
    }
};

export default facebookButton;
