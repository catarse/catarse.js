import m from 'mithril';
import _ from 'underscore';
import postgrest from 'mithril-postgrest';
import h from '../h';
import generateErrorInstance from '../error';

const e = generateErrorInstance();

const fields = {
    owner_document: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    country_id: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    street: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    number: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    city: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    zipcode: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    complement: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    neighbourhood: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    state: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    phonenumber: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    name: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    agency: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    bank_id: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    agency_digit: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    account: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    account_digit: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    bank_account_id: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    state_inscription: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    birth_date: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    account_type: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    bank_account_type: console.warn("m.prop has been removed from mithril 1.0") || m.prop('')
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

    extractAndSetErrorMsg("owner_document", ["user.cpf", "cpf"]);
    extractAndSetErrorMsg("country_id", ["user.country_id", "country_id"]);
    extractAndSetErrorMsg("street", ["user.address_street", "address_street"]);
    extractAndSetErrorMsg("number", ["user.address_number", "address_number"]);
    extractAndSetErrorMsg("city", ["user.address_city", "address_city"]);
    extractAndSetErrorMsg("zipcode", ["user.address_zip_code", "address_zip_code"]);
    extractAndSetErrorMsg("complement", ["user.address_complement", "address_complement"]);
    extractAndSetErrorMsg("neighbourhood", ["user.address_neighbourhood", "address_neighbourhood"]);
    extractAndSetErrorMsg("state", ["user.address_state", "address_state"]);
    extractAndSetErrorMsg("phonenumber", ["user.phone_number", "phone_number"]);
    extractAndSetErrorMsg("name", ["user.name", "name"]);
    extractAndSetErrorMsg("agency", ["user.bank_account.agency", "bank_account.agency"]);
    extractAndSetErrorMsg("agency_digit", ["user.bank_account.agency_digit", "bank_account.agency_digit"]);
    extractAndSetErrorMsg("account", ["user.bank_account.account", "bank_account.account"]);
    extractAndSetErrorMsg("account_digit", ["user.bank_account.account_digit", "bank_account.account_digit"]);
    extractAndSetErrorMsg("bank_account_type", ["user.bank_account.account_type", "bank_account.account_type"]);
    extractAndSetErrorMsg("bank_id", ["user.bank_account.bank", "bank_account.bank"]);
    extractAndSetErrorMsg("birth_date", ["user.birth_date", "birth_date"]);
    extractAndSetErrorMsg("account_type", ["user.account_type", "account_type"]);

    return e;
};

const userSettingsVM = {
    fields,
    mapRailsErrors
};

export default userSettingsVM;
