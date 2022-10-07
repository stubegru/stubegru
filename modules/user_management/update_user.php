<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_management/update_user_helper.php";
permissionRequest("USER_WRITE");
$erfasser = $_SESSION["id"];
$erstellungsdatum = date("d.m.Y");

$id = $_POST["id"];
$name = $_POST["name"];
$mail = $_POST["mail"];
$account = $_POST["account"];
$role = $_POST["role"];
$password = $_POST["password"];
$pwdChanged = $_POST["pwdChanged"]; // 0 or 1
$permissions = isset($_POST["permissions"]) ? $_POST["permissions"] : array();

//Passwort hashen
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

if ($id == 0) { //Neuer Nutzer

    checkIfUsernameExists($account);

    $insertStatement = $dbPdo->prepare("INSERT INTO `Nutzer` (`name`,`mail`,`account`,`role`,`erfassungsdatum`,`erfasser`,`passwort`) VALUES (:name,:mail,:account,:role,:erstellungsdatum,:erfasser,:hashedPassword);");
    $insertStatement->bindValue(':name', $name);
    $insertStatement->bindValue(':mail', $mail);
    $insertStatement->bindValue(':account', $account);
    $insertStatement->bindValue(':role', $role);
    $insertStatement->bindValue(':erstellungsdatum', $erstellungsdatum);
    $insertStatement->bindValue(':erfasser', $erfasser);
    $insertStatement->bindValue(':hashedPassword', $hashedPassword);
    $insertStatement->execute();
    $id = $dbPdo->lastInsertId();

    setRolePresetNotifications($id, $role);
    setPermissions($id, $permissions);

    echo json_encode(array("status" => "success", "message" => "Neuer Nutzer $name wurde erfolgreich angelegt.", "id" => $id));
} else if ($id > 0) { //Update user not create

    if ($pwdChanged == "1") {
        $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail, account=:account, role=:role,  passwort=:hashedPassword WHERE id=:id;");
        $updateStatement->bindValue(':hashedPassword', $hashedPassword);
    } else { //Password not changed
        $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail, account=:account, role=:role WHERE id=:id;");
    }
    $updateStatement->bindValue(':name', $name);
    $updateStatement->bindValue(':mail', $mail);
    $updateStatement->bindValue(':account', $account);
    $updateStatement->bindValue(':role', $role);
    $updateStatement->bindValue(':id', $id);
    $updateStatement->execute();

    setPermissions($id, $permissions);

    echo json_encode(array("status" => "success", "message" => "Nutzerdaten wurden erfolgreich gespeichert."));
}
