import adminContributionItem from '../../src/c/admin-contribution-item.js';
import adminProject from '../../src/c/admin-project';
import adminContribution from '../../src/c/admin-contribution';
import adminContributionUser from '../../src/c/admin-contribution-user';
import paymentStatus from '../../src/c/payment-status';
import postgrest from 'mithril-postgrest';

fdescribe('adminContributionItem', () => {
    let $output, args;

    describe('view', () => {
        beforeAll(() => {
            spyOn(m, 'component').and.callThrough();
            args = {
                item: m.prop(ContributionMockery()),
                key: 1
            };
            $output = mq(adminContributionItem, args);
        });

        it('shoud render the admin item basic structure', () => {
            expect(m.component).toHaveBeenCalledWith(adminProject, args);
            expect(m.component).toHaveBeenCalledWith(adminContribution, args);
            expect(m.component).toHaveBeenCalledWith(paymentStatus, args);
            expect(m.component).toHaveBeenCalledWith(adminContributionUser, args);
        });
    });
});
