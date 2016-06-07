CREATE TABLE `Tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(767) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`tag`)
)
