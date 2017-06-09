import m from 'mithril';
import h from '../h';

const categoryTag = {
    view(vnode) {
        const project = vnode.attrs.project;

        return project ? m(`a.btn.btn-inline.btn-small.btn-transparent.link-hidden-light[href="/pt/explore#by_category_id/${project().category_id}"]`, {
            onclick: h.analytics.event({
                cat: 'project_view',
                act: 'project_category_link',
                lbl: project().category_name,
                project: project()
            })
        }, [
            m('span.fa.fa-tag'), ' ',
            project().category_name
        ]) : '';
    }
};

export default categoryTag;
