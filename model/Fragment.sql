CREATE TABLE `Fragment` (
  `id` int(11) DEFAULT NULL,
  `start` double DEFAULT NULL,
  `end` double DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `lastSeen` datetime DEFAULT NULL,
  KEY `fragment_id` (`id`)
)
