import { drizzle } from 'drizzle-orm/mysql2';
import { desc, gte } from 'drizzle-orm';
import { leads, pageViews } from './drizzle/schema.ts';

const db = drizzle(process.env.DATABASE_URL);

// Check leads from the last 12 hours
const twelveHoursAgo = new Date(Date.now() - 12*60*60*1000);
const recentLeads = await db.select({
  id: leads.id,
  name: leads.name,
  source: leads.source,
  createdAt: leads.createdAt,
}).from(leads).where(gte(leads.createdAt, twelveHoursAgo)).orderBy(desc(leads.createdAt));

console.log('=== LEADS IN LAST 12 HOURS ===');
console.log('Count:', recentLeads.length);
recentLeads.forEach(l => console.log(`  ${l.createdAt.toISOString()} | ${l.name} | ${l.source}`));

// Check page views in last 2 hours
const twoHoursAgo = new Date(Date.now() - 2*60*60*1000);
const recentViews = await db.select({
  id: pageViews.id,
  page: pageViews.page,
  createdAt: pageViews.createdAt,
}).from(pageViews).where(gte(pageViews.createdAt, twoHoursAgo)).orderBy(desc(pageViews.createdAt));

console.log('\n=== PAGE VIEWS IN LAST 2 HOURS ===');
console.log('Count:', recentViews.length);
recentViews.slice(0, 10).forEach(v => console.log(`  ${v.createdAt.toISOString()} | ${v.page}`));

process.exit(0);
