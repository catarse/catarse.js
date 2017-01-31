import m from 'mithril';
import h from '../h';
import I18n from 'i18n-js';

const I18nScope = _.partial(h.i18nScope, 'layouts');

const menuSearch = {
    view(ctrl, args) {
        return m('span#menu-search', [
            m('.w-form.w-hidden-small.w-hidden-tiny.header-search[id=\'discover-form-wrapper\']',
                  [
                      m('form.discover-form[accept-charset=\'UTF-8\'][action=\'/en/explore?ref=ctrse_header\'][id=\'search-form\'][method=\'get\']',
                          [
                              m('div', {style: {'display': 'none'}},
                                  m('input[name=\'utf8\'][type=\'hidden\'][value=\'✓\']')
                              ),
                              m('input.w-input.text-field.prefix.search-input[autocomplete=\'off\'][id=\'pg_search\'][name=\'pg_search\'][placeholder=\''+I18n.t('header.search', I18nScope())+'\'][type=\'text\']')
                          ]
                      ),
                      m('.search-pre-result.w-hidden[data-searchpath=\'/en/auto_complete_projects\']',
                          [
                              m('.result',
                                  m('.u-text-center',
                                      m('img[alt=\'Loader\'][src=\'/assets/catarse_bootstrap/loader.gif\']')
                                  )
                              ),
                              m('a.btn.btn-small.btn-terciary.see-more-projects[href=\'javascript:void(0);\']',
                                  ' more'
                              )
                          ]
                      )
                  ]
              ),
              m('a.w-inline-block.w-hidden-small.w-hidden-tiny.btn.btn-dark.btn-attached.postfix[href=\'#\'][id=\'pg_search_submit\']',
                  m('img.header-lupa[alt=\'Magnifying glass\'][data-pin-nopin=\'true\'][src=\'/assets/catarse_bootstrap/lupa.png\']')
              )
        ]);
    }
};

export default menuSearch;
