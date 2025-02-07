import { StubegruUser } from "../../components/user_utils/user_utils.js";
import UserManagementController from "./user_management_controller.js";
import UserManagementService from "./user_management_service.js";
import UserManagementView from "./user_management_view.js";

export default class UserManagementModule {

    static state = {};

    static service: UserManagementService;
    static controller: UserManagementController;
    static view: UserManagementView;

    static async init() {
        UserManagementModule.service = new UserManagementService();
        UserManagementModule.controller = new UserManagementController();
        UserManagementModule.view = new UserManagementView();

        await UserManagementModule.view.init();
        await UserManagementModule.controller.init();
    }
}

await UserManagementModule.init();


export interface UserListItem extends StubegruUser {
    actionButton: string;
    roleText: string;
}

export interface UserManagementDataForCreate {
    name: string;
    mail: string;
    account: string;
    role: string;
    password: string;
    permissions: string[];
}

export interface UserManagementDataForUpdate extends UserManagementDataForCreate {
    pwdChanged: boolean;
    id: string;
}

export interface UserRole {
    id: string;
    name: string;
    description: string;
    notification_online: string[];
    permission: string[];
}










