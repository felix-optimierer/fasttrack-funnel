ALTER TABLE `ad_spend` ADD `campaignName` varchar(255);--> statement-breakpoint
ALTER TABLE `ad_spend` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `utmSource` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmMedium` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmCampaign` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmTerm` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `utmContent` varchar(255);--> statement-breakpoint
ALTER TABLE `leads` ADD `referrer` varchar(2048);--> statement-breakpoint
ALTER TABLE `leads` ADD `ipAddress` varchar(45);--> statement-breakpoint
ALTER TABLE `leads` ADD `userAgent` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `timeOnPageSeconds` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `crmStatus` varchar(32) DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE `leads` ADD `notes` text;--> statement-breakpoint
ALTER TABLE `page_views` ADD `utmSource` varchar(255);--> statement-breakpoint
ALTER TABLE `page_views` ADD `utmMedium` varchar(255);--> statement-breakpoint
ALTER TABLE `page_views` ADD `utmCampaign` varchar(255);--> statement-breakpoint
ALTER TABLE `page_views` ADD `utmTerm` varchar(255);--> statement-breakpoint
ALTER TABLE `page_views` ADD `utmContent` varchar(255);--> statement-breakpoint
ALTER TABLE `page_views` ADD `referrer` varchar(2048);--> statement-breakpoint
ALTER TABLE `page_views` ADD `ipAddress` varchar(45);--> statement-breakpoint
ALTER TABLE `page_views` ADD `userAgent` text;--> statement-breakpoint
CREATE INDEX `leads_source_idx` ON `leads` (`source`);--> statement-breakpoint
CREATE INDEX `leads_crm_status_idx` ON `leads` (`crmStatus`);