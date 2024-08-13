import Stubegru from "../stubegru_core/logic/stubegru.js";
export default class UserUtils {
    static currentUser;
    static allUsersList;
    /**
     * @param {string} userId id of the user, if no id is provided, info for the current logged in user is retrieved
     */
    static async getUserInfo(userId = "currentUser") {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_info.php?userId=${userId}`);
        return userData;
    }
    static async fetchAllUsers() {
        const resp = await Stubegru.fetch.getJson(`modules/user_utils/get_all_users.php`);
        UserUtils.allUsersList = resp;
    }
    static async getAllUsers() {
        //if local user list ist already fetched -> return it
        if (UserUtils.allUsersList) {
            return UserUtils.allUsersList;
        }
        //if not -> fetch it from server:
        await UserUtils.fetchAllUsers();
        return UserUtils.allUsersList;
    }
    static async getUserListByPermission(permissionRequest) {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_by_permission.php`, { permissionRequest: permissionRequest });
        return userData;
    }
    static async getUsersPermissionRequests() {
        const permissionList = await Stubegru.fetch.getJson(`modules/user_utils/get_users_permission_requests.php`);
        return permissionList;
    }
    static updateAdminElements() {
        Stubegru.dom.querySelectorAll(`.permission-required`).forEach(elem => elem.style.display = "none"); //Hide all
        for (let perm of UserUtils.currentUser.permissionRequests) {
            if (perm.access) {
                Stubegru.dom.querySelectorAll(`.permission-${perm.name}`).forEach(elem => elem.style.removeProperty("style")); //then show allowed
            }
        }
    }
    static async init() {
        const userData = await UserUtils.getUserInfo();
        const permReq = await UserUtils.getUsersPermissionRequests();
        userData.permissionRequests = permReq;
        UserUtils.currentUser = userData;
    }
    ;
}
await UserUtils.init();
