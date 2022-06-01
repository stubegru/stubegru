<?php
// Dieses Script löscht alle alten Notifications und Verknüpfungen zu diesen Notifications
// Dieses Script wird von get_notifcations regelmäßig aufgerufen

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$time = strtotime("-2 month", time());
$delete_before = date("Y-m-d", $time);

//Lösche Benachrichtigungsverknüpfungen
$dbPdo->query("DELETE FROM `Link_Benachrichtigungen_Nutzer` WHERE `Link_Benachrichtigungen_Nutzer`.`notificationId` IN (SELECT id FROM `Benachrichtigungen` WHERE `timestamp` < '$delete_before')");
//Lösche Benachrichtigungen
$dbPdo->query("DELETE FROM `Benachrichtigungen` WHERE `timestamp` < '$delete_before'");
//Lösche Benachrichtigungen, die vonn jedem Nutzer entfernt wurden
$dbPdo->query("DELETE FROM `Benachrichtigungen` WHERE `id` NOT IN (SELECT Link_Benachrichtigungen_Nutzer.notificationId from Link_Benachrichtigungen_Nutzer);");
