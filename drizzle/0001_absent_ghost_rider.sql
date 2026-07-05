CREATE TABLE `ad_spend` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` varchar(64) NOT NULL,
	`date` varchar(10) NOT NULL,
	`amountCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_spend_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(64) NOT NULL,
	`leadId` int,
	`eventUri` varchar(512),
	`name` varchar(255),
	`email` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` varchar(64) NOT NULL,
	`url` text,
	`active` int NOT NULL DEFAULT 1,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhooks_channel_unique` UNIQUE(`channel`)
);
--> statement-breakpoint
CREATE INDEX `ads_channel_date_idx` ON `ad_spend` (`channel`,`date`);--> statement-breakpoint
CREATE INDEX `appt_source_idx` ON `appointments` (`source`);--> statement-breakpoint
CREATE INDEX `appt_created_idx` ON `appointments` (`createdAt`);--> statement-breakpoint
CREATE INDEX `wh_channel_idx` ON `webhooks` (`channel`);