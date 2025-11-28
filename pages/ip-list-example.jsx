import ListResults from "@/components/ListResults";
import { AGGREGATE_IPS_URL } from "@/config/api";

const ipRedirect = (ip_address) => {
  // Navigate to bot-event-list-example page with IP address filter
  window.location.href = `/bot-event-list-example?ip_address=${encodeURIComponent(ip_address)}`;
};

export default function IPListExample() {
  const columns = [
    {
      label: "IP Address",
      key: "ip_address",
      render: (row) => (
        <span
          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click
            ipRedirect(row.ip_address);
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

  const orderingOptions = [
    { value: "-traffic_count", label: "Total Hits" },
    { value: "-attack_count", label: "Attack Count" },
    { value: "-spam_count", label: "Spam Count" },
    { value: "-scan_count", label: "Scan Count" },
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
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
      defaultOrdering="-traffic_count"
      useDetailView={false}
    />
  );
}
