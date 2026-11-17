<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/user_utils/user_utils.php";
permissionRequest("SEND_TELEPHONE_NOTE");
require_once "$BASE_PATH/modules/mailing/mailing.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";

$ownId = $_SESSION["id"];
$sender_name = getUserName($ownId);
$currentTime = date("d.m.Y H:i");
$applicationName = $constants["CUSTOM_CONFIG"]["applicationName"] ?? "Stubegru";

$name = $_POST["name"];
$studentId = $_POST["studentId"];
$phone = $_POST["phone"];
$mail = $_POST["mail"];
$note = $_POST["note"];
$recipient = $_POST["recipient"];
$issue = $_POST["issue"];

$keywordList = ["{sender_name}", "{time}", "{issue}", "{name}", "{mnumber}", "{phone}", "{mail}", "{note}", "{application_name}"];
$valueList = [$sender_name, $currentTime, $issue, $name, $studentId, $phone, $mail, $note, $applicationName];

$mailText = loadStubegruMailtemplate("mail_template_telephone_note.html");
$mailText = str_replace($keywordList, $valueList, $mailText);
$subject = extractMailSubject($mailText,"mail_template_telephone_note.html");
$subject = str_replace($keywordList, $valueList, $subject);

stubegruMail($recipient,$subject,$mailText); //Send mail

$toReturn = array("status" => "success", "message" => "Mail erfolgreich versandt");
echo json_encode($toReturn);
