# Frontend User Journey Guide

## Overview

This document outlines how users navigate through the Bot Farm API, starting from the homepage snapshot and traversing between various list and detail views. Each view is interconnected through filter parameters that allow seamless navigation.

---

## 🏠 Starting Points

### 1. **Homepage Snapshot** (`GET /api/snapshot/`)

The entry point showing high-level analytics.

**Response includes:**

- `total_events` - Total bot events (links to -> **Bot Event List**)
- `total_injection_attempts` - Total attacks (links to → **Attack List**)
- `total_ips` - Total unique IPs (links to → **IP Analytics List**)
- `attack_category_snapshot` - Top 3 attack categories with popular paths (links to -> **Attack List with 'category'**)

**Navigation from Snapshot:**

- Click `total_injection_attempts` → **Attack List** (no filter)
- Click `total_ips` → **IP Analytics List** (no filter)
- Click a category → **Attack List** filtered by `category`

---

### 2. **Path Analytics List** (`GET /api/aggregate-paths/`)

Shows aggregated analytics for each request path, displayed on homepage below snapshot.

**Response includes:**

- `request_path` - The path (links to → **Bot Event List** with `path`)
- `traffic_count` - Total events for this path
- `scan_count` - Scan bot count (links to → **Bot Event List** with `scan_bot=true`)
- `spam_count` - Spam bot count (links to → **Bot Event List** with `spam_bot=true`)
- `attack_count` - Attack count (links to → **Attack List** with `path`)
- `most_popular_attack` - Most common attack type (links to → **Attack List**)

**Navigation from Path Analytics:**

- Click `request_path` → **Bot Event List** filtered by `request_path={value}`
- Click `scan_count` → **Bot Event List** filtered by `request_path={value}&scan_bot=true`
- Click `spam_count` → **Bot Event List** filtered by `request_path={value}&spam_bot=true`
- Click `attack_count` → **Attack List** filtered by `request_path={value}`
- Click `most_popular_attack` → **Attack List** filtered by `category={value}`

---

## 📋 List Views

### 3. **IP Analytics List** (`GET /api/aggregate-ips/`)

Shows aggregated analytics for each IP address.

**Response includes:**

- `ip_address` - The IP (links to → **IP Analytics Detail**)
- `traffic_count` - Total events (links to → **Bot Event List**)
- `attack_count` - Attack count (links to → **Attack List**)
- `attack_categories` - List of attack types (links to → **Attack List**)
- `email_count` - Number of distinct emails used by this IP
- `created_at` - Most recent event timestamp

**Navigation from IP Analytics List:**

- Click `ip_address` → **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)
- Click `traffic_count` → **Bot Event List** filtered by `ip_address={value}`
- Click `attack_count` → **Attack List** filtered by `ip_address={value}`
- Click an `attack_categories` item → **Attack List** filtered by `category={value}`

**Search & Filtering:**

- Use `?search={term}` to search across `ip_address`, `referer`, and `email` fields (OR logic)
- Use `?ordering=email_count` or `?ordering=-email_count` to sort by email count
- Use `?ordering={field}` to sort by any ordering field (see Technical Specs)

---

### 4. **Bot Event List** (`GET /api/bot-events/`)

Shows individual bot events with summary information.

**Response includes:**

- `id` - Event ID (links to → **Bot Event Detail**)
- `request_path` - The path (links to → **Path Analytics** via search)
- `ip_address` - The IP (links to → **IP Analytics Detail**)
- `attack_count` - Number of attacks (links to → **Attack List**)
- `attack_categories` - List of categories (links to → **Attack List**)

**Navigation from Bot Event List:**

- Click `id` → **Bot Event Detail** (`GET /api/bot-events/{id}/`)
- Click `ip_address` → **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)
- Click `request_path` → **Path Analytics List** (search by `request_path`)
- Click `attack_count` → **Attack List** filtered by `bot_event_id={id}`
- Click an `attack_categories` item → **Attack List** filtered by `category={value}`

---

### 5. **Attack List** (`GET /api/attacks/`)

Shows individual attack records.

**Response includes:**

- `id` - Attack ID (links to → **Attack Detail**)
- `bot_event_id` - Bot event ID (links to → **Bot Event Detail**)
- `ip_address` - The IP (links to → **IP Analytics Detail**)
- `request_path` - The path (links to → **Bot Event List**)
- `target_field`, `pattern`, `category`, `created_at`

**Navigation from Attack List:**

- Click `id` → **Attack Detail** (`GET /api/attacks/{id}/`)
- Click `bot_event_id` → **Bot Event Detail** (`GET /api/bot-events/{bot_event_id}/`)
- Click `ip_address` → **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)
- Click `request_path` → **Bot Event List** filtered by `request_path={value}`
- Click `category` → **Attack List** filtered by `category={value}`

---

## 🔍 Detail Views

### 6. **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)

Detailed analytics for a specific IP address.

**Response includes:**

