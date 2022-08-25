<?php

// Dieses Script wird per Cronjob einmal täglich nachts ausgeführt und löscht Kalender Termine, die älter sind als 1 Tag
$vorEinemTag = date("Y-m-d", strtotime("-1 days"));

//Teilnehmer suchen
$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE date <= :vorEinemTag;");
$selectStatement->bindValue(':vorEinemTag', $vorEinemTag);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $teilnehmer = $row["teilnehmer"];

    if ($teilnehmer != "") { //Falls termin Teilnehmer hat hole Daten aus DB

        $teilnehmer = explode("-", $teilnehmer);

        for ($i = 0; $i < count($teilnehmer); $i++) {
            //teilneher Daten löschen
            $deleteStatement = $dbPdo->prepare("DELETE FROM Beratene WHERE id=:teilnehmer;");
            $deleteStatement->bindValue(':teilnehmer', $teilnehmer[$i]);
            $deleteStatement->execute();
        }

    }
}

$selectStatement = $dbPdo->prepare("SELECT * FROM `Termine` WHERE date <= :vorEinemTag;");
$selectStatement->bindValue(':vorEinemTag', $vorEinemTag);
$selectStatement->execute();
$resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

foreach ($resultList as $row) {
    $teilnehmer = $row["teilnehmer"];

    if ($teilnehmer != "") { //Falls termin Teilnehmer hat hole Daten aus DB

        $teilnehmer = explode("-", $teilnehmer);

        for ($i = 0; $i < count($teilnehmer); $i++) {
            //teilneher Daten löschen
            $deleteStatement = $dbPdo->prepare("DELETE FROM Beratene WHERE id=:teilnehmer;");
            $deleteStatement->bindValue(':teilnehmer', $teilnehmer[$i]);
            $deleteStatement->execute();
        }

    }
}
//termine löschen
$deleteStatement = $dbPdo->prepare("DELETE FROM `Termine` WHERE date <= :vorEinemTag;");
$deleteStatement->bindValue(':vorEinemTag', $vorEinemTag);
$deleteStatement->execute();

echo ("Alle vergangenen Termine und zugeordnete Personen wurden gelöscht");
