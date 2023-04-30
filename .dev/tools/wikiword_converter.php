<?php
//Converts old wikiwords [article name] to new wikiwords [wikiword|12|article name]

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}

$where = "`id`>='0'";
$currentIndex = 0;
echo "Converting wikiwords in all articles from $server.$database where $where<br>";

$testStatement = $dbPdo->query("SELECT count(*) FROM `wiki_artikel` WHERE $where;");
$numberOfAllArticles = $testStatement->fetchColumn();

$ergebnis = $dbPdo->query("SELECT * FROM `wiki_artikel` WHERE $where;");
$resultList = $ergebnis->fetchAll(PDO::FETCH_OBJ);

foreach ($resultList as $row) {
    //Für jeden Artikel
    $currentIndex++;
    $articleId = $row->id;
    $articleHeading = $row->heading;
    $articleText = $row->text;
    echo "<br>[$currentIndex/$numberOfAllArticles] Update Wiki article <b>$articleHeading</b> with id <b>$articleId</b><br>";

    //Prüfen, ob null-wikiwords mit einer articleId verknüpft werden können
    $replace_wikiword = function ($matches) {
        global $dbPdo;
        $match = $matches[0]; //Only full matches are interesting

        $badMatches = array("if gte mso","endif");

        foreach($badMatches as $badM)
        if (str_contains($match, $badM)) {
            echo "&nbsp;&nbsp;&nbsp;&nbsp;[WARNING] Found regex match <b>$match</b> but seems to be not a wikiword. Skipping this match<br>";
            return $match;
        }

        $title = substr($match, 1, -1); //remove brackets
        //lookup DB for article with this title
        $headingResult = $dbPdo->query("SELECT id FROM `wiki_artikel` WHERE heading = '$title';");
        $headingList = $headingResult->fetchAll(PDO::FETCH_OBJ);
        foreach ($headingList as $headingRow) {
            $articleId = $headingRow->id;
            echo "&nbsp;&nbsp;&nbsp;&nbsp;[SUCCESS] Found wikiword <b>$title</b> matching with article id <b>$articleId</b><br>";
            return "[wikiword|$articleId|$title]";
        }
        echo "&nbsp;&nbsp;&nbsp;&nbsp;[WARNING] Found wikiword <b>$title</b> but can't match with article! Created null-wikiword<br>";
        return "[wikiword|null|$title]";
    };
    $regex = "/\[(\w|ä|Ä|ü|Ü|ö|Ö|ß|\"|\'|\§|\/|\€|\?|\!|\-|\(|\)|\,|\.|\ )*\]/mi";
    $articleText = preg_replace_callback($regex, $replace_wikiword, $articleText);
    //aktualisierten Text in der DB speichern
    $dbPdo->query("UPDATE `wiki_artikel` SET `text`='$articleText' WHERE `id` = '$articleId';");
}
