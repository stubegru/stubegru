-- Demo SQL statements to create initial datasets
-- DONT USE THIS ON PRDUCTION SYSTEMS!!!


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
--
-- Daten für Tabelle `Abwesenheiten`
--

INSERT INTO `Abwesenheiten` (`id`, `name`, `description`, `start`, `end`, `recurring`, `wholeDay`) VALUES
(2, 'Karl Krank', 'Reha', '2020-01-01 00:00:00', '2030-12-31 00:00:00', '', 1),
(3, 'Martina Meeting', 'Dienstrunde', '2020-01-01 07:00:00', '2020-01-01 17:00:00', 'daily', 0),
(4, 'Marcel Mittwoch', 'Homeoffice', '2022-09-07 00:00:00', '2030-12-31 00:00:00', 'weekly', 1);


--
-- Daten für Tabelle `Nachrichten`
--

INSERT INTO `Nachrichten` (`id`, `inhalt`, `titel`, `prioritaet`, `erfasser`, `erfassungsdatum`, `beginn`, `ende`) VALUES
(1, 'Stubegru ist ein Softwarepaket für eure <strong>Beratungsstelle</strong>.<br />\nEs gibt manchmal Tage, an denen verliert man den Überblick. Emails, Kalender, Webseiten, das Telefon klingelt und der nächste Kunde steht schon in der Tür...<br />\n<br />\nStubegru hilft euch den Überblick zu behalten. Es funktioniert in jedem Webbrowser ohne Installation, sogar im Home Office. Auf einen Blick haben alle die wichtigsten Informationen parat und die Details sind nur ein Klick entfernt: Tagesaktuelle Informationen, langfristige Regelungen und Prozessbeschreibungen, Abwesenheiten und gebuchte Beratungstermine. Alles in einem System.', 'Stubegru ist so toll!', 0, '1', '07.09.2022', '2020-01-01', '2030-12-31'),
(2, 'Diese Nachricht ist besonders wichtig und wird deshalb in <span style=\"color:#e74c3c\">rot</span> und an oberster Stelle angezeigt!', 'Wichtige Änderung (hier klicken für Details)', 1, '1', '29.10.2022', '2020-01-01', '2030-12-31');

--
-- Daten für Tabelle `notification_emitter`
--

INSERT INTO `notification_emitter` (`name`, `notificationTypeId`) VALUES
('ABSENCE', 'absence'),
('DAILY_NEWS', 'news'),
('MOVE_TO_WIKI', 'article'),
('MOVE_TO_WIKI', 'news'),
('WIKI_ARTICLE', 'article'),
('WIKI_REMINDER', 'reminder'),
('WIKI_REPORT', 'report');

--
-- Daten für Tabelle `notification_types`
--

INSERT INTO `notification_types` (`id`, `name`, `description`) VALUES
('absence', 'Abwesenheit', 'Benachrichtigungen über Änderungen bzw neue Abwesenheiten'),
('article', 'Wiki Artikel', 'Benachrichtigung über Änderungen bzw neue Wiki Artikel'),
('error', 'Technischer Fehler', 'Benachrichtigungen über technische Probleme'),
('news', 'Tagesaktuelle Info', 'Benachrichtigung über Änderungen bzw neue tagesaktuelle Infos'),
('reminder', 'Reminder', 'Automatische Benachrichtigung über Wiki Artikel, die überarbeitet werden müssen. Reminder müssen manuell erstellt werden.'),
('report', 'Wiki Problem', 'Benachrichtigung, wenn Nutzende einen Fehler in Wiki Artikeln melden.');

--
-- Daten für Tabelle `notification_type_user`
--

INSERT INTO `notification_type_user` (`userId`, `notificationType`, `online`, `mail`) VALUES
(1, 'absence', 1, 0),
(1, 'article', 1, 0),
(1, 'error', 1, 0),
(1, 'news', 1, 0),
(1, 'reminder', 1, 0),
(1, 'report', 1, 0),
(2, 'absence', 1, 0),
(2, 'article', 1, 0),
(2, 'news', 1, 0),
(3, 'absence', 1, 0),
(3, 'article', 1, 0),
(3, 'news', 1, 0);

