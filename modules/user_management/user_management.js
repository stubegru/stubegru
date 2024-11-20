let rolePresets;
let userManagementListSortableTable;
initUserManagement();



async function initUserManagement() {
    rolePresets = await getRolePresets();

    //Reset monitoring form if the modal is closed
    $('#userEditModal').on('hidden.bs.modal', resetUserEditForm);
    $('#userEditModal').on('hidden.bs.modal', updateUserManagement);

    let tableOptions = {
        data: [],
        columns: {
            id: "Id",
            name: "Name",
            mail: "Mail",
            account: "Accountname",
            roleText: "Rolle",
            actionButton: "",
        },
        rowsPerPage: 10,
        pagination: true,
        nextText: "<i class='fas fa-angle-right'>",
        prevText: "<i class='fas fa-angle-left'>",
        searchField: document.getElementById("userManagementFilterInput"),
        //tableDidUpdate: EventInstanceView.onUpdateListView
    };

    userManagementListSortableTable = $('#user_management_table').tableSortable(tableOptions);

    document.querySelector("#userManagementFilterClearButton").addEventListener("click", () => {
        document.querySelector("#userManagementFilterInput").value = "";
        document.querySelector("#userManagementFilterInput").dispatchEvent(new Event("input"));
    })

    updateUserManagement();
}

async function getRolePresets() {
    const presets = await (await fetch(`${stubegru.constants.BASE_URL}/modules/user_management/get_role_presets.php`)).json();
    let presetsObject = {};
    //Generate selectable role option for userEditModal's userEditRole input
    let html = `<option value="" disabled selected>Bitte wählen</option>`;
    for (const role of presets) {
        presetsObject[role.id] = role;
        html += `<option value="${role.id}" title="${role.description}">${role.name}</option>`;
    }
    $("#userEditRole").html(html);
    return presetsObject;
}

async function updateUserManagement() { //Tabelle mit den Nutzern updaten
    let tableDataList = [];

    let userList = await stubegru.modules.userUtils.getAllUsers();

    for (let userId in userList) {
        let user = userList[userId];
        let editBtn = `<button type="button" class="btn btn-primary btn-sm" onclick="showUserModal(${user.id})">
                            <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
                       </button>`;
        let deleteBtn = `&nbsp;<button class="btn btn-danger btn-sm" type="button" onclick="deleteUser(${user.id})">
                            <i class="far fa-trash-alt"></i> Löschen
                         </button>`;
        user.actionButton = editBtn + deleteBtn;
        user.roleText = rolePresets[user.role].name;
        tableDataList.push(user);
    }

    //Add table data and refresh
    userManagementListSortableTable.setData(tableDataList, null);

    //Keep sorting state consistent (the table plugin does not care about this...)
    let sort = userManagementListSortableTable._sorting;
    sort.currentCol = sort.currentCol == '' ? "id" : sort.currentCol;
    sort.dir = sort.dir == '' ? "desc" : (sort.dir == "asc" ? "desc" : "asc"); //<-- Yes, this looks ugly, but the sorting logic of this table-plugin is really crazy :D
    userManagementListSortableTable.sortData(sort.currentCol, sort.dir);
}

async function showUserModal(id) {
    if (id != 0) {
        //falls die id nicht 0 ist, wird ein bestehender Nutzer bearbeitet. Die aktuellen Nutzerdaten werden auss der DB und ins Modal eingetragen
        const userData = await stubegru.modules.userUtils.getUserInfo(id);
        $("#userEditId").val(userData.id);
        $("#userEditName").val(userData.name);
        $("#userEditMail").val(userData.mail);
        $("#userEditAccount").val(userData.account);
        $("#userEditRole").val(userData.role);
        $("#userEditBerater").val(userData.berater);
        $("#userEditTelefonnotiz").val(userData.telefonnotiz);
        $("#userEditPermissionAuthor").val(userData.autor);
        $("#userEditPasswort").val("");

        await generatePermissionToggles(userData.permissions);

        $("#userEditModal").modal("show");
    } else {
        //falls die Id 0 ist, wird ein neuer Benutzer hinzugefügt, es müssen also keine Werte vorgeladen werden.
        await generatePermissionToggles([]);
        $("#userEditModal").modal("show");
    }
}

