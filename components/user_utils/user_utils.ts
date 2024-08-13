import Stubegru from "../stubegru_core/logic/stubegru.js";
import { Permission, PermissionRequest, PermissionRequestAccess } from "./permission_request.js";

export default class UserUtils {
    static currentUser: StubegruUserWithPermReq;
    static allUsersList: StubegruUser[];

    /**
     * @param {string} userId id of the user, if no id is provided, info for the current logged in user is retrieved
     */
    static async getUserInfo(userId = "currentUser") {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_info.php?userId=${userId}`) as StubegruUserWithPerm;
        return userData;
    }

    private static async fetchAllUsers() {
        const resp = await Stubegru.fetch.getJson(`modules/user_utils/get_all_users.php`) as StubegruUser[];
        UserUtils.allUsersList = resp;
    }

    static async getAllUsers() {
        //if local user list ist already fetched -> return it
        if (UserUtils.allUsersList) { return UserUtils.allUsersList; }
        //if not -> fetch it from server:
        await UserUtils.fetchAllUsers();
        return UserUtils.allUsersList;
    }

    static async getUserListByPermission(permissionRequest: PermissionRequest) {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_by_permission.php`, { permissionRequest: permissionRequest }) as StubegruUser[];
        return userData;
    }

    private static async getUsersPermissionRequests() {
        const permissionList = await Stubegru.fetch.getJson(`modules/user_utils/get_users_permission_requests.php`) as PermissionRequestAccess[];
        return permissionList;
    }

    static updateAdminElements() {
        Stubegru.dom.querySelectorAll(`.permission-required`).forEach(elem => elem.style.display = "none") //Hide all

        for (let perm of UserUtils.currentUser.permissionRequests) {
            if (perm.access) {
                Stubegru.dom.querySelectorAll(`.permission-${perm.name}`).forEach(elem => elem.style.display = "inline-block") //Hide all
            }
        }
    }

    static async init() {
        const userData = await UserUtils.getUserInfo() as StubegruUserWithPermReq;
        const permReq = await UserUtils.getUsersPermissionRequests();
        userData.permissionRequests = permReq;
        UserUtils.currentUser = userData;
    };
}

await UserUtils.init();




export interface StubegruUser {
    id: string;
    name: string;
    mail: string;
    account: string;
    role: string;
    erfassungsdatum?: string;
    erfasser?: string;
}

export interface StubegruUserWithPerm extends StubegruUser {
    permissions: Permission[];
}

export interface StubegruUserWithPermReq extends StubegruUserWithPerm {
    permissionRequests: PermissionRequestAccess[];
}
