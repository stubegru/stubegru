<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("EXECUTE_CRONJOB");

//Execute Cronjob
$ALLOW_CALLS_FROM_WEBSERVER = true;
require_once "$BASE_PATH/modules/cronjob/cronjob.php";
