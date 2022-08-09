<?php

// Dieses Script generiert html Text für die Abwesenheitseinträge | Erst die Aktuellen, dann die Bevorstehenden



require("connect.php");
require("functions.php");
$user=$_SESSION["id"];
$now=date("Y-m-d");

if (isset($_POST["absenceId"])){
    $absenceId = $_POST["absenceId"]; //"all" => alle
}
else{
     echo json_encode(array("state" => "error", "message" => "Bitte eine id oder \"all\" als absenceId uebergeben"));
    exit;
}


mysqli_query($mysqli, "DELETE FROM `Abwesenheit` WHERE enddate < '$now' ;"); //Lösche alle abgelaufenen abwesenheiten

$toReturn = array();

//Prüfen, ob alle oder ein bestimmter Datensatz geholt werden soll
if ($absenceId == "all"){
    $result=mysqli_query($mysqli, "SELECT * FROM `Abwesenheit` ORDER BY startdate ASC;");
}
else if (is_numeric($absenceId)){
    $result=mysqli_query($mysqli, "SELECT * FROM `Abwesenheit` WHERE id = '$absenceId' ORDER BY startdate ASC;");
}
else{
    echo json_encode(array("state" => "error", "message" => "Bitte eine id oder \"all\" als absenceId uebergeben"));
    exit;
}

//Daten abarbeiten
while($row=mysqli_fetch_object($result)){
    $tempArray = array();
	$tempArray["id"]=$row->id;
    $tempArray["name"]=$row->name;
    $tempArray["notice"]=$row->notice;
    $tempArray["startdate"]=$row->startdate;
    $tempArray["enddate"]=$row->enddate;
    $toReturn[] = $tempArray;
}

echo json_encode($toReturn);
?>
