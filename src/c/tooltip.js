/**
 * window.c.Tooltip component
 * A component that allows you to show a tooltip on
 * a specified element hover. It receives the element you want
 * to trigger the tooltip and also the text to display as tooltip.
 *
 * Example of use:
 * view: () => {
 *     let tooltip = (el) => {
 *          return m.component(c.Tooltip, {
 *              el: el,
 *              text: 'text to tooltip',
 *              width: 300
 *          })
 *     }
 *
 *     return tooltip('a#link-wth-tooltip[href="#"]');
 *
 * }
 */
import m from 'mithril';
import h from '../h';

const tooltip = {
    oninit(vnode) {
        let parentHeight = console.warn("m.prop has been removed from mithril 1.0") || m.prop(0),
            width = console.warn("m.prop has been removed from mithril 1.0") || m.prop(vnode.attrs.width || 280),
            top = console.warn("m.prop has been removed from mithril 1.0") || m.prop(0),
            left = console.warn("m.prop has been removed from mithril 1.0") || m.prop(0),
            opacity = console.warn("m.prop has been removed from mithril 1.0") || m.prop(0),
            parentOffset = console.warn("m.prop has been removed from mithril 1.0") || m.prop({ top: 0, left: 0 }),
            tooltip = h.toggleProp(0, 1),
            toggle = () => {
                tooltip.toggle();
                m.redraw();
            };

        const setParentPosition = (el, isInitialized) => {
                if (!isInitialized) {
                    parentOffset(h.cumulativeOffset(el));
                }
            },
            setPosition = (el, isInitialized) => {
                if (!isInitialized) {
                    const elTop = el.offsetHeight + el.offsetParent.offsetHeight;
                    const style = window.getComputedStyle(el);

                    if (window.innerWidth < (el.offsetWidth + 2 * parseFloat(style.paddingLeft) + 30)) { // 30 here is a safe margin
                        el.style.width = window.innerWidth - 30; // Adding the safe margin
                        left(-parentOffset().left + 15); // positioning center of window, considering margin
                    } else if ((parentOffset().left + (el.offsetWidth / 2)) <= window.innerWidth && (parentOffset().left - (el.offsetWidth / 2)) >= 0) {
                        left(-el.offsetWidth / 2); // Positioning to the center
                    } else if ((parentOffset().left + (el.offsetWidth / 2)) > window.innerWidth) {
                        left(-el.offsetWidth + el.offsetParent.offsetWidth); // Positioning to the left
                    } else if ((parentOffset().left - (el.offsetWidth / 2)) < 0) {
                        left(-el.offsetParent.offsetWidth); // Positioning to the right
                    }
                    top(-elTop); // Setting top position
                }
            };

        return {
            width,
            top,
            left,
            opacity,
            tooltip,
            toggle,
            setPosition,
            setParentPosition
        };
    },
    view(vnode) {
        const width = vnode.state.width();
        return m(vnode.attrs.el, {
            onclick: vnode.state.toggle,
            config: vnode.state.setParentPosition,
            style: { cursor: 'pointer' }
        }, vnode.state.tooltip() ? [
            m(`.tooltip.dark[style="width: ${width}px; top: ${vnode.state.top()}px; left: ${vnode.state.left()}px;"]`, {
                config: vnode.state.setPosition
            }, [
                m('.fontsize-smallest', vnode.attrs.text)
            ])
        ] : '');
    }
};

export default tooltip;
