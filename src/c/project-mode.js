/**
 * window.c.ProjectMode component
 * A simple component that displays a badge with the current project mode
 * together with a description of the mode, shown inside a tooltip.
 * It receives a project as resource
 *
 * Example:
 *  view: {
 *      return m.component(c.ProjectMode, {project: project})
 *  }
 */

import m from 'mithril';
import _ from 'underscore';
import h from '../h';
import tooltip from './tooltip';

const projectMode = {
    view(ctrl, args) {
        const project = args.project(),
            mode = project.mode,
            modeImgSrc = (mode === 'aon') ? '/assets/aon-badge.png' : '/assets/flex-badge.png',
            modeTitle = (mode === 'aon') ? 'All-or-nothing Campaign ' : 'Flexible Campaign ',
            goal = (_.isNull(project.goal) ? 'not defined' : h.formatNumber(project.goal)),
            buildTooltip = (el) => {
                return m.component(tooltip, {
                    el: el,
                    text: (mode === 'aon') ? `You will only receive the resources if you reach or exceed the goal until ${h.momentify(project.zone_expires_at, 'DD/MM/YYYY')}.` : 'The director will receive all the resources when he closes the campaign, even if he has not reached this goal.',
                    width: 280
                });
            };

        return m(`#${mode}.w-row`, [
            m('.w-col.w-col-2.w-col-small-2.w-col-tiny-2', [
                !_.isEmpty(project) ? m(`img[src="${modeImgSrc}"][width='30']`) : ''
            ]),
            m('.w-col.w-col-10.w-col-small-10.w-col-tiny-10', [
                m('.fontsize-base.fontweight-semibold', 'Goal Rs ' + h.selfOrEmpty(goal, '--')),
                m('.w-inline-block.fontsize-smallest._w-inline-block', [
                    !_.isEmpty(project) ? modeTitle : '',
                    buildTooltip('span.w-inline-block.tooltip-wrapper.fa.fa-question-circle.fontcolor-secondary')
                ])
            ])
        ]);
    }
};

export default projectMode;
