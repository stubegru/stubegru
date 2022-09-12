<?php

$BASE_PATH = getenv("BASE_PATH");
$viewName = $_GET["view"];
$customPath = "$BASE_PATH/custom/views/$viewName.html";
$defaultPath = "$BASE_PATH/views/$viewName.html";

if (file_exists($customPath)) {
    echo file_get_contents($customPath);
} else {
    echo file_get_contents($defaultPath);
}
