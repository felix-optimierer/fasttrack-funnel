#!/usr/bin/env python3
"""
Generate SQL INSERT statements to backfill missing leads into TiDB.
Reads from /tmp/missing_leads_full.json (output of fetch-missing-leads.py)
"""
import json

with open("/tmp/missing_leads_full.json") as f:
    leads = json.load(f)

def sql_val(v, nullable=True):
    """Escape a value for SQL insertion"""
    if v is None or v == '':
        if nullable:
            return 'NULL'
        else:
            return "''"
    # Escape single quotes
    escaped = str(v).replace("'", "\\'")
    return f"'{escaped}'"

def sql_timestamp(iso_str):
    """Convert ISO timestamp to MySQL DATETIME format"""
    if not iso_str:
        return 'NOW()'
    # 2026-07-27T04:18:13.470Z -> '2026-07-27 04:18:13'
    dt = iso_str.replace('T', ' ').split('.')[0].replace('Z', '')
    return f"'{dt}'"

print("-- Backfill missing leads from SalesSuite CRM")
print("-- Downtime period: 2026-07-26 11:10:26 UTC to 2026-07-27 09:07:00 UTC")
print(f"-- Total leads to insert: {len(leads)}")
print()

for i, lead in enumerate(leads, 1):
    name = lead['name']
    email = lead['email']
    phone = lead['phone']
    source = lead['source']
    utm_source = lead.get('utmSource')
    utm_medium = lead.get('utmMedium')
    utm_campaign = lead.get('utmCampaign')
    utm_term = lead.get('utmTerm')
    utm_content = lead.get('utmContent')
    referrer = lead.get('referrer')
    fbclid = lead.get('fbclid')
    created_at = lead['createdAt']
    
    sql = f"""INSERT INTO leads (name, email, phone, source, webhookStatus, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, referrer, fbclid, crmStatus, isDuplicate, createdAt)
VALUES ({sql_val(name)}, {sql_val(email)}, {sql_val(phone)}, {sql_val(source)}, 'sent', {sql_val(utm_source)}, {sql_val(utm_medium)}, {sql_val(utm_campaign)}, {sql_val(utm_term)}, {sql_val(utm_content)}, {sql_val(referrer)}, {sql_val(fbclid)}, 'new', 0, {sql_timestamp(created_at)});"""
    
    print(f"-- {i}. {name} ({email})")
    print(sql)
    print()

# Save to file
output_path = "/tmp/backfill_leads.sql"
with open(output_path, 'w') as f:
    f.write("-- Backfill missing leads from SalesSuite CRM\n")
    f.write("-- Downtime period: 2026-07-26 11:10:26 UTC to 2026-07-27 09:07:00 UTC\n")
    f.write(f"-- Total leads to insert: {len(leads)}\n\n")
    
    for i, lead in enumerate(leads, 1):
        name = lead['name']
        email = lead['email']
        phone = lead['phone']
        source = lead['source']
        utm_source = lead.get('utmSource')
        utm_medium = lead.get('utmMedium')
        utm_campaign = lead.get('utmCampaign')
        utm_term = lead.get('utmTerm')
        utm_content = lead.get('utmContent')
        referrer = lead.get('referrer')
        fbclid = lead.get('fbclid')
        created_at = lead['createdAt']
        
        sql = f"""INSERT INTO leads (name, email, phone, source, webhookStatus, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, referrer, fbclid, crmStatus, isDuplicate, createdAt)
VALUES ({sql_val(name, False)}, {sql_val(email, False)}, {sql_val(phone, False)}, {sql_val(source, False)}, 'sent', {sql_val(utm_source)}, {sql_val(utm_medium)}, {sql_val(utm_campaign)}, {sql_val(utm_term)}, {sql_val(utm_content)}, {sql_val(referrer)}, {sql_val(fbclid)}, 'new', 0, {sql_timestamp(created_at)});"""
        
        f.write(f"-- {i}. {name} ({email})\n")
        f.write(sql + "\n\n")

print(f"\nSQL saved to: {output_path}")
