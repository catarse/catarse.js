import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import userVM from '../vms/user-vm';
import userAboutVM from '../vms/user-about-vm';
import railsErrorsVM from '../vms/rails-errors-vm';
import popNotification from './pop-notification';
import inlineError from './inline-error';
import projectEditSaveBtn from './project-edit-save-btn';

const userAboutEdit = {
    controller(args) {
        let parsedErrors = userAboutVM.mapRailsErrors(railsErrorsVM.railsErrors());
        let deleteUser;
        const user = args.user || {},
            fields = {
                password: m.prop(''),
                current_password: m.prop(''),
                uploaded_image: m.prop(userVM.displayImage(user)),
                cover_image: m.prop(user.profile_cover_image || ''),
                email: m.prop(''),
                permalink: m.prop(user.permalink || ''),
                public_name: m.prop(user.public_name || ''),
                facebook_link: m.prop(user.facebook_link || ''),
                twitter: m.prop(user.twitter_username || ''),
                links: m.prop(user.links || []),
                about_html: m.prop(user.about_html || ''),
                email_confirmation: m.prop('')
            },
            passwordHasError = m.prop(false),
            emailHasError = m.prop(false),
            showEmailForm = h.toggleProp(false, true),
            showSuccess = m.prop(false),
            showError = m.prop(false),
            errors = m.prop(),
            loading = m.prop(false),
            uploading = m.prop(false),
            errorsArray = m.prop([]),
            pushErrosMessage = () => {
                errors(errorsArray().join('<br/>'));
            },
            updateFieldsFromUser = () => {
                userVM.fetchUser(args.userId, false).then((dataResponse) => {
                    const data = _.first(dataResponse);
                    fields.uploaded_image(userVM.displayImage(data));
                    fields.cover_image(data.profile_cover_image);
                    fields.permalink(data.permalink);
                    fields.public_name(data.public_name);
                    fields.facebook_link(data.facebook_link);
                    fields.twitter(data.twitter_username);
                    fields.links(data.links);
                    fields.about_html(data.about_html);
                });
            },
            uploadImage = () => {
                const userUploadedImageEl = window.document.getElementById('user_uploaded_image'),
                    userCoverImageEl = window.document.getElementById('user_cover_image'),
                    formData = new FormData();

                if (userUploadedImageEl.files[0] || (!args.hideCoverImg && userCoverImageEl.files[0])) {
                    formData.append('uploaded_image', userUploadedImageEl.files[0]);
                    if (!args.hideCoverImg) {
                        formData.append('cover_image', userCoverImageEl.files[0]);
                    }

                    uploading(true);
                    m.redraw();

                    return m.request({
                        method: 'POST',
                        url: `/users/${user.id}/upload_image.json`,
                        data: formData,
                        config: h.setCsrfToken,
                        serialize(data) {
                            return data;
                        }
                    }).then((data) => {
                        fields.uploaded_image(data.uploaded_image);
                        fields.cover_image(data.cover_image);
                        uploading(false);
                    }).catch((err) => {
                        if (_.isArray(err.errors)) {
                            errorsArray(errorsArray().concat(err.errors));
                        } else {
                            errors('Error updating information.');
                        }
                        pushErrosMessage();
                        showError(true);
                        uploading(false);
                    });
                }

                return void (0);
            },

            updateUser = () => {
                const userData = {
                    current_password: fields.current_password(),
                    password: fields.password(),
                    email: fields.email(),
                    permalink: fields.permalink(),
                    public_name: fields.public_name(),
                    facebook_link: fields.facebook_link(),
                    twitter: fields.twitter(),
                    about_html: fields.about_html(),
                    links_attributes: linkAttributes()
                };

                if (args.publishingUserAbout) {
                    userData.publishing_user_about = true;
                }

                loading(true);
                m.redraw();
                uploadImage();

                return m.request({
                    method: 'PUT',
                    url: `/users/${user.id}.json`,
                    data: {
                        user: userData
                    },
                    config: h.setCsrfToken
                }).then(() => {
                    showSuccess(true);
                    updateFieldsFromUser();
                    loading(false);
                    m.redraw();
                    railsErrorsVM.validatePublish();
                }).catch((err) => {
                    if (parsedErrors) {
                        parsedErrors.resetFieldErrors();
                    }
                    parsedErrors = userAboutVM.mapRailsErrors(err.errors_json);
                    errors('Error updating information. ');

                    showError(true);
                    loading(false);
                    m.redraw();
                });
            },
            removeLinks = [],
            addLink = () => fields.links().push({
                link: ''
            }),
            removeLink = (linkId, idx) => () => {
                fields.links()[idx]._destroy = true;
                return false;
            },
            linkAttributes = () => _.reduce(fields.links(), (memo, item, index) => {
                memo[index.toString()] = item;
                return memo;
            }, {}),
            validateEmailConfirmation = () => {
                if (fields.email() !== fields.email_confirmation()) {
                    emailHasError(true);
                } else {
                    emailHasError(false);
                }
                return !emailHasError();
            },
            validatePassword = () => {
                const pass = String(fields.password());
                if (pass.length > 0 && pass.length <= 5) {
                    passwordHasError(true);
                }

                return !passwordHasError();
            },
            setDeleteForm = (el, isInit) => {
                if (!isInit) {
                    deleteUser = () => el.submit();
                }
            },
            deleteAccount = () => {
                if (window.confirm('Are you sure you want to deactivate your account?')) {
                    deleteUser();
                }

                return false;
            },
            onSubmit = (e) => {
                e.preventDefault();
                if (!validateEmailConfirmation()) {
                    errors('Email confirmation is incorrect.');
                    showError(true);
                } else if (!validatePassword()) {
                    errors('New password is incorrect.');
                    showError(true);
                } else {
                    updateUser();
                }
                return false;
            };
        // Temporary fix for the menu selection bug. Should be fixed/removed as soon as we route all tabs from mithril.
        setTimeout(m.redraw, 0);

        return {
            removeLinks,
            removeLink,
            addLink,
            fields,
            loading,
            showSuccess,
            showError,
            errors,
            uploading,
            onSubmit,
            emailHasError,
            showEmailForm,
            validateEmailConfirmation,
            passwordHasError,
            validatePassword,
            deleteAccount,
            setDeleteForm,
            parsedErrors
        };
    },
    view(ctrl, args) {
        const user = args.user || {},
            fields = ctrl.fields;
        return m('#about-tab.content', [
            (ctrl.showSuccess() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
                message: 'Your information has been updated'
            }) : ''),
            (ctrl.showError() && !ctrl.loading() && !ctrl.uploading() ? m.component(popNotification, {
                message: m.trust(ctrl.errors()),
                error: true
            }) : ''),
            m('form.simple_form.w-form', {
                onsubmit: ctrl.onSubmit
            }, [
                m('input[name="utf8"][type="hidden"][value="✓"]'),
                m('input[name="_method"][type="hidden"][value="patch"]'),
                m(`input[name="authenticity_token"][type="hidden"][value=${h.authenticityToken()}]`),
                m('div',
                    m('.w-container',
                        m('.w-row',
                            m('.w-col.w-col-10.w-col-push-1', [!user.is_admin ? '' : m('.w-row.u-marginbottom-30.card.card-terciary', [
                                m('.w-col.w-col-5.w-sub-col', [
                                    m('label.field-label.fontweight-semibold',
                                            'Your profile address'
                                        ),
                                    m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                            'Your public profile may have a custom URL. Choose an easy to save!    '
                                        )
                                ]),
                                m('.w-col.w-col-7',
                                        m('.w-row', [
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6',
                                                m('input.string.optional.w-input.text-field.text-field.positive.prefix[id="user_permalink"][type="text"]', {
                                                    name: 'user[permalink]',
                                                    value: fields.permalink(),
                                                    onchange: m.withAttr('value', fields.permalink)
                                                })
                                            ),
                                            m('.w-col.w-col-6.w-col-small-6.w-col-tiny-6.text-field.postfix.no-hover',
                                                m('.fontcolor-secondary.fontsize-smaller', '  .grasruts.com')
                                            )
                                        ])
                                    )
                            ]),
                                m('.w-row.u-marginbottom-30.card.card-terciary', [
                                    m('.fontsize-base.fontweight-semibold',
                                        'Email'
                                    ),
                                    m('.fontsize-small.u-marginbottom-30',
                                        'Keep this email updated as it is the channel of communication between you, the Grasruts team and the team of campaigns you have supported. '
                                    ),
                                    m('.fontsize-base.u-marginbottom-40', [
                                        m('span.fontweight-semibold.card.u-radius',
                                            user.email
                                        ),
                                        m('a.alt-link.fontsize-small.u-marginleft-10[href=\'javascript:void(0);\'][id=\'update_email\']', {
                                            onclick: () => {
                                                ctrl.showEmailForm.toggle();
                                            }
                                        },
                                            'Change email'
                                        )
                                    ]),
                                    m(`${ctrl.showEmailForm() ? '' : '.w-hidden'}.u-marginbottom-20.w-row[id=\'email_update_form\']`, [
                                        m('.w-col.w-col-6.w-sub-col', [
                                            m('label.field-label.fontweight-semibold',
                                                'New email'
                                            ),
                                            m('input.w-input.text-field.positive[id=\'new_email\'][name=\'new_email\'][type=\'email\']', {
                                                class: ctrl.emailHasError() ? 'error' : '',
                                                value: fields.email(),
                                                onfocus: () => ctrl.emailHasError(false),
                                                onchange: m.withAttr('value', fields.email)
                                            })
                                        ]),
                                        m('.w-col.w-col-6', [
                                            m('label.field-label.fontweight-semibold',
                                                'Confirm new email'
                                            ),
                                            m('input.string.required.w-input.text-field.w-input.text-field.positive[id=\'new_email_confirmation\'][name=\'user[email]\'][type=\'text\']', {
                                                class: ctrl.emailHasError() ? 'error' : '',
                                                value: fields.email_confirmation(),
                                                onfocus: () => ctrl.emailHasError(false),
                                                onblur: ctrl.validateEmailConfirmation,
                                                onchange: m.withAttr('value', fields.email_confirmation)
                                            })
                                        ]),
                                        ctrl.emailHasError() ? m(inlineError, {
                                            message: 'Email confirmation is incorrect.'
                                        }) : ''
                                    ])
                                ]),
                                m('.w-row.u-marginbottom-30.card.card-terciary', [
                                    m('.w-col.w-col-5.w-sub-col', [
                                        m('label.field-label.fontweight-semibold',
                                            '  Name'
                                        ),
                                        m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                            'This is the name that users will see on your profile.'
                                        )
                                    ]),
                                    m('.w-col.w-col-7',
                                        m('input.string.optional.w-input.text-field.positive[id="user_public_name"][type="text"]', {
                                            name: 'user[public_name]',
                                            class: ctrl.parsedErrors.hasError('public_name') ? 'error' : false,
                                            value: fields.public_name(),
                                            onchange: m.withAttr('value', fields.public_name)
                                        }),
                                        ctrl.parsedErrors.inlineError('public_name')
                                    )
                                ]),
                                m('.w-form', [
                                    m('.w-row.u-marginbottom-30.card.card-terciary', [
                                        m('.w-col.w-col-5.w-sub-col', [
                                            m('label.field-label.fontweight-semibold',
                                                '  Profile picture'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                '  This image will be used as your profile thumbnail (PNG, JPG size 280x280)'
                                            )
                                        ]),
                                        m('.w-col.w-col-4.w-sub-col',
                                            m('.input.file.optional.user_uploaded_image.field_with_hint', [
                                                m('label.field-label'),
                                                m('span.hint',
                                                    m(`img[alt="User avatar"][src="${fields.uploaded_image()}"]`)
                                                ),
                                                m('input.file.optional.w-input.text-field[id="user_uploaded_image"][type="file"]', {
                                                    name: 'user[uploaded_image]',
                                                    class: ctrl.parsedErrors.hasError('uploaded_image') ? 'error' : false
                                                }),
                                                ctrl.parsedErrors.inlineError('uploaded_image')
                                            ])
                                        )
                                    ]),
                                    (args.hideCoverImg ? '' : m('.w-row.u-marginbottom-30.card.card-terciary', [
                                        m('.w-col.w-col-5.w-sub-col', [
                                            m('label.field-label.fontweight-semibold',
                                                '  Profile Cover Image'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                '  This image will be used as the background of your public profile header (PNG or JPG). If you do not submit any images here, we will use your profile image as an alternative.'
                                            )
                                        ]),
                                        m('.w-col.w-col-4.w-sub-col',
                                            m('.input.file.optional.user_cover_image', [
                                                m('label.field-label'),
                                                m('span.hint',
                                                    user.profile_cover_image ? m('img', {
                                                        src: fields.cover_image()
                                                    }) : ''
                                                ),
                                                m('input.file.optional.w-input.text-field[id="user_cover_image"][type="file"]', {
                                                    name: 'user[cover_image]'
                                                })
                                            ])
                                        )
                                    ]))
                                ]),
                                m('.w-row',
                                    m('.w-col',
                                        m('.card.card-terciary.u-marginbottom-30', [
                                            m('label.field-label.fontweight-semibold',
                                                'About'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary.u-marginbottom-20',
                                                'Talk about yourself and try to provide the most relevant information so visitors can get to know you better. '
                                            ),
                                            m('.w-form',
                                                m('.preview-container.u-marginbottom-40', {
                                                    class: ctrl.parsedErrors.hasError('about_html') ? 'error' : false
                                                }, h.redactor('user[about_html]', fields.about_html)),
                                                ctrl.parsedErrors.inlineError('about_html')
                                            )
                                        ])
                                    )
                                ),
                                m('.w-form.card.card-terciary.u-marginbottom-30', [
                                    m('.w-row.u-marginbottom-10', [
                                        m('.w-col.w-col-5.w-sub-col', [
                                            m('label.field-label.fontweight-semibold',
                                                '  Facebook profile'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                ' Paste your profile link'
                                            )
                                        ]),
                                        m('.w-col.w-col-7',
                                            m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                name: 'user[facebook_link]',
                                                value: fields.facebook_link(),
                                                onchange: m.withAttr('value', fields.facebook_link)
                                            })
                                        )
                                    ]),
                                    m('.w-row.u-marginbottom-10', [
                                        m('.w-col.w-col-5.w-sub-col', [
                                            m('label.field-label.fontweight-semibold',
                                                '  Twitter profile'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary',
                                                ' Paste your profile link'
                                            )
                                        ]),
                                        m('.w-col.w-col-7',
                                            m('input.string.optional.w-input.text-field.positive[type="text"]', {
                                                name: 'user[twitter]',
                                                value: fields.twitter(),
                                                onchange: m.withAttr('value', fields.twitter)
                                            })
                                        )
                                    ])
                                ]),
                                m('.w-form.card.card-terciary.u-marginbottom-30',
                                    m('.w-row.u-marginbottom-10', [
                                        m('.w-col.w-col-5.w-sub-col', [
                                            m('label.field-label.fontweight-semibold[for="name-8"]',
                                                ' Other links'
                                            ),
                                            m('label.field-label.fontsize-smallest.fontcolor-secondary[for="name-8"]', ' Include links to help other users get to know you better. ')
                                        ]),
                                        m('.w-col.w-col-7', [
                                            m('.w-row', [fields.links() && fields.links().length <= 0 ? '' : m('.link', _.map(fields.links(),
                                                (link, idx) => {
                                                    const toRemove = link._destroy;

                                                    return m('div', {
                                                        key: idx,
                                                        class: toRemove ? 'w-hidden' : 'none'
                                                    }, [
                                                        m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10',
                                                            m(`input.string.w-input.text-field.w-input.text-field][type="text"][value="${link.link}"]`, {
                                                                class: link.link === '' ? 'positive' : 'optional',
                                                                name: `user[links_attributes][${idx}][link]`,
                                                                onchange: m.withAttr('value', val => fields.links()[idx].link = val)
                                                            })
                                                        ),
                                                        m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                                                            m('a.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border', {
                                                                onclick: ctrl.removeLink(link.id, idx)
                                                            })
                                                        ])
                                                    ]);
                                                }
                                            ))]),
                                            m('.w-row', [
                                                m('.w-col.w-col-6.w-col-push-6',
                                                    m('a.btn.btn-small.btn-terciary', {
                                                        onclick: ctrl.addLink
                                                    },
                                                        m('span.translation_missing', 'Add Link')
                                                    )
                                                )
                                            ])
                                        ])
                                    ])
                                ),
                                (args.hidePasswordChange ? '' : m('.w-form.card.card-terciary.u-marginbottom-30',
                                    m('.w-row.u-marginbottom-10', [
                                        m('.fontsize-base.fontweight-semibold',
                                            'Change my password'
                                        ),
                                        m('.fontsize-small.u-marginbottom-20',
                                            'In order for the password to be changed you must confirm your current password.'
                                        ),
                                        m('.w-row.u-marginbottom-20', [
                                            m('.w-col.w-col-6.w-sub-col', [
                                                m('label.field-label.fontweight-semibold',
                                                    ' current password'
                                                ),
                                                m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_current_password\'][name=\'user[current_password]\'][type=\'password\']', {
                                                    value: fields.current_password(),
                                                    onchange: m.withAttr('value', fields.current_password)
                                                })
                                            ]),
                                            m('.w-col.w-col-6', [
                                                m('label.field-label.fontweight-semibold',
                                                    ' New password'
                                                ),
                                                m('input.password.optional.w-input.text-field.w-input.text-field.positive[id=\'user_password\'][name=\'user[password]\'][type=\'password\']', {
                                                    class: ctrl.passwordHasError() ? 'error' : '',
                                                    value: fields.password(),
                                                    onfocus: () => ctrl.passwordHasError(false),
                                                    onblur: ctrl.validatePassword,
                                                    onchange: m.withAttr('value', fields.password)
                                                }), !ctrl.passwordHasError() ? '' : m(inlineError, {
                                                    message: 'Your new password must be at least 6 characters.'
                                                })
                                            ])
                                        ]),

                                    ])
                                )),
                                (args.hideDisableAcc || user.total_published_projects > 0 ? '' : m('.w-form.card.card-terciary.u-marginbottom-30',
                                    m('.w-row.u-marginbottom-10', [
                                        m('.fontweight-semibold.fontsize-smaller',
                                            'Disable my account'
                                        ),
                                        m('.fontsize-smallest',
                                            'All your support will be converted into anonymous backups, your data will no longer be visible, you will automatically exit the system and your account will be permanently disabled.'
                                        ),
                                        m(`a.alt-link.fontsize-smaller[href='/en/users/${user.id}'][rel='nofollow']`, {
                                            onclick: ctrl.deleteAccount
                                        },
                                            'Disable my Grasruts account'
                                        ),
                                        m('form.w-hidden', {
                                            action: `/en/users/${user.id}`,
                                            method: 'post',
                                            config: ctrl.setDeleteForm
                                        }, [
                                            m(`input[name='authenticity_token'][type='hidden'][value='${h.authenticityToken()}']`),
                                            m('input[name=\'_method\'][type=\'hidden\'][value=\'delete\']')
                                        ])

                                    ])
                                ))

                            ])
                        )
                    ),


                    m(projectEditSaveBtn, {
                        loading: ctrl.loading,
                        onSubmit: ctrl.onSubmit
                    })


                )

            ])
        ]);
    }
};

export default userAboutEdit;
