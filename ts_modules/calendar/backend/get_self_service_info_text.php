<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/permission_request.php";
permissionRequest("CALENDAR_SELF_SERVICE");

$paths = [
    $BASE_PATH . '/custom/mail_templates/self_service_info_text.html',
    $BASE_PATH . '/mail_templates/self_service_info_text.html',
];

$template = null;
foreach ($paths as $path) {
    if (is_file($path) && is_readable($path)) {
        $template = $path;
        break;
    }
}

if ($template) {
    header('Content-Type: text/html; charset=utf-8');
    echo file_get_contents($template);
}