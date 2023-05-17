<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php";
require_once "$BASE_PATH/utils/permission_request.php";

$permissionRequest = $_GET["permissionRequest"];
$result = permissionRequestWithoutExit($permissionRequest);

echo json_encode($result);

