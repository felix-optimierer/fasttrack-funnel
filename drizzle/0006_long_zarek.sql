CREATE TABLE `ad_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`funnel` varchar(64) NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`campaignName` varchar(512),
	`spend` decimal(10,2) NOT NULL DEFAULT '0.00',
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ad_costs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `ad_costs_date_funnel_idx` ON `ad_costs` (`date`,`funnel`);--> statement-breakpoint
CREATE INDEX `ad_costs_campaign_idx` ON `ad_costs` (`campaignId`);