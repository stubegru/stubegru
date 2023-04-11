<?php
//Converts old user table to new user table and inserts the additional info from the old user table to the new independent tables.

//Verbindung zur alten DB
$server = getenv("DB_SERVER_OLD");
$user = getenv("DB_USER_OLD");
$password = getenv("DB_PASSWORD_OLD");
$database = getenv("DB_NAME_OLD");

$oldDB = new PDO("mysql:host=$server;dbname=$database", $user, $password);


//Verbindung zur neuen DB
$server = getenv("DB_SERVER");
$user = getenv("DB_USER");
$password = getenv("DB_PASSWORD");
$database = getenv("DB_NAME");

$newDB = new PDO("mysql:host=$server;dbname=$database", $user, $password);

//User tabelle aus alten DB auslesen
$selectStatement = $oldDB->prepare("SELECT * FROM `Nutzer`");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {

    $id = $row["id"];
    $name = $row["name"];
    $mail = $row["mail"];
    $account = $row["account"];
    $role = $row["role"];
    $erfassungsdatum = $row["erfassungsdatum"];
    $erfasser = $row["erfasser"];
    $passwort = $row["passwort"];
    $notification_reminder = $row["notification_reminder"];
    $notification_report = $row["notification_report"];
    $notification_article = $row["notification_article"];
    $notification_news = $row["notification_news"];
    $notification_absence = $row["notification_absence"];
    $notification_error = $row["notification_error"];

    //set new role id
    $role = $role - 1;

    //Daten in neue Nutzertabelle eintragen
    $insertStatement = $newDB->prepare("INSERT INTO `Nutzer` (`id`,`name`,`mail`,`account`,`role`,`erfassungsdatum`,`erfasser`,`passwort`) VALUES (:id,:name,:mail,:account,:role,:erfassungsdatum,:erfasser,:passwort);");
    $insertStatement->bindValue(':id', $id);
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':mail', $mail);
    $insertStatement->bindValue(':account', $account);
    $insertStatement->bindValue(':role', $role);
    $insertStatement->bindValue(':erfassungsdatum', $erfassungsdatum);
    $insertStatement->bindValue(':erfasser', $erfasser);
    $insertStatement->bindValue(':passwort', $passwort);
    $insertStatement->execute();

    $userId = $newDB->lastInsertId();
    echo "Nutzer <b>$name</b> mit id <b>$userId</b> in neue Nutzer Tabelle eingefügt.<br>";


    $notificationTypeList = array(
        array("name" => "reminder", "value" => $notification_reminder),
        array("name" => "report", "value" => $notification_report),
        array("name" => "article", "value" => $notification_article),
        array("name" => "news", "value" => $notification_news),
        array("name" => "absence", "value" => $notification_absence),
        array("name" => "error", "value" => $notification_error)
    );

    $insertStatement = $newDB->prepare("INSERT INTO `notification_type_user`(`userId`, `notificationType`, `online`, `mail`) VALUES (:id,:notificationType,:online,:mail);");


    foreach ($notificationTypeList as $t) {


        //Notification Abos in neue Tabelle einfügen
        // 0 = nichts
        // 1 = nur Online
        // 2 = nur Mail
        // 3 = Online + Mail

        $isOnline = 0;
        if ($t["value"] == 1 || $t["value"] == 3) {
            $isOnline = 1;
        }
        $isMail = 0;
        if ($t["value"] == 2 || $t["value"] == 3) {
            $isMail = 1;
        }
        $notificationType = $t["name"];

        $insertStatement->bindValue(':id', $id);
        $insertStatement->bindValue(':notificationType', $notificationType);
        $insertStatement->bindValue(':online', $isOnline);
        $insertStatement->bindValue(':mail', $isMail);
        $insertStatement->execute();

        echo "Nutzer <b>$name</b> hat für die notification $notificationType folgende Werte: Online: <b>$isOnline</b> Mail: <b>$isMail</b>.<br>";
    }
}




//Daten aufteilen
//Neue Nutzertabelle füllen
//Andere Tabellen füllen
