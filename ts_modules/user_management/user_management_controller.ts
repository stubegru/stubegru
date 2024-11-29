import Alert from "../../components/alert/alert.js";
import UserManagementModule, { UserRole } from "./user_management_module.js";

export default class UserManagementController {

    rolePresets: UserRole[];


    async init() {
        this.rolePresets = await UserManagementModule.service.getRolePresets();
        UserManagementModule.view.setRolePresets(this.rolePresets); //TEST: is the view yet initialized...?
        await this.refreshUserList();
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
            const resp = await UserManagementModule.service.updateUser(userData); //TEST: Check if param names to php endpoint are correct
            Alert.alertResp(resp, "Nutzerdaten speichern");
            await this.refreshUserList();
            UserManagementModule.view.modal.hide();
        } catch (error) {
            Alert.alertError(error);
        }

    }

    async handleUserCreate() {
        try {
            let userData = UserManagementModule.view.getModalFormData();
            const resp = await UserManagementModule.service.createUser(userData); //TEST: Check if param names to php endpoint are correct
            Alert.alertResp(resp, "Neuen Nutzeraccount erstellen");
            await this.refreshUserList();
            UserManagementModule.view.modal.hide();
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
            UserManagementModule.view.modal.show();
        } catch (error) {
            Alert.alertError(error);
        }
    }


}




