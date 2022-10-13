<?php

// Dieses Script prüft, ob es Benachrichtigungen für den Nutzer gibt und stellt sie als JSON zur Verfügung

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
$own_id = $_SESSION['id'];

//[Aufräumen] Lösche alle Notifications, die älter als 2 Monate sind
require_once "$BASE_PATH/modules/notifications/delete_old_notifications.php";



if (isset($_POST["notificationId"])){
    $notificationId = $_POST["notificationId"]; //"all" => alle
}
else{
     echo json_encode(array("status" => "error", "message" => "Bitte eine id oder \"all\" als notificationId uebergeben"));
    exit;
}

$toReturn = array();


//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($notificationId == "all"){
    //hohle alle Benachrichtigungen
    $selectStatement = $dbPdo->prepare("SELECT notifications . * , notification_user.read FROM notifications, notification_user WHERE notifications.id = notification_user.notificationId AND notification_user.userId = :ownId ORDER BY `timestamp` DESC;");
    $selectStatement->bindValue(':ownId', $own_id);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
}
else if (is_numeric($notificationId)){
    //hohle eine spezielle Benachrichtigung
    $selectStatement = $dbPdo->prepare("SELECT notifications.* , notification_user.read FROM notifications, notification_user WHERE notifications.id=:notificationId AND notification_user.userId = :ownId LIMIT 1;");
    $selectStatement->bindValue(':ownId', $own_id);
    $selectStatement->bindValue(':notificationId', $notificationId);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
}
else{
    echo json_encode(array("status" => "error", "message" => "Bitte eine id oder \"all\" als absenceId uebergeben"));
    exit;
}

//Ungelesene Benachrichtignugnen abarbeiten
foreach ($resultList as $row) {
    //Informationen aus Benachrichtigungen Tabelle holen
    $row["notificationId"]=$row["id"];
    $row["readState"]=$row["read"];
   
    //Name des Autors aus Nutzer Tabelle holen
    $row["userName"]=getUserAttribute($row["userId"], "name");
    
    //In Rückgabearray einfügen
    $toReturn[] = $row;    
}


echo json_encode($toReturn);
