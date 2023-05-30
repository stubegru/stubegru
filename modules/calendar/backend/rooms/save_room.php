<?php
// Dieses Script speichert einen neuen Eintrag für einen Raum
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_WRITE");
$ownUserId = $_SESSION['id'];

$raumId = $_POST["id"];
$kanal = $_POST["kanal"];
$titel = $_POST["titel"];
$raumnummer = $_POST["raumnummer"];
$etage = $_POST["etage"];
$strasse = $_POST["strasse"];
$hausnummer = $_POST["hausnummer"];
$plz = $_POST["plz"];
$ort = $_POST["ort"];
$link = $_POST["link"];
$passwort = $_POST["passwort"];
$telefon = $_POST["telefon"];

if ($raumId == "new") {
    //Neuer Raum
    $insertStatement = $dbPdo->prepare("INSERT INTO `Raeume` (`kanal`, `titel`, `besitzer`, `raumnummer`, `strasse`, `hausnummer`, `plz`, `ort`, `etage`, `link`, `passwort`, `telefon`) VALUES (:kanal,:titel,:besitzer,:raumnummer,:strasse,:hausnummer,:plz,:ort,:etage,:link,:passwort,:telefon);");
    $insertStatement->bindValue(':kanal', $kanal);
    $insertStatement->bindValue(':titel', $titel);
    $insertStatement->bindValue(':besitzer', $ownUserId);
    $insertStatement->bindValue(':raumnummer', $raumnummer);
    $insertStatement->bindValue(':strasse', $strasse);
    $insertStatement->bindValue(':hausnummer', $hausnummer);
    $insertStatement->bindValue(':plz', $plz);
    $insertStatement->bindValue(':ort', $ort);
    $insertStatement->bindValue(':etage', $etage);
    $insertStatement->bindValue(':link', $link);
    $insertStatement->bindValue(':passwort', $passwort);
    $insertStatement->bindValue(':telefon', $telefon);
    $insertStatement->execute();
    $raumId = $dbPdo->lastInsertId();   // Id des neuen Raums ermitteln
} else {
    //Bestehenden Raum bearbeiten
    $updateStatement = $dbPdo->prepare("UPDATE `Raeume` SET `kanal`=:kanal, `titel`=:titel,`raumnummer`=:raumnummer,`strasse`=:strasse,`hausnummer`=:hausnummer,`plz`=:plz,`ort`=:ort,`etage`=:etage,`link`=:link, `passwort`=:passwort, `telefon`=:telefon WHERE id=:raumId;");
    $updateStatement->bindValue(':kanal', $kanal);
    $updateStatement->bindValue(':titel', $titel);
    $updateStatement->bindValue(':raumnummer', $raumnummer);
    $updateStatement->bindValue(':strasse', $strasse);
    $updateStatement->bindValue(':hausnummer', $hausnummer);
    $updateStatement->bindValue(':plz', $plz);
    $updateStatement->bindValue(':ort', $ort);
    $updateStatement->bindValue(':etage', $etage);
    $updateStatement->bindValue(':link', $link);
    $updateStatement->bindValue(':passwort', $passwort);
    $updateStatement->bindValue(':telefon', $telefon);
    $updateStatement->bindValue(':raumId', $raumId);
    $updateStatement->execute();
}

echo json_encode(array("status" => "success", "message" => "Speichern erfolgreich.", "roomId" => $raumId));
