CREATE TABLE `MediaTag` (
  `media_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL,
  UNIQUE KEY `unique_index` (`media_id`, `tag_id`)
)
