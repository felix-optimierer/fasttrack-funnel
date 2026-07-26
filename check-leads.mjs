import { drizzle } from 'drizzle-orm/mysql2';
import { desc, sql } from 'drizzle-orm';
import { leads, pageViews } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

// Latest 5 leads
const latestLeads = await db.select({
  id: leads.id,
  name: leads.name,
  email: leads.email,
  source: leads.source,
  createdAt: leads.createdAt,
}).from(leads).orderBy(desc(leads.createdAt)).limit(5);

console.log("=== LATEST 5 LEADS ===");
console.log(JSON.stringify(latestLeads, null, 2));

// Latest 5 page views
const latestViews = await db.select({
  id: pageViews.id,
  page: pageViews.page,
  createdAt: pageViews.createdAt,
}).from(pageViews).orderBy(desc(pageViews.createdAt)).limit(5);

console.log("\n=== LATEST 5 PAGE VIEWS ===");
console.log(JSON.stringify(latestViews, null, 2));

// Count leads today
const todayLeads = await db.select({ cnt: sql`COUNT(*)` }).from(leads).where(sql`DATE(createdAt) = CURDATE()`);
console.log("\n=== LEADS TODAY ===");
console.log(todayLeads[0]?.cnt);

process.exit(0);
