CREATE TABLE `ab_elements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`elementType` enum('main_headline','pre_headline','sub_headline','cta') NOT NULL,
	`cssSelector` varchar(1000) NOT NULL,
	`originalText` text NOT NULL,
	`label` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ab_elements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_notifications_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`type` enum('winner_found','no_significance','test_started') NOT NULL,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`message` text,
	CONSTRAINT `ab_notifications_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`targetUrl` varchar(500) NOT NULL,
	`conversionUrlPattern` varchar(500) NOT NULL,
	`conversionMatchType` enum('exact','contains') NOT NULL DEFAULT 'contains',
	`status` enum('active','paused','stopped') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`settingKey` varchar(128) NOT NULL,
	`settingValue` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ab_settings_settingKey_unique` UNIQUE(`settingKey`)
);
--> statement-breakpoint
CREATE TABLE `ab_tests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`elementId` int NOT NULL,
	`variantText` text NOT NULL,
	`controlText` text NOT NULL,
	`trafficSplit` int NOT NULL DEFAULT 50,
	`status` enum('running','paused','winner_a','winner_b','no_result','stopped','skipped') NOT NULL DEFAULT 'running',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`endedAt` timestamp,
	`visitorsA` int NOT NULL DEFAULT 0,
	`visitorsB` int NOT NULL DEFAULT 0,
	`conversionsA` int NOT NULL DEFAULT 0,
	`conversionsB` int NOT NULL DEFAULT 0,
	`significanceLevel` decimal(8,6),
	`improvementPercent` decimal(8,2),
	CONSTRAINT `ab_tests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ab_visitors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testId` int NOT NULL,
	`visitorUid` varchar(64) NOT NULL,
	`variant` enum('a','b') NOT NULL,
	`converted` boolean NOT NULL DEFAULT false,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`convertedAt` timestamp,
	CONSTRAINT `ab_visitors_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ab_elem_project_idx` ON `ab_elements` (`projectId`);--> statement-breakpoint
CREATE INDEX `ab_notif_test_idx` ON `ab_notifications_log` (`testId`);--> statement-breakpoint
CREATE INDEX `ab_proj_status_idx` ON `ab_projects` (`status`);--> statement-breakpoint
CREATE INDEX `ab_test_project_idx` ON `ab_tests` (`projectId`);--> statement-breakpoint
CREATE INDEX `ab_test_element_idx` ON `ab_tests` (`elementId`);--> statement-breakpoint
CREATE INDEX `ab_test_status_idx` ON `ab_tests` (`status`);--> statement-breakpoint
CREATE INDEX `ab_vis_test_idx` ON `ab_visitors` (`testId`);--> statement-breakpoint
CREATE INDEX `ab_vis_visitor_idx` ON `ab_visitors` (`visitorUid`,`testId`);