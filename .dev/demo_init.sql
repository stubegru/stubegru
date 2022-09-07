-- Demo SQL statements to create initial datasets
-- DONT USE THIS ON PRDUCTION SYSTEMS!!!


SET time_zone = "+00:00";
--
-- Daten für Tabelle `Abwesenheiten`
--

INSERT INTO `Abwesenheiten` (`id`, `name`, `description`, `start`, `end`, `recurring`, `wholeDay`) VALUES
(2, 'Karl Krank', 'Reha', '2020-01-01 00:00:00', '2030-12-31 00:00:00', '', 1),
(3, 'Martina Meeting', 'Dienstrunde', '2020-01-01 07:00:00', '2020-01-01 17:00:00', 'daily', 0),
(4, 'Marcel Mittwoch', 'Homeoffice', '2022-09-07 00:00:00', '2030-12-31 00:00:00', 'weekly', 1);

--
-- Daten für Tabelle `Link_Nutzer_Rechte`
--

INSERT INTO `Link_Nutzer_Rechte` (`userId`, `permissionId`) VALUES
(1, 'admin'),
(1, 'beratung'),
(1, 'monitoring'),
(1, 'telefonnotiz'),
(1, 'wiki_autor');

--
-- Daten für Tabelle `Nachrichten`
--

INSERT INTO `Nachrichten` (`id`, `inhalt`, `titel`, `prioritaet`, `erfasser`, `erfassungsdatum`, `beginn`, `ende`) VALUES
(1, 'Stubegru ist ein Softwarepaket für eure <strong>Beratungsstelle</strong>.<br />\nEs gibt manchmal Tage, an denen verliert man den Überblick. Emails, Kalender, Webseiten, das Telefon klingelt und der nächste Kunde steht schon in der Tür...<br />\n<br />\nStubegru hilft euch den Überblick zu behalten. Es funktioniert in jedem Webbrowser ohne Installation, sogar im Home Office. Auf einen Blick haben alle die wichtigsten Informationen parat und die Details sind nur ein Klick entfernt: Tagesaktuelle Informationen, langfristige Regelungen und Prozessbeschreibungen, Abwesenheiten und gebuchte Beratungstermine. Alles in einem System.', 'Stubegru ist so toll!', 0, '1', '07.09.2022', '2020-01-01', '2030-12-31'),
(2, 'Diese Nachricht ist besonders wichtig und wird deshalb in <span style=\"color:#e74c3c\">rot</span> und an oberster Stelle angezeigt!', 'Wichtige Änderung (hier klicken für Details)', 1, '1', '07.09.2022', '2020-01-01', '2030-12-31');

--
-- Daten für Tabelle `Nutzer`
--

