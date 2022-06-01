<?php
exit(); //this is a copyboard and should never be exceuted


//***Select mehrerer Datensätze***
$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId;");
$selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $titel = $row["titel"];
    $inhalt = $row["inhalt"];
    //do sth with the data...
}



//***Select eines Datensatzes***
$selectStatement = $dbPdo->prepare("SELECT * FROM `Nachrichten` WHERE id = :newsId;");
$selectStatement->bindValue(':newsId', $id);
$selectStatement->execute();
$row = $selectStatement->fetch(PDO::FETCH_ASSOC);

$titel = $row["titel"];
$inhalt = $row["inhalt"];
//do sth with the data...



//***Löschen eines Datensatzes***
$deleteStatement = $dbPdo->prepare("DELETE FROM Nachrichten WHERE id = :newsId;");
$deleteStatement->bindValue(':newsId', $id);
$deleteStatement->execute();


//***Testen wieviele Datensätze existieren***
$testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_artikel` WHERE heading = :titel;");
$testStatement->bindValue(':titel', $titel);
$testStatement->execute();
$rowNumbers = $testStatement->fetchColumn();

//***INSERT***
$insertStatement = $dbPdo->prepare("INSERT INTO `wiki_artikel` (`heading`,`text`) VALUES (:titel,:inhalt);");
$insertStatement->bindValue(':titel', $titel);
$insertStatement->bindValue(':inhalt', $inhalt);
$insertStatement->execute();
$articleId = $dbPdo->lastInsertId();

//***UPDATE***
$updateStatement = $dbPdo->prepare("UPDATE `Nachrichten` SET titel=:titel, erfassungsdatum=:erfassungsdatum WHERE id=:newsId;");
$updateStatement->bindValue(':titel', $titel);
$updateStatement->bindValue(':erfassungsdatum', $erfassungsdatum);
$updateStatement->bindValue(':newsId', $newsId);
$updateStatement->execute();
