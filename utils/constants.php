<?php
//This script returns widely used constants.
//If the INCLUDED_IN_SCRIPT flag is set it will just make the $constants available
//If the INCLUDED_IN_SCRIPT flag is NOT set it will echo the $constants as stringified json object
//Set the INCLUDED_IN_SCRIPT flag by calling $INCLUDED_IN_SCRIPT = true; before including this script

$BASE_URL = getenv("BASE_URL");
$BASE_PATH = getenv("BASE_PATH");
$APPLICATION_ID = getenv("APPLICATION_ID");


$APPLICATION_VERSION = "NOVERSION";
if (file_exists("$BASE_PATH/.version")) {
    $APPLICATION_VERSION = file_get_contents("$BASE_PATH/.version");
}

$CUSTOM_CONFIG = array();
if (file_exists("$BASE_PATH/custom/config.json")) {
    $configJson = file_get_contents("$BASE_PATH/custom/config.json");
    $CUSTOM_CONFIG = json_decode($configJson,true);
}

$constants = array();
$constants["BASE_URL"] = $BASE_URL;
$constants["BASE_PATH"] = $BASE_PATH;
$constants["APPLICATION_ID"] = $APPLICATION_ID;

$constants["APPLICATION_VERSION"] = $APPLICATION_VERSION;
$constants["CUSTOM_CONFIG"] = $CUSTOM_CONFIG;

$constants["all"] = "all";
$constants["currentUser"] = "currentUser";
$constants["read"] = "read";
$constants["unread"] = "unread";
$constants["all_read"] = "all_read";
$constants["error"] = "error";
$constants["success"] = "success";
$constants["reminder"] = "reminder";
$constants["report"] = "report";
$constants["article"] = "article";
$constants["news"] = "news";
$constants["absence"] = "absence";
$constants["new"] = "new";
$constants["update"] = "update";
$constants["delete"] = "delete";
$constants["info"] = "info";
$constants["notification_mail"] = 2;
$constants["notification_online"] = 1;
$constants["notification_both"] = 3;
$constants["notification_none"] = 0;
$constants["nobody"] = 0;

if (isset($INCLUDED_IN_SCRIPT) && $INCLUDED_IN_SCRIPT == true) {
    //This script was called with include (or require) by another script
} else {
    //This script was called directly by client (e.g via ajax)
    echo json_encode($constants);
}
