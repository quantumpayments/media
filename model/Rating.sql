CREATE TABLE `Rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` varchar(767) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `votes` double DEFAULT NULL,
  `reviewer` VARCHAR(767),
  `source` VARCHAR(767),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_index` (`uri`,`reviewer`)
)
