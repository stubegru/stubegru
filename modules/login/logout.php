<?php

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
$loggedInUserId = $_SESSION["id"];

//remove all blocks by this user
$updateStatement = $dbPdo->prepare("DELETE FROM `meeting_blocks` WHERE userId = :userId;");
$updateStatement->bindValue(':userId', $loggedInUserId);
$updateStatement->execute();

session_unset();
session_destroy();
$_SESSION = array();

echo json_encode(array("status" => "success", "message" => "User with id $loggedInUserId is logged off"));
