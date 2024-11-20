import Stubegru from '../../components/stubegru_core/logic/stubegru.js';
import { Modal } from '../../components/bootstrap/v3/ts_wrapper.js';
import UserManagementModule, { UserListItem, UserManagementDataForUpdate } from './user_management_module.js';
import UserUtils, { StubegruUser, StubegruUserWithPerm } from '../../components/user_utils/user_utils.js';



export default class UserManagementView {

    userManagementListSortableTable;
    modal: Modal;

    async init() {

        this.modal = new Modal('#userEditModal');
        //Reset monitoring form if the modal is closed
        this.modal.addEventListener("hide.bs.modal", this.resetModalForm);
        this.modal.addEventListener("hide.bs.modal", this.updateListView);

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

        //TODO: bind submit event...
        Stubegru.dom.querySelector("#daily_news_modal_form").addEventListener("submit", (event) => {
            event.preventDefault();
            DailyNewsModule.controller.saveDailyNews();
        });

    }

    async getRolePresets() {
        //TODO: Typed rolepresets
        const presets = await UserManagementModule.service.getRolePresets();
        let presetsObject = {};
        //Generate selectable role option for userEditModal's userEditRole input
        let html = `<option value="" disabled selected>Bitte wählen</option>`;
        for (const role of presets) {
            presetsObject[role.id] = role;
            html += `<option value="${role.id}" title="${role.description}">${role.name}</option>`;
        }
        Stubegru.dom.querySelector("#userEditRole").html(html);
        return presetsObject;
    }



    async updateListView() {
        let tableDataList = [];

        //TODO: Check if this ffetches really fresh data
        let userList = await UserUtils.getAllUsers();

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


    setModalFormData(userData: StubegruUser) {
        Stubegru.dom.querySelectorAsInput("#userEditName").value = userData.name;
        Stubegru.dom.querySelectorAsInput("#userEditMail").value = userData.mail;
        Stubegru.dom.querySelectorAsInput("#userEditAccount").value = userData.account;
        Stubegru.dom.querySelectorAsInput("#userEditRole").value = userData.role;
        //TODO: handle permissions correct
        Stubegru.dom.querySelectorAsInput("#userEditBerater").value = userData.berater;
        Stubegru.dom.querySelectorAsInput("#userEditTelefonnotiz").value = userData.telefonnotiz;
        Stubegru.dom.querySelectorAsInput("#userEditPermissionAuthor").value = userData.autor;
        Stubegru.dom.querySelectorAsInput("#userEditPasswort").value = "";
    }

    //TODO: Typed return
    getModalFormData():UserManagementDataForUpdate {
        let userData = {} as UserManagementDataForUpdate;
        userData.name = Stubegru.dom.querySelectorAsInput("#userEditName").value;
        userData.mail = Stubegru.dom.querySelectorAsInput("#userEditMail").value;
        userData.account = Stubegru.dom.querySelectorAsInput("#userEditAccount").value;
        userData.role = Stubegru.dom.querySelectorAsInput("#userEditRole").value;
    
        //Permissions
        userData.permissions = [];
        //TODO: Check selector
        Stubegru.dom.querySelectorAll('.permissionsToggle:checkbox:checked').forEach((elem) => {
            userData.permissions.push(elem.getAttribute("data-permission-id"));
        });
    
        //Nur wenn in das Passwort Input etwas eingetragen wurde, wird das Passwort geändert und gehasht in der DB gespeichert
        if (Stubegru.dom.querySelectorAsInput("#userEditPasswort").value != "") {
            userData.password = Stubegru.dom.querySelectorAsInput("#userEditPasswort").value;
            userData.pwdChanged = true;
        } else {
            userData.password = "notChanged";
            userData.pwdChanged = false; //TODO: Check wether true/false logic works fine in PHP
        }

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



    async generatePermissionToggles(userPermissions) {
        //Generate Permission toggles
        const permissionData = await fetch(`${stubegru.constants.BASE_URL}/modules/user_management/get_all_permissions.php`);
        let permissionList = await permissionData.json();
        let html = "";
        for (let perm of permissionList) {
            let isChecked = "";
            for (let userPerm of userPermissions) { if (userPerm.id == perm.id) { isChecked = "checked" } }
            html += `<hr style="margin:3px;"><div class="row">
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
        Stubegru.dom.querySelector("#permissionContainer").html(html);
        Stubegru.dom.querySelector(`.permissionsToggle`).bootstrapToggle();
    }





Stubegru.dom.querySelector('#userEditRole').addEventListener('change', onRoleSelect);
    //Wird aufgerufen, wenn die Rolle im Modal Dropdown geändert wird um default Berechtigungen zu setzen
    onRoleSelect() {
        const roleId = Stubegru.dom.querySelector("#userEditRole").value =);
        const roleProps = rolePresets[roleId];
        if (roleProps == undefined) {
            console.error(`Selected role has id ${roleId}. But this role has no presets.`);
            return;
        }

        //Set all toggles to off
        Stubegru.dom.querySelector(`.permissionsToggle`).bootstrapToggle('off');
        //Enable all toggles where user have permission
        let rolePermissions = roleProps.permission;
        for (const permId of rolePermissions) {
            Stubegru.dom.querySelector(`#permissionToggle${permId}`).bootstrapToggle('on');
        }

    }


}