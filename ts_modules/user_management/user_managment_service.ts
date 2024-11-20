
export default class UserManagementService {


    async getRolePresets() {
        return await (await fetch(`${stubegru.constants.BASE_URL}/modules/user_management/get_role_presets.php`)).json();
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
