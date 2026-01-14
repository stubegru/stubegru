<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

$keepLogDays = isset($constants["CUSTOM_CONFIG"]["selfServiceKeepLogDays"]) ? $constants["CUSTOM_CONFIG"]["selfServiceKeepLogDays"] : 30;
$deleteStatement = $dbPdo->prepare("DELETE FROM self_service_log WHERE created < NOW() - INTERVAL :keepLogDays DAY");
$deleteStatement->bindValue(':keepLogDays', $keepLogDays);
$deleteStatement->execute();
$numberOfRows = $deleteStatement->rowCount();
echo ("Self-Service Logs (älter als $keepLogDays Tage) wurden gelöscht ($numberOfRows)");