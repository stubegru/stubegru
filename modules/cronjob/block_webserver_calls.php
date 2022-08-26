<?php
$interface = php_sapi_name();
$devMode = getenv("DEV_MODE");

if (!$devMode && $interface != "cli") {
    header("HTTP/1.1 401 Unauthorized");
    echo json_encode(array("status" => "error", "message" => "401 Unauthorized"));
    exit;
}
