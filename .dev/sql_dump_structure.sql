-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Erstellungszeit: 12. Nov 2024 um 11:19
-- Server-Version: 11.5.2-MariaDB
-- PHP-Version: 8.3.13

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
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `start` timestamp NULL DEFAULT NULL,
  `end` timestamp NULL DEFAULT NULL,
  `recurring` varchar(30) NOT NULL,
  `wholeDay` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Beratene`
--

CREATE TABLE `Beratene` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `mail` varchar(100) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `channel` varchar(20) DEFAULT NULL,
  `formular` tinyint(1) NOT NULL,
  `description` mediumtext NOT NULL,
  `dateId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `cronjob_mails`
--

CREATE TABLE `cronjob_mails` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `recipient` varchar(500) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `body` text NOT NULL,
  `attachmentName` varchar(300) NOT NULL,
  `attachmentContent` text NOT NULL,
  `type` varchar(300) NOT NULL,
  `reference` varchar(300) NOT NULL COMMENT 'field for referencing related datasets'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_mgmt_instances`
--

CREATE TABLE `event_mgmt_instances` (
  `id` int(11) NOT NULL,
  `eventInstanceId` varchar(100) NOT NULL,
  `multiple` tinyint(1) NOT NULL DEFAULT 0,
  `attributeKey` varchar(100) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `event_mgmt_types`
--

CREATE TABLE `event_mgmt_types` (
  `id` int(11) NOT NULL,
  `eventTypeId` varchar(100) NOT NULL,
  `multiple` tinyint(1) NOT NULL DEFAULT 0,
  `attributeKey` varchar(100) NOT NULL,
  `value` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `mail_log`
--

CREATE TABLE `mail_log` (
  `id` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp(),
  `recipient` varchar(500) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `attachmentName` varchar(300) NOT NULL,
  `status` text NOT NULL,
  `initiator` int(11) NOT NULL COMMENT 'userId',
  `mailMethod` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Nachrichten`
--

