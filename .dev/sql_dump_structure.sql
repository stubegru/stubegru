-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Erstellungszeit: 18. Aug 2022 um 09:00

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
--

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Abwesenheiten`
--

CREATE TABLE `Abwesenheiten` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `start` timestamp NULL DEFAULT NULL,
  `end` timestamp NULL DEFAULT NULL,
  `recurring` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wholeDay` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Benachrichtigungen`
--

CREATE TABLE `Benachrichtigungen` (
  `id` int(11) NOT NULL,
  `triggerType` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `triggerId` int(11) NOT NULL,
  `userId` int(11) NOT NULL COMMENT 'Vom wem wurde diese Notification ausgelöst',
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `triggerInfoHeadline` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `triggerInfoText` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `triggerExtraInfo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Wird genutzt, um bei einem report, die report Kategorie zu speichern'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Beratene`
--

CREATE TABLE `Beratene` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `formular` tinyint(1) NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `dateId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Feedback_Mails`
--

CREATE TABLE `Feedback_Mails` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `mail` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Link_Benachrichtigungen_Nutzer`
--

CREATE TABLE `Link_Benachrichtigungen_Nutzer` (
  `notificationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Link_Nutzer_Rechte`
--

CREATE TABLE `Link_Nutzer_Rechte` (
  `userId` int(11) NOT NULL,
  `permissionId` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Nachrichten`
--

