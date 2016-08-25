CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uri` VARCHAR(255) DEFAULT NULL,
  `safe` int(11) DEFAULT '0',
  PRIMARY KEY (`id`)
);