CREATE TABLE `Nachrichten` (
  `id` int(11) NOT NULL,
  `inhalt` longtext NOT NULL,
  `titel` mediumtext NOT NULL,
  `prioritaet` tinyint(1) NOT NULL,
  `erfasser` mediumtext NOT NULL,
  `erfassungsdatum` mediumtext NOT NULL,
  `beginn` date NOT NULL,
  `ende` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `emitterId` varchar(100) NOT NULL,
  `userId` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` tinytext NOT NULL,
  `text` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notification_emitter`
--

CREATE TABLE `notification_emitter` (
  `name` varchar(100) NOT NULL,
  `notificationTypeId` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notification_types`
--

CREATE TABLE `notification_types` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notification_type_user`
--

CREATE TABLE `notification_type_user` (
  `userId` int(11) NOT NULL,
  `notificationType` varchar(100) NOT NULL,
  `online` tinyint(1) NOT NULL DEFAULT 0,
  `mail` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `notification_user`
--

CREATE TABLE `notification_user` (
  `notificationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Nutzer`
--

CREATE TABLE `Nutzer` (
  `id` int(11) NOT NULL,
  `name` mediumtext NOT NULL,
  `mail` varchar(100) NOT NULL,
  `account` mediumtext NOT NULL,
  `role` int(11) NOT NULL,
  `erfassungsdatum` mediumtext NOT NULL,
  `erfasser` mediumtext NOT NULL,
  `passwort` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `permissions`
--

CREATE TABLE `permissions` (
  `id` varchar(20) NOT NULL,
  `description` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `permissions_user`
--

CREATE TABLE `permissions_user` (
  `userId` int(11) NOT NULL,
  `permissionId` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `permission_requests`
--

CREATE TABLE `permission_requests` (
  `name` varchar(100) NOT NULL,
  `permissionId` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Quicklinks`
--

CREATE TABLE `Quicklinks` (
  `id` int(11) NOT NULL,
  `text` mediumtext NOT NULL,
  `link` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Raeume`
--

CREATE TABLE `Raeume` (
  `id` int(11) NOT NULL,
  `kanal` varchar(100) NOT NULL DEFAULT 'personally',
  `titel` varchar(100) NOT NULL,
  `besitzer` int(11) NOT NULL,
  `raumnummer` varchar(100) NOT NULL,
  `strasse` varchar(100) NOT NULL,
  `hausnummer` varchar(100) NOT NULL,
  `plz` varchar(100) NOT NULL,
  `ort` varchar(100) NOT NULL,
  `etage` varchar(100) NOT NULL,
  `link` varchar(500) NOT NULL,
  `passwort` varchar(100) NOT NULL,
  `telefon` varchar(100) NOT NULL,
  `aktiv` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `role_presets`
--

CREATE TABLE `role_presets` (
  `roleId` int(11) NOT NULL,
  `type` varchar(100) NOT NULL,
  `subjectId` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_answers`
--

CREATE TABLE `survey_answers` (
  `id` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `userHash` varchar(100) NOT NULL,
  `value` mediumtext NOT NULL,
  `optionId` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `timestamp` timestamp NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_answer_options`
--

CREATE TABLE `survey_answer_options` (
  `id` int(11) NOT NULL,
  `questionId` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `text` mediumtext NOT NULL,
  `value` varchar(300) NOT NULL,
  `action` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_keys`
--

CREATE TABLE `survey_keys` (
  `id` int(11) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `uniqueKey` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `text` mediumtext NOT NULL,
  `type` varchar(100) NOT NULL,
  `questionGroup` varchar(100) NOT NULL,
  `surveyId` int(11) NOT NULL,
  `action` varchar(100) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `survey_survey`
--

CREATE TABLE `survey_survey` (
  `id` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `auth` varchar(100) NOT NULL,
  `adminAuth` varchar(100) NOT NULL,
  `uniqueKey` tinyint(1) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Templates`
--

CREATE TABLE `Templates` (
  `id` int(11) NOT NULL,
  `titel` longtext NOT NULL,
  `text` mediumtext NOT NULL,
  `letzteaenderung` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ersteller` int(11) NOT NULL,
  `betreff` mediumtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `Termine`
--

CREATE TABLE `Termine` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `owner` varchar(100) NOT NULL,
  `ownerId` int(11) NOT NULL,
  `free` int(11) NOT NULL DEFAULT 0,
  `room` int(11) NOT NULL,
  `erfassungsdatum` timestamp NOT NULL DEFAULT current_timestamp(),
  `start` time NOT NULL,
  `end` time NOT NULL,
  `title` mediumtext NOT NULL,
  `channel` varchar(20) NOT NULL DEFAULT 'all',
  `teilnehmer` mediumtext DEFAULT NULL,
  `template` int(11) NOT NULL COMMENT 'Id des mail templates das bei terminvergabe an den zu Beratenden versendet wird',
  `blocked` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tabellenstruktur für Tabelle `wiki_artikel`
--

CREATE TABLE `wiki_artikel` (
  `id` int(11) NOT NULL,
  `heading` mediumtext NOT NULL,
  `text` longtext NOT NULL,
  `lastChanged` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `reminderDate` date DEFAULT NULL,
  `reminderText` mediumtext DEFAULT NULL,
  `showInSidebar` tinyint(1) NOT NULL DEFAULT 0,
  `visited` int(11) NOT NULL DEFAULT 0
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
  `name` mediumtext NOT NULL
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
-- Indizes für die Tabelle `Beratene`
--
ALTER TABLE `Beratene`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `cronjob_mails`
--
ALTER TABLE `cronjob_mails`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `event_mgmt_instances`
--
ALTER TABLE `event_mgmt_instances`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `event_mgmt_types`
--
ALTER TABLE `event_mgmt_types`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `mail_log`
--
ALTER TABLE `mail_log`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `Nachrichten`
--
ALTER TABLE `Nachrichten`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `notification_emitter`
--
ALTER TABLE `notification_emitter`
  ADD PRIMARY KEY (`name`,`notificationTypeId`);

--
-- Indizes für die Tabelle `notification_types`
--
ALTER TABLE `notification_types`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `notification_type_user`
--
ALTER TABLE `notification_type_user`
  ADD PRIMARY KEY (`userId`,`notificationType`);

--
-- Indizes für die Tabelle `notification_user`
--
ALTER TABLE `notification_user`
  ADD PRIMARY KEY (`notificationId`,`userId`);

--
-- Indizes für die Tabelle `Nutzer`
--
ALTER TABLE `Nutzer`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `permissions_user`
--
ALTER TABLE `permissions_user`
  ADD PRIMARY KEY (`userId`,`permissionId`);

--
-- Indizes für die Tabelle `permission_requests`
--
ALTER TABLE `permission_requests`
  ADD PRIMARY KEY (`name`,`permissionId`);

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
-- Indizes für die Tabelle `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Indizes für die Tabelle `role_presets`
--
ALTER TABLE `role_presets`
  ADD PRIMARY KEY (`roleId`,`type`,`subjectId`);

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
-- AUTO_INCREMENT für Tabelle `Beratene`
--
ALTER TABLE `Beratene`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `cronjob_mails`
--
ALTER TABLE `cronjob_mails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `event_mgmt_instances`
--
ALTER TABLE `event_mgmt_instances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `event_mgmt_types`
--
ALTER TABLE `event_mgmt_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `mail_log`
--
ALTER TABLE `mail_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `Nachrichten`
--
ALTER TABLE `Nachrichten`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT für Tabelle `notifications`
--
ALTER TABLE `notifications`
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
-- AUTO_INCREMENT für Tabelle `roles`
--
ALTER TABLE `roles`
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
