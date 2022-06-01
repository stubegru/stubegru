<?php

// Dieses Script gibt eine JSn Objekt zurück. Dies enthält Informationen, ob der gesuchte Artikeltitel gefunden wurde und die passende Artikel Id


$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

$articleName=$_POST["articleName"];
$articleName = urldecode($articleName);

$testStatement = $dbPdo->prepare("SELECT id FROM `wiki_artikel` WHERE heading = :articleName;");
$testStatement->bindValue(':articleName', $articleName);
$testStatement->execute();
$rowNumbers = $testStatement->fetchColumn();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);
if($rowNumbers > 0){   
    foreach ($resultList as $row) {
          $id=$row["id"];
          $toReturn = array("articleFound" => true,"articleId" => $id);
     }
}
else{
     $toReturn = array("articleFound" => false, "searchedFor" => $articleName);
}

echo json_encode($toReturn);


?>