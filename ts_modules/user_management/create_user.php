<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/ts_modules/user_management/update_user_helper.php";
permissionRequest("USER_WRITE");
$erfasser = $_SESSION["id"];
$erstellungsdatum = date("d.m.Y");

$name = $_POST["name"];
$mail = $_POST["mail"];
$account = $_POST["account"];
$role = $_POST["role"];
$password = $_POST["password"];
$permissions = isset($_POST["permissions"]) ? explode(',', $_POST["permissions"]) : array();

//Passwort hashen
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

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

setRolePresetNotifications($id, $role); //see update_user_helper.php
setPermissions($id, $permissions);      //see update_user_helper.php

echo json_encode(array("status" => "success", "message" => "Neuer Nutzer $name wurde erfolgreich angelegt.", "id" => $id));
