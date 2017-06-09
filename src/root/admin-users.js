import m from 'mithril';
import h from '../h';
import userListVM from '../vms/user-list-vm';
import userFilterVM from '../vms/user-filter-vm';
import adminFilter from '../c/admin-filter';
import adminList from '../c/admin-list';
import adminUserItem from '../c/admin-user-item';
import adminUserDetail from '../c/admin-user-detail';
import adminUser from '../c/admin-user';
import filterMain from '../c/filter-main';
import filterDropdown from '../c/filter-dropdown';

const adminUsers = {
    oninit() {
        const listVM = userListVM,
            filterVM = userFilterVM,
            error = console.warn("m.prop has been removed from mithril 1.0") || m.prop(''),
            itemBuilder = [{
                component: adminUser,
                wrapperClass: '.w-col.w-col-4'
            }],
            filterBuilder = [{ // name
                component: filterMain,
                data: {
                    vm: filterVM.full_text_index,
                    placeholder: 'Busque por nome, e-mail, Ids do usuário...',
                },
            }, { // status
                component: filterDropdown,
                data: {
                    label: 'Com o estado',
                    index: 'status',
                    name: 'deactivated_at',
                    vm: filterVM.deactivated_at,
                    options: [{
                        value: '',
                        option: 'Qualquer um'
                    }, {
                        value: null,
                        option: 'ativo'
                    }, {
                        value: !null,
                        option: 'desativado'
                    }]
                }
            }],
            submit = () => {
                listVM.firstPage(filterVM.parameters()).then(null, (serverError) => {
                    error(serverError.message);
                });
                return false;
            };

        return {
            filterVM,
            filterBuilder,
            listVM: {
                list: listVM,
                error
            },
            submit
        };
    },
    view(vnode) {
        const label = 'Usuários';

        return m('', [
            m(adminFilter, {
                form: vnode.state.filterVM.formDescriber,
                filterBuilder: vnode.state.filterBuilder,
                label,
                submit: vnode.state.submit
            }),
            m(adminList, {
                vm: vnode.state.listVM,
                label,
                listItem: adminUserItem,
                listDetail: adminUserDetail
            })
        ]);
    }
};

export default adminUsers;
