import UserUtils from "../../components/user_utils/user_utils.js";
import UserManagementModule, { UserRole } from "./user_management_module.js";

export default class UserManagementController {

    rolePresets: UserRole[];


    async init() {
        this.rolePresets = await UserManagementModule.service.getRolePresets();
        UserManagementModule.view.setRolePresets(this.rolePresets); //TODO: is the view yet intialized...?
        updateUserManagement();
    }



function deleteUser(userId) {
    deleteConfirm("Nutzer löschen", "Soll der Nutzer wirklich gelöscht werden?", function () {

        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/user_management/delete_user.php`,
            data: { id: userId },
            success: function (json) {
                stubegru.modules.alerts.alert({
                    title: "Nutzer Gelöscht!",
                    text: json.message,
                    type: json.status,
                });
            }
        });
    });

        async showUserModal(userId: string) {
        const userData = await UserUtils.getUserInfo(userId);
        UserManagementModule.view.setModalFormData(userData);

        await this.generatePermissionToggles(userData.permissions);

        Stubegru.dom.querySelector("#userEditModal").modal("show");


        //falls die Id 0 ist, wird ein neuer Benutzer hinzugefügt, es müssen also keine Werte vorgeladen werden.
        await generatePermissionToggles([]);
        Stubegru.dom.querySelector("#userEditModal").modal("show");

        //TODO: bind submit event...
        Stubegru.dom.querySelector("#daily_news_modal_form").addEventListener("submit", (event) => {
            event.preventDefault();
            DailyNewsModule.controller.saveDailyNews();
        });
    }

    function updateUser() { //Nutzerdaten speichern in DB
        let userData = UserManagementModule.view.getModalFormData();

        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/user_management/update_user.php`,
            data: userData,
            success: function (json) {
                stubegru.modules.alerts.alert({
                    title: "Nutzer speichern",
                    text: json.message,
                    type: json.status
                });
                if (json.status == "success") { Stubegru.dom.querySelector("#userEditModal").modal("hide"); }
            }
        });
    }
}




