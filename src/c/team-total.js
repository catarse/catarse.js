import m from 'mithril';
import h from '../h';
import models from '../models';

const teamTotal = {
    oninit() {
        const vm = {
            collection: console.warn("m.prop has been removed from mithril 1.0") || m.prop([])
        };

        models.teamTotal.getRow().then((data) => {
            vm.collection(data);
        });

        return {
            vm
        };
    },
    view(vnode) {
        return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [
            vnode.state.vm.collection().map(teamTotal => m('.w-container', [
                m('.w-row', [
                    m('.w-col.w-col-2'),
                    m('.w-col.w-col-8', [
                        m('.fontsize-base.u-marginbottom-30',
                                `Hoje somos ${teamTotal.member_count} pessoas espalhadas por ${teamTotal.total_cities} cidades em ${teamTotal.countries.length
                                } países (${teamTotal.countries.toString()})! O Catarse é independente, sem investidores, de código aberto e construído com amor. Nossa paixão é construir um ambiente onde cada vez mais projetos possam ganhar vida.`),
                        m('.fontsize-larger.lineheight-tight.text-success',
                                `Nossa equipe, junta, já apoiou R$${h.formatNumber(teamTotal.total_amount)} para ${teamTotal.total_contributed_projects} projetos!`)
                    ]),
                    m('.w-col.w-col-2')
                ])
            ]))
        ]);
    }
};

export default teamTotal;
