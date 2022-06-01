<?php
// Dieses Script speichert Daten eines Nutzers
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION["id"];

$name = $_POST["name"];
$mail = $_POST["mail"];
$passwort = $_POST["password"];
$passwortGeaendert = $_POST["passwordChanged"];

//Passwort hashen
$passwort = password_hash($passwort, PASSWORD_DEFAULT);

if ($passwortGeaendert == "passwordChanged") {
    $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail, passwort=:passwort WHERE id=:own_id;");
    $updateStatement->bindValue(':name', $name);
    $updateStatement->bindValue(':mail', $mail);
    $updateStatement->bindValue(':passwort', $passwort);
    $updateStatement->bindValue(':own_id', $own_id);
    $updateStatement->execute();
    echo json_encode(array("status" => "success", "message" => "Nutzerdaten und Passwort wurden erfolgreich gespeichert. Bitte laden Sie die Seite einmal neu, damit die Änderungen in allen Modulen übernommen werden"));
} else { //Passwort nicht geändert
    $updateStatement = $dbPdo->prepare("UPDATE `Nutzer` SET name=:name, mail=:mail WHERE id=:own_id;");
    $updateStatement->bindValue(':name', $name);
    $updateStatement->bindValue(':mail', $mail);
    $updateStatement->bindValue(':own_id', $own_id);
    $updateStatement->execute();
    echo json_encode(array("status" => "success", "message" => "Nutzerdaten wurden erfolgreich gespeichert. Bitte laden Sie die Seite einmal neu, damit die Änderungen in allen Modulen übernommen werden"));
}


