import ListResults from "@/components/ListResults";
import { AGGREGATE_IPS_URL } from "@/config/api";

export default function IPListExample() {
  const columns = [
    { label: "IP Address", key: "ip_address" },
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

  const orderingOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
    { value: "-traffic_count", label: "Total Hits" },
    { value: "-scan_count", label: "Scan Count" },
    { value: "-spam_count", label: "Spam Count" },
    { value: "-attack_count", label: "Attack Count" },
  ];

  return (
    <ListResults
      baseUrl={AGGREGATE_IPS_URL}
      columns={columns}
      orderingOptions={orderingOptions}
      title="IP Addresses"
      description="Browse all IP addresses with pagination"
      searchPlaceholder="Search by IP, email, location..."
      emptyMessage="No IP addresses found."
      loadingMessage="Loading IP list..."
      defaultOrdering="-created_at"
    />
  );
}
