<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

$updateStatement = $dbPdo->query("UPDATE `Termine` SET blocked = '0'");

echo ("Alle Termine wurden wieder zur Vergabe freigegeben.");
