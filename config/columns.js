export const botEventColumns = [
  { label: "Timestamp", key: "created_at", type: "date" },
  { label: "IP Address", key: "ip_address" },
  { label: "Browser", key: "agent_snapshot" },
  { label: "Location", key: "geo_location" },
  { label: "Activity", key: "event_category" },
  { label: "Path", key: "request_path" },
  { label: "Method", key: "method" },
  { label: "Fields Targeted", key: "target_fields" },
];

export const pathColumns = [
  { label: "Path", key: "request_path" },
  { label: "Traffic Count", key: "traffic_count" },
  { label: "Attack Count", key: "attack_count" },
  { label: "Spam Count", key: "spam_count" },
  { label: "Scan Count", key: "scan_count" },
  { label: "Most Popular Attack", key: "most_popular_attack" },
  { label: "Attacks Found", key: "attacks_used" },
];
export const ipColumns = [
  {
    label: "IP Address",
    key: "ip_address",
    render: (row) => (
      <span
        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
        onClick={(e) => {
          e.stopPropagation(); // Prevent row click
          window.location.href = `/bot-event-list?ip_address=${encodeURIComponent(row.ip_address)}`;
        }}
      >
        {row.ip_address}
      </span>
    ),
  },
  { label: "Location", key: "geo_location" },
  { label: "Language", key: "language" },
  { label: "Referer", key: "referer", cellClassName: "max-w-xs truncate" },
  {
    label: "Email",
    key: "email",
    accessor: (row) => (row.email && Array.isArray(row.email) ? row.email.join(", ") : "—"),
    cellClassName: "max-w-xs truncate",
  },
  { label: "Traffic Count", key: "traffic_count" },
  { label: "Scan Count", key: "scan_count" },
  { label: "Spam Count", key: "spam_count" },
  { label: "Attack Count", key: "attack_count" },
];

export const detailComponentInfo = [
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
