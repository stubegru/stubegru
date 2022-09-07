-- Demo SQL statements to create initial datasets
-- DONT USE THIS ON PRDUCTION SYSTEMS!!!

-- Create example roles
INSERT INTO `Rollen` (`id`, `name`, `permission_admin`, `permission_beratung`, `permission_monitoring`, `permission_wiki_autor`, `permission_telefonnotiz`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error`) VALUES
(1, 'Studiservice', 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0),
(2, 'Hiflskraft', 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0),
(3, 'Beratung', 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0),
(4, 'Admin', 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1);

-- Create default permissions
INSERT INTO `Rechte` (`id`, `description`) VALUES
('admin', 'Administrative Aufgaben: Nutzerverwaltung, Quicklinks editieren'),
('beratung', 'Beratungsaufgaben: Beratungstermine anlegen, Monitorin/Evaluation Download, Tagesaktuelle Infos bearbeiten'),
('monitoring', 'Berechtigung um das Monitoring zu benutzen'),
('wiki_autor', 'Erlaubnis um Wiki Artikel zu bearbeiten, zu erstellen und zu löschen.'),
('telefonnotiz', 'Jede Person mit dieser Berechtigung wird in der Liste der Empfänger für Telefonnotizen angezeigt.');

-- Create dummy survey
INSERT INTO `survey_survey`(`id`, `title`, `auth`, `adminAuth`, `uniqueKey`) VALUES (1, 'Dummy Survey', 'anybody', 'admin', 0);

-- Create dummy user with username "test" and password "test"
INSERT INTO `Nutzer` (`id`, `name`, `mail`, `account`, `role`, `erfassungsdatum`, `erfasser`, `passwort`, `notification_reminder`, `notification_report`, `notification_article`, `notification_news`, `notification_absence`, `notification_error`) VALUES (NULL, 'test', 'dummy@example.com', 'test', '1', '', '', '$2y$10$fLgGmGWibrtZjtvc3rst7ujFZGuQvEdox53wv5bWItxKKEQd3j/Da', '0', '0', '0', '0', '0', '0')

-- Give admin access to test user
INSERT INTO `Link_Nutzer_Rechte`(`userId`, `permissionId`) VALUES (1,'wiki_autor'),(1,'admin'),(1,'beratung'),(1,'monitoring'),(1,'telefonnotiz')