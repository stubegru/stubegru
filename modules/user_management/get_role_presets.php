<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
permissionRequest("USER_READ");

$selectStatement = $dbPdo->query("SELECT * FROM roles;");
$roleList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

$rolePresetStatement = $dbPdo->prepare("SELECT * FROM `role_presets` WHERE roleId = :roleId;");
foreach ($roleList as &$role) { //use "&" to have a reference and not a copy of the role item
    $roleId = $role["id"];
    $rolePresetStatement->bindValue(':roleId', $roleId);
    $rolePresetStatement->execute();
    $resultList = $rolePresetStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $row) {
        $presetType = $row["type"];
        $presetSubjectId = $row["subjectId"];
        if (!isset($role[$presetType])) {
            $role[$presetType] = array();
        }
        $role[$presetType][] = $presetSubjectId;
    }
}

echo json_encode($roleList);
