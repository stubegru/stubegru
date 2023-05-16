<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php";
require_once "$BASE_PATH/utils/permission_request.php";

$permissionRequest = $_GET["permissionRequest"];
permissionRequest($permissionRequest); //Exit with status 401 if NOT fulfilled

echo json_encode(array("status" => "success", "message" => "permissionRequest $permissionRequest is fulfilled", "permissionRequest" => $permissionRequest));

