import m from 'mithril';
import h from '../h';
import projectVM from './project-vm';
import generateErrorInstance from '../error';

const e = generateErrorInstance();
const currentProject = console.warn("m.prop has been removed from mithril 1.0") || m.prop({});

const fields = {
    headline: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    uploaded_image: console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
    upload_files: console.warn("m.prop has been removed from mithril 1.0") || m.prop(undefined)
};

const fillFields = (data) => {
    fields.headline(data.headline || '');
    currentProject(data);
};

const reloadCurrentProject = () => {
    if (currentProject().id) {
        projectVM.fetchProject(currentProject().id, false).then((data) => {
            currentProject(_.first(data));
            m.redraw();
        });
    }
};

const prepareForUpload = (event) => {
    const formData = new FormData();
    if (event.target.files[0]) {
        formData.append('uploaded_image', event.target.files[0]);
    }
    fields.upload_files(formData);
};

const uploadImage = (project_id) => {
    if (_.isUndefined(fields.upload_files())) {
        const deferred = console.warn("m.deferred has been removed from mithril 1.0") || m.deferred();
        deferred.resolve({});
        return deferred.promise;
    }
    return m.request({
        method: 'POST',
        url: `/projects/${project_id}/upload_image.json`,
        data: fields.upload_files(),
        config: h.setCsrfToken,
        serialize(data) { return data; }
    });
};

const updateProject = (project_id) => {
    const projectData = {
        headline: fields.headline()
    };

    return projectVM.updateProject(project_id, projectData);
};

const projectCardVM = {
    fields,
    fillFields,
    updateProject,
    e,
    prepareForUpload,
    uploadImage,
    currentProject,
    reloadCurrentProject
};

export default projectCardVM;