--
-- Daten für Tabelle `Nutzer`
--

INSERT INTO `Nutzer` (`id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser`, `passwort`) VALUES
(1, 'Theodor Test', 'dummy@example.com', 'test', 3, '', '', '$2y$10$fLgGmGWibrtZjtvc3rst7ujFZGuQvEdox53wv5bWItxKKEQd3j/Da'),
(2, 'Hedwig Hiwi', 'nobody@example.com', 'hiwi', 1, '17.10.2023', '1', '$2y$10$N1TkGUT89EulLY/ez7.YtuEbCC/qbrdAun0UxtlkMZFrmzBCyF5mq'),
(3, 'Bernd Berater', 'nobody@exampe.com', 'bernd', 2, '17.10.2023', '1', '$2y$10$0qCxOUykHe6f3WeXu71yWes6aNrz45Mv9ozFPIt0v4jDhEvG1i8pi');

--
-- Daten für Tabelle `permissions`
--

INSERT INTO `permissions` (`id`, `description`) VALUES
('admin', 'Administrative Aufgaben: Nutzerverwaltung, Quicklinks editieren'),
('beratung', 'Beratungsaufgaben: Beratungstermine anlegen, Monitorin/Evaluation Download, Tagesaktuelle Infos bearbeiten'),
('monitoring', 'Berechtigung um das Monitoring zu benutzen'),
('telefonnotiz', 'Jede Person mit dieser Berechtigung wird in der Liste der Empfänger für Telefonnotizen angezeigt.'),
('wiki_autor', 'Erlaubnis um Wiki Artikel zu bearbeiten, zu erstellen und zu löschen.');

--
-- Daten für Tabelle `permissions_user`
--

INSERT INTO `permissions_user` (`userId`, `permissionId`) VALUES
(1, 'admin'),
(1, 'beratung'),
(1, 'monitoring'),
(1, 'telefonnotiz'),
(1, 'wiki_autor'),
(2, 'monitoring'),
(2, 'telefonnotiz'),
(3, 'beratung'),
(3, 'monitoring'),
(3, 'telefonnotiz'),
(3, 'wiki_autor');

--
-- Daten für Tabelle `permission_requests`
--

INSERT INTO `permission_requests` (`name`, `permissionId`) VALUES
('ABSENCE_READ', 'user'),
('ABSENCE_WRITE', 'admin'),
('ASSIGN_DATE', 'beratung'),
('DAILY_NEWS_READ', 'user'),
('DAILY_NEWS_WRITE', 'admin'),
('DEFAULT_VIEW_ACCESS', 'user'),
('EVALUATION_READ', 'admin'),
('EVALUATION_WRITE', 'anybody'),
('MEETING_ADVISOR', 'beratung'),
('MEETINGS_READ', 'user'),
('MEETINGS_WRITE', 'beratung'),
('MONITORING_READ', 'admin'),
('MONITORING_WRITE', 'monitoring'),
('MOVE_TO_WIKI', 'admin'),
('MOVE_TO_WIKI', 'wiki_autor'),
('QUICKLINK_READ', 'user'),
('QUICKLINK_WRITE', 'admin'),
('RECEIVE_TELEPHONE_NOTE', 'telefonnotiz'),
('REMOVE_ASSIGNMENT', 'beratung'),
('SEND_TELEPHONE_NOTE', 'user'),
('USER_READ', 'user'),
('USER_WRITE', 'admin'),
('VIEW_ACCESS_EVALUATION', 'anybody'),
('VIEW_ACCESS_LOGIN', 'anybody'),
('EVENT_TYPE_WRITE', 'beratung'),
('EVENT_TYPE_READ', 'beratung'),
('EVENT_INSTANCE_READ', 'beratung'),
('EVENT_INSTANCE_WRITE', 'beratung'),
('VIEW_ACCESS_PORTFOLIO', 'anybody'),
('WIKI_READ', 'user'),
('MAIL_LOG', 'admin'),
('WIKI_WRITE', 'wiki_autor');


