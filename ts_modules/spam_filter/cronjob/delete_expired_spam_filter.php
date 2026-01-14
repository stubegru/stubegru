<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/cronjob/block_webserver_calls.php";

$deleteStatement = $dbPdo->query("DELETE FROM spam_filter WHERE expires < NOW()");
$numberOfRows = $deleteStatement->rowCount();
echo ("Abgelaufene Spam Filter wurden gelöscht ($numberOfRows)");