async function generatePermissionToggles(userPermissions) {
    //Generate Permission toggles
    const permissionData = await fetch(`${stubegru.constants.BASE_URL}/modules/user_management/get_all_permissions.php`);
    let permissionList = await permissionData.json();
    let html = "";
    for (let perm of permissionList) {
        let isChecked = "";
        for (let userPerm of userPermissions) { if (userPerm.id == perm.id) { isChecked = "checked" } }
        html += `<hr style="margin:3px;"><div class="row">
                    <div class="col-xs-2">
                        <input type="checkbox" data-toggle="toggle" class="permissionsToggle" data-on="Ja" data-off="Nein" data-width="70px" data-permission-id="${perm.id}" id="permissionToggle${perm.id}" ${isChecked}>
                    </div>
                    <div class="col-xs-3">
                        <b>${perm.id}</b>
                    </div>
                    <div class="col-xs-7">
                        ${perm.description}
                    </div>
                </div>`;
    }
    $("#permissionContainer").html(html);
    $(`.permissionsToggle`).bootstrapToggle();
}

function resetUserEditForm() {
    $("#userEditId").val("0");
    $("#userEditName").val("");
    $("#userEditMail").val("");
    $("#userEditAccount").val("");
    $("#userEditRole").val("");
    $("#userEditPasswort").val("");
    $("#permissionContainer").html("");
}

function updateUser() { //Nutzerdaten speichern in DB
    let userData = {};
    userData.id = $("#userEditId").val();
    userData.name = $("#userEditName").val();
    userData.mail = $("#userEditMail").val();
    userData.account = $("#userEditAccount").val();
    userData.role = $("#userEditRole").val();

    //Permissions
    userData.permissions = [];
    $('.permissionsToggle:checkbox:checked').each(function () {
        userData.permissions.push($(this).attr("data-permission-id"));
    })

    //Nur wenn in das Passwort Input etwas eingetragen wurde, wird das Passwort geändert und gehasht in der DB gespeichert
    if ($("#userEditPasswort").val() != "") {
        userData.password = $("#userEditPasswort").val();
        userData.pwdChanged = 1;
    } else {
        userData.password = "notChanged";
        userData.pwdChanged = 0;
    }

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/user_management/update_user.php`,
        data: userData,
        success: function (json) {
            stubegru.modules.alerts.alert({
                title: "Nutzer speichern",
                text: json.message,
                type: json.status
            });
            if (json.status == "success") { $("#userEditModal").modal("hide"); }
        }
    });
}

$('#userEditRole').on('change', onRoleSelect);
//Wird aufgerufen, wenn die Rolle im Modal Dropdown geändert wird um default Berechtigungen zu setzen
function onRoleSelect() {
    const roleId = $("#userEditRole").val();
    const roleProps = rolePresets[roleId];
    if (roleProps == undefined) {
        console.error(`Selected role has id ${roleId}. But this role has no presets.`);
        return;
    }

    //Set all toggles to off
    $(`.permissionsToggle`).bootstrapToggle('off');
    //Enable all toggles where user have permission
    let rolePermissions = roleProps.permission;
    for (const permId of rolePermissions) {
        $(`#permissionToggle${permId}`).bootstrapToggle('on');
    }

}

function deleteUser(userId) {
    deleteConfirm("Nutzer löschen", "Soll der Nutzer wirklich gelöscht werden?", function () {

        $.ajax({
            type: "POST",
            dataType: "json",
            url: `${stubegru.constants.BASE_URL}/modules/user_management/delete_user.php`,
            data: { id: userId },
            success: function (json) {
                stubegru.modules.alerts.alert({
                    title: "Nutzer Gelöscht!",
                    text: json.message,
                    type: json.status,
                });
            }
        });
    });
}