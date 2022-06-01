<?php
//Converts old wikiwords [article name] to new wikiwords [wikiword|12|article name]

if(!isset($_GET["pwd"]) || $_GET["pwd"] != getenv("APPLICATION_ID")){
    header("401 - No access",true,401);
    exit;
}

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$where = "`id`>='0'";
$currentIndex = 0;

$ergebnis = mysqli_query($mysqli, "SELECT * FROM `wiki_artikel` WHERE $where;");
$numberOfAllArticles = $ergebnis->num_rows;

while ($row = mysqli_fetch_object($ergebnis)) {
    //Für jeden Artikel
    $currentIndex++;
    $articleId = $row->id;
    $articleHeading = $row->heading;
    $articleText = $row->text;
    echo "<br>[$currentIndex/$numberOfAllArticles] Update Wiki article <b>$articleHeading</b> with id <b>$articleId</b><br>";

    //Prüfen, ob null-wikiwords mit einer articleId verknüpft werden können
    $replace_wikiword = function ($matches) {
        global $mysqli;
        $match = $matches[0]; //Only full matches are interesting
        $title = substr($match, 1, -1); //remove brackets
        //lookup DB for article with this title
        $ergebnis = mysqli_query($mysqli, "SELECT id FROM `wiki_artikel` WHERE heading = '$title';");
        if ($ergebnis->num_rows > 0) {
            $row = mysqli_fetch_object($ergebnis);
            $articleId = $row->id;
            echo "&nbsp;&nbsp;&nbsp;&nbsp;[SUCCESS] Found wikiword <b>$title</b> matching with article id <b>$articleId</b><br>";
            return "[wikiword|$articleId|$title]";
        }
        echo "&nbsp;&nbsp;&nbsp;&nbsp;[WARNING] Found wikiword <b>$title</b> but can't match with article! Created null-wikiword<br>";
        return "[wikiword|null|$title]";
    };
    $regex = "/\[(\w|ä|Ä|ü|Ü|ö|Ö|ß|\"|\'|\§|\/|\€|\?|\!|\-|\(|\)|\,|\.|\ )*\]/mi";
    $articleText = preg_replace_callback($regex, $replace_wikiword, $articleText);
    //aktualisierten Text in der DB speichern
    mysqli_query($mysqli, "UPDATE `wiki_artikel` SET `text`='$articleText' WHERE `id` = '$articleId'");
}
