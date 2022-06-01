<?php
// Dieses Script speichert einen Artikel im Wiki
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permission_required("wiki_autor");
require_once "$BASE_PATH/modules/notifications/notification_system.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$own_id = $_SESSION['id'];

//Post Parameter auslesen
$articleId = $_POST["articleId"];
$heading = $_POST["articleHeading"];
$text = $_POST["articleText"];
$tags = $_POST["articleTags"];
$showInSidebar = $_POST["showInSidebar"];
$markAsUnread = $_POST["markAsUnread"];
$reminderDate = isset($_POST["reminderDate"]) ? $_POST["reminderDate"] : "0000-00-00";
$reminderText = isset($_POST["reminderText"]) ? $_POST["reminderText"] : "";

$tagsArray = json_decode($tags);
$toReturn = array();

//Prüfen, ob der Artikel eine Überschrift und Ihnalt hat
if ($heading == "") {
    //Keine Überschrift
    $toReturn["status"] = "error";
    $toReturn["message"] = "Bitte eine Überschrift angeben";
    $toReturn["articleId"] = $articleId;
    echo json_encode($toReturn);
    exit;
}

//Prüfen, ob "verbotene" Sonderzeichen in der Überschrift vorkommen
$badCharsTitle = array("[", "]", "|", "&", "=", "%", "'");
foreach ($badCharsTitle as $badChar) {
    if (strpos($heading, $badChar) != false) {
        $toReturn["status"] = "error";
        $toReturn["message"] = "Der Titel enthält das Zeichen --- $badChar ---. Dieses Zeichen ist in Artikeltiteln nicht erlaubt.";
        $toReturn["articleId"] = $articleId;
        echo json_encode($toReturn);
        exit;
    }
}

//Prüfen, ob "verbotene" Sonderzeichen im Text vorkommen
$badCharsText = array("'");
foreach ($badCharsText as $badChar) {
    if (strpos($text, $badChar) != false) {
        $toReturn["status"] = "error";
        $toReturn["message"] = "Der Artikeltext enthält das Zeichen --- $badChar ---. Dieses Zeichen ist im Artikeltext nicht erlaubt.";
        $toReturn["articleId"] = $articleId;
        echo json_encode($toReturn);
        exit;
    }
}

//Prüfen ob genausoviele Eckige Klammern aufgehen wie zugehen, dies verhindert falsche wikiwords
if (substr_count($text, "[") != substr_count($text, "]")) {
    $toReturn["status"] = "error";
    $toReturn["message"] = "Im Artikeltext werden nicht alle eckigen Klammern [ ] wieder geschlossen, die geöffnet werden. Eckige Klammern bitte nur für Wikiwords verwenden.";
    $toReturn["articleId"] = $articleId;
    echo json_encode($toReturn);
    exit;
}

/*
_   _                                      _   _ _        _
| \ | |                          /\        | | (_) |      | |
|  \| | ___ _   _  ___ _ __     /  \   _ __| |_ _| | _____| |
| . ` |/ _ \ | | |/ _ \ '__|   / /\ \ | '__| __| | |/ / _ \ |
| |\  |  __/ |_| |  __/ |     / ____ \| |  | |_| |   <  __/ |
|_| \_|\___|\__,_|\___|_|    /_/    \_\_|   \__|_|_|\_\___|_|

 */
