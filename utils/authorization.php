<?php
$BASE_URL = getenv("BASE_URL");

if (session_status() == PHP_SESSION_NONE) {
    session_start(); //Session starten, falls sie noch nicht läuft
}

//Wenn keine Session id gesetzt ist, wird zur Login Seite weitergeleitet bzw bei einem AJAX Call ein 401-Fehler gesendet
if (empty($_SESSION["id"]) || empty($_SESSION['application']) || $_SESSION["application"] != getenv("APPLICATION_ID")) {
    session_destroy(); // Destroy session from other session

    if (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
        //Ajax call => return 401 Error
        header("HTTP/1.1 401 Unauthorized");
        echo json_encode(array("status" => "error", "message" => "401 Unauthorized", "permission" => "user"));
        exit;
    } else {
        //direct browser call => redirect to login page
        $redirectUrl = getCurrentUrl();
        header("Location: $BASE_URL/?view=login&triggerUrl=$redirectUrl");
        exit;
    }
}

function getCurrentUrl()
{
    $url = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
    $url = urlencode($url);
    return $url;
}
