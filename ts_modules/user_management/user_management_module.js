import UserManagementController from "./user_managment_controller.js";
import UserManagementService from "./user_managment_service.js";
import UserManagementView from "./user_managment_view.js";
class UserManagementModule {
    static state = {};
    static service;
    static controller;
    static view;
    static async init() {
        UserManagementModule.service = new UserManagementService();
        UserManagementModule.controller = new UserManagementController();
        UserManagementModule.view = new UserManagementView();
        await UserManagementModule.view.init();
        await UserManagementModule.controller.init();
    }
}
export default UserManagementModule;
await UserManagementModule.init();
