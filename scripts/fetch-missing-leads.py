#!/usr/bin/env python3
"""
Fetch missing leads from SalesSuite CRM for the downtime period.
Gets full contact details including UTM parameters, phone, email etc.
"""
import json
import os
import sys
from datetime import datetime
import urllib.request
import urllib.error

API_KEY = os.environ.get("SALESSUITE_API_KEY")
if not API_KEY:
    print("ERROR: SALESSUITE_API_KEY not set")
    sys.exit(1)

BASE = "https://api.salessuite.com/api"

def api_get(path):
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, headers={"x-api-key": API_KEY})
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        print(f"  HTTP Error {e.code} for {path}: {e.read().decode()[:200]}")
        return None

# 1. Get all deals (page 1 = most recent 25)
print("Fetching deals from SalesSuite...")
deals_page1 = api_get("/v1/deal") or []
print(f"  Page 1: {len(deals_page1)} deals")

# Downtime period: Jul 26 11:10:26 UTC to Jul 27 09:07:00 UTC
# Walter (11:10:25) is already in DB
START = datetime(2026, 7, 26, 11, 10, 26)
END = datetime(2026, 7, 27, 9, 7, 0)

# Test deal names to skip
TEST_NAMES = ['DB-Test-Hetzner', 'LocalDBTest', 'DB-Test-After-Rollback', 'TEST MANUS']

# Filter deals in downtime period
missing_deals = []
for d in deals_page1:
    created_str = d.get('createdAt', '')
    try:
        created = datetime.fromisoformat(created_str.replace('Z', '+00:00')).replace(tzinfo=None)
    except:
        continue
    
    if START <= created <= END:
        name = d.get('name', '')
        if any(t in name for t in TEST_NAMES):
            continue
        missing_deals.append(d)

print(f"\nDeals during downtime (excluding tests): {len(missing_deals)}")

# 2. For each deal, get the contact details
print("\nFetching contact details...")
leads_to_insert = []

for deal in missing_deals:
    contact_id = deal.get('contactId')
    deal_name = deal.get('name', '?')
    deal_created = deal.get('createdAt', '')
    
    if not contact_id:
        print(f"  SKIP {deal_name}: no contactId")
        continue
    
    # Get contact by ID - response has { contact: {...}, mainContactPerson: {...} }
    contact_data = api_get(f"/v1/contact/{contact_id}")
    
    if not contact_data:
        print(f"  SKIP {deal_name}: contact fetch failed")
        continue
    
    # Extract contact info
    contact = contact_data.get('contact', {})
    person = contact_data.get('mainContactPerson', {})
    
    first_name = person.get('firstName', '')
    last_name = person.get('lastName', '')
    email = person.get('email', '')
    phone = person.get('phone', '') or person.get('mobilePhone', '')
    
    # UTM parameters from contact
    utm_source = contact.get('utm_source') or None
    utm_medium = contact.get('utm_medium') or None
    utm_campaign = contact.get('utm_campaign') or None
    utm_term = contact.get('utm_term') or None
    utm_content = contact.get('utm_content') or None
    referrer = contact.get('referer') or None
    fbclid = contact.get('fbclid') or None
    
    # Determine funnel source from deal name and custom fields
    source = 'exit-plan'  # default
    if 'KI-Report' in deal_name or 'KI_Report' in deal_name or 'LM_KI-Report' in deal_name:
        source = 'ki-report'
    elif 'Traumwebseite' in deal_name or 'VSL_Traumwebseite' in deal_name:
        source = 'home'
    elif 'Exit-Plan' in deal_name or 'LM_Exit-Plan' in deal_name:
        source = 'exit-plan'
    else:
        # Check custom fields for funnel info
        if contact.get('x_vsl_traumwebseite_lead'):
            source = 'home'
        elif contact.get('x_leadmagnet_ki_report'):
            source = 'ki-report'
        elif contact.get('x_leadmagnet_exit_plan'):
            source = 'exit-plan'
    
    name = f"{first_name} {last_name}".strip()
    
    lead = {
        'name': name,
        'firstName': first_name,
        'lastName': last_name,
        'email': email,
        'phone': phone,
        'source': source,
        'utmSource': utm_source,
        'utmMedium': utm_medium,
        'utmCampaign': utm_campaign,
        'utmTerm': utm_term,
        'utmContent': utm_content,
        'referrer': referrer,
        'fbclid': fbclid,
        'createdAt': deal_created,
        'dealName': deal_name,
        'contactId': contact_id,
    }
    
    leads_to_insert.append(lead)
    print(f"  OK: {name} | {email} | {phone} | {source} | utm_source={utm_source} | utm_campaign={utm_campaign}")

# 3. Save to JSON for processing
output_path = "/tmp/missing_leads_full.json"
with open(output_path, 'w') as f:
    json.dump(leads_to_insert, f, indent=2, ensure_ascii=False)

print(f"\n{'='*60}")
print(f"Total leads to backfill: {len(leads_to_insert)}")
print(f"Saved to: {output_path}")
print(f"{'='*60}")

# Print summary
print("\n--- SUMMARY ---")
for i, lead in enumerate(leads_to_insert, 1):
    print(f"{i:2}. {lead['name']:25} | {lead['email']:35} | {lead['phone']:15} | {lead['source']:12} | {lead['createdAt']}")