--
-- Daten für Tabelle `Quicklinks`
--

INSERT INTO `Quicklinks` (`id`, `text`, `link`) VALUES
(1, 'Stubegru Website', 'https://stubegru.org/'),
(2, 'Stubgeru auf Gtihub', 'https://github.com/stubegru/stubegru');

--
-- Daten für Tabelle `Raeume`
--

INSERT INTO `Raeume` (`id`, `kanal`, `titel`, `besitzer`, `raumnummer`, `strasse`, `hausnummer`, `plz`, `ort`, `etage`, `link`, `passwort`, `telefon`, `aktiv`) VALUES
(1, 'personally', 'Testbüro', 1, '123', 'Teststraße', '12', '12345', 'Stadthausen', '1', 'www.example.com/roomlink', 'secret', '123456789', 1);

--
-- Daten für Tabelle `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Hilfskraft', 'Hilfskräfte mit eingeschränkten Berechtigungen'),
(2, 'Studienberatung', 'Studienberater:innen mit umfassenden Berechtigungen'),
(3, 'Admin', 'Alle Berechtigungen, insbesondere Nutzerverwaltung');

--
-- Daten für Tabelle `role_presets`
--

INSERT INTO `role_presets` (`roleId`, `type`, `subjectId`) VALUES
(1, 'notification_online', 'absence'),
(1, 'notification_online', 'article'),
(1, 'notification_online', 'news'),
(1, 'permission', 'monitoring'),
(2, 'notification_online', 'absence'),
(2, 'notification_online', 'article'),
(2, 'notification_online', 'news'),
(2, 'permission', 'beratung'),
(2, 'permission', 'monitoring'),
(2, 'permission', 'telefonnotiz'),
(2, 'permission', 'wiki_autor'),
(3, 'notification_online', 'absence'),
(3, 'notification_online', 'article'),
(3, 'notification_online', 'error'),
(3, 'notification_online', 'news'),
(3, 'notification_online', 'reminder'),
(3, 'notification_online', 'report'),
(3, 'permission', 'admin'),
(3, 'permission', 'beratung'),
(3, 'permission', 'monitoring'),
(3, 'permission', 'telefonnotiz'),
(3, 'permission', 'wiki_autor');

--
-- Daten für Tabelle `survey_answers`
--

INSERT INTO `survey_answers` (`id`, `questionId`, `userHash`, `value`, `optionId`, `surveyId`, `timestamp`) VALUES
(1, 1, '139nv8dcu3te', '3 -  Teils  /  Teils  ', 0, 1, '2023-10-16 16:32:45'),
(2, 1, 'j99koz429o', '3 -  Teils  /  Teils  ', 0, 1, '2023-10-16 17:02:48'),
(3, 1, '953nfryxq2', '3 -  Teils  /  Teils  ', 0, 1, '2023-10-16 17:02:53'),
(4, 1, 'fdfvh9fuvq', '', 0, 1, '2023-10-17 09:26:01'),
(5, 2, 'fdfvh9fuvq', '', 0, 1, '2023-10-17 09:26:01'),
(6, 3, 'fdfvh9fuvq', '', 0, 1, '2023-10-17 09:26:01'),
(7, 24, 'fdfvh9fuvq', 'infotheke', 0, 1, '2023-10-17 09:26:01'),
(8, 25, 'fdfvh9fuvq', 'studieninteressierte inland', 0, 1, '2023-10-17 09:26:01'),
(9, 26, 'fdfvh9fuvq', 'Bachelor inkl. kunst. Studiengänge', 0, 1, '2023-10-17 09:26:01'),
(10, 27, 'fdfvh9fuvq', 'Einschreibung', 0, 1, '2023-10-17 09:26:01'),
(11, 28, 'fdfvh9fuvq', 'Kein freier Termin verfügbar', 0, 1, '2023-10-17 09:26:01');

--
-- Daten für Tabelle `survey_answer_options`
--

INSERT INTO `survey_answer_options` (`id`, `questionId`, `title`, `text`, `value`, `action`) VALUES
(3, 2, 'Gut', 'Gut', 'good', ''),
(4, 2, 'Mittle', 'Mittle', 'mid', ''),
(5, 2, 'Schlecht', 'Schlecht', 'bad', ''),
(6, 3, 'Freunde', 'Freunde', 'friends', ''),
(7, 3, 'Familie', 'Familie', 'family', ''),
(8, 3, 'Andere', 'Andere', 'others', ''),
(9, 4, 'Selten', 'selten', 'rarely', ''),
(10, 4, 'Oft', 'Oft', 'often', ''),
(11, 4, 'Ja', 'Ja', 'yes', ''),
(12, 15, 'Homepage der Universität', '', 'homepage', ''),
(13, 15, 'Flyer / Broschüre\r\n', '', 'flyer', ''),
(14, 15, 'Freunde / Bekannte\r\n', '', 'friends', ''),
(15, 15, 'Information Studium im Campus Center\r\n', '', 'campus center', ''),
(16, 15, 'Callcenter der Information Studium\r\n', '', 'callcenter', ''),
(17, 15, 'Fachbereich', '', 'faculty', ''),
(18, 15, 'Studierendensekretariat', '', 'stusek', ''),
(19, 15, 'Sonstiges', '', 'others', ''),
(20, 19, 'Studieninteressierte/r', '', 'interested', ''),
(21, 19, 'Studierende/r', '', 'student', ''),
(22, 19, 'Sonstiges', '', 'others', ''),
(23, 20, 'Ich habe den Beratungsraum nicht gefunden', '', 'Beratungsraum nicht gefunden', 'hide:nichtteilnahmegrund'),
(24, 20, 'Ich habe den Termin vergessen', '', 'forgotten', 'hide:nichtteilnahmegrund'),
(25, 20, 'Ich war verhindert', '', 'verhindert', 'hide:nichtteilnahmegrund'),
(26, 20, 'Mein Anliegen habe ich in einer anderen Beratungsstelle geklärt', '', 'geklärt', 'hide:nichtteilnahmegrund'),
(27, 20, 'Mein Anliegen hat sich inzwischen erledigt', '', 'erledigt', 'hide:nichtteilnahmegrund'),
(28, 20, 'Die Beraterin/der Berater war nicht anwesend bzw. hat abgesagt', '', 'kein Berater', 'hide:nichtteilnahmegrund'),
(29, 20, 'Sonstiges, und zwar', '', 'others', 'show:nichtteilnahmegrund'),
(30, 24, 'Telefon', '', 'telefon', ''),
(31, 24, 'Email', '', 'email', ''),
(32, 24, 'Infotheke', '', 'infotheke', ''),
(33, 25, 'Studieninteressierte Inland', '', 'studieninteressierte inland', ''),
(34, 25, 'Studierende Uni', '', 'studierende uni ks', ''),
(35, 25, 'Studieninteressierte International', '', 'studieninteressierte international', ''),
(36, 25, 'Studierende andere Hochschule', '', 'studierende andere hochschule', ''),
(37, 25, 'Sonstige', '(KK, FB, Eltern, Polizei, ehem. Studierende...)', 'sonstige', 'tooltip'),
(38, 26, 'Bachelor inkl. kunst. Studiengänge', '', 'Bachelor inkl. kunst. Studiengänge', ''),
(39, 26, 'Flüchtlingsberatung', '', 'Flüchtlingsberatung', ''),
(40, 26, 'Master', '', 'Master', ''),
(41, 26, 'Allg. Studienberatung', '', 'Allg. Studienberatung', ''),
(42, 26, 'Lehramt', '', 'Lehramt', ''),
(43, 26, 'Stadt', '', 'Stadt', ''),
(44, 26, 'Promotion', '', 'Promotion', ''),
(45, 26, 'Sonstiges', '(IO, P-Amt, ITS, FB, Studentenwerk, Sprachzentrum, Studienkolleg, Hess. Lehrkräfteakad, Visainfo, Welcome Centre, uni-assist...)', 'Sonstiges', 'tooltip'),
(46, 26, 'Beglaubigung', '', 'Beglaubigung', ''),
(47, 27, 'Studiengang Allg.', '', 'Studiengang Allg.', ''),
(48, 27, 'Studienverlauf', '(Wechsel, abzählen, Exma, Beurlaubung, Teilzeitstudium...)', 'Studienverlauf', 'tooltip'),
(49, 27, 'Bewerbung', '(inkl. beruflich Qualifizierte)', 'Bewerbung', 'tooltip'),
(50, 27, 'Terminvereinbarung', '', 'Terminvereinbarung', ''),
(51, 27, 'Einschreibung', '', 'Einschreibung', ''),
(52, 27, 'Verweis', '', 'Verweis', ''),
(53, 27, 'Rückmeldung', '', 'Rückmeldung', ''),
(54, 27, 'Sonstiges', '(Adressänderung, Bescheinigung, Rentenbescheid...)', 'Sonstiges', 'tooltip'),
(55, 28, 'abschließend beantwortet', '', 'abschließend beantwortet', ''),
(56, 28, 'verschoben/weitergeleitet', '(inkl. Übernahme und Telefonnotiz)', 'verschoben/weitergeleitet', 'tooltip'),
(57, 28, 'Ticketvergabe', '', 'Ticketvergabe', ''),
(58, 28, 'Technische Störung/Sonstiges', '(Anruf abgebrochen ohne abschl. Beantwortung...)', 'Technische Störung/Sonstiges', 'tooltip'),
(60, 28, 'Kein passender Termin gefunden', 'Grundsätzlich sind freie Beratungstermin im Kalender verfügbar. Dem Kunden passt aber keiner davon.', 'Kein passender Termin gefunden', 'tooltip'),
(61, 28, 'Kein freier Termin verfügbar', 'Absolut kein freier Beratungstermin im Kalendar verfügbar.', 'Kein freier Termin verfügbar', 'tooltip'),
(62, 5, 'Ja', '', 'Ja', 'show:beratungstermin|hide:nichtstattgefunden'),
(63, 5, 'Nein', '', 'Nein', 'hide:beratungstermin|show:nichtstattgefunden');

--
-- Daten für Tabelle `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `title`, `text`, `type`, `questionGroup`, `surveyId`, `action`) VALUES
(1, 'Vorname', 'Bitte tragen Sie hier Ihren Vornamen ein', 'input:text', 'personal-info', 1, 'show: second-name'),
(2, 'Wie war die Vorlesung?', 'Bitte bewerten sie die Vorlesung', 'radio', 'ratings', 1, ''),
(3, 'Wodurch sind Sie auf uns aufmerksam geworden?', 'wählen Sie eine oder mehrere Optionen', 'checkbox', '', 1, ''),
(5, 'Hat der Beratungstermin stattgefunden?', '', 'select', '', 2, ''),
(6, 'Wartezeit', 'Die Wartezeit auf den Gesprächstermin war zu lang.', 'rating', 'beratungstermin', 2, ''),
(7, 'Zugang zur Studienberatung', 'Die Allgemeine Studienberatung ist gut zu finden.', 'rating', 'beratungstermin', 2, ''),
(8, 'Informationsgehalt', 'Ich habe die notwendigen Informationen bekommen oder weiß nun, wo ich sie bekommen kann.', 'rating', 'beratungstermin', 2, ''),
(9, 'Ergebnis', 'Das Gespräch hat mir im Orientierungs- /Entscheidungsprozess weitergeholfen.	', 'rating', 'beratungstermin', 2, ''),
(10, 'Weitervermittlung', 'Ich hatte den Eindruck, dass ich, wenn nötig, an die richtigen Einrichtungen weiter verwiesen wurde.	', 'rating', 'beratungstermin', 2, ''),
(11, 'Kompetenz des Beratenden', 'Der/die Berater/in hat einen kompetenten Eindruck gemacht.	', 'rating', 'beratungstermin', 2, ''),
(12, 'Aufmerksamkeit des Beratenden', 'Der/die Berater/in hat mir zugehört und mein Anliegen ernst genommen.	', 'rating', 'beratungstermin', 2, ''),
(13, 'Erfolg', 'Der Besuch bei der Allg. Studienberatung hat sich für mich gelohnt.	', 'rating', 'beratungstermin', 2, ''),
(14, 'Empfehlung', 'Ein Gespräch bei der Studienberatung würde ich anderen weiterempfehlen.	', 'rating', 'beratungstermin', 2, ''),
(15, 'Wie sind Sie auf die \"Allgemeine Studienberatung\" aufmerksam geworden? \r\n', 'Mehrfachnennungen sind möglich!', 'checkbox', 'beratungstermin', 2, ''),
(16, 'Im Gespräch hat mir gut gefallen:', '', 'text', 'beratungstermin', 2, ''),
(17, 'Das könnte noch besser werden:', '', 'text', 'beratungstermin', 2, ''),
(18, 'Von der Allgemeinen Studienberatung wünsche ich mir folgende Angebote (Workshops, Beratungen...) :', '', 'text', 'beratungstermin', 2, ''),
(19, 'Mein Status:', '', 'select', '', 2, ''),
(20, 'Aus welchen Gründen haben Sie den Beratungstermin nicht wahrnehmen können?', '', 'select', 'nichtstattgefunden', 2, ''),
(21, 'Ich möchte folgendes anmerken<br> oder anregen:', '', 'text', 'nichtstattgefunden', 2, ''),
(22, 'Von der Allgemeinen Studienberatung wünsche ich mir folgende Angebote:', '', 'text', 'nichtstattgefunden', 2, ''),
(23, 'Ich konnte nicht teilnehmen weil:', '', 'text', 'nichtteilnahmegrund', 2, ''),
(24, 'Kontaktkanal', '', 'radio-inline', '', 1, ''),
(25, 'Zielgruppe', '', 'radio-inline', '', 1, ''),
(26, 'Sachgebiet', '', 'radio-inline', '', 1, ''),
(27, 'Anliegen', '', 'radio-inline', '', 1, ''),
(28, 'Ergebnis', '', 'radio-inline', '', 1, '');

