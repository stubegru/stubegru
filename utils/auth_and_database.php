<?php
/**
 * Require this script if database access is neccessary
 * 
 * This script will also check if the user is logged in 
 * This makes sense in most use cases of database connection
 * If there's a sensible reason to use database connectivity withouth basic user authorisation, you could use the database_without_auth.php script instead
 */


$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/authorization.php"; //Check if user is logged in
require_once "$BASE_PATH/utils/database_without_auth.php"; //Provide database access
require_once "$BASE_PATH/utils/permission_request.php"; //Provide permissionRequest function
