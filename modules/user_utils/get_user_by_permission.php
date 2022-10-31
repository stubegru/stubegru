<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$permissionRequest = $_GET["permissionRequest"];

//get all permissions required for this permissionRequest
$selectStatement = $dbPdo->prepare("SELECT permissionId FROM permission_requests WHERE `name` = :permissionRequest");
$selectStatement->bindValue(':permissionRequest', $permissionRequest);
$selectStatement->execute();
$permissionList = $selectStatement->fetchAll(PDO::FETCH_COLUMN);

if(count($permissionList) <= 0){
    echo json_encode(array("status" => "error", "message" => "No permissionRequest found with name $permissionRequest"));
    exit;
}

$complexQuery = "SELECT Nutzer.name, Nutzer.id, Nutzer.mail, Nutzer.account FROM Nutzer WHERE";
//build "AND-statement" for each required permission
foreach($permissionList as $index => $permission){
    if($index > 0){
        $complexQuery .= " AND";
    }
    $complexQuery .= " Nutzer.id IN (SELECT permissions_user.userId FROM permissions_user WHERE permissions_user.permissionId = :perm$index)";
}

//prepare and bind values
$complexSelect = $dbPdo->prepare($complexQuery);
foreach($permissionList as $index => $permission){
    $complexSelect->bindValue(":perm$index",$permission);
}

//execute statement
$complexSelect->execute();
$resultList = $complexSelect->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
