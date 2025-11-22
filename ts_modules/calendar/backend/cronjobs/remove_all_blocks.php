<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

$deleteStatement = $dbPdo->query("DELETE FROM `meeting_blocks`");

echo ("Alle Termine wurden wieder zur Vergabe freigegeben.");
