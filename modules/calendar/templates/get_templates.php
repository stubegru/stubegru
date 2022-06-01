<?php

// Dieses Script gibt html text für das mail_template dropdown zurück


$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];



$selectStatement = $dbPdo->prepare("SELECT * FROM `Templates`;");
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $titel=$row["titel"];
	$id=$row["id"];
    $text=$row["text"];
    echo "<option value='$id' title='$text' id='templateSelectOption$id'>$titel</option>";
}


?>