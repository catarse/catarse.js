/**
 * window.c.OnlineSuccessModalContent component
 * Render online success message
 *
 */
import m from 'mithril';

const onlineSuccessModalContent = {
    view(ctrl, args) {
        return m('.modal-dialog-content.u-text-center', [
            m('.fa.fa-check-circle.fa-5x.text-success.u-marginbottom-40'),
            m('p.fontsize-larger.lineheight-tight', 'Your campaign is online !!! Congratulations on that first big step. Good luck on this journey. ;)')
        ]);
    }
};

export default onlineSuccessModalContent;
