CREATE TABLE `Rating` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` varchar(767) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `votes` double DEFAULT NULL,
  `reviewer_id` INTEGER(11) DEFAULT '1' NULL,
  `source` VARCHAR(767),
  `datePublished` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_rating` (`uri`,`reviewer`)
)
