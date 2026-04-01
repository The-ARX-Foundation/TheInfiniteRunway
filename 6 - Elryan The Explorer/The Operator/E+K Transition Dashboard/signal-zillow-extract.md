# Signal → Zillow Link Extraction

**Status:** TODO  
**Context:** Kenya has been sending Zillow/land links via Signal. Extract all of them and batch-load into the [[E+K Transition Dashboard]] property tracker.

---

## Option A: Quick & Manual (< 20 links)

1. Open Signal Desktop → Kenya conversation
2. Click her name/header → **Media, links, and files**
3. Go to **Links** tab
4. Copy all Zillow URLs manually

## Option B: Database Export (bulk)

Signal DB locations:
- **Linux:** `~/.config/Signal/sql/db.sqlite`
- **Windows:** `%APPDATA%\Signal\sql\db.sqlite`

Encryption key: `~/.config/Signal/config.json` → `key` field

### Using signal-export (Python)

```bash
pip install signal-export --break-system-packages
sigexport --chat "Kenya" ~/signal-kenya-export/
grep -roE 'https?://[^ "]*zillow\.com[^ "]*' ~/signal-kenya-export/ | sort -u
```

### Using sqlcipher (direct)

```bash
sqlcipher db.sqlite
pragma key = "x'YOUR_KEY_HERE'";
SELECT body FROM messages WHERE conversationId = (
  SELECT id FROM conversations WHERE name = 'Kenya'
) AND body LIKE '%zillow.com%';
```

---

## After Extraction

Drop the link list into a Claude chat and say:  
> "Batch scrape these Zillow links and load them into the dashboard property tracker"

The dashboard uses persistent storage key `dash-v1` and the `properties` array accepts:
```json
{
  "id": "",
  "url": "",
  "address": "",
  "price": 0,
  "acres": 0,
  "type": "land|house|house+land",
  "zoning": "",
  "notes": "",
  "status": "reviewing",
  "addedBy": "K",
  "added": "YYYY-MM-DD"
}
```
