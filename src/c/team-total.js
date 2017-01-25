import m from 'mithril';
import h from '../h';
import models from '../models';

const teamTotal = {
    controller() {
        const vm = {
            collection: m.prop([])
        };

        models.teamTotal.getRow().then((data) => {
            vm.collection(data);
        });

        return {
            vm: vm
        };
    },
    view(ctrl, args) {
        return m('#team-total-static.w-section.section-one-column.section.u-margintop-40.u-text-center.u-marginbottom-20', [
            ctrl.vm.collection().map((teamTotal) => {
                return m('.w-container', [
                    m('.w-row', [
                        m('.w-col.w-col-2'),
                        m('.w-col.w-col-8', [
                            m('.fontsize-base.u-marginbottom-30',
                                'Today we are' + teamTotal.member_count + ' People scattered over ' + teamTotal.total_cities + ' Cities in ' + teamTotal.countries.length +
                                ' Countries (' + teamTotal.countries.toString() + ')! JVN is independent, open-source, and built with love. Our passion is to build an environment where more and more projects can come to life.'),
                            m('.fontsize-larger.lineheight-tight.text-success',
                                'Our team, together, has already Rs' + h.formatNumber(teamTotal.total_amount) + ' for ' + teamTotal.total_contributed_projects + ' Business!')
                        ]),
                        m('.w-col.w-col-2')
                    ])
                ]);
            })
        ]);
    }
};

export default teamTotal;
