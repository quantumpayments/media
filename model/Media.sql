CREATE TABLE `Media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` varchar(1000) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `cacheURI` VARCHAR(1000),
  `lastSeen` DATETIME,
  `contentType` VARCHAR(100),
  PRIMARY KEY (`id`),
  UNIQUE KEY `constr_uri` (`uri`)
)
