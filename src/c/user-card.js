import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import ownerMessageContent from './owner-message-content';
import modalBox from './modal-box';

const userCard = {
    controller(args) {
        const userDetails = m.prop({}),
            user_id = args.userId;

        userVM.fetchUser(user_id, true, userDetails);

        return {
            userDetails: userDetails,
            displayModal: h.toggleProp(false, true)
        };
    },
    view(ctrl) {
        const user = ctrl.userDetails(),
            contactModalC = [ownerMessageContent, ctrl.userDetails],
            profileImage = userVM.displayImage(user);
        return m('#user-card', m('.card.card-user.u-radius.u-marginbottom-30[itemprop=\'author\']', [
            m('.w-row', [
                m('.w-col.w-col-4.w.col-small-4.w-col-tiny-4.w-clearfix',
                    m(`img.thumb.u-round[itemprop=\'image\'][src=\'${profileImage}\'][width=\'100\']`)
                ),
                m('.w-col.w-col-8.w-col-small-8.w-col-tiny-8', [
                    m('.fontsize-small.fontweight-semibold.lineheight-tighter[itemprop=\'name\']',
                        m('a.link-hidden[href="/users/' + user.id + '"]', user.name)
                    ),
                    m('.fontsize-smallest.lineheight-looser[itemprop=\'address\']',
                        user.address_city
                    ),
                    m('.fontsize-smallest',
                        `${h.pluralize(user.total_published_projects, ' campaign', ' campaigns')} Created`
                    ),
                    m('.fontsize-smallest',
                        `Backed ${h.pluralize(user.total_contributed_projects, ' campaign', ' campaigns')}`
                    )
                ])
            ]),
            m('.project-author-contacts', [
                m('ul.w-list-unstyled.fontsize-smaller.fontweight-semibold', [
                    (!_.isEmpty(user.facebook_link) ? m('li', [
                        m('a.link-hidden[itemprop="url"][href="' + user.facebook_link + '"][target="_blank"]', 'Facebook Profile')
                    ]) : ''), (!_.isEmpty(user.twitter_username) ? m('li', [
                        m('a.link-hidden[itemprop="url"][href="https://twitter.com/' + user.twitter_username + '"][target="_blank"]', 'Twitter Profile')
                    ]) : ''),
                    _.map(user.links, (link) => {
                        return m('li', [
                            m('a.link-hidden[itemprop="url"][href="' + link.link + '"][target="_blank"]', link.link)
                        ]);
                    })
                ]),
            ]),
            (ctrl.displayModal() ? m.component(modalBox, {
                displayModal: ctrl.displayModal,
                content: contactModalC
            }) : ''),
            (!_.isEmpty(user.email) ? m('a.btn.btn-medium.btn-message[href=\'javascript:void(0);\']', {onclick: ctrl.displayModal.toggle}, 'Send message') : '')
        ]));
    }
};

export default userCard;