- `ip_address` - The IP
- `traffic_count`, `scan_count`, `spam_count`, `attack_count`
- `referer` - Referer domain
- `email` - List of distinct email addresses used by this IP
- `email_count` - Number of distinct emails
- `agent`, `language`, `geo_location`
- `created_at`

**Navigation from IP Analytics Detail:**

- Use `ip_address` → **Bot Event List** filtered by `ip_address={value}`
- Use `attack_count` → **Attack List** filtered by `ip_address={value}`

---

### 7. **Bot Event Detail** (`GET /api/bot-events/{id}/`)

Full details of a specific bot event.

**Response includes:**

- `id` - Event ID
- `request_path`, `ip_address`, `method`, `email`, `geo_location`, `agent`, `referer`, `origin`, `language`
- `data` - Submitted form data
- `attack_attempted` - Boolean flag
- `attack_count` - Number of attacks (links to → **Attack List**)
- `attack_categories` - List of categories (links to → **Attack List**)

**Navigation from Bot Event Detail:**

- Use `id` → **Attack List** filtered by `bot_event_id={id}`
- Use `ip_address` → **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)
- Use `request_path` → **Bot Event List** filtered by `request_path={value}`
- Click an `attack_categories` item → **Attack List** filtered by `category={value}`

---

### 8. **Attack Detail** (`GET /api/attacks/{id}/`)

Full details of a specific attack.

**Response includes:**

- `id` - Attack ID
- `target_field`, `pattern`, `category`, `raw_value`
- `bot_event_id` - Links to → **Bot Event Detail**
- `ip_address` - Links to → **IP Analytics Detail**
- `request_path` - Links to → **Bot Event List**

**Navigation from Attack Detail:**

- Use `bot_event_id` → **Bot Event Detail** (`GET /api/bot-events/{bot_event_id}/`)
- Use `ip_address` → **IP Analytics Detail** (`GET /api/aggregate-ips/{ip_address}/`)
- Use `request_path` → **Bot Event List** filtered by `request_path={value}`

---

## 🔗 Key Relationships Summary

| From View         | To View             | Filter Parameter                 | Example                                                 |
| ----------------- | ------------------- | -------------------------------- | ------------------------------------------------------- |
| Snapshot          | Attack List         | `category`                       | `/api/attacks/?category=XSS`                            |
| Snapshot          | IP Analytics List   | (none)                           | `/api/aggregate-ips/`                                   |
| Path Analytics    | Bot Event List      | `request_path`                   | `/api/bot-events/?request_path=/contact/`               |
| Path Analytics    | Bot Event List      | `request_path` + `scan_bot=true` | `/api/bot-events/?request_path=/contact/&scan_bot=true` |
| Path Analytics    | Attack List         | `request_path`                   | `/api/attacks/?request_path=/contact/`                  |
| IP Analytics List | IP Analytics Detail | `ip_address` (in URL)            | `/api/aggregate-ips/192.168.1.1/`                       |
| IP Analytics List | Bot Event List      | `ip_address`                     | `/api/bot-events/?ip_address=192.168.1.1`               |
| IP Analytics List | Attack List         | `ip_address`                     | `/api/attacks/?ip_address=192.168.1.1`                  |
| Bot Event List    | Bot Event Detail    | `id` (in URL)                    | `/api/bot-events/{id}/`                                 |
| Bot Event List    | Attack List         | `bot_event_id`                   | `/api/attacks/?bot_event_id={uuid}`                     |
| Bot Event Detail  | Attack List         | `bot_event_id`                   | `/api/attacks/?bot_event_id={uuid}`                     |
| Attack List       | Bot Event Detail    | `bot_event_id` (in URL)          | `/api/bot-events/{bot_event_id}/`                       |
| Attack List       | IP Analytics Detail | `ip_address` (in URL)            | `/api/aggregate-ips/{ip_address}/`                      |
| Attack Detail     | Bot Event Detail    | `bot_event_id` (in URL)          | `/api/bot-events/{bot_event_id}/`                       |
| Attack Detail     | IP Analytics Detail | `ip_address` (in URL)            | `/api/aggregate-ips/{ip_address}/`                      |

---

## 💡 Navigation Tips

1. **Use filter parameters consistently** - All filterable fields use the same names across views (e.g., `ip_address`, `request_path`, `category`)

2. **Boolean filters** - Use `spam_bot=true` or `scan_bot=true` to filter Bot Event List for specific bot types

3. **Multiple filters** - Combine filters with `&`: `/api/bot-events/?ip_address=192.168.1.1&request_path=/contact/`

4. **Detail views** - Use the ID or IP address in the URL path, not as a query parameter

5. **Search fields** - Most views support search across multiple fields (see Technical Specs document)

6. **IP Analytics Search** - The IP Analytics List supports unified search across `ip_address`, `referer`, and `email` fields using `?search={term}`. The search uses OR logic (matches if any field contains the term).

7. **Email Count Sorting** - IP Analytics List can be sorted by `email_count` using `?ordering=email_count` (ascending) or `?ordering=-email_count` (descending)
