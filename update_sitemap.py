# update_sitemap.py
from datetime import datetime
import re

# Read sitemap
with open('sitemap.xml', 'r') as f:
    content = f.read()

# Get today's date
today = datetime.now().strftime('%Y-%m-%d')

# Update lastmod
updated = re.sub(
    r'<lastmod>\d{4}-\d{2}-\d{2}</lastmod>',
    f'<lastmod>{today}</lastmod>',
    content
)

# Write back
with open('sitemap.xml', 'w') as f:
    f.write(updated)

print(f"✅ Sitemap updated with date: {today}")
