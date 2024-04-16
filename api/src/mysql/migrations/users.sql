-- Users --
CREATE TABLE `users` (
  `id` varchar(26) NOT NULL,
  `email` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
);

ALTER TABLE `users`
ADD UNIQUE INDEX `users_unique_idx` (`username`);
ALTER TABLE `users`
ADD INDEX `users_idx` (`deleted_at`, `created_at`, `updated_at`);

-- Connections --
CREATE TABLE `connections` (
    `id` VARCHAR(26) NOT NULL,
    PRIMARY KEY(`id`),
    `provider` VARCHAR(24) NOT NULL,
    `sub` VARCHAR(128) NOT NULL,
    `user_id` VARCHAR(36) NOT NULL REFERENCES `users` (`id`)
);
ALTER TABLE `connections`
ADD UNIQUE INDEX `connections_unique_idx` (`sub`);
