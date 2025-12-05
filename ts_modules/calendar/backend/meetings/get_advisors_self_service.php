<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<used in self-service
require_once "$BASE_PATH/utils/permission_request.php";
permissionRequest("CALENDAR_SELF_SERVICE");

//get all permissions required for this permissionRequest
$selectStatement = $dbPdo->prepare("SELECT permissionId FROM permission_requests WHERE `name` = :permissionRequest");
$selectStatement->bindValue(':permissionRequest', "MEETING_ADVISOR");
$selectStatement->execute();
$permissionList = $selectStatement->fetchAll(PDO::FETCH_COLUMN);

if (count($permissionList) <= 0) {
    echo json_encode(array("status" => "error", "message" => "No permissionRequest found with name $permissionRequest"));
    exit;
}

$complexQuery = "SELECT Nutzer.name, Nutzer.id FROM Nutzer WHERE";
//build "AND-statement" for each required permission
foreach ($permissionList as $index => $permission) {
    if ($index > 0) {
        $complexQuery .= " AND";
    }
    $complexQuery .= " Nutzer.id IN (SELECT permissions_user.userId FROM permissions_user WHERE permissions_user.permissionId = :perm$index)";
}

//prepare and bind values
$complexSelect = $dbPdo->prepare($complexQuery);
foreach ($permissionList as $index => $permission) {
    $complexSelect->bindValue(":perm$index", $permission);
}

//execute statement
$complexSelect->execute();
$resultList = $complexSelect->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);


//alternative
/*
<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/database_without_auth.php"; //<<used in self-service

// Get all permissionIds required for the "MEETING_ADVISOR" permissionRequest
$permissionRequest = $dbPdo->query("SELECT permissionId FROM permission_requests WHERE `name` = 'MEETING_ADVISOR'");
$permissions = $permissionRequest->fetchAll(PDO::FETCH_COLUMN);


// Find users who have all required permissions
$placeholders = implode(',', array_fill(0, count($permissions), '?'));
$query = "
    SELECT u.id, u.name
    FROM Nutzer u
    JOIN permissions_user pu ON u.id = pu.userId
    WHERE pu.permissionId IN ($placeholders)
    GROUP BY u.id, u.name
    HAVING COUNT(DISTINCT pu.permissionId) = ?
";
$stmt = $dbPdo->prepare($query);
$stmt->execute(array_merge($permissions, [count($permissions)]));
$resultList = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($resultList);
*/