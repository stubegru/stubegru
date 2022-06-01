<?php
// Dieses Script speichert einen neuen Nutzer oder speichert die Änderungen eines bestehenden Nutzers
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("admin");
$erfasser = $_SESSION["id"];
$erstellungsdatum = date("d.m.Y");

$id = $_POST["id"];
$name = $_POST["name"];
$mail = $_POST["mail"];
$account = $_POST["account"];
$role = $_POST["role"];
$passwort = $_POST["passwort"];
$passwortGeaendert = $_POST["passwortGeaendert"];
$permissions = isset($_POST["permissions"]) ? $_POST["permissions"] : array();

//Passwort hashen
$hashedPassword = password_hash($passwort, PASSWORD_DEFAULT);

if ($id == 0) { //Neuer Nutzer

    //Prüfen, ob bereits ein Account mit diesem username existiert
    $testStatement = $dbPdo->prepare("SELECT * from `Nutzer` WHERE account=:account;");
    $testStatement->bindValue(':account', $account);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        echo json_encode(array("status" => "error", "message" => "Es exisitert bereits ein Account mit dem Nutzernamen '$account'. Für einen neuen Account bitte einen anderen Nutzernamen wählen."));
        exit;
    }

    //Benachrichtigungsvoreinstellungen aus Db hohlen
    $selectStatement = $dbPdo->prepare("SELECT * from `Rollen` WHERE id=:role;");
    $selectStatement->bindValue(':role', $role);
    $selectStatement->execute();
    $result = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    //Daten abarbeiten
    foreach ($result as $row) {
        $notification_reminder = $row["notification_reminder"];
        $notification_report = $row["notification_report"];
        $notification_article = $row["notification_article"];
        $notification_news = $row["notification_news"];
        $notification_absence = $row["notification_absence"];
        $notification_error = $row["notification_error"];
    }

    $insertStatement = $dbPdo->prepare("INSERT INTO `Nutzer` (`name`,`mail`,`account`,`role`,`erfassungsdatum`,`erfasser`,`passwort`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error`) VALUES (:name,:mail,:account,:role,:erstellungsdatum,:erfasser,:hashedPassword,:notification_reminder,:notification_report,:notification_article,:notification_news,:notification_absence,:notification_error);");
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':mail', $mail);
    $insertStatement->bindValue(':account', $account);
    $insertStatement->bindValue(':role', $role);
    $insertStatement->bindValue(':erstellungsdatum', $erstellungsdatum);
    $insertStatement->bindValue(':erfasser', $erfasser);
    $insertStatement->bindValue(':hashedPassword', $hashedPassword);
    $insertStatement->bindValue(':notification_reminder', $notification_reminder);
    $insertStatement->bindValue(':notification_report', $notification_report);
    $insertStatement->bindValue(':notification_article', $notification_article);
    $insertStatement->bindValue(':notification_news', $notification_news);
    $insertStatement->bindValue(':notification_absence', $notification_absence);
    $insertStatement->bindValue(':notification_error', $notification_error);
    $insertStatement->execute();
    $id = $dbPdo->lastInsertId();
    set_permissions($id, $permissions);
    echo json_encode(array("status" => "success", "message" => "Neuer Nutzer $name wurde erfolgreich angelegt.", "id" => $id));
} else if ($id > 0) { //Bereits registrierter Nutzer

    if ($passwortGeaendert == "pwdChanged") {
        $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail, account=:account, role=:role,  passwort=:hashedPassword WHERE id=:id;");
        $updateStatement->bindValue(':name', $name);
        $updateStatement->bindValue(':mail', $mail);
        $updateStatement->bindValue(':account', $account);
        $updateStatement->bindValue(':role', $role);
        $updateStatement->bindValue(':hashedPassword', $hashedPassword);
        $updateStatement->bindValue(':id', $id);
        $updateStatement->execute();
    } else { //Passwort nicht geändert
        $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail, account=:account, role=:role WHERE id=:id;");
        $updateStatement->bindValue(':name', $name);
        $updateStatement->bindValue(':mail', $mail);
        $updateStatement->bindValue(':account', $account);
        $updateStatement->bindValue(':role', $role);
        $updateStatement->bindValue(':id', $id);
        $updateStatement->execute();
    }

    set_permissions($id, $permissions);

    echo json_encode(array("status" => "success", "message" => "Nutzerdaten wurden erfolgreich gespeichert."));
}

function set_permissions($userId, $permissions)
{
    global $dbPdo;
    //Delete all existing permission links
    $deleteStatement = $dbPdo->prepare("DELETE FROM `Link_Nutzer_Rechte` WHERE `userId` = :userId;");
    $deleteStatement->bindValue(':userId', $userId);
    $deleteStatement->execute();

    //set new permission links
    $insertStatement = $dbPdo->prepare("INSERT INTO `Link_Nutzer_Rechte`(`userId`, `permissionId`) VALUES (:userId,:permissionId);");

    foreach ($permissions as $perm) {
        $insertStatement->bindValue(':userId', $userId);
        $insertStatement->bindValue(':permissionId', $perm);
        $insertStatement->execute();
    }
}
