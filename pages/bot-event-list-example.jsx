import { useState } from "react";
import ListResults from "@/components/ListResults";
import { BOT_EVENTS_URL } from "@/config/api";
import { attackCategoryFilter, methodFilter, attackAttemptedFilter, botEventTypeFilter } from "@/config/filters";
import { Badge } from "flowbite-react";

export default function BotEventListExample() {
  // Read query parameters from URL to support filtering from other pages
  // Initialize synchronously if on client side to ensure filter is applied on first render
  const getInitialParams = () => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ipAddress = params.get("ip_address");
      if (ipAddress) {
        return { ip_address: ipAddress };
      }
      const requestPath = params.get("exact_request_path");
      if (requestPath) {
        return { request_path: requestPath };
      }
    }
    return {};
  };

  const [initialParams] = useState(getInitialParams);
  const columns = [
    { label: "Timestamp", key: "created_at", type: "date" },
    { label: "IP Address", key: "ip_address" },
    { label: "Browser", key: "agent_snapshot" },
    { label: "Location", key: "geo_location" },
    { label: "Activity", key: "event_category" },
    { label: "Path", key: "request_path" },
    { label: "Method", key: "method" },

    { label: "Attack Categories", key: "attack_categories" },
    { label: "Attack Count", key: "attack_count" },
  ];

  const orderingOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
    { value: "-ip_address", label: "IP Address (Highest)" },
    { value: "ip_address", label: "IP Address (Lowest)" },
    { value: "-geo_location", label: "Location (A-Z)" },
    { value: "geo_location", label: "Location (Z-A)" },
    { value: "-attack_count", label: "Most Attacks" },
    { value: "attack_count", label: "Least Attacks" },
  ];

  const detailComponentInfo = [
    { value: "created_at", label: "Timestamp" },
    { value: "ip_address", label: "IP Address" },
    { value: "email", label: "Email" },
    { value: "agent", label: "Browser" },
    { value: "geo_location", label: "Location" },
    { value: "language", label: "Language" },
    { value: "referer", label: "Referer" },
    { value: "request_path", label: "Path" },
    { value: "method", label: "Method" },
    { value: "target_fields", label: "Target Fields" },
    { value: "data_details", label: "Data Present", type: "json" },
  ];

  // Filters imported from config
  const filters = [attackCategoryFilter, methodFilter, botEventTypeFilter];

  // Custom renderer for attack categories (shows badges)
  const customCellRenderers = {
    attack_categories: (row) => {
      const categories = row.attack_categories;
      if (!categories || categories.length === 0) {
        return <Badge color="gray">none</Badge>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <Badge key={`${row.id}-${cat}`} color="info">
              {cat}
            </Badge>
          ))}
        </div>
      );
    },
  };

  return (
    <ListResults
      baseUrl={BOT_EVENTS_URL}
      filters={filters}
      columns={columns}
      orderingOptions={orderingOptions}
      title="All Bot Events"
      description="Browse all bot submission events with pagination"
      searchPlaceholder="Search by IP, location, path..."
      emptyMessage="No bot events found."
      loadingMessage="Loading bot events…"
      defaultOrdering="-created_at"
      customCellRenderers={customCellRenderers}
      detailFields={detailComponentInfo}
      additionalParams={initialParams}
    />
  );
}
