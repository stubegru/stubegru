<?php
// Dieses Script löscht alle alten Notifications und Verknüpfungen zu diesen Notifications
// Dieses Script wird von get_notifcations regelmäßig aufgerufen

$BASE_PATH = getenv("BASE_PATH");
$time = strtotime("-2 month", time());
$delete_before = date("Y-m-d", $time);

//Lösche Benachrichtigungsverknüpfungen
$dbPdo->query("DELETE FROM `notification_user` WHERE `notification_user`.`notificationId` IN (SELECT id FROM `notifications` WHERE `timestamp` < '$delete_before')");
//Lösche Benachrichtigungen
$dbPdo->query("DELETE FROM `notifications` WHERE `timestamp` < '$delete_before'");
//Lösche Benachrichtigungen, die vonn jedem Nutzer entfernt wurden
$dbPdo->query("DELETE FROM `notifications` WHERE `id` NOT IN (SELECT notification_user.notificationId from notification_user);");

echo "Deleted all notifications that were older than $delete_before";
