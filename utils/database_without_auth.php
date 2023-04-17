<?php

/**
 * This script will provide database access using the credentials defined in .htaccess
 * 
 * This script will NOT check if the user is logged in 
 * If there's no sensible reason to use database connectivity withouth basic user authorisation, YOU SHOULD ALLWAYS USE THE auth_and_database.php SCRIPT INSTEAD!!!
 */


//Get environment variables from .htaccess
$server = getenv("DB_SERVER");
$user = getenv("DB_USER");
$password = getenv("DB_PASSWORD");
$database = getenv("DB_NAME");

$dbPdo = new PDO("mysql:host=$server;dbname=$database", $user, $password); //Provide PDO Database

unset($user);
unset($password);
