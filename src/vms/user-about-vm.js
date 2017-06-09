import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import generateErrorInstance from '../error';

const e = generateErrorInstance();

const fields = {
    password: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    current_password: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    uploaded_image: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    cover_image: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    email: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    permalink: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    public_name: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    facebook_link: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    twitter: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    links: console.warn("m.prop has been removed from mithril 1.0") || m.prop([]),
    about_html: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    email_confirmation: console.warn("m.prop has been removed from mithril 1.0") || m.prop('')
};

const mapRailsErrors = (rails_errors) => {
    let parsedErrors;
    try {
        parsedErrors = JSON.parse(rails_errors);
    } catch(e) {
        parsedErrors = {};
    }
    const extractAndSetErrorMsg = (label, fieldArray) => {
        const value = _.first(_.compact(_.map(fieldArray, (field) => {
            return _.first(parsedErrors[field]);
        })));

        if(value) {
            e(label, value);
            e.inlineError(label, true);
        }
    };

    //extractAndSetErrorMsg("about_html", ["user.about_html", "about_html"]);
    //extractAndSetErrorMsg("public_name", ["user.public_name", "public_name"]);

    return e;
};

const userAboutVM = {
    fields,
    mapRailsErrors
};

export default userAboutVM;
