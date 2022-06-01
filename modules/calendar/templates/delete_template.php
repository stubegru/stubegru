<?php

// Dieses Script löscht ein Template

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("beratung");
$uebergabe=($_POST["get_Data"]);

$id=$uebergabe[0]; //Id des zu löschenden Templates

echo "Vorlage gelöscht";

$deleteStatement = $dbPdo->prepare("DELETE FROM Templates WHERE id=:id;");
$deleteStatement->bindValue(':id', $id);
$deleteStatement->execute();





?>