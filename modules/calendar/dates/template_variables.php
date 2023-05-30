<?php

/**
 * Defining Template variables for replacing in Strings e.g. for mail texts.
 * placeholder      - Placeholder substring to be replaced
 * description      - Some extra info about using this variable
 * category         - Type of object that provides the requested property
 * property         - The property's value will be inserted instead of the placeholder
 */
$variableList = array();

//Meeting Variables
$variableList[] = array(
    "placeholder" => "{Termin_Titel}",
    "description" => "",
    "category" => "meeting",
    "property" => "title"
);
$variableList[] = array(
    "placeholder" => "{Termin_Datum}",
    "description" => "",
    "category" => "meeting",
    "property" => "datePretty"
);
$variableList[] = array(
    "placeholder" => "{Termin_Uhrzeit}",
    "description" => "",
    "category" => "meeting",
    "property" => "start"
);
$variableList[] = array(
    "placeholder" => "{Termin_Uhrzeit_Ende}",
    "description" => "",
    "category" => "meeting",
    "property" => "end"
);
$variableList[] = array(
    "placeholder" => "{Berater_Name}",
    "description" => "",
    "category" => "meeting",
    "property" => "owner"
);
$variableList[] = array(
    "placeholder" => "{Berater_Mail}",
    "description" => "",
    "category" => "meeting",
    "property" => "ownerMail"
);


//Client variables
$variableList[] = array(
    "placeholder" => "{Termin_Kanal}",
    "description" => "",
    "category" => "client",
    "property" => "channelPretty"
);
$variableList[] = array(
    "placeholder" => "{Klient_Name}",
    "description" => "",
    "category" => "client",
    "property" => "name"
);
$variableList[] = array(
    "placeholder" => "{Klient_Telefon}",
    "description" => "",
    "category" => "client",
    "property" => "phone"
);
$variableList[] = array(
    "placeholder" => "{Klient_Mail}",
    "description" => "",
    "category" => "client",
    "property" => "mail"
);
$variableList[] = array(
    "placeholder" => "{Klient_Anliegen}",
    "description" => "",
    "category" => "client",
    "property" => "description"
);


//Room variables
$variableList[] = array(
    "placeholder" => "{Raum_Kanal}",
    "description" => "",
    "category" => "room",
    "property" => "kanal"
);
$variableList[] = array(
    "placeholder" => "{Raum_Nummer}",
    "description" => "",
    "category" => "room",
    "property" => "raumnummer"
);
$variableList[] = array(
    "placeholder" => "{Raum_Etage}",
    "description" => "",
    "category" => "room",
    "property" => "etage"
);
$variableList[] = array(
    "placeholder" => "{Raum_Strasse}",
    "description" => "",
    "category" => "room",
    "property" => "strasse"
);
$variableList[] = array(
    "placeholder" => "{Raum_Hausnummer}",
    "description" => "",
    "category" => "room",
    "property" => "hausnummer"
);
$variableList[] = array(
    "placeholder" => "{Raum_PLZ}",
    "description" => "",
    "category" => "room",
    "property" => "plz"
);
$variableList[] = array(
    "placeholder" => "{Raum_Ort}",
    "description" => "",
    "category" => "room",
    "property" => "ort"
);
$variableList[] = array(
    "placeholder" => "{Raum_Link}",
    "description" => "",
    "category" => "room",
    "property" => "link"
);
$variableList[] = array(
    "placeholder" => "{Raum_Passwort}",
    "description" => "",
    "category" => "room",
    "property" => "passwort"
);
$variableList[] = array(
    "placeholder" => "{Raum_Telefon}",
    "description" => "",
    "category" => "room",
    "property" => "telefon"
);



//Extra variables
$variableList[] = array(
    "placeholder" => "{Terminvergabe_Name}",
    "description" => "Name der Person, die den Termin an einen Kunden vergeben hat",
    "category" => "extra",
    "property" => "currentUserName"
);
