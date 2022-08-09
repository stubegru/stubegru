<?php

// Dieses Script löscht ein abwesenheitseintrag

require("connect_admin.php");
require("notification_system.php");
$own_id = $_SESSION['id'];

$id=$_POST["id"];

$ergebnis=mysqli_query($mysqli, "SELECT * FROM `Abwesenheit` WHERE `id`='$id';");
while($row = mysqli_fetch_object($ergebnis)) {   
    $name=$row->name;
    $notice=$row->notice;
    $startdate=$row->startdate;
    $enddate=$row->enddate;
    
    if($startdate != $enddate){
        $timeSpan = "Vom " . changeDateOrder($startdate,"-")  . " bis " . changeDateOrder($enddate,"-");
    }
    else{
        $timeSpan = "Am " . changeDateOrder($startdate,"-"); 
    }
   
    //Notification versenden
    newNotification($constants["absence"],$own_id,$name,$notice,$timeSpan,$own_id,$constants["delete"]);  

    mysqli_query($mysqli, "DELETE FROM Abwesenheit WHERE id=$id;");

    echo json_encode(array("state" => "success", "message" => "Eintrag gelöscht!"));
    
}

?>