import Alert from "../../components/alert/alert.js";
import { Permission } from "../../components/user_utils/permission_request.js";
import UserManagementModule, { UserRole } from "./user_management_module.js";

export default class UserManagementController {

    private rolePresets: UserRole[];
    allPermissions: Permission[];


    async init() {
        this.rolePresets = await UserManagementModule.service.getRolePresets();
        this.allPermissions = await UserManagementModule.service.getAllPermissions();
        UserManagementModule.view.setRolePresets(this.rolePresets);
        await this.refreshUserList();
    }

    getRoleData(roleId: string): UserRole {
        return this.rolePresets.find(role => role.id == roleId);
    }

    async refreshUserList() {
        try {
            let userList = await UserManagementModule.service.getAllUser();
            UserManagementModule.view.updateListView(userList);
        } catch (error) {
            Alert.alertError(error);
        }
    }


    async handleUserEdit(userId: string) {
        try {
            let userData = UserManagementModule.view.getModalFormData();
            userData.id = userId;
            const resp = await UserManagementModule.service.updateUser(userData);
            Alert.alertResp(resp, "Nutzerdaten speichern");
            UserManagementModule.view.modal.hide(); //refresh user list via hide event
        } catch (error) {
            Alert.alertError(error);
        }

    }

    async handleUserCreate() {
        try {
            let userData = UserManagementModule.view.getModalFormData();
            const resp = await UserManagementModule.service.createUser(userData);
            Alert.alertResp(resp, "Neuen Nutzeraccount erstellen");
            UserManagementModule.view.modal.hide(); //refresh user list via hide event
        } catch (error) {
            Alert.alertError(error);
        }

    }

    async handleUserDelete(userId: string) {
        try {
            let confirmResp = await Alert.deleteConfirm("Nutzeraccount löschen", "Soll der Nutzeraccount wirklich gelöscht werden?");
            let resp = await UserManagementModule.service.deleteUser(userId);
            Alert.alertResp(resp, "Nutzeraccount Löschen");
            await this.refreshUserList();
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async showUserModalForUpdate(userId: string) {
        try {
            const userData = await UserManagementModule.service.getUser(userId);
            UserManagementModule.view.setModalFormData(userData);
            UserManagementModule.view.setModalSubmitEvent(() => {
                UserManagementModule.controller.handleUserEdit(userId);
            });
            UserManagementModule.view.modal.show();
        } catch (error) {
            Alert.alertError(error);
        }
    }

    async showUserModalForCreate() {
        try {
            UserManagementModule.view.setModalSubmitEvent(() => {
                UserManagementModule.controller.handleUserCreate();
            });
            UserManagementModule.view.generatePermissionToggles([]);
            UserManagementModule.view.modal.show();
        } catch (error) {
            Alert.alertError(error);
        }
    }


}




