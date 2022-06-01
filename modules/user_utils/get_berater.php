<?php

// Dieses Script gibt html Text für das Berater Dropown zurück | der eigenen Name wird oben angezeigt
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];
$berater_permission = "beratung";

//Get the own id first
$selectStatement = $dbPdo->prepare("SELECT Nutzer.name, Nutzer.id FROM Nutzer, Rechte, Link_Nutzer_Rechte WHERE Nutzer.id = Link_Nutzer_Rechte.userId AND Rechte.id = Link_Nutzer_Rechte.permissionId AND Rechte.id = ':berater_permission' AND Nutzer.id = ':own_id';");
$selectStatement->bindValue(':berater_permission', $berater_permission);
$selectStatement->bindValue(':own_id', $own_id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
	$name = $row["name"];
    $id = $row["id"];
    echo '<option value="' . $id . '"> ' . $name . '</option>';
	echo '<option disabled="disabled">----</option>';
}

$selectStatement = $dbPdo->prepare("SELECT Nutzer.name, Nutzer.id FROM Nutzer, Rechte, Link_Nutzer_Rechte WHERE Nutzer.id = Link_Nutzer_Rechte.userId AND Rechte.id = Link_Nutzer_Rechte.permissionId AND Rechte.id = ':berater_permission';");
$selectStatement->bindValue(':berater_permission', $berater_permission);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
	$name = $row["name"];
    $id = $row["id"];
    echo '<option value="' . $id . '"> ' . $name . '</option>';
}

?>