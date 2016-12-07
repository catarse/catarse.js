import m from 'mithril';
import addressTag from '../../src/c/address-tag.js';

fdescribe('AddressTag', () => {
    let $output, projectDetail;

    describe('view', () => {
        beforeAll(() => {
            projectDetail = ProjectDetailsMockery()[0];
            $output = mq(
                m(addressTag, {project: m.prop(projectDetail)}).view()
            );
        });

        it('should render project about and reward list', () => {
            expect($output.contains(projectDetail.address.city)).toEqual(true);
            expect($output.contains(projectDetail.address.state_acronym)).toEqual(true);
        });
    });
});
