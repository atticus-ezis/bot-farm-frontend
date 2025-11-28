import ListResults from "@/components/ListResults";
import { AGGREGATE_PATHS_URL, BOT_EVENTS_URL } from "@/config/api";
import { attackAttemptedFilter } from "@/config/filters";

export default function PathListExample() {
  const columns = [
    { label: "Path", key: "request_path" },
    { label: "Traffic Count", key: "traffic_count" },
    { label: "Attack Count", key: "attack_count" },
    { label: "Spam Count", key: "spam_count" },
    { label: "Scan Count", key: "scan_count" },
    { label: "Most Popular Attack", key: "most_popular_attack" },
    { label: "Attacks Found", key: "attacks_used" },
  ];
  const orderingOptions = [
    { value: "-traffic_count", label: "Total Hits" },
    { value: "-scan_count", label: "Scan Count" },
    { value: "-spam_count", label: "Spam Count" },
    { value: "-attack_count", label: "Attack Count" },
    { value: "request_path", label: "Path (A-Z)" },
  ];

  //   add custom row click handler that redirects to
  //   {BOT_EVENT_URL}/?request_path={row.request_path}

  const customHandleRowClick = (row) => {
    window.location.href = `/bot-event-list-example?exact_request_path=${encodeURIComponent(row.request_path)}`;
  };

  return (
    <ListResults
      baseUrl={AGGREGATE_PATHS_URL}
      columns={columns}
      orderingOptions={orderingOptions}
      title="Path List"
      description="Browse all paths with pagination"
      useDetailView={true}
      customHandleRowClick={customHandleRowClick}
      defaultOrdering="-traffic_count"
    />
  );
}
