<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/wiki/show_article/wikiword_helper.php";

unlinkBrokenWikiwordsNews();
