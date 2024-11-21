import Stubegru from "../../components/stubegru_core/logic/stubegru.js";
import { Permission } from "../../components/user_utils/permission_request.js";
import { UserRole } from "./user_management_module.js";

export default class UserManagementService {


    //TODO: Error handling, return types
    async getRolePresets() {
        return await Stubegru.fetch.getJson(`ts_modules/user_management/get_role_presets.php`) as UserRole[];
    }

    async getAllPermissions() {
        return await Stubegru.fetch.getJson("ts_modules/user_management/get_all_permissions.php") as Permission[];
    }





    async delete(dailyNewsId) {
        let resp = await Stubegru.fetch.postJson("ts_modules/daily_news/backend/delete_daily_news.php", { id: dailyNewsId }) as StubegruHttpResponse;
        if (resp.status == "error") { throw new Error(resp.message) };
        return resp;
    }

    async getAll() {
        return await Stubegru.fetch.getJson("ts_modules/daily_news/backend/get_all_daily_news.php") as DailyNewsObject[];
    }

   
}
