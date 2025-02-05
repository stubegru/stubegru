import { Modal } from '../../components/bootstrap/v3/ts_wrapper.js';
import Stubegru from '../../components/stubegru_core/logic/stubegru.js';
import { TableSortable } from '../../components/table-sortable/ts_wrapper.js';
import UserManagementModule from './user_management_module.js';
export default class UserManagementView {
    table;
    modal;
    modalForm = Stubegru.dom.querySelector("#user_management_modal_form");
    async init() {
        this.modal = new Modal('#user_management_modal');
        //Reset monitoring form if the modal is closed
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modal.addEventListener("hide.bs.modal", UserManagementModule.controller.refreshUserList);
        Stubegru.dom.querySelector('#user_management_modal_form_role').addEventListener('change', this.onRoleSelect);
        let tableColumns = {
            id: "Id",
            name: "Name",
            mail: "Mail",
            account: "Accountname",
            roleText: "Rolle",
            actionButton: "",
        };
        let searchInput = Stubegru.dom.querySelectorAsInput("#user_management_filter_input");
        let searchInputClear = Stubegru.dom.querySelectorAsInput("#user_management_filter_clear_button");
        this.table = new TableSortable("#user_management_table", tableColumns, searchInput, searchInputClear, 10, this.registerListItemButtons);
        Stubegru.dom.addEventListener("#user_management_create_user_button", "click", UserManagementModule.controller.handleUserCreate);
    }
    setRolePresets(presets) {
        //Generate selectable role option for userEditModal's user_management_modal_form_role input
        let html = `<option value="" disabled selected>Bitte wählen</option>`;
        for (const role of presets) {
            html += `<option value="${role.id}" title="${role.description}">${role.name}</option>`;
        }
        Stubegru.dom.querySelector("#user_management_modal_form_role").innerHTML = html;
    }
    async updateListView(userList) {
        let tableDataList = [];
        for (let userId in userList) {
            let user = userList[userId];
            let editBtn = `<button type="button" class="btn btn-primary btn-sm user-management-edit-btn" data-user-id="${user.id}">
                                <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                           </button>`;
            let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm user-management-delete-btn" type="button" data-user-id="${user.id}">
                                <i class="far fa-trash-alt"></i> Löschen
                             </button>`;
            user.actionButton = editBtn + deleteBtn;
            user.roleText = UserManagementModule.controller.rolePresets[user.role].name;
            tableDataList.push(user);
        }
        this.table.update(tableDataList, "id");
        this.registerListItemButtons();
    }
    registerListItemButtons() {
        Stubegru.dom.querySelectorAll(".user-management-edit-btn").forEach(elem => {
            const userId = elem.getAttribute("data-user-id");
            Stubegru.dom.addEventListener(elem, "click", () => UserManagementModule.controller.showUserModalForUpdate(userId));
        });
        Stubegru.dom.querySelectorAll(".user-management-delete-btn").forEach(elem => {
            const userId = elem.getAttribute("data-user-id");
            Stubegru.dom.addEventListener(elem, "click", () => UserManagementModule.controller.handleUserDelete(userId));
        });
    }
    setModalSubmitEvent(callback) {
        Stubegru.dom.removeEventListener(this.modalForm, "submit");
        Stubegru.dom.addEventListener(this.modalForm, "submit", (event) => {
            event.preventDefault();
            callback();
        });
    }
    /**
     * Sets form data AND generates PermissionToggles
     */
    setModalFormData(userData) {
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_name").value = userData.name;
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_mail").value = userData.mail;
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_account").value = userData.account;
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_role").value = userData.role;
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_password").value = ""; //Password field is set to empty value
        this.generatePermissionToggles(userData.permissions);
    }
    getModalFormData() {
        let userData = {};
        userData.name = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_name").value;
        userData.mail = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_mail").value;
        userData.account = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_account").value;
        userData.role = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_role").value;
        //Nur wenn in das Passwort Input etwas eingetragen wurde, wird das Passwort geändert und als Hash in der DB gespeichert
        if (Stubegru.dom.querySelectorAsInput("#user_management_modal_form_password").value != "") {
            userData.password = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_password").value;
            userData.pwdChanged = true;
        }
        else {
            userData.password = "notChanged";
            userData.pwdChanged = false; //TEST: Check wether true/false logic works fine in PHP
        }
        //Permissions
        userData.permissions = [];
        //TEST: Check selector
        Stubegru.dom.querySelectorAll('.user-management-permission-toggle:checked').forEach((elem) => {
            userData.permissions.push(elem.getAttribute("data-permission-id"));
        });
        return userData;
    }
    resetModalForm() {
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_name").value = "";
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_mail").value = "";
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_account").value = "";
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_role").value = "";
        Stubegru.dom.querySelectorAsInput("#user_management_modal_form_password").value = "";
        Stubegru.dom.querySelector("#user_management_modal_form_permission_container").innerHTML = "";
    }
    async generatePermissionToggles(userPermissions) {
        Stubegru.dom.querySelector("#user_management_modal_form_permission_container").innerHTML = ""; //Clear container
        //Generate Permission toggles
        const allPermissions = await UserManagementModule.service.getAllPermissions();
        let html = "";
        for (let perm of allPermissions) {
            let isChecked = "";
            for (let userPerm of userPermissions) {
                if (userPerm.id == perm.id) {
                    isChecked = "checked";
                }
            }
            html += `<hr style="margin:3px;">
                    <div class="row">
                        <div class="col-xs-2">
                            <input type="checkbox" data-toggle="toggle" class="user-management-permission-toggle" data-on="Ja" data-off="Nein" data-width="70px" data-permission-id="${perm.id}" id="user_management_permission_toggle_${perm.id}" ${isChecked}>
                        </div>
                        <div class="col-xs-3">
                            <b>${perm.id}</b>
                        </div>
                        <div class="col-xs-7">
                            ${perm.description}
                        </div>
                    </div>`;
        }
        Stubegru.dom.querySelector("#user_management_modal_form_permission_container").innerHTML = html;
        //@ts-expect-error
        $(`.user-management-permission-toggle`).bootstrapToggle();
    }
    //Wird aufgerufen, wenn die Rolle im Modal Dropdown geändert wird um default Berechtigungen zu setzen
    onRoleSelect() {
        const roleId = Stubegru.dom.querySelectorAsInput("#user_management_modal_form_role").value;
        const roleProps = UserManagementModule.controller.rolePresets[roleId];
        if (roleProps == undefined) {
            console.error(`Selected role has id ${roleId}. But this role has no presets.`);
            return;
        }
        //@ts-expect-error 
        $(`.user-management-permission-toggle`).bootstrapToggle('off'); //Set all toggles to off
        //Enable all toggles where user have permission
        let rolePermissions = roleProps.permission;
        for (const permId of rolePermissions) {
            //@ts-expect-error
            $(`#user_management_permission_toggle_${permId}`).bootstrapToggle('on');
        }
    }
}
