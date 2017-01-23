import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';

const userAboutEdit = {
    controller(args) {
        const removeLinks = [],
            addLink = () => args.user.links.push({link: '', id: '-1'}),
            removeLink = (linkId, idx) => () => {
                if (linkId != -1){
                    removeLinks.push(linkId);
                } else {
                    args.user.links.splice(idx, 1);
                }
                return false;
            };
        // Temporary fix for the menu selection bug. Should be fixed/removed as soon as we route all tabs from mithril.
        setTimeout(m.redraw, 0);

        return {
            removeLinks,
            removeLink,
            addLink
        };
    },
    view(ctrl, args) {
        const user = args.user || {};
        return m('#about-tab.content',
            m('form.simple_form.w-form', {
                    action: `/en/users/${user.id}`,
                    novalidate: true,
                    enctype: 'multipart/form-data',
                    'accept-charset': 'UTF-8',
                    method: 'POST'
                } , [
                m('input[name="utf8"][type="hidden"][value="✓"]'),
                m('input[name="_method"][type="hidden"][value="patch"]'),
                m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                m('div',
                    m('.w-container',
                        m('.w-row',
                            m('.w-col.w-col-10.w-col-push-1',
                                [
                                    m('.w-form',
                                        [
                                            m('.w-row.u-marginbottom-30.card.card-terciary',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Profile picture'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                ' This image will be used as your profile thumbnail (PNG, JPG size 280x280)'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-4.w-sub-col',
                                                        m('.input.file.optional.user_uploaded_image.field_with_hint',
                                                            [
                                                                m('label.field-label'),
                                                                m('span.hint',
                                                                    m(`img[alt="User avatar"][src="${userVM.displayImage(user)}"]`)
                                                                ),
                                                                m('input.file.optional.w-input.text-field[id="user_uploaded_image"][type="file"]', {name: 'user[uploaded_image]'})
                                                            ]
                                                        )
                                                    )
                                                ]
                                            ),
                                            m('.w-row.u-marginbottom-30.card.card-terciary',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Profile Cover Image'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  This image will be used as the background of your public profile header (PNG or JPG). If you do not submit any images here, we will use your profile image as an alternative.'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-4.w-sub-col',
                                                        m('.input.file.optional.user_cover_image',
                                                            [
                                                                m('label.field-label'),
                                                                m('span.hint',
                                                                    user.profile_cover_image ? m('img', {src: user.profile_cover_image}) : ''
                                                                ),
                                                                m('input.file.optional.w-input.text-field[id="user_cover_image"][type="file"]', {name: 'user[cover_image]'})
                                                            ]
                                                        )
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    !user.is_admin ? '' : m('.w-row.u-marginbottom-30.card.card-terciary',
                                        [
                                            m('.w-col.w-col-5.w-sub-col',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        'Address of your profile'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                        'Your public profile may have a custom URL. Choose an easy to save!    '
                                                    )
                                                ]
                                            ),
                                            m('.w-col.w-col-7',
                                                m('.w-row',
                                                    [
                                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6',
                                                            m('input.string.optional.w-input.text-field.text-field.positive.prefix[id="user_permalink"][type="text"]',{
                                                                name: 'user[permalink]',
                                                                value: h.selfOrEmpty(user.permalink)
                                                            })
                                                        ),
                                                        m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.text-field.postfix.no-hover',
                                                            m('.fontcolor-secondary.fontsize-smaller', '  .catarse.me')
                                                        )
                                                    ]
                                                )
                                            )
                                        ]
                                    ),
                                    m('.w-row.u-marginbottom-30.card.card-terciary',
                                        [
                                            m('.w-col.w-col-5.w-sub-col',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        '  Name'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                        '  This is the name that users will see in your public profile'
                                                    )
                                                ]
                                            ),
                                            m('.w-col.w-col-7',
                                                m('input.string.optional.w-input.text-field.positive[id="user_name"][type="text"]', {
                                                    name: 'user[name]',
                                                    value: user.name
                                                })
                                            )
                                        ]
                                    ),
                                    m('.w-form.card.card-terciary.u-marginbottom-30',
                                        [
                                            m('.w-row.u-marginbottom-10',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Facebook profile'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Paste your profile link'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-7',
                                                        m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                            name: 'user[facebook_link]',
                                                            value: user.facebook_link
                                                        })
                                                    )
                                                ]
                                            ),
                                            m('.w-row.u-marginbottom-10',
                                                [
                                                    m('.w-col.w-col-5.w-sub-col',
                                                        [
                                                            m('label.field-label.fontweight-semibold',
                                                                '  Twitter profile'
                                                            ),
                                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                                '  Paste your profile link'
                                                            )
                                                        ]
                                                    ),
                                                    m('.w-col.w-col-7',
                                                        m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                            name: 'user[twitter]',
                                                            value: user.twitter_username
                                                        })
                                                    )
                                                ]
                                            )
                                        ]
                                    ),
                                    m('.w-form.card.card-terciary.u-marginbottom-30',
                                        m('.w-row.u-marginbottom-10',
                                            [
                                                m('.w-col.w-col-5.w-sub-col',
                                                    [
                                                        m('label.field-label.fontweight-semibold[for="name-8"]',
                                                            ' Presence on the internet'
                                                        ),
                                                        m('label.field-label.fontsize-smallest.fontcolor-secondary[for="name-8"]', ' Include links to help other users get to know you better. ')
                                                    ]
                                                ),
                                                m('.w-col.w-col-7',
                                                    [
                                                        m('.w-row',
                                                            [user.links && user.links.length <= 0 ? '' : m('.link', _.map(user.links,
                                                                (link, idx) => {
                                                                    const toRemove = _.indexOf(ctrl.removeLinks, link.id) >= 0;

                                                                    return m('div', {
                                                                            key: idx,
                                                                            class: toRemove ? 'w-hidden' : 'none'
                                                                        } , [
                                                                            link.id === '-1' ? '' : [
                                                                                m('input[type="hidden"]', {
                                                                                    name: `user[links_attributes][${idx}][_destroy]`,
                                                                                    value: toRemove
                                                                                }),
                                                                                m('input[type="hidden"]', {
                                                                                    name: `user[links_attributes][${idx}][id]`,
                                                                                    value: link.id
                                                                                })
                                                                            ],
                                                                            m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                                                                                m(`input.string.w-input.text-field.w-input.text-field][type="text"][value="${link.link}"]`, {
                                                                                    class: link.link === '' ? 'positive' : 'optional',
                                                                                    name: `user[links_attributes][${idx}][link]`,
                                                                                    onchange: m.withAttr('value', (val) => user.links[idx].link = val)
                                                                                })
                                                                            ),
                                                                            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2',
                                                                                [
                                                                                    m('button.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border', {
                                                                                        onclick: ctrl.removeLink(link.id, idx)
                                                                                    })
                                                                                ]
                                                                            )
                                                                        ]
                                                                    )
                                                                }
                                                            ))
                                                            ]
                                                        ),
                                                        m('.w-row',
                                                            [
                                                                m('.w-col.w-col-6.w-col-push-6',
                                                                    m('a.btn.btn-small.btn-terciary',
                                                                        { onclick: ctrl.addLink },
                                                                        m('span.translation_missing', 'Add Link')
                                                                    )
                                                                )
                                                            ]
                                                        )
                                                    ]
                                                )
                                            ]
                                        )
                                    ),
                                    m('.w-row',
                                        m('.w-col',
                                            m('.card.card-terciary.u-marginbottom-30',
                                                [
                                                    m('label.field-label.fontweight-semibold',
                                                        'Sobre'
                                                    ),
                                                    m('label.field-label.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                                                        'Talk about yourself and try to provide the most relevant information so visitors can get to know you better. '
                                                    ),
                                                    m('.w-form',
                                                        m('.preview-container.u-marginbottom-40', h.redactor('user[about_html]', m.prop(user.about_html)))
                                                    )
                                                ]
                                            )
                                        )
                                    )
                                ]
                            )
                        )
                    )
                ),
                m('div',
                    m('.w-container',
                        m('.w-row', [
                            m('.w-col.w-col-4.w-col-push-4',
                                [
                                    m('input[id="anchor"][name="anchor"][type="hidden"][value="about_me"]'),
                                    m('input.btn.btn.btn-large[name="commit"][type="submit"][value="To save"]')
                                ]
                            ),
                            m('.w-col.w-col-4')
                        ])
                    )
                )
            ])
        );
    }
};

export default userAboutEdit;
