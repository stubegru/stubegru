<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";
require_once "$BASE_PATH/utils/database_without_auth.php"; //Database access without login
require_once "$BASE_PATH/modules/mailing/mailing.php";
$MODULES_PATH = "$BASE_PATH/modules/";
$MODULE_FILE_NAME = "module.json";
$CONFIG_PATH = "$BASE_PATH/custom/";
$CONFIG_FILE_NAME = "config.json";

$cronjobList = array();

//Scan for all module's json files
$jsonList = scanForModules($MODULES_PATH);
foreach ($jsonList as $jsonPath) {
    $cstr = file_get_contents($jsonPath);
    $json = json_decode($cstr, true); // decode the JSON into an associative array
    //print_r($json);
    if (isset($json["cronjob"])) {
        foreach ($json["cronjob"] as $cronjobName) {
            $cronPath = substr($jsonPath, 0, -strlen($MODULE_FILE_NAME)) . $cronjobName;
            $cronInfo = array("name" => $cronjobName, "path" => $cronPath);
            $cronjobList[] = $cronInfo;
        }
    }
}

//scan for config file
if (file_exists($CONFIG_PATH . $CONFIG_FILE_NAME)) {
    $configContent = file_get_contents($CONFIG_PATH . $CONFIG_FILE_NAME); //WHAT if not exists????
    $configJson = json_decode($configContent, true); // decode the JSON into an associative array
    if (isset($configJson["cronjob"])) {
        foreach ($configJson["cronjob"] as $cronjobName) {
            $cronInfo = array("name" => "$cronjobName (loaded by $CONFIG_FILE_NAME)", "path" => $CONFIG_PATH . $cronjobName);
            $cronjobList[] = $cronInfo;
        }
    }
}

//Execute cronjobs
foreach ($cronjobList as $cronInfo) {
    $cronName = $cronInfo["name"];
    $cronPath = $cronInfo["path"];
    echo "<br><br>Load Cronjob: <b>$cronName</b><br>";
    require($cronPath);
}


function scanForModules($path)
{
    global $MODULE_FILE_NAME;
    $list = array();
    //echo "<br>Searching for module files in $path<br>";
    $itemsList = array_diff(scandir($path), array('..', '.')); //Scandir and remove . and .. items
    foreach ($itemsList as $itemName) {
        $newPath = $path . $itemName;
        if ($itemName == $MODULE_FILE_NAME && is_file($newPath)) {
            //echo "Found module.json in $path<br>";
            $list[] = $newPath;
        } else if (is_dir($newPath)) {
            $list = array_merge($list, scanForModules($newPath . "/"));
        }
    }
    return $list;
}
