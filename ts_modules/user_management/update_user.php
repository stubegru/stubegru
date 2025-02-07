<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/ts_modules/user_management/update_user_helper.php";
permissionRequest("USER_WRITE");

$id = $_POST["id"];
$name = $_POST["name"];
$mail = $_POST["mail"];
$account = $_POST["account"];
$role = $_POST["role"];
$password = $_POST["password"];
$pwdChanged = $_POST["pwdChanged"];
$permissions = isset($_POST["permissions"]) ? explode(',', $_POST["permissions"]) : array();

//Passwort hashen
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);


if ($pwdChanged == "true") {
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

setPermissions($id, $permissions); //see update_user_helper.php

echo json_encode(array("status" => "success", "message" => "Nutzerdaten wurden erfolgreich gespeichert."));