if ($articleId == "create") {

    //Prüfen, ob es schon einen Artikel mit dieser Überschrift gibt
    $testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_artikel` WHERE heading = :heading;");
    $testStatement->bindValue(':heading', $heading);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        $toReturn["status"] = "error";
        $toReturn["message"] = "Es existiert bereits ein Artikel mit dieser Überschrift.";
        echo json_encode($toReturn);
        exit;
    }

    $insertStatement = $dbPdo->prepare("INSERT INTO `wiki_artikel` (`heading`,`text`,`reminderDate`,`reminderText`,`showInSidebar`) VALUES (:heading,:text,:reminderDate,:reminderText,:showInSidebar);");
    $insertStatement->bindValue(':heading', $heading);
    $insertStatement->bindValue(':text', $text);
    $insertStatement->bindValue(':reminderDate', $reminderDate);
    $insertStatement->bindValue(':reminderText', $reminderText);
    $insertStatement->bindValue(':showInSidebar', $showInSidebar);
    $insertStatement->execute();
    $articleId = $dbPdo->lastInsertId();

    //Tag Verknüpfungen setzen
    foreach ($tagsArray as $tagId) {
        $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO `wiki_artikel` (`artikelId`,`tagId`) VALUES (:artikelId,:tagId);");
        $insertStatement->bindValue(':tagId', $tagId);
        $insertStatement->bindValue(':artikelId', $artikelId);
        $insertStatement->execute();
        $articleId = $dbPdo->lastInsertId();
    }

    //Gelesen Verknüpfungen setzen
    if ($markAsUnread == 0) {
        //Gelesen Verknüpfung für jeden Nutzer setzen
        $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO wiki_link_gelesen (`nutzerId`,`artikelId`) SELECT ID, :articleId AS artikelId FROM Nutzer;");
        $insertStatement->bindValue(':articleId', $articleId);
        $insertStatement->execute();
        $articleId = $dbPdo->lastInsertId();
    } else {
        //Notification versenden. wenn der Artikel als ungelesen angezeigt werden soll
        newNotification($constants["article"], $articleId, $heading, "", "", $own_id, $constants["new"]);
    }

    $toReturn["status"] = "success";
    $toReturn["message"] = "Der Artikel wurde erfolgreich hinzugefügt";
    $toReturn["articleId"] = $articleId;

}

/*
Artikel Updaten
 */
else {
    if (!is_numeric($articleId)) {
        $toReturn["status"] = "error";
        $toReturn["message"] = "Die Artikel Id ist in einem ungültigen Format";
        $toReturn["articleId"] = $articleId;
        echo json_encode($toReturn);
        exit;
    }

    //Artikel Daten updaten
    $updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET heading=:heading, text=:text, reminderDate=:reminderDate, reminderText=:reminderText, showInSidebar=:showInSidebar WHERE id=:articleId;");
    $updateStatement->bindValue(':heading', $heading);
    $updateStatement->bindValue(':text', $text);
    $updateStatement->bindValue(':reminderDate', $reminderDate);
    $updateStatement->bindValue(':reminderText', $reminderText);
    $updateStatement->bindValue(':showInSidebar', $showInSidebar);
    $updateStatement->bindValue(':articleId', $articleId);
    $updateStatement->execute();

    //Erstmal alle Tag <-> Artikel Verknüpfungen löschen, falls es welche gibt
    $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_artikel_tags WHERE artikelId = :articleId;");
    $deleteStatement->bindValue(':articleId', $articleId);
    $deleteStatement->execute();

    //Dann alle übergebenen Verknüpfungen setzen
    foreach ($tagsArray as $tagId) {
        $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO `wiki_link_artikel_tags` (`artikelId`,`tagId`) VALUES (:artikelId,:tagId);");
        $insertStatement->bindValue(':artikelId', $articleId);
        $insertStatement->bindValue(':tagId', $tagId);
        $insertStatement->execute();
        $articleId = $dbPdo->lastInsertId();
    }

    //Gelesen Verknüpfungen löschen und Notification senden
    if ($markAsUnread == 1) {
        $deleteStatement = $dbPdo->prepare("DELETE FROM wiki_link_gelesen WHERE artikelId = :artikelId;");
        $deleteStatement->bindValue(':artikelId', $articleId);
        $deleteStatement->execute();
        newNotification($constants["article"], $articleId, $heading, "", "", $own_id, $constants["update"]);
    }

    $toReturn["status"] = "success";
    $toReturn["message"] = "Der Artikel wurde erfolgreich gespeichert";
    $toReturn["articleId"] = $articleId;
}

echo json_encode($toReturn);
