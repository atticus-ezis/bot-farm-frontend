# Frontend Technical Specifications

## API Endpoints

### Snapshot & Analytics

#### `GET /api/snapshot/`

**Description:** Homepage summary analytics  
**Response:**

```json
{
  "total_events": 1234,
  "total_injection_attempts": 567,
  "total_ips": 89,
  "attack_category_snapshot": [
    {
      "category": "XSS",
      "total_count": 234,
      "most_popular_paths": [{ "request_path": "/contact/", "path_count": 45 }]
    }
  ]
}
```

---

#### `GET /api/aggregate-paths/`

**Description:** Aggregated path analytics  
**FilterSet:** `AggregatePathFilter`  
**Filters:**

- `most_popular_attack` (choice) - Filter by attack category

**Search Fields:**

- `request_path`

**Ordering Fields:**

- `traffic_count`, `scan_count`, `spam_count`, `attack_count`, `request_path`, `created_at`

**Default Ordering:** `-traffic_count`, `-created_at`, `request_path`

**Response:**

```json
{
  "count": 50,
  "results": [
    {
      "request_path": "/contact/",
      "traffic_count": 123,
      "scan_count": 45,
      "spam_count": 30,
      "attack_count": 48,
      "created_at": "2024-01-15T10:30:00Z",
      "most_popular_attack": "XSS"
    }
  ]
}
```

---

### IP Analytics

#### `GET /api/aggregate-ips/`

**Description:** List of aggregated IP analytics  
**FilterSet:** `AggregateIPFilter`  
**Lookup Field:** `ip_address`  
**Filters:**

- `ip_address` (exact) - Filter by IP address
- `referer` (exact) - Filter by referer
- `agent` (exact) - Filter by user agent
- `language` (exact) - Filter by language
- `geo_location` (exact) - Filter by geo location
- `attack_categories` (multiple choice) - Filter by attack categories

**Search Fields:**

- `ip_address`, `referer`, `email` - Search across all three fields with OR logic (case-insensitive partial match)

**Ordering Fields:**

- `traffic_count`, `scan_count`, `spam_count`, `attack_count`, `ip_address`, `created_at`, `email_count`

**Default Ordering:** `-traffic_count`, `-created_at`

**Response:**

