import Stubegru from "../../components/stubegru_core/logic/stubegru.js";
import UserUtils from "../../components/user_utils/user_utils.js";
export default class UserManagementService {
    async getRolePresets() {
        return await Stubegru.fetch.getJson(`ts_modules/user_management/get_role_presets.php`);
    }
    async getAllPermissions() {
        return await Stubegru.fetch.getJson("ts_modules/user_management/get_all_permissions.php");
    }
    async getAllUser() {
        return await UserUtils.getAllUsers(true);
    }
    async getUser(userId) {
        return await UserUtils.getUserInfo(userId);
    }
    async updateUser(userData) {
        let resp = await Stubegru.fetch.postJson("ts_modules/user_management/update_user.php", userData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async createUser(userData) {
        let resp = await Stubegru.fetch.postJson("ts_modules/user_management/create_user.php", userData);
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
    async deleteUser(userId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/user_management/delete_user.php", { id: userId });
        if (resp.status == "error") {
            throw new Error(resp.message);
        }
        ;
        return resp;
    }
}
