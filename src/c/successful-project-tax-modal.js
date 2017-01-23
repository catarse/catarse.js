/**
 * window.c.SuccessfulProjectTaxModal component
 * Modal content for show project transfer complete values data
 */
import m from 'mithril';
import h from '../h';

const successfulProjectTaxModal = {
    view(ctrl, args) {
        let pt = args.projectTransfer;

        return m('div',[
            m('.modal-dialog-header', [
                m('.fontsize-large.u-text-center',
                  'Project Extract')
            ]),
            m('.modal-dialog-content', [
                m('p.fontsize-small.u-marginbottom-40', [
                    'Check the extract of your project, including the fees and retentions. If you have questions about how this calculation is done, ',
                    m('a.alt-link[href="http://suporte.catarse.me/hc/pt-br/articles/202037493-FINANCIADO-Como-ser%C3%A1-feito-o-repasse-do-dinheiro-"][target="__blank"]', 'Access here'),
                    '.'
                ]),
                m('div', [
                    m('.w-row.fontsize-small.u-marginbottom-10', [
                        m('.w-col.w-col-4', [
                            m('.text-success', `+ Rs ${h.formatNumber(pt.pledged, 2)}`)
                        ]),
                        m('.w-col.w-col-8', [
                            m('div', `Total collection (${pt.total_contributions} Supports)`)
                        ])
                    ]),
                    (pt.irrf_tax > 0 ?
                     m('.w-row.fontsize-small.u-marginbottom-10', [
                         m('.w-col.w-col-4', [
                             m('.text-success', `+ Rs ${h.formatNumber(pt.irrf_tax, 2)}`)
                         ]),
                         m('.w-col.w-col-8', [
                             m('div', 'Retention IRRF (Income Tax withholding)')
                         ])
                     ]) : ''),
                    m('.w-row.fontsize-small.u-marginbottom-10', [
                        m('.w-col.w-col-4', [
                            m('.text-error', `- Rs ${h.formatNumber(pt.catarse_fee, 2)}`)
                        ]),
                        m('.w-col.w-col-8', [
                            m('div', `JVN fee and means of payment (${h.formatNumber((pt.service_fee * 100), 2)}%) `)
                        ])
                    ]),
                    m('.divider.u-marginbottom-10'),
                    m('.w-row.fontsize-base.fontweight-semibold', [
                        m('.w-col.w-col-4', [
                            m('div', `Rs ${h.formatNumber(pt.total_amount, 2)}`)
                        ]),
                        m('.w-col.w-col-8', [
                            m('div', 'Total to be transferred')
                        ])
                    ])
                ])
            ])
        ]);
    }
};

export default successfulProjectTaxModal;
