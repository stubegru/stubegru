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
    "description" => "Titel des Termins",
    "category" => "meeting",
    "property" => "title"
);
$variableList[] = array(
    "placeholder" => "{Termin_Datum}",
    "description" => "Datum des Termins. Format: dd.mm.yyyy",
    "category" => "meeting",
    "property" => "datePretty"
);
$variableList[] = array(
    "placeholder" => "{Termin_Uhrzeit}",
    "description" => "Beginn des Termins im Format: hh:mm",
    "category" => "meeting",
    "property" => "start"
);
$variableList[] = array(
    "placeholder" => "{Termin_Uhrzeit_Ende}",
    "description" => "Ende des Termins im Format: hh:mm",
    "category" => "meeting",
    "property" => "end"
);
$variableList[] = array(
    "placeholder" => "{Berater_Name}",
    "description" => "Name der Beratenden Person",
    "category" => "meeting",
    "property" => "owner"
);
$variableList[] = array(
    "placeholder" => "{Berater_Mail}",
    "description" => "Mailadresse der Beratenden Person",
    "category" => "meeting",
    "property" => "ownerMail"
);


//Client variables
$variableList[] = array(
    "placeholder" => "{Termin_Kanal}",
    "description" => "Beratungskanal, den der Kunde bei der Terminvergabe gewünscht hat. Mögliche Werte: Persönliches Gespräch / Telefonberatung / Webmeeting",
    "category" => "client",
    "property" => "channelPretty"
);
$variableList[] = array(
    "placeholder" => "{Klient_Name}",
    "description" => "Name des Kunden",
    "category" => "client",
    "property" => "name"
);
$variableList[] = array(
    "placeholder" => "{Klient_Telefon}",
    "description" => "Telefonnummer des Kunden",
    "category" => "client",
    "property" => "phone"
);
$variableList[] = array(
    "placeholder" => "{Klient_Mail}",
    "description" => "Mailadresse des Kunden",
    "category" => "client",
    "property" => "mail"
);
$variableList[] = array(
    "placeholder" => "{Klient_Anliegen}",
    "description" => "Beratungsanliegen des Kunden",
    "category" => "client",
    "property" => "description"
);


//Room variables
$variableList[] = array(
    "placeholder" => "{Raum_Kanal}",
    "description" => "Art des Beratungsraums, mögliche Werte: personally,webmeeting,phone",
    "category" => "room",
    "property" => "kanal"
);
$variableList[] = array(
    "placeholder" => "{Raum_Nummer}",
    "description" => "Raumnummer",
    "category" => "room",
    "property" => "raumnummer"
);
$variableList[] = array(
    "placeholder" => "{Raum_Etage}",
    "description" => "Etage des Raums",
    "category" => "room",
    "property" => "etage"
);
$variableList[] = array(
    "placeholder" => "{Raum_Strasse}",
    "description" => "Strasse des Gebäudes",
    "category" => "room",
    "property" => "strasse"
);
$variableList[] = array(
    "placeholder" => "{Raum_Hausnummer}",
    "description" => "Hausnummer des Gebäudes",
    "category" => "room",
    "property" => "hausnummer"
);
$variableList[] = array(
    "placeholder" => "{Raum_PLZ}",
    "description" => "Postleitzahl des Gebäudes",
    "category" => "room",
    "property" => "plz"
);
$variableList[] = array(
    "placeholder" => "{Raum_Ort}",
    "description" => "Ortsname des Gebäudes",
    "category" => "room",
    "property" => "ort"
);
$variableList[] = array(
    "placeholder" => "{Raum_Link}",
    "description" => "Link zur Wegbeschreibung des Raumes",
    "category" => "room",
    "property" => "link"
);
$variableList[] = array(
    "placeholder" => "{Raum_Passwort}",
    "description" => "Passwort für den Raum. Beispielsweise Kenncode bei Webmeetings",
    "category" => "room",
    "property" => "passwort"
);
$variableList[] = array(
    "placeholder" => "{Raum_Telefon}",
    "description" => "Telefonnummer des Raums",
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
