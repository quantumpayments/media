CREATE TABLE `Fragment` (
  `id` int(11) DEFAULT NULL,
  `start` double DEFAULT NULL,
  `end` double DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `lastSeen` datetime DEFAULT NULL,
  `user_id` int(11) DEFAULT '1' NULL,
  KEY `fragment_id` (`id`),
  UNIQUE KEY `unique_uri` (`id`, `start`, `end`, `user_id`)
)
