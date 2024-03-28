<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("EXECUTE_CRONJOB");

//Execute Cronjob
require_once "$BASE_PATH/modules/cronjob/cronjob.php";
