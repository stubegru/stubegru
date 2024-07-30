<?php

echo "This server's timezone is ";
echo date_default_timezone_get();
echo " \nServer time: ";
echo date("H:i:s");

$startTimestampLocal = date("Y-m-d H:i:s");
$startDateObject = DateTime::createFromFormat('Y-m-d H:i:s', $startTimestampLocal);
$startTimestampUTC = gmdate("Ymd\THis\Z", $startDateObject->getTimestamp());

echo "\nAs UTC: $startTimestampUTC \n";