CREATE TABLE `Nachrichten` (
  `id` int(11) NOT NULL,
  `inhalt` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `titel` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `prioritaet` tinyint(1) NOT NULL,
  `erfasser` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `erfassungsdatum` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `beginn` date NOT NULL,
  `ende` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Nutzer`
--

CREATE TABLE `Nutzer` (
  `id` int(11) NOT NULL,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `mail` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` int(11) NOT NULL COMMENT 'See table Rollen',
  `erfassungsdatum` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `erfasser` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwort` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_reminder` int(11) NOT NULL DEFAULT 3 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online',
  `notification_report` int(11) NOT NULL DEFAULT 3 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online',
  `notification_article` int(11) NOT NULL DEFAULT 3 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online',
  `notification_news` int(11) NOT NULL DEFAULT 3 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online',
  `notification_absence` int(11) NOT NULL DEFAULT 3 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online',
  `notification_error` int(11) DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Online'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Quicklinks`
--

CREATE TABLE `Quicklinks` (
  `id` int(11) NOT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Raeume`
--

CREATE TABLE `Raeume` (
  `id` int(11) NOT NULL,
  `kanal` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'personally',
  `titel` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `besitzer` int(11) NOT NULL,
  `raumnummer` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `strasse` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hausnummer` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `plz` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ort` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `etage` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passwort` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefon` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `aktiv` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Rechte`
--

CREATE TABLE `Rechte` (
  `id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Rollen`
--

CREATE TABLE `Rollen` (
  `id` int(11) NOT NULL,
  `name` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permission_admin` tinyint(1) NOT NULL,
  `permission_beratung` tinyint(1) NOT NULL,
  `permission_monitoring` tinyint(1) NOT NULL,
  `permission_wiki_autor` tinyint(1) NOT NULL,
  `permission_telefonnotiz` tinyint(1) NOT NULL,
  `notification_reminder` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine',
  `notification_report` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine',
  `notification_article` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine',
  `notification_news` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine',
  `notification_absence` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine',
  `notification_error` int(11) NOT NULL DEFAULT 0 COMMENT '0:nichts 1:nur Online 2:nur Mail 3:Mail und Onliine'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Studiengaenge`
--

CREATE TABLE `Studiengaenge` (
  `id` int(11) NOT NULL,
  `nummer` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_answers`
--

CREATE TABLE `survey_answers` (
  `id` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `userHash` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `optionId` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_answer_options`
--

CREATE TABLE `survey_answer_options` (
  `id` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `title` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_keys`
--

CREATE TABLE `survey_keys` (
  `id` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `uniqueKey` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL,
  `title` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `questionGroup` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surveyId` int(11) NOT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_survey`
--

CREATE TABLE `survey_survey` (
  `id` int(11) NOT NULL,
  `title` varchar(300) COLLATE utf8mb4_unicode_ci NOT NULL,
  `auth` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `adminAuth` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `uniqueKey` tinyint(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Templates`
--

CREATE TABLE `Templates` (
  `id` int(11) NOT NULL,
  `titel` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `letzteaenderung` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ersteller` int(11) NOT NULL,
  `betreff` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Termine`
--

CREATE TABLE `Termine` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `owner` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ownerId` int(11) NOT NULL,
  `free` int(11) NOT NULL DEFAULT 0,
  `room` int(11) NOT NULL,
  `erfassungsdatum` timestamp NOT NULL DEFAULT current_timestamp(),
  `start` time NOT NULL,
  `end` time NOT NULL,
  `title` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `channel` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'all',
  `teilnehmer` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `template` int(11) NOT NULL COMMENT 'Id des mail templates das bei terminvergabe an den zu Beratenden versendet wird',
  `blocked` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_artikel`
--

CREATE TABLE `wiki_artikel` (
  `id` int(11) NOT NULL,
  `heading` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastChanged` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reminderDate` date DEFAULT NULL,
  `reminderText` mediumtext COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `showInSidebar` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_link_artikel_tags`
--

CREATE TABLE `wiki_link_artikel_tags` (
  `artikelId` int(11) NOT NULL,
  `tagId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_link_favoriten`
--

CREATE TABLE `wiki_link_favoriten` (
  `nutzerId` int(11) NOT NULL,
  `artikelId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_link_gelesen`
--

CREATE TABLE `wiki_link_gelesen` (
  `nutzerId` int(11) NOT NULL,
  `artikelId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_tags`
--

CREATE TABLE `wiki_tags` (
  `id` int(11) NOT NULL,
  `name` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indizes der exportierten Tabellen
--

--
-- Indizes für die Tabelle `Abwesenheiten`
--
ALTER TABLE `Abwesenheiten`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Benachrichtigungen`
--
ALTER TABLE `Benachrichtigungen`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Beratene`
--
ALTER TABLE `Beratene`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Feedback_Mails`
--
ALTER TABLE `Feedback_Mails`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Link_Benachrichtigungen_Nutzer`
--
ALTER TABLE `Link_Benachrichtigungen_Nutzer`
  ADD PRIMARY KEY (`notificationId`,`userId`);

--
-- Indizes für die Tabelle `Link_Nutzer_Rechte`
--
ALTER TABLE `Link_Nutzer_Rechte`
  ADD PRIMARY KEY (`userId`,`permissionId`);

--
-- Indizes für die Tabelle `Nachrichten`
--
ALTER TABLE `Nachrichten`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Nutzer`
--
ALTER TABLE `Nutzer`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Quicklinks`
--
ALTER TABLE `Quicklinks`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Raeume`
--
ALTER TABLE `Raeume`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Rechte`
--
ALTER TABLE `Rechte`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Rollen`
--
ALTER TABLE `Rollen`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Studiengaenge`
--
ALTER TABLE `Studiengaenge`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `survey_answers`
--
ALTER TABLE `survey_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `questionId` (`questionId`,`userHash`);

--
-- Indizes für die Tabelle `survey_answer_options`
--
ALTER TABLE `survey_answer_options`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `survey_keys`
--
ALTER TABLE `survey_keys`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniqueKey` (`uniqueKey`);

--
-- Indizes für die Tabelle `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `survey_survey`
--
ALTER TABLE `survey_survey`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Templates`
--
ALTER TABLE `Templates`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Termine`
--
ALTER TABLE `Termine`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `wiki_artikel`
--
ALTER TABLE `wiki_artikel`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `wiki_link_artikel_tags`
--
ALTER TABLE `wiki_link_artikel_tags`
  ADD UNIQUE KEY `artikelId` (`artikelId`,`tagId`);

--
-- Indizes für die Tabelle `wiki_link_favoriten`
--
ALTER TABLE `wiki_link_favoriten`
  ADD UNIQUE KEY `nutzerId` (`nutzerId`,`artikelId`);

--
-- Indizes für die Tabelle `wiki_link_gelesen`
--
ALTER TABLE `wiki_link_gelesen`
  ADD UNIQUE KEY `nutzerId` (`nutzerId`,`artikelId`);

--
-- Indizes für die Tabelle `wiki_tags`
--
ALTER TABLE `wiki_tags`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT für exportierte Tabellen
--

--
-- AUTO_INCREMENT für Tabelle `Abwesenheiten`
--
ALTER TABLE `Abwesenheiten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Benachrichtigungen`
--
ALTER TABLE `Benachrichtigungen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Beratene`
--
ALTER TABLE `Beratene`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Feedback_Mails`
--
ALTER TABLE `Feedback_Mails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Nachrichten`
--
ALTER TABLE `Nachrichten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Nutzer`
--
ALTER TABLE `Nutzer`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Quicklinks`
--
ALTER TABLE `Quicklinks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Raeume`
--
ALTER TABLE `Raeume`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Rollen`
--
ALTER TABLE `Rollen`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Studiengaenge`
--
ALTER TABLE `Studiengaenge`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `survey_answers`
--
ALTER TABLE `survey_answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `survey_answer_options`
--
ALTER TABLE `survey_answer_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `survey_keys`
--
ALTER TABLE `survey_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `survey_questions`
--
ALTER TABLE `survey_questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `survey_survey`
--
ALTER TABLE `survey_survey`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Templates`
--
ALTER TABLE `Templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Termine`
--
ALTER TABLE `Termine`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `wiki_artikel`
--
ALTER TABLE `wiki_artikel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `wiki_tags`
--
ALTER TABLE `wiki_tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
