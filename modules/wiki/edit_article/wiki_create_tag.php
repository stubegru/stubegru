 <?php
// Dieses Script erstellt einen neuen Tag in der DB
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("wiki_autor");
$tagName = $_POST["name"];

$insertStatement = $dbPdo->prepare("INSERT INTO `wiki_tags` (`name`) VALUES (:tagName);");
$insertStatement->bindValue(':tagName', $tagName);
$insertStatement->execute();
$tagId = $dbPdo->lastInsertId();

echo json_encode(array("tagId" => $tagId, "tagName" => $tagName));