INSERT INTO `Nutzer` (`id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser`, `passwort`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error`) VALUES
(1, 'test', 'dummy@example.com', 'test', 1, '', '', '$2y$10$fLgGmGWibrtZjtvc3rst7ujFZGuQvEdox53wv5bWItxKKEQd3j/Da', 0, 0, 0, 0, 0, 0);

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
(1, 'personally', 'Testbüro', 0, ':raumnummer', ':strasse', ':hausnummer', ':plz', ':ort', ':etage', ':link', ':passwort', ':telefon', 1);

--
-- Daten für Tabelle `Rechte`
--

INSERT INTO `Rechte` (`id`, `description`) VALUES
('admin', 'Administrative Aufgaben: Nutzerverwaltung, Quicklinks editieren'),
('beratung', 'Beratungsaufgaben: Beratungstermine anlegen, Monitorin/Evaluation Download, Tagesaktuelle Infos bearbeiten'),
('monitoring', 'Berechtigung um das Monitoring zu benutzen'),
('telefonnotiz', 'Jede Person mit dieser Berechtigung wird in der Liste der Empfänger für Telefonnotizen angezeigt.'),
('wiki_autor', 'Erlaubnis um Wiki Artikel zu bearbeiten, zu erstellen und zu löschen.');

--
-- Daten für Tabelle `Rollen`
--

INSERT INTO `Rollen` (`id`, `name`, `permission_admin`, `permission_beratung`, `permission_monitoring`, `permission_wiki_autor`, `permission_telefonnotiz`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error`) VALUES
(1, 'Studiservice', 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
(2, 'Hiflskraft', 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0),
(3, 'Beratung', 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0),
(4, 'Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1);

--
-- Daten für Tabelle `survey_questions`
--

INSERT INTO `survey_questions` (`id`, `title`, `text`, `type`, `questionGroup`, `surveyId`, `action`) VALUES
(1, 'Wie toll ist Stubegru?', 'Stubegru ist megageil!!!', 'rating', '', 1, '');

--
-- Daten für Tabelle `survey_survey`
--

INSERT INTO `survey_survey` (`id`, `title`, `auth`, `adminAuth`, `uniqueKey`) VALUES
(1, 'Dummy Survey', 'anybody', 'admin', 0);

--
-- Daten für Tabelle `Templates`
--

INSERT INTO `Templates` (`id`, `titel`, `text`, `letzteaenderung`, `ersteller`, `betreff`) VALUES
(1, 'Testvorlage für Mails', 'Dies ist eine Testmail. Folgende Varibalen können benutzt werden:<br />\n{Termin_Titel} {Termin_Datum} {Termin_Uhrzeit} {Klient_Name} {Klient_Telefon} {Berater_Name} {Berater_Mail} {Raum_Kanal} {Raum_Nummer} {Raum_Etage} {Raum_Strasse} {Raum_Hausnummer} {Raum_PLZ} {Raum_Ort} {Raum_Link} {Raum_Passwort} {Raum_Telefon}', '2022-09-07 09:54:11', 0, 'Testvorlage für Mails');

--
-- Daten für Tabelle `wiki_artikel`
--

INSERT INTO `wiki_artikel` (`id`, `heading`, `text`, `lastChanged`, `reminderDate`, `reminderText`, `showInSidebar`) VALUES
(1, 'Was ist Stubegru?', 'Stubegru ist ein Softwarepaket für eure Beratungsstelle.<br />\nEs gibt manchmal Tage, an denen verliert man den Überblick. Emails, Kalender, Webseiten, das Telefon klingelt und der nächste Kunde steht schon in der Tür...<br />\n<br />\nStubegru hilft euch den Überblick zu behalten. Es funktioniert in jedem Webbrowser ohne Installation, sogar im Home Office. Auf einen Blick haben alle die wichtigsten Informationen parat und die Details sind nur ein Klick entfernt: Tagesaktuelle Informationen, langfristige Regelungen und Prozessbeschreibungen, Abwesenheiten und gebuchte Beratungstermine. Alles in einem System.', '2022-09-07 09:55:58', '0000-00-00', '', 0),
(2, 'Inhaltsverzeichnis', 'Dies ist die Wiki Sidebar<br />\nSie kann wie ein Wiki Artikel editiert werden.<br />\nZum bearbeiten der Sidebar [wikiword|2|hier klicken]<br />\n<br />\nWichtige Themen:\n<ul>\n	<li>[wikiword|1|Was ist Stubegru]</li>\n</ul>\n', '2022-09-07 09:59:46', '0000-00-00', '', 1);

--
-- Daten für Tabelle `wiki_link_favoriten`
--

INSERT INTO `wiki_link_favoriten` (`nutzerId`, `artikelId`) VALUES
(1, 1),
(1, 2);

--
-- Daten für Tabelle `wiki_link_gelesen`
--

INSERT INTO `wiki_link_gelesen` (`nutzerId`, `artikelId`) VALUES
(1, 1),
(1, 2);

--
-- Daten für Tabelle `wiki_tags`
--

INSERT INTO `wiki_tags` (`id`, `name`) VALUES
(1, 'info'),
(2, 'stubegru');
COMMIT;