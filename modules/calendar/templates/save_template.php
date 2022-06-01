<?php

// Dieses Script speichert einen neuen Eintrag für ien Template oder speichert ein bearbeitetes Template

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");
$uebergabe=($_POST["get_Data"]);

$titel=$uebergabe[0];
$betreff=$uebergabe[1];
$text=$uebergabe[2];
$id=$uebergabe[3];


if ($titel != "" && $betreff != "" && $text != ""){
    
    $echoArray = array();
    $echoArray["status"]="success";

    if ($id=="new"){ //Neue vorlage
            $insertStatement = $dbPdo->prepare("INSERT INTO `Templates` (`titel`,`betreff`,`text`) VALUES (:titel,:titel,:text);");
            $insertStatement->bindValue(':titel', $titel);
            $insertStatement->bindValue(':titel', $titel);
            $insertStatement->bindValue(':text', $text);
            $insertStatement->execute();
            // Id des neuen Eintrags ermitteln
            $id = $dbPdo->lastInsertId();
    }
    else{ //Vorlage bearbeiten
        $updateStatement = $dbPdo->prepare("UPDATE `Templates` SET titel=:titel, betreff=:betreff, text=:text WHERE id=:id;");
        $updateStatement->bindValue(':titel', $titel);
        $updateStatement->bindValue(':betreff', $betreff);
        $updateStatement->bindValue(':text', $text);
        $updateStatement->bindValue(':id', $id);
        $updateStatement->execute();
       
    }
    
    $echoArray["message"] = "Speichern erfolgreich."; 
    $echoArray["optionId"] = $id;
}

else{
    $echoArray["status"] = "error";
    $echoArray["message"] = "Bitte Titel, Betreff und Mailtext angeben angeben";
}

echo json_encode($echoArray);

?>