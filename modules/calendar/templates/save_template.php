<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("MEETINGS_WRITE");
$ownId = $_SESSION["id"];

$titel = $_POST["title"];
$betreff = $_POST["subject"];
$text = $_POST["text"];
$id = $_POST["templateId"];


if ($titel != "" && $betreff != "" && $text != "") {

    $echoArray = array();
    $echoArray["status"] = "success";

    if ($id == "new") { //Neue vorlage
        $insertStatement = $dbPdo->prepare("INSERT INTO `Templates` (`titel`,`betreff`,`text`,`ersteller`) VALUES (:titel,:titel,:text,:ersteller);");
        $insertStatement->bindValue(':titel', $titel);
        $insertStatement->bindValue(':titel', $titel);
        $insertStatement->bindValue(':text', $text);
        $insertStatement->bindValue(':ersteller', $ownId);
        $insertStatement->execute();
        // Id des neuen Eintrags ermitteln
        $id = $dbPdo->lastInsertId();
        $echoArray["message"] = "Mailvorlage wurde erfolgreich erstellt";
    } else { //Vorlage bearbeiten
        $updateStatement = $dbPdo->prepare("UPDATE `Templates` SET titel=:titel, betreff=:betreff, text=:text WHERE id=:id;");
        $updateStatement->bindValue(':titel', $titel);
        $updateStatement->bindValue(':betreff', $betreff);
        $updateStatement->bindValue(':text', $text);
        $updateStatement->bindValue(':id', $id);
        $updateStatement->execute();
        $echoArray["message"] = "Mailvorlage wurde erfolgreich gespeichert";
    }

    $echoArray["optionId"] = $id;
} else {
    $echoArray["status"] = "error";
    $echoArray["message"] = "Bitte Titel, Betreff und Mailtext angeben angeben";
}

echo json_encode($echoArray);