```json
{
  "count": 100,
  "results": [
    {
      "ip_address": "192.168.1.1",
      "traffic_count": 45,
      "attack_count": 12,
      "attack_categories": ["XSS", "SQLI"],
      "email_count": 3,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### `GET /api/aggregate-ips/{ip_address}/`

**Description:** Detailed IP analytics for a specific IP  
**Lookup Field:** `ip_address` (use IP address in URL, not query param)

**Response:**

```json
{
  "ip_address": "192.168.1.1",
  "traffic_count": 45,
  "scan_count": 20,
  "spam_count": 13,
  "attack_count": 12,
  "referer": "example.com",
  "email": ["bot@example.com", "other@example.com"],
  "email_count": 2,
  "agent": "Mozilla/5.0...",
  "language": "en-US",
  "geo_location": "US",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Bot Events

#### `GET /api/bot-events/`

**Description:** List of bot events  
**FilterSet:** `BotEventFilter`  
**Filters:**

- `ip_address` (exact)
- `request_path` (exact)
- `exact_request_path` (exact) - Alternative to request_path
- `email` (exact)
- `geo_location` (exact)
- `language` (exact)
- `referer` (exact)
- `origin` (exact)
- `agent` (exact)
- `method` (choice) - "GET" or "POST"
- `attack_attempted` (boolean)
- `attack_categories` (multiple choice)
- `raw_attack_value` (icontains) - Search in attack raw values
- `bot_data` (icontains) - Search in JSON data field
- `spam_bot` (boolean) - Filter for spam bots (attack_attempted=False, method=POST, data\_\_isnull=False)
- `scan_bot` (boolean) - Filter for scan bots (attack_attempted=False, method=GET, data\_\_isnull=True OR data={})

**Search Fields:**

- `email`, `origin`, `ip_address`, `geo_location`, `agent`, `request_path`, `attacks__raw_value`

**Ordering Fields:**

- `created_at`, `ip_address`, `geo_location`, `attack_count`

**Default Ordering:** `-created_at`

**Response:**

```json
{
  "count": 1000,
  "results": [
    {
      "id": "uuid",
      "created_at": "2024-01-15T10:30:00Z",
      "method": "POST",
      "request_path": "/contact/",
      "ip_address": "192.168.1.1",
      "attack_count": 2,
      "attack_categories": ["XSS", "SQLI"]
    }
  ]
}
```

---

#### `GET /api/bot-events/{id}/`

**Description:** Detailed bot event information  
**Lookup Field:** `id` (UUID in URL)

**Response:**

```json
{
  "id": "uuid",
  "created_at": "2024-01-15T10:30:00Z",
  "method": "POST",
  "request_path": "/contact/",
  "email": "bot@example.com",
  "ip_address": "192.168.1.1",
  "geo_location": "US",
  "agent": "Mozilla/5.0...",
  "referer": "example.com",
  "origin": "example.com",
  "language": "en-US",
  "data": { "name": "test", "message": "alert(1)" },
  "attack_attempted": true,
  "attack_count": 2,
  "attack_categories": ["XSS", "SQLI"]
}
```

---

### Attacks

#### `GET /api/attacks/`

**Description:** List of attack records  
**FilterSet:** `AttackTypeFilter`  
**Filters:**

- `category` (choice) - Attack category (XSS, SQLI, LFI, CMD, TRAVERSAL, SSTI, OTHER)
- `pattern` (exact)
- `target_field` (exact)
- `raw_value` (icontains)
- `bot_event_id` (UUID) - Filter by bot event ID
- `ip_address` (exact) - Filter by bot event IP address
- `request_path` (exact) - Filter by bot event request path
- `method` (choice) - Filter by bot event method ("GET" or "POST")

**Search Fields:**

- `category`, `pattern`, `target_field`, `raw_value`, `bot_event__email`, `bot_event__referer`

**Ordering Fields:**

- `created_at`, `target_field`

**Default Ordering:** `-created_at`

**Response:**

```json
{
  "count": 500,
  "results": [
    {
      "id": "uuid",
      "bot_event_id": "uuid",
      "ip_address": "192.168.1.1",
      "request_path": "/contact/",
      "target_field": "message",
      "pattern": "img_onerror",
      "category": "XSS",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### `GET /api/attacks/{id}/`

**Description:** Detailed attack information  
**Lookup Field:** `id` (UUID in URL)

**Response:**

```json
{
  "id": "uuid",
  "target_field": "message",
  "pattern": "img_onerror",
  "category": "XSS",
  "raw_value": "<img src=x onerror=alert(1)>",
  "created_at": "2024-01-15T10:30:00Z",
  "bot_event_id": "uuid",
  "ip_address": "192.168.1.1",
  "request_path": "/contact/"
}
```

---

## Filter Reference

### Common Filter Types

**Exact Match:**

- `ip_address`, `email`, `referer`, `agent`, `language`, `geo_location`, `request_path`
- Example: `?ip_address=192.168.1.1`

**Boolean:**

- `attack_attempted`, `spam_bot`, `scan_bot`
- Example: `?spam_bot=true`

**Choice:**

- `method` - "GET" or "POST"
- `category` - Attack category choices
- Example: `?method=POST`

**Multiple Choice:**

- `attack_categories` - Can select multiple values
- Example: `?attack_categories=XSS&attack_categories=SQLI`

**Contains (case-insensitive):**

- `raw_attack_value`, `bot_data`
- Example: `?raw_attack_value=alert`

---

## Pagination

All list endpoints use standard pagination:

```json
{
  "count": 1000,
  "next": "http://api.example.com/api/bot-events/?page=2",
  "previous": null,
  "results": [...]
}
```

**Page Size:** Standard (typically 20-50 items per page, check API response)

---

## Search

Most endpoints support search across multiple fields. Use the `search` parameter:

- Example: `?search=192.168.1.1`

Search fields vary by endpoint (see endpoint details above).

---

## Ordering

Use `ordering` parameter with field names. Prefix with `-` for descending:

- Example: `?ordering=-created_at`
- Example: `?ordering=ip_address,-created_at` (multiple fields)

---

## Common Filter Combinations

**Filter Bot Events by IP and Path:**

```
GET /api/bot-events/?ip_address=192.168.1.1&request_path=/contact/
```

**Filter Bot Events for Spam Bots on Specific Path:**

```
GET /api/bot-events/?request_path=/contact/&spam_bot=true
```

**Filter Attacks by Category and IP:**

```
GET /api/attacks/?category=XSS&ip_address=192.168.1.1
```

**Filter Attacks by Bot Event:**

```
GET /api/attacks/?bot_event_id={uuid}
```

**Filter IP Analytics by Attack Category:**

```
GET /api/aggregate-ips/?attack_categories=XSS&attack_categories=SQLI
```

---

## Field Naming Consistency

All endpoints use consistent field names for filtering:

- `ip_address` - IP address
- `request_path` - Request path
- `referer` - Referer header (note: "referer" not "referrer")
- `email` - Email address
- `geo_location` - Geographic location
- `agent` - User agent
- `language` - Language
- `method` - HTTP method (GET/POST)
- `attack_attempted` - Boolean attack flag
- `attack_categories` - List of attack categories
- `category` - Single attack category

---

## Error Responses

Standard HTTP status codes:

- `200 OK` - Success
- `400 Bad Request` - Invalid filter parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error response format:

```json
{
  "detail": "Error message here"
}
```
