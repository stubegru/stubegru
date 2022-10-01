<?php
// Dieses Script gibt eine Liste aller bekannten Erlaubnis-Stufen zurück
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$own_id = $_SESSION["id"];

//Get all permissionChannel <-> permission relations
$selectStatement = $dbPdo->query("SELECT * FROM `permission_requests`;");
$permissionRelations = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

//Get all permissions, the current user fulfills
$selectStatement = $dbPdo->prepare("SELECT permissions.id FROM `Nutzer`, `permissions`, `permissions_user` WHERE Nutzer.id = permissions_user.userId AND `permissions`.id = permissions_user.permissionId AND Nutzer.id = :own_id;");
$selectStatement->bindValue(':own_id', $own_id);
$selectStatement->execute();
$permissionUserList = $selectStatement->fetchAll(PDO::FETCH_COLUMN, 0); //Fetch as flat list

$list = array();

//Get all permissionChannels fulfilled by current user
foreach ($permissionRelations as $row) {
    $pChannel = $row["name"];
    $pRequired = $row["permissionId"];

    if (isset($list[$pChannel]) && $list[$pChannel] === false) {
        continue; //If access is already denied by other rule, continue with next permissionChannel
    }

    if ($pRequired == "user" || $pRequired == "anybody") {
        $list[$pChannel] = true;
        continue;
    }

    if (array_search($pRequired, $permissionUserList) === false) {
        $list[$pChannel] = false;
    } else {
        $list[$pChannel] = true;
    }
}

$toReturn = array();
foreach ($list as $index => $item) {
    $toReturn[] = array("name" => $index, "access" => $item);
}

echo json_encode($toReturn);
