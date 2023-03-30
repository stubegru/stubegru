<?php
//Import wiki articles from aulis old wiki

if(!isset($_GET["pwd"]) || $_GET["pwd"] != getenv("APPLICATION_ID")){
    header("401 - No access",true,401);
    exit;
}

$BASE_PATH = getenv("BASE_PATH");
$IMPORT_PATH = "path/to/import";
require_once "$BASE_PATH/utils/auth_and_database.php";

$filesList = scandir($IMPORT_PATH);

foreach ($filesList as $fileName) {
    if (strpos($fileName, ".html") != false) {
        //echo $fileName . "<br>";
        $file = file_get_contents($IMPORT_PATH . $fileName);

        //Title <h1 class="ilc_page_title_PageTitle">Title</h1>
        $titleStartString = '<h1 class="ilc_page_title_PageTitle">';
        $titleEndString = '</h1><!--COPage-PageTop-->';
        $titleStartIndex = strpos($file, $titleStartString);
        $titleStartIndex = $titleStartIndex + strlen($titleStartString);
        $titleEndIndex = strpos($file, $titleEndString);
        $title = substr($file, $titleStartIndex, $titleEndIndex - $titleStartIndex);
        $title = strip_tags($title);
        //echo "Titel:<b> $title</b><br><hr><br>";

        //Content <div class="ilc_Paragraph ilc_text_block_Standard">Content</div><div class="ilc_Paragraph ilc_text_block_Standard">More Content</div>
        $contentStartString = '<div class="ilc_Paragraph ilc_text_block_Standard">';
        $contentEndString = '<div class="ilBlockHeader">';
        $contentStartIndex = strpos($file, $contentStartString);
        $contentStartIndex = $contentStartIndex + strlen($contentStartString);
        $contentOffset = $contentStartIndex + 1;
        $contentEndIndex = strpos($file, $contentEndString);
        $content = substr($file, $contentStartIndex, $contentEndIndex - $contentStartIndex);
        $content = strip_tags($content);
        //echo "<br>Content: $content<br>";

        //In die Datenbank schreiben
        mysqli_query($mysqli, "INSERT INTO `wiki_artikel` (`heading`,`text`) VALUES ('$title','$content')");
        $articleId = mysqli_insert_id($mysqli);
        //$articleId = 1;
        echo "Artikel <b> $title</b> [$fileName] wurde mit ID <b>$articleId</b> im neuen Wiki gespeichert.<br>";

    }
}
