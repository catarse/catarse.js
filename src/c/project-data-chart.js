/**
 * window.c.ProjectDataChart component
 * A graph builder interface to be used on project related dashboards.
 * Example:
 * m.component(c.ProjectDataChart, {
 *     collection: ctrl.contributionsPerDay,
 *     label: 'R$ arrecadados por dia',
 *     dataKey: 'total_amount'
 * })
 */
import m from 'mithril';
import _ from 'underscore';
import Chart from 'chartjs';

const projectDataChart = {
    controller(args) {
        const resource = _.first(args.collection()),
            source = (!_.isUndefined(resource) ? resource.source : []),

            mountDataset = () => [{
                backgroundColor: 'rgba(126,194,69,0.2)',
                borderColor: 'rgba(126,194,69,1)',
                pointBackgroundColor: 'rgba(126,194,69,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(220,220,220,1)',
                data: _.map(source, item => item[args.dataKey])
            }],
            renderChart = (element, isInitialized) => {
                if (!isInitialized) {
                    const ctx = element.getContext('2d');

                    new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: args.xAxis ? _.map(source, item => args.xAxis(item)) : [],
                            datasets: mountDataset()
                        },
                        options: {
                            legend: {
                                display: false,
                            },
                            scales: {
                                xAxes: [{
                                    // type: 'linear',
                                    // position: 'bottom',
                                    ticks: {
                                       maxTicksLimit: 30
                                    }
                                }]
                            }
                        }
                    });
                }
            };

        return {
            renderChart,
            source
        };
    },
    view(ctrl, args) {
        return m('.card.u-radius.medium.u-marginbottom-30', [
            m('.fontweight-semibold.u-marginbottom-10.fontsize-large.u-text-center', args.label),
            m('.w-row', [
                m('.w-col.w-col-12.overflow-auto', [
                    !_.isEmpty(ctrl.source) ? m('canvas[id="chart"][width="860"][height="300"]', {
                        config: ctrl.renderChart
                    }) : m('.w-col.w-col-8.w-col-push-2', m('p.fontsize-base', args.emptyState))
                ]),
            ])
        ]);
    }
};

export default projectDataChart;
