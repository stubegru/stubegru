<?php

// Dieses Script gibt alle Termine in einem großen JSON Array zurück


$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION['id'];

$uebergabe=($_POST["get_Data"]);

$dateId = $uebergabe[0];


$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE `id` = :dateId ORDER BY date, start;");
$selectStatement->bindValue(':dateId', $dateId);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
$finalArray = array();

foreach ($resultList as $row) {
    $tempRowArray = array();
    $teilnehmerDaten = array();
    
	$teilnehmer = $row["teilnehmer"];
    
    if ($teilnehmer != "") { //Falls termin schon vergeben hole Daten aus DB
    
        $teilnehmer = explode("-",$teilnehmer);
    
   
    
        for ($i=0; $i<count($teilnehmer); $i++){
            $tempArray = array();
            $selectStatement = $dbPdo->prepare("SELECT * FROM `Beratene` WHERE id=:teilnehmer;");
            $selectStatement->bindValue(':teilnehmer', $teilnehmer[$i]);
            $selectStatement->execute();
            $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

            foreach ($resultList as $row2) {
                $tempArray["name"] = $row2["name"];
                $tempArray["gender"] = $row2["gender"];
                $tempArray["channel"] = $row2["channel"];
                if ($own_id == $row->ownerId){ //Alle Daten außer Name des zu Beratenden werden nur dem Terminbesitzer angezeigt - Datenschutz!!!
                    $tempArray["mail"] = $row2["mail"];
                    $tempArray["phone"] = $row2["phone"];
                    $tempArray["formular"] = $row2["formular"];
                    $tempArray["anliegen"] = $row2["description"];
                }
            
                $teilnehmerDaten[] = $tempArray;
            }
        }
        $tempRowArray["teilnehmer"] = $teilnehmerDaten;
    }
    else{
        $tempRowArray["teilnehmer"] = "";
    }
    
    $tempRowArray["id"] = $row["id"];
    $tempRowArray["date"] = $row["date"];
    $tempRowArray["owner"] = $row["owner"];
    $tempRowArray["ownerId"] = $row["ownerId"];
    $tempRowArray["free"] = $row["free"];
    $tempRowArray["room"] = $row["room"];
    $tempRowArray["start"] = $row["start"];
    $tempRowArray["end"] = $row["end"];
    $tempRowArray["title"] = $row["title"];
    $tempRowArray["template"] = $row["template"];
    $tempRowArray["blocked"] = $row["blocked"];
    $tempRowArray["channel"] = $row["channel"];
   
    
    $finalArray[] = $tempRowArray;
}




echo json_encode($finalArray);



?>