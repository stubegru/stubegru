import Stubegru from "../../components/stubegru_core/logic/stubegru.js";
import { StubegruHttpResponse } from "../../components/stubegru_core/logic/stubegru_fetch.js";
import { Permission } from "../../components/user_utils/permission_request.js";
import UserUtils from "../../components/user_utils/user_utils.js";
import { UserManagementDataForUpdate, UserRole } from "./user_management_module.js";

export default class UserManagementService {

    async getRolePresets() {
        return await Stubegru.fetch.getJson(`ts_modules/user_management/get_role_presets.php`) as UserRole[];
    }

    async getAllPermissions() {
        return await Stubegru.fetch.getJson("ts_modules/user_management/get_all_permissions.php") as Permission[];
    }

    async getAllUser() {
        //FIXME: fetch really fresh data, not cached user list...
        return await UserUtils.getAllUsers();
    }

    async getUser(userId: string) {
        return await UserUtils.getUserInfo(userId);
    }

    async updateUser(userData: UserManagementDataForUpdate) {
        let resp = await Stubegru.fetch.postJson("ts_modules/user_management/update_user.php", userData) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async deleteUser(userId: string) {
        let resp = await Stubegru.fetch.postJson("ts_modules/user_management/delete_user.php", { id: userId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }
}
