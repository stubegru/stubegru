<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
$currentUserId = $_SESSION["id"];

//ArtikelId des zu markierenden Artikels. "$constans['all']" falls alle Artikel markiert werden sollen
$articleId = $_POST["articleId"];

//Art der Aktion. "$constants['unread']" wenn gelesen entfernt werden soll,  "$constants['read']" wenn gelesen hinzugefügt werden soll
$mode = $_POST["mode"];

//Nutzer für den die Aktion durchgeführt werden soll. "$constants[currentUser]" wenn der aktuell angemeldete Nutzer bearbeitet werden soll, "$constants[all]" wenn alle Nutzer bearbeitet werden sollen
$userId = $_POST["userId"];

//Prüfen, ob ArtikelId und NutzerId überhaupt existieren. Nicht numerische Werte werden später rausgefiltert
if (is_numeric($articleId)) {
    $testStatement = $dbPdo->prepare("SELECT id FROM wiki_artikel WHERE id = :articleId;");
    $testStatement->bindValue(':articleId', $articleId);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers <= 0) {
        echo json_encode(array("status" => $constants["error"], "error" => "Invalid articleId"));
        exit;
    }
}

if (is_numeric($userId)) {
    $testStatement = $dbPdo->prepare("SELECT ID FROM Nutzer WHERE ID = :userId;");
    $testStatement->bindValue(':userId', $userId);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers <= 0) {
        echo json_encode(array("status" => $constants["error"], "error" => "Invalid userId"));
        exit;
    }
}

if ($mode == $constants["read"]) {
    if ($articleId == $constants["all"]) {
        if ($userId == $constants["currentUser"]) {
            $userId = $currentUserId;
        }
        if ($userId == $constants["all"]) {
            //Set read for all articles for all users | not yet implemented, cause this is not needed
            echo json_encode(array("status" => $constants["error"], "error" => "Set read for all articles and all users is not implemented"));
        } else if (is_numeric($userId)) {
            //Set read for all Articles and one user($userId)

            $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO wiki_link_gelesen (`nutzerId`,`artikelId`) SELECT :userId AS nutzerId, id FROM wiki_artikel;");
            $insertStatement->bindValue(':userId', $userId);
            $insertStatement->execute();
            $articleId = $dbPdo->lastInsertId();
            echo json_encode(array("status" => $constants["success"], "articleId" => $constants["all"], "mode" => $constants["read"], "userId" => "singleId: " . $userId));
        } else {
            echo json_encode(array("status" => $constants["error"], "error" => "Invalid userId"));
        }
    } else if (is_numeric($articleId)) {
        if ($userId == $constants["currentUser"]) {
            $userId = $currentUserId;
        }
        if ($userId == $constants["all"]) {
            //Set read for one article($articleId) for all users

            $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO wiki_link_gelesen (`nutzerId`,`artikelId`) SELECT ID, :articleId AS artikelId FROM Nutzer;");
            $insertStatement->bindValue(':articleId', $articleId);
            $insertStatement->execute();
            $articleId = $dbPdo->lastInsertId();
            echo json_encode(array("status" => $constants["success"], "articleId" => "singleId: " . $articleId, "mode" => $constants["read"], "userId" => $constants["all"]));
        } else if (is_numeric($userId)) {
            //Set read for one article($articleId) and one user($userId)

            $insertStatement = $dbPdo->prepare("INSERT IGNORE INTO `wiki_link_gelesen` (`nutzerId`, `artikelId`) VALUES (:userId, :articleId);");
            $insertStatement->bindValue(':userId', $userId);
            $insertStatement->bindValue(':articleId', $articleId);
            $insertStatement->execute();
            $articleId = $dbPdo->lastInsertId();
            echo json_encode(array("status" => $constants["success"], "articleId" => "singleId: " . $articleId, "mode" => $constants["read"], "userId" => "singleId: " . $userId));
        } else {
            echo json_encode(array("status" => $constants["error"], "error" => "Invalid userId"));
        }
    } else {
        echo json_encode(array("status" => $constants["error"], "error" => "Invalid articleId"));
    }
} else if ($mode == $constants["unread"]) {
    if ($articleId == $constants["all"]) {
        if ($userId == $constants["currentUser"]) {
            $userId = $currentUserId;
        }
        if ($userId == $constants["all"]) {
            //Set unread for all articles for all users
            $deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_gelesen`;");
            $deleteStatement->execute();
            echo json_encode(array("status" => $constants["success"], "articleId" => $constants["all"], "mode" => $constants["unread"], "userId" => $constants["all"]));
        } else if (is_numeric($userId)) {
            //Set unread for all Articles and one user($userId)

            $deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_gelesen` WHERE `nutzerId` = :userId;");
            $deleteStatement->bindValue(':userId', $userId);
            $deleteStatement->execute();
            echo json_encode(array("status" => $constants["success"], "articleId" => $constants["all"], "mode" => $constants["unread"], "userId" => "singleId: " . $userId));
        } else {
            echo json_encode(array("status" => $constants["error"], "error" => "Invalid userId"));
        }
    } else if (is_numeric($articleId)) {
        if ($userId == $constants["currentUser"]) {
            $userId = $currentUserId;
        }
        if ($userId == $constants["all"]) {
            //Set unread for one article($articleId) for all users

            $deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_gelesen` WHERE `artikelId` = :articleId;");
            $deleteStatement->bindValue(':articleId', $articleId);
            $deleteStatement->execute();
            echo json_encode(array("status" => $constants["success"], "articleId" => "singleId: " . $articleId, "mode" => $constants["unread"], "userId" => $constants["all"]));
        } else if (is_numeric($userId)) {
            //Set unread for one article($articleId) and one user($userId)

            $deleteStatement = $dbPdo->prepare("DELETE FROM `wiki_link_gelesen` WHERE `nutzerId` = :userId AND `artikelId` = :articleId;");
            $deleteStatement->bindValue(':userId', $userId);
            $deleteStatement->bindValue(':articleId', $articleId);
            $deleteStatement->execute();
            echo json_encode(array("status" => $constants["success"], "articleId" => "singleId: " . $articleId, "mode" => $constants["unread"], "userId" => "singleId: " . $userId));
        } else {
            echo json_encode(array("status" => $constants["error"], "error" => "Invalid userId"));
        }
    } else {
        echo json_encode(array("status" => $constants["error"], "error" => "Invalid articleId"));
    }
} else {
    echo json_encode(array("status" => $constants["error"], "error" => "Invalid mode"));
}
