<?php

// Dieses Script gibt html text für das Dropdown zur Auswahl der Räume zurück | Der eigenen Raum steht ganz oben

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];

$kanalBeschreibungen = array("personally" => "Persönlich", "phone" => "Telefon", "webmeeting" => "Webmeeting");

//Get the own id first
$selectStatement = $dbPdo->prepare("SELECT `titel`,`id`,`kanal` FROM `Raeume` WHERE `aktiv`='1' AND `besitzer`=:own_id;");
$selectStatement->bindValue(':own_id', $own_id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $titel = $row["titel"];
    $kanal = $row["kanal"];
    $id = $row["id"];
    echo "<option value='$id' id='roomSelectOption$id' data-channel='$kanal' >[" . $kanalBeschreibungen[$kanal] . "] $titel</option>";	
}

echo "<option disabled='disabled'>----</option>";

$selectStatement = $dbPdo->prepare("SELECT `titel`,`id`,`kanal` FROM `Raeume` WHERE `aktiv`='1';");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $titel = $row["titel"];
    $kanal = $row["kanal"];
    $id = $row["id"];
    echo "<option value='$id' id='roomSelectOption$id' data-channel='$kanal' >[" . $kanalBeschreibungen[$kanal] . "] $titel</option>";
}
