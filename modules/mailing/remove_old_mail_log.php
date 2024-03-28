<?php

$BASE_PATH = getenv("BASE_PATH");
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

//Read number of days to keep mail log (default 30 days)
$xDays = isset($constants["CUSTOM_CONFIG"]["mailLogKeepDays"]) ? $constants["CUSTOM_CONFIG"]["mailLogKeepDays"] : "30";
$someDay = date("Y-m-d", strtotime("- $xDays days"));

$deleteStatement = $dbPdo->prepare("DELETE FROM `mail_log` WHERE `timestamp` <= :someDay;");
$deleteStatement->bindValue(':someDay', $someDay);
$deleteStatement->execute();
$rowCount = $deleteStatement->rowCount() ;

echo "Alle Mails aus dem Log entfernt, die älter als <b>$xDays Tage</b> sind. ($rowCount)";
