/**
 * window.c.Slider component
 * Build a slider from any array of mithril elements
 *
 * Example of use:
 * view: () => {
 *     ...
 *     m.component(c.Slider, {
 *         slides: [m('slide1'), m('slide2'), m('slide3')],
 *         title: 'O que estão dizendo por aí...'
 *     })
 *     ...
 * }
 */

import m from 'mithril';
import _ from 'underscore';

const slider = {
    oninit(vnode) {
        let interval;
        const selectedSlideIdx = console.warn("m.prop has been removed from mithril 1.0") || m.prop(0),
            translationSize = console.warn("m.prop has been removed from mithril 1.0") || m.prop(1600),
            sliderTime = vnode.attrs.sliderTime || 6500,
            decrementSlide = () => {
                if (selectedSlideIdx() > 0) {
                    selectedSlideIdx(selectedSlideIdx() - 1);
                } else {
                    selectedSlideIdx(vnode.attrs.slides.length - 1);
                }
            },
            incrementSlide = () => {
                if (selectedSlideIdx() < (vnode.attrs.slides.length - 1)) {
                    selectedSlideIdx(selectedSlideIdx() + 1);
                } else {
                    selectedSlideIdx(0);
                }
            },
            startSliderTimer = () => {
                interval = setInterval(() => {
                    incrementSlide();
                    m.redraw();
                }, sliderTime);
            },
            resetSliderTimer = () => {
                clearInterval(interval);
                startSliderTimer();
            },
            config = (el, isInitialized, context) => {
                if (!isInitialized) {
                    translationSize(Math.max(document.documentElement.clientWidth, window.innerWidth || 0));
                    m.redraw();
                }
            };

        startSliderTimer();

        return {
            config,
            selectedSlideIdx,
            translationSize,
            decrementSlide,
            incrementSlide,
            resetSliderTimer
        };
    },

    view(vnode) {
        const slideClass = vnode.attrs.slideClass || '',
            wrapperClass = vnode.attrs.wrapperClass || '',
            effect = vnode.attrs.effect || 'slide',
            sliderClick = (fn, param) => {
                fn(param);
                vnode.state.resetSliderTimer();
                vnode.attrs.onchange && vnode.attrs.onchange();
            },
            effectStyle = (idx, translateStr) => {
                const slideFx = `transform: ${translateStr}; -webkit-transform: ${translateStr}; -ms-transform:${translateStr}`,
                    fadeFx = idx === vnode.state.selectedSlideIdx() ? 'opacity: 1; visibility: visible;' : 'opacity: 0; visibility: hidden;';

                return effect === 'fade' ? fadeFx : slideFx;
            };

        return m(`.w-slider.${wrapperClass}`, {
            config: vnode.state.config
        }, [
            m('.fontsize-larger', vnode.attrs.title),
            m('.w-slider-mask', [
                _.map(vnode.attrs.slides, (slide, idx) => {
                    let translateValue = (idx - vnode.state.selectedSlideIdx()) * vnode.state.translationSize(),
                        translateStr = `translate3d(${translateValue}px, 0, 0)`;

                    return m(`.slide.w-slide.${slideClass}`, {
                        style: `${effectStyle(idx, translateStr)} ${slide.customStyle}`
                    }, [
                        m('.w-container', [
                            m('.w-row', [
                                m('.w-col.w-col-8.w-col-push-2', slide.content)
                            ])
                        ])
                    ]);
                }),
                m('#slide-prev.w-slider-arrow-left.w-hidden-small.w-hidden-tiny', {
                    onclick: () => sliderClick(vnode.state.decrementSlide)
                }, [
                    m('.w-icon-slider-left.fa.fa-lg.fa-angle-left.fontcolor-terciary')
                ]),
                m('#slide-next.w-slider-arrow-right.w-hidden-small.w-hidden-tiny', {
                    onclick: () => sliderClick(vnode.state.incrementSlide)
                }, [
                    m('.w-icon-slider-right.fa.fa-lg.fa-angle-right.fontcolor-terciary')
                ]),
                m('.w-slider-nav.w-slider-nav-invert.w-round.slide-nav', _(vnode.attrs.slides.length).times(idx => m(`.slide-bullet.w-slider-dot${vnode.state.selectedSlideIdx() === idx ? '.w-active' : ''}`, {
                    onclick: () => sliderClick(vnode.state.selectedSlideIdx, idx)
                })))
            ])
        ]);
    },

    onremove: () => clearInterval(interval)
};

export default slider;
