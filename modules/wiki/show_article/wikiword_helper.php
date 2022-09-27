<?php

/**
 * Globale Variable um zu merken, bo ein Objekt veränert wurde und somit in der Datenbank neu gespiechert werden muss...
 * Wird von mehreren Funktionen (dieser Datei) genutzt
 */
$changesMade = false;
$regexTemplate = "/\[wikiword\|%%ARTICLE_ID%%\|(\w|ä|Ä|ü|Ü|ö|Ö|ß|\"|\'|\§|\/|\€|\?|\!|\-|\(|\)|\,|\.|:|\ )*\]/mi";
$regexLinkedWikiwords = str_replace("%%ARTICLE_ID%%", "[0-9]+", $regexTemplate);
$regexUnlinkedWikiwords = str_replace("%%ARTICLE_ID%%", "null", $regexTemplate);



/**
 * Prüft, ob null-wikiwords im übergebenen $text automatisch mit passenden Artiklen verlinkt werden können
 * @param $dataId   Id des akutellen Datensatzes (relevant für DB update)
 * @param $text     Text, der nach wikiwords durchsucht werden soll
 * @param $type     Typ des Datensatzes: "DAILY_NEWS" | "WIKI_ARTICLE"
 * @return string   Gibt den überarbeiteten Text zurück
 */
function autolinkWikiwords($dataId, $text, $type)
{
    global $dbPdo, $changesMade, $regexUnlinkedWikiwords;
    //Prüfen, ob null-wikiwords mit einer articleId verknüpft werden können
    $changesMade = false;
    $replace_wikiword = function ($matches) {
        global $dbPdo, $changesMade;
        $match = $matches[0]; //Only full matches are interesting
        $wikiword_parts = explode("|", $match);
        $title = substr($wikiword_parts[2], 0, -1);
        //lookup DB for article with this title
        $selectStatement = $dbPdo->prepare("SELECT id FROM `wiki_artikel` WHERE heading = :title;");
        $selectStatement->bindValue(':title', $title);
        $selectStatement->execute();
        $row = $selectStatement->fetch(PDO::FETCH_ASSOC);
        if ($row != false) {
            $changesMade = true;
            $articleId = $row["id"];
            return "[wikiword|$articleId|$title]";
        }
        return $match;
    };
    $regex = $regexUnlinkedWikiwords;
    $text = preg_replace_callback($regex, $replace_wikiword, $text);

    //If changes were made, save this changes to DB
    if ($changesMade) {
        switch ($type) {
            case "WIKI_ARTICLE":
                $updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET `text`=:text WHERE `id` = :dataId;");
                $updateStatement->bindValue(':text', $text);
                $updateStatement->bindValue(':dataId', $dataId);
                $updateStatement->execute();
                break;
            case "DAILY_NEWS":
                $updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET `inhalt`=:text WHERE `id` = :dataId;");
                $updateStatement->bindValue(':text', $text);
                $updateStatement->bindValue(':dataId', $dataId);
                $updateStatement->execute();
                break;
        }
    }

    return $text;
}


/**
 * Überprüft, ob das übergebene wikiword ein gültiges Ziel hat
 * Falls ja, gibt es das unveränderte wikiword zurück
 * Falls nein, gibt es das Wikiword als Null-Wikiword zurück
 * --> Diese Funktion sollte als Callback eines preg_replace_callback Aufrufes genutzt werden
 * @param $matches Array mit matches der preg_replace_callback Funktion
 */
$checkWikiwordLink = function ($matches) {
    global $dbPdo, $changesMade;
    $match = $matches[0]; //Only full matches are interesting
    $wikiword_parts = explode("|", $match);
    $linkedArticleId = $wikiword_parts[1];
    $title = substr($wikiword_parts[2], 0, -1);


    //lookup DB for article with this id
    $testStatement = $dbPdo->prepare("SELECT count(*) FROM `wiki_artikel` WHERE id = :linkedArticleId;");
    $testStatement->bindValue(':linkedArticleId', $linkedArticleId);
    $testStatement->execute();
    $rowNumbers = $testStatement->fetchColumn();
    if ($rowNumbers > 0) {
        //echo "    - Wikiword $match is OK >>> Id=$linkedArticleId , Title=$title<br>";
        return $match; //Article found => return unmodified wikiword
    }

    //Article doesn't exist => change to null-wikiword
    $changesMade = true;
    //echo "    - Wikiword $match is <b>broken</b> >>> Id=$linkedArticleId , Title=$title<br>";
    return "[wikiword|null|$title]";
};

/**
 * Prüft in allen Wiki Artikeln, ob es Verlinkte Wikiwords gibt, deren Ziel nicht mehr existiert
 * In solch einem Fall wird die Verlinkung aufgehoben und das Wikiword erschient als rotes, unverlinktes Wikiword
 */
function unlinkBrokenWikiwordsArticle()
{
    global $dbPdo, $changesMade, $checkWikiwordLink, $regexLinkedWikiwords;

    $selectStatement = $dbPdo->prepare("SELECT `id`,`text`,`heading` FROM `wiki_artikel`;");
    // $selectStatement->bindValue(':newsId', $id);
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $row) {
        $changesMade = false;
        $articleText = $row["text"];
        $articleId = $row["id"];
        //echo "<b>Checking wiki Article $articleHeading [$articleId] for broken Wikiwords</b><br>";
        $newText = preg_replace_callback($regexLinkedWikiwords, $checkWikiwordLink, $articleText);

        if ($changesMade) {
            echo ">>> [$articleId] Update wiki article with new text<br>";
            $updateStatement = $dbPdo->prepare("UPDATE `wiki_artikel` SET `text`=:newText WHERE `id` = :articleId;");
            $updateStatement->bindValue(':newText', $newText);
            $updateStatement->bindValue(':articleId', $articleId);
            $updateStatement->execute();
        }
    }

    echo "Checked all wiki articles for broken wikiwords";
}

/**
 * Prüft in allen Tagesaktuellen Infos, ob es Verlinkte Wikiwords gibt, deren Ziel nicht mehr existiert
 * In solch einem Fall wird die Verlinkung aufgehoben und das Wikiword erschient als rotes, unverlinktes Wikiword
 */
function unlinkBrokenWikiwordsNews()
{
    global $dbPdo, $changesMade, $checkWikiwordLink, $regexLinkedWikiwords;

    $selectStatement = $dbPdo->prepare("SELECT `id`,`inhalt`,`titel` FROM `Nachrichten`;");
    $selectStatement->execute();
    $resultList = $selectStatement->fetchAll(PDO::FETCH_ASSOC);

    foreach ($resultList as $row) {
        $changesMade = false;
        $newsId = $row["id"];
        $newsText = $row["inhalt"];
        //echo "<b>Checking Daily News $newsHeading [$newsId] for broken Wikiwords</b><br>";
        $newText = preg_replace_callback($regexLinkedWikiwords, $checkWikiwordLink, $newsText);

        if ($changesMade) {
            echo ">>> [$newsId] Update Daily News with new text<br>";
            $updateStatement = $dbPdo->prepare("UPDATE `Nachrichten` SET `inhalt`=:newText WHERE `id` = :newsId;");
            $updateStatement->bindValue(':newText', $newText);
            $updateStatement->bindValue(':newsId', $newsId);
            $updateStatement->execute();
        }
    }

    echo "Checked all Daily News for broken wikiwords";
}
