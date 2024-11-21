import Stubegru from '../../components/stubegru_core/logic/stubegru.js';
import { Modal } from '../../components/bootstrap/v3/ts_wrapper.js';
import UserManagementModule, { UserListItem, UserManagementDataForUpdate, UserRole } from './user_management_module.js';
import { StubegruUserWithPerm } from '../../components/user_utils/user_utils.js';
import { Permission } from '../../components/user_utils/permission_request.js';



export default class UserManagementView {

    userManagementListSortableTable;
    modal: Modal;

    async init() {

        this.modal = new Modal('#userEditModal');
        //Reset monitoring form if the modal is closed
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modal.addEventListener("hide.bs.modal", this.updateListView);

        Stubegru.dom.querySelector('#userEditRole').addEventListener('change', this.onRoleSelect);

        let tableOptions = {
            data: [],
            columns: {
                id: "Id",
                name: "Name",
                mail: "Mail",
                account: "Accountname",
                roleText: "Rolle",
                actionButton: "",
            },
            rowsPerPage: 10,
            pagination: true,
            nextText: "<i class='fas fa-angle-right'>",
            prevText: "<i class='fas fa-angle-left'>",
            searchField: document.getElementById("userManagementFilterInput"),
        };

        //@ts-expect-error //TODO: Pretty wrapper for table sortable
        this.userManagementListSortableTable = Stubegru.dom.querySelector('#user_management_table').tableSortable(tableOptions);

        Stubegru.dom.querySelector("#userManagementFilterClearButton").addEventListener("click", () => {
            Stubegru.dom.querySelectorAsInput("#userManagementFilterInput").value = "";
            Stubegru.dom.querySelector("#userManagementFilterInput").dispatchEvent(new Event("input"));
        })
    }

    setRolePresets(presets: UserRole[]) {
        //Generate selectable role option for userEditModal's userEditRole input
        let html = `<option value="" disabled selected>Bitte wählen</option>`;
        for (const role of presets) {
            html += `<option value="${role.id}" title="${role.description}">${role.name}</option>`;
        }
        Stubegru.dom.querySelector("#userEditRole").innerHTML = html;
    }



    async updateListView() {
        let tableDataList = [];

        let userList = await UserManagementModule.service.getAllUser();

        for (let userId in userList) {
            let user = userList[userId] as UserListItem;
            let editBtn = `<button type="button" class="btn btn-primary btn-sm" onclick="showUserModal(${user.id})">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm" type="button" onclick="deleteUser(${user.id})">
                                <i class="far fa-trash-alt"></i> Löschen
                             </button>`;
            user.actionButton = editBtn + deleteBtn;
            user.roleText = UserManagementModule.controller.rolePresets[user.role].name;
            tableDataList.push(user);
        }

        //Add table data and refresh
        this.userManagementListSortableTable.setData(tableDataList, null);

        //TODO: Move to function in table sortable wrapper
        //Keep sorting state consistent (the table plugin does not care about this...)
        let sort = this.userManagementListSortableTable._sorting;
        sort.currentCol = sort.currentCol == '' ? "id" : sort.currentCol;
        sort.dir = sort.dir == '' ? "desc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
        this.userManagementListSortableTable.sortData(sort.currentCol, sort.dir);

        
    }


    setModalFormData(userData: StubegruUserWithPerm) {
        Stubegru.dom.querySelectorAsInput("#userEditName").value = userData.name;
        Stubegru.dom.querySelectorAsInput("#userEditMail").value = userData.mail;
        Stubegru.dom.querySelectorAsInput("#userEditAccount").value = userData.account;
        Stubegru.dom.querySelectorAsInput("#userEditRole").value = userData.role;
        Stubegru.dom.querySelectorAsInput("#userEditPasswort").value = ""; //Password field is set to empty value
        this.generatePermissionToggles(userData.permissions);
    }

    getModalFormData(): UserManagementDataForUpdate {
        let userData = {} as UserManagementDataForUpdate;
        userData.name = Stubegru.dom.querySelectorAsInput("#userEditName").value;
        userData.mail = Stubegru.dom.querySelectorAsInput("#userEditMail").value;
        userData.account = Stubegru.dom.querySelectorAsInput("#userEditAccount").value;
        userData.role = Stubegru.dom.querySelectorAsInput("#userEditRole").value;

         //Nur wenn in das Passwort Input etwas eingetragen wurde, wird das Passwort geändert und als Hash in der DB gespeichert
         if (Stubegru.dom.querySelectorAsInput("#userEditPasswort").value != "") {
            userData.password = Stubegru.dom.querySelectorAsInput("#userEditPasswort").value;
            userData.pwdChanged = true;
        } else {
            userData.password = "notChanged";
            userData.pwdChanged = false; //TODO: Check wether true/false logic works fine in PHP
        }

        //Permissions
        userData.permissions = [];
        //TODO: Check selector
        Stubegru.dom.querySelectorAll('.permissionsToggle:checkbox:checked').forEach((elem) => {
            userData.permissions.push(elem.getAttribute("data-permission-id"));
        });

        return userData;
    }

    resetModalForm() {
        Stubegru.dom.querySelectorAsInput("#userEditName").value = "";
        Stubegru.dom.querySelectorAsInput("#userEditMail").value = "";
        Stubegru.dom.querySelectorAsInput("#userEditAccount").value = "";
        Stubegru.dom.querySelectorAsInput("#userEditRole").value = "";
        Stubegru.dom.querySelectorAsInput("#userEditPasswort").value = "";
        Stubegru.dom.querySelector("#permissionContainer").innerHTML = "";
    }



    async generatePermissionToggles(userPermissions: Permission[]) {
        Stubegru.dom.querySelector("#permissionContainer").innerHTML = ""; //Clear container
        //Generate Permission toggles
        const allPermissions = await UserManagementModule.service.getAllPermissions();
        let html = "";

        for (let perm of allPermissions) {
            let isChecked = "";
            for (let userPerm of userPermissions) { if (userPerm.id == perm.id) { isChecked = "checked" } }
            html += `<hr style="margin:3px;">
                    <div class="row">
                        <div class="col-xs-2">
                            <input type="checkbox" data-toggle="toggle" class="permissionsToggle" data-on="Ja" data-off="Nein" data-width="70px" data-permission-id="${perm.id}" id="permissionToggle${perm.id}" ${isChecked}>
                        </div>
                        <div class="col-xs-3">
                            <b>${perm.id}</b>
                        </div>
                        <div class="col-xs-7">
                            ${perm.description}
                        </div>
                    </div>`;
        }

        Stubegru.dom.querySelector("#permissionContainer").innerHTML = html;
        //@ts-expect-error
        $(`.permissionsToggle`).bootstrapToggle();
    }





    //Wird aufgerufen, wenn die Rolle im Modal Dropdown geändert wird um default Berechtigungen zu setzen
    onRoleSelect() {
        const roleId = Stubegru.dom.querySelectorAsInput("#userEditRole").value;
        const roleProps = UserManagementModule.controller.rolePresets[roleId];

        if (roleProps == undefined) {
            console.error(`Selected role has id ${roleId}. But this role has no presets.`);
            return;
        }

        //@ts-expect-error 
        $(`.permissionsToggle`).bootstrapToggle('off'); //Set all toggles to off

        //Enable all toggles where user have permission
        let rolePermissions = roleProps.permission;
        for (const permId of rolePermissions) {
            //@ts-expect-error
            $(`#permissionToggle${permId}`).bootstrapToggle('on');
        }
    }


}