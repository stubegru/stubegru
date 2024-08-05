import Stubegru from "../stubegru_core/logic/stubegru.js";
import { Permission, PermissionRequest, PermissionRequestAccess } from "./permission_request.js";

export default class UserUtils {
    static currentUser: StubegruUserWithPermReq; //TODO: SEt attributes
    static allUsersList: StubegruUser[];

    /**
     * @param {string} userId id of the user, if no id is provided, info for the current logged in user is retrieved
     */
    static async getUserInfo(userId = "currentUser") {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_info.php?userId=${userId}`) as StubegruUserWithPerm;
        return userData;
    }

    static private async fetchAllUsers() {
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

    static async getUserByPermission(permissionRequest: PermissionRequest) {
        const userData = await Stubegru.fetch.getJson(`modules/user_utils/get_user_by_permission.php`, { permissionRequest: permissionRequest }) as StubegruUser[];
        return userData;
    }

    static async getUserPermissionRequests() {
        const permissionList = await Stubegru.fetch.getJson(`modules/user_utils/get_users_permission_requests.php`) as PermissionRequestAccess[];
        return permissionList;
    }

    static updateAdminElements() {
        Stubegru.dom.querySelectorAll(`.permission-required`).forEach(elem => elem.style.display = "none") //Hide all

        for (let perm of UserUtils.currentUser.permissionRequests) {
            if (perm.access) {
                Stubegru.dom.querySelectorAll(`.permission-${perm.name}`).forEach(elem => elem.style.removeProperty("style")); //then show allowed
            }
        }
    }

    static async function initUserManagement() {
        const userData = await static getUserInfo();
        stubegru.currentUser = userData;
        stubegru.modules.menubar.addItem("secondary", `<li><a style="cursor:default;"><i class="fas fa-user"></i>&nbsp;Nutzer: <b>${userData.name}</b></a></li>`, -1000);
        stubegru.modules.menubar.addItem("secondary", `<li><a data-toggle="modal" data-target="#userUtilsModal" title="Name, Mailadresse und Passwort konfigurieren"><i class="fas fa-cog"></i>&nbsp;Eigenen Account bearbeiten</a></li>`, -999);
        stubegru.modules.menubar.addDivider("secondary", -900);
        stubegru.modules.menubar.addItem("secondary", `<li class="permission-USER_WRITE permission-required"><a href="${stubegru.constants.BASE_URL}?view=user_management" title="Alle Benutzer verwalten"><i class="fas fa-users-cog"></i>&nbsp;Nutzerverwaltung</a></li>`, 10);
        stubegru.modules.menubar.registerPostRenderHook("-Update Admin Elements-", static updateAdminElements, 100);
        userUtilsModalReset();
        updateAdminElements();
    };
    initUserManagement();





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
