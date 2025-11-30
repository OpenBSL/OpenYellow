-- Create news table
CREATE TABLE IF NOT EXISTS `news` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) NOT NULL,
  `text` text NOT NULL,
  `icon` varchar(500) DEFAULT NULL,
  `link` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Example news entries
INSERT INTO `news` (`title`, `text`, `icon`, `link`) VALUES
('Добро пожаловать на OpenYellow!', 'Мы рады представить вам обновленную версию OpenYellow - агрегатора open-source проектов для 1С:Предприятие. Теперь с динамической загрузкой данных, улучшенным поиском и фильтрацией!', 'static/logo.png', 'https://github.com/OpenBSL/OpenYellow'),
('Новая система значков', 'Теперь вы можете получить динамический значок для вашего репозитория! Значок автоматически обновляется и показывает актуальное место в рейтинге.', 'static/logo.png', 'badges.html'),
('Фильтрация по форкам', 'Добавлена возможность исключать форки из результатов поиска. Теперь вы можете видеть только оригинальные проекты!', 'static/logo.png', NULL);
