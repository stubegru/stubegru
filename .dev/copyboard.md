# Copyboard for some sample code
# ------------------------------PHP------------------------------

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$loggedInUserId = $_SESSION["id"];

require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permissionRequest("perm_id");

require_once "$BASE_PATH/modules/user_utils/user_utils.php";
getUserName($userId);

require_once "$BASE_PATH/modules/notifications/notification_system.php";

$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

echo json_encode(array("status" => "success", "message" => "..."));




# ------------------------------JS------------------------------

## --- AJAX TEMPLATE ---
$.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/MODULE_NAME/PHP_NAME.php`,
        success: function (data) {
            
        }
});

## --- LINK TO WIKI ARTICLE ---
let link = `${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${ARTICLE_ID}`

## --- SWEETALERT TEMPLATE ---
stubegru.modules.alerts.alert({
    title: "Termin konnte nicht gespeichert werden",
    text: meetingResp.message,
    type: "error",
    mode: "alert"
});

## --- ADD MENU ENTRY ---
stubegru.modules.menubar.addItem("secondary primary", `<li><a title="TITLE" href="${stubegru.constants.BASE_URL}/LINK_LOCATION"><i class="FONT_AWESOME_ICON"></i>&nbsp;DISPLAY_TEXT</a></li>`, PRIORITY);

## --- register funtion if the modal is closed ---
$('#modalID').on('hidden.bs.modal', functionToCall);




# ------------------------------HTML------------------------------

## --- ADD SCRIPT IN MODULE.HTML --- 
<script src="modules/MODULE_NAME/SCRIPT_NAME.js"></script>

## --- USE MODULE IN VIEW ---
<stubegruModule data-name="VIEW_NAME"></stubegruModule>



