stubegru.modules.userUtils = {};
/**
 * @param {string} userId id of the user, if no id is provided, info for the current logged in user is retrieved
 */
stubegru.modules.userUtils.getUserInfo = async function (userId) {
    if (userId == undefined) { userId = "currentUser"; }
    const resp = await fetch(`${stubegru.constants.BASE_URL}/modules/user_utils/get_user_info.php?userId=${userId}`)
    const userData = await resp.json();
    return userData;
}

/**
 * @param {string} permission id of the permission
 */
stubegru.modules.userUtils.getUserByPermission = async function (permission) {
    const resp = await fetch(`${stubegru.constants.BASE_URL}/modules/user_utils/get_user_by_permission.php?permission=${permission}`)
    const userData = await resp.json();
    return userData;
}

async function initUserManagement() {
    const userData = await stubegru.modules.userUtils.getUserInfo();
    stubegru.currentUser = userData;
    stubegru.modules.menubar.addItem("secondary", `<li><a style="cursor:default;"><i class="fas fa-user"></i>&nbsp;Nutzer: <b>${userData.name}</b></a></li>`, -1000);
    stubegru.modules.menubar.addItem("secondary", `<li><a data-toggle="modal" data-target="#userUtilsModal" title="Name, Mailadresse und Passwort konfigurieren"><i class="fas fa-cog"></i>&nbsp;Eigenen Account bearbeiten</a></li>`, -999);
    stubegru.modules.menubar.addDivider("secondary", -900);
    stubegru.modules.menubar.addItem("secondary", `<li class="permission-USER_WRITE permission-required"><a href="${stubegru.constants.BASE_URL}?view=user_management" title="Alle Benutzer verwalten"><i class="fas fa-users-cog"></i>&nbsp;Nutzerverwaltung</a></li>`, 10);
    userUtilsModalReset();
};
initUserManagement();

stubegru.modules.userUtils.updateAdminElements = async function () {
    const permissionList = await (await fetch(`${stubegru.constants.BASE_URL}/modules/user_utils/get_permissions.php`)).json();
    for (let perm of permissionList) {
        $(`.permission-${perm.name}`).hide(); //Hide all
        if (perm.access) {
            $(`.permission-${perm.name}`).show(); //then show allowed
        }
    }
}


//-------------userUtilsModal--------------------

function userUtilsModalSubmit() {
    let pwdChanged = $("#userUtilsModalPassword").val() == "" ? "false" : "passwordChanged";

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/user_utils/update_user_settings.php`,
        data: {
            name: $("#userUtilsModalName").val(),
            mail: $("#userUtilsModalMail").val(),
            password: $("#userUtilsModalPassword").val(),
            passwordChanged: pwdChanged
        },
        success: function (data) {
            stubegru.modules.alerts.alert({
                title: "Accountdaten speichern",
                text: data.message,
                type: data.status,
                mode: "alert"
            });
            $("#userUtilsModal").modal("hide");
        }
    });
}

$('#userUtilsModal').on('hidden.bs.modal', userUtilsModalReset);
function userUtilsModalReset() {
    let userData = stubegru.currentUser;
    $("#userUtilsModalName").val(userData.name);
    $("#userUtilsModalMail").val(userData.mail);
    $("#userUtilsModalPassword").val("");
}