--
-- Daten für Tabelle `survey_survey`
--

INSERT INTO `survey_survey` (`id`, `title`, `auth`, `adminAuth`, `uniqueKey`) VALUES
(2, 'Feedback Studienberatung Universität', 'EVALUATION_WRITE', 'EVALUATION_READ', 1),
(1, 'Tracking', 'MONITORING_WRITE', 'MONITORING_READ', 0);

--
-- Daten für Tabelle `Templates`
--

INSERT INTO `Templates` (`id`, `titel`, `text`, `letzteaenderung`, `ersteller`, `betreff`) VALUES
(1, 'Testvorlage für Mails', 'Dies ist eine Testmail. Folgende Varibalen können benutzt werden:<br />\n{Termin_Titel} {Termin_Datum} {Termin_Uhrzeit} {Klient_Name} {Klient_Telefon} {Berater_Name} {Berater_Mail} {Raum_Kanal} {Raum_Nummer} {Raum_Etage} {Raum_Strasse} {Raum_Hausnummer} {Raum_PLZ} {Raum_Ort} {Raum_Link} {Raum_Passwort} {Raum_Telefon}', '2019-12-31 23:00:00', 0, 'Testvorlage für Mails');

--
-- Daten für Tabelle `wiki_artikel`
--

INSERT INTO `wiki_artikel` (`id`, `heading`, `text`, `lastChanged`, `reminderDate`, `reminderText`, `showInSidebar`) VALUES
(1, 'Was ist Stubegru?', 'Stubegru ist ein Softwarepaket für eure Beratungsstelle.<br />\nEs gibt manchmal Tage, an denen verliert man den Überblick. Emails, Kalender, Webseiten, das Telefon klingelt und der nächste Kunde steht schon in der Tür...<br />\n<br />\nStubegru hilft euch den Überblick zu behalten. Es funktioniert in jedem Webbrowser ohne Installation, sogar im Home Office. Auf einen Blick haben alle die wichtigsten Informationen parat und die Details sind nur ein Klick entfernt: Tagesaktuelle Informationen, langfristige Regelungen und Prozessbeschreibungen, Abwesenheiten und gebuchte Beratungstermine. Alles in einem System.', '2019-12-31 23:00:00', '0000-00-00', '', 0),
(2, 'Inhaltsverzeichnis', 'Dies ist die Wiki Sidebar<br />\nSie kann wie ein Wiki Artikel editiert werden.<br />\nZum bearbeiten der Sidebar [wikiword|2|hier klicken]<br />\n<br />\nWichtige Themen:\n<ul>\n	<li>[wikiword|1|Was ist Stubegru]</li>\n</ul>\n', '2019-12-31 23:00:00', '0000-00-00', '', 1),
(3, 'Formatierung in Wiki Artikeln', 'In Wiki Artikeln kannst du natürlich auch wunderschöne Fomratierungen benutzen.<br />\nDu kannst Text in <strong>Fett</strong> oder <em>Kursiv</em> dartellen.<br />\nOder sogar in <em><strong>fett und kursiv</strong></em>.<br />\nDu kannst Text sogar <u>unterstreichen</u>.<br />\nOder auch <u><strong>fett und unterstrichen</strong></u>.<br />\nOder <u><em><strong>kursiv und fett und unterstrichen</strong></em></u>.<br />\nOder…&nbsp;Okay ich glaube das Prinzip ist klar geworden, oder…?\n<h1>Listen</h1>\nEs gibt auch Listen, damit kannst du wichtige Dinge aufzählen:\n\n<ul>\n	<li><strong><span style=\"color:#c0392b\"><span style=\"font-family:Comic Sans MS,cursive\">Müll rausbringen</span></span></strong></li>\n	<li><strong><span style=\"color:#c0392b\"><span style=\"font-family:Comic Sans MS,cursive\">Klo putzen</span></span></strong></li>\n	<li><strong><span style=\"color:#c0392b\"><span style=\"font-family:Comic Sans MS,cursive\">Wasserkocher entkalken</span></span></strong></li>\n</ul>\nOkay, lass uns lieber über schönere Dinge sprechen. Alles wird schöner wenn es eine Nummer hat:\n\n<ol>\n	<li><span style=\"font-family:Courier New,Courier,monospace\"><span style=\"color:#16a085\">Pizza essen</span></span></li>\n	<li><span style=\"font-family:Courier New,Courier,monospace\"><span style=\"color:#16a085\">Kaffee trinken</span></span></li>\n	<li><span style=\"font-family:Courier New,Courier,monospace\"><span style=\"color:#16a085\">Auf dem Sofa chillen</span></span></li>\n	<li><span style=\"font-family:Courier New,Courier,monospace\"><span style=\"color:#16a085\">Jetzt solltest du aber wirklich mal den Müll rausbringen!</span></span></li>\n</ol>\nDu kannst auch <a href=\"https://stubegru.org\">Links benutzen</a> oder [wikiword|1|Wikiwords] erstellen, damit kannst du ganz einfach auf andere Artikel in diesem Wiki verweisen.<br />\n&nbsp;\n<div class=\"sachbearbeiter\">\n<p>Warum nicht mal etwas farbig hervorheben? So wird das Leben <span style=\"color:#ecf0f1\"><span style=\"background-color:#8e44ad\">bunter</span></span> und der Leser wieder munter :-)</p>\n</div>\n', '2023-10-17 09:15:48', '0000-00-00', '', 0);

--
-- Daten für Tabelle `wiki_link_artikel_tags`
--

INSERT INTO `wiki_link_artikel_tags` (`artikelId`, `tagId`) VALUES
(3, 2);

--
-- Daten für Tabelle `wiki_link_favoriten`
--

INSERT INTO `wiki_link_favoriten` (`nutzerId`, `artikelId`) VALUES
(1, 1),
(1, 2);

--
-- Daten für Tabelle `wiki_tags`
--

INSERT INTO `wiki_tags` (`id`, `name`) VALUES
(1, 'info'),
(2, 'stubegru');
COMMIT;
