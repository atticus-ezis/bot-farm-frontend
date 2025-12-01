import { useEffect, useState } from "react";
import { Button, Card, Spinner, Badge } from "flowbite-react";
import ListResults from "@/components/ListResults";
import { SNAPSHOT_URL, BOT_EVENTS_URL, AGGREGATE_IPS_URL, AGGREGATE_PATHS_URL } from "@/config/api";
import Link from "next/link";

// Reuse the same detailComponentInfo from bot-event-list
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

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const snapshotResponse = await fetch(SNAPSHOT_URL);
      if (!snapshotResponse.ok) throw new Error("Unable to load analytics data");
      const snapshotData = await snapshotResponse.json();
      setSummary(snapshotData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const summaryMetrics = [
    { label: "Total Events", value: summary?.total_events ?? "—" },
    { label: "Injection Attempts", value: summary?.total_injection_attempts ?? "—" },
    { label: "From Unique IPs", value: summary?.total_ips ?? "—" },
  ];

  // Event columns matching bot-event-list
  const eventColumns = [
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

  // Custom renderer for attack categories (matching bot-event-list)
  const eventCustomCellRenderers = {
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

  // Path columns matching path-list
  const pathColumns = [
    { label: "Path", key: "request_path" },
    { label: "Traffic Count", key: "traffic_count" },
    { label: "Attack Count", key: "attack_count" },
    { label: "Spam Count", key: "spam_count" },
    { label: "Scan Count", key: "scan_count" },
    { label: "Most Popular Attack", key: "most_popular_attack" },
    { label: "Attacks Found", key: "attacks_used" },
  ];

  // Path row click handler (matching path-list)
  const pathCustomHandleRowClick = (row) => {
    window.location.href = `/bot-event-list?exact_request_path=${encodeURIComponent(row.request_path)}`;
  };

  // IP columns matching ip-list
  const ipColumns = [
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

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Real Bot Traffic</h1>
        <p className="text-slate-600">Everything that spam bots submit to our urls.</p>
        <Button color="light" onClick={fetchSummary} outline>
          Refresh
        </Button>
      </header>

      {loading && (
        <div className="flex items-center gap-3 rounded-lg bg-white p-6 shadow">
          <Spinner />
          <p className="text-sm text-slate-500">Loading submission telemetry…</p>
        </div>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      {!loading && !error && (
        <>
          <section className="grid gap-4 sm:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <Card key={metric.label}>
                <p className="text-xs uppercase text-slate-500">{metric.label}</p>
                <p className="text-3xl font-semibold">{metric.value}</p>
              </Card>
            ))}

            {summary?.top_three_paths && summary.top_three_paths.length > 0 && (
              <Card>
                <p className="text-xs uppercase text-slate-500">Top 3 Paths</p>
                <div className="space-y-1 mt-2">
                  {summary.top_three_paths.map((path, index) => (
                    <p key={index} className="text-sm">
                      <span className="font-semibold">{path.request_path}</span>
                      <span className="text-slate-500 ml-2">({path.total_count})</span>
                    </p>
                  ))}
                </div>
              </Card>
            )}
            {summary?.top_three_categories && summary.top_three_categories.length > 0 && (
              <Card>
                <p className="text-xs uppercase text-slate-500">Top 3 Categories</p>
                <div className="space-y-1 mt-2">
                  {summary.top_three_categories.map((category, index) => (
                    <p key={index} className="text-sm">
                      <span className="font-semibold">{category.category}</span>
                      <span className="text-slate-500 ml-2">({category.total_count})</span>
                    </p>
                  ))}
                </div>
              </Card>
            )}
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Browse by...</h2>
                <p className="text-sm text-slate-500">
                  Showing up to 25 results per table. Click rows for details or visit full pages for complete data.
                </p>
              </div>
            </div>

            <Card>
              <Link href="/bot-event-list">
                <h2 className="text-xl font-semibold mb-4 hover:text-blue-600 cursor-pointer">Recent submissions</h2>
              </Link>
              <ListResults
                baseUrl={BOT_EVENTS_URL}
                columns={eventColumns}
                orderingOptions={[]}
                filters={[]}
                title="Events"
                emptyMessage="No bot events found."
                loadingMessage="Loading bot events…"
                defaultOrdering="-created_at"
                customCellRenderers={eventCustomCellRenderers}
                detailFields={detailComponentInfo}
                additionalParams={{ page_size: 25 }}
                hideSearch={true}
                hidePagination={true}
                hideHeader={true}
                compact={true}
              />
            </Card>

            <Card>
              <Link href="/path-list">
                <h2 className="text-xl font-semibold mb-4 hover:text-blue-600 cursor-pointer">High Risk URLs</h2>
              </Link>
              <ListResults
                baseUrl={AGGREGATE_PATHS_URL}
                columns={pathColumns}
                orderingOptions={[]}
                filters={[]}
                title="Paths"
                emptyMessage="No paths found."
                loadingMessage="Loading paths…"
                defaultOrdering="-traffic_count"
                customHandleRowClick={pathCustomHandleRowClick}
                additionalParams={{ page_size: 25 }}
                hideSearch={true}
                hidePagination={true}
                hideHeader={true}
                compact={true}
              />
            </Card>

            <Card>
              <Link href="/ip-list">
                <h2 className="text-xl font-semibold mb-4 hover:text-blue-600 cursor-pointer">High Risk IPs</h2>
              </Link>
              <ListResults
                baseUrl={AGGREGATE_IPS_URL}
                columns={ipColumns}
                orderingOptions={[]}
                filters={[]}
                title="IPs"
                emptyMessage="No IP addresses found."
                loadingMessage="Loading IP list..."
                defaultOrdering="-traffic_count"
                useDetailView={false}
                additionalParams={{ page_size: 25 }}
                hideSearch={true}
                hidePagination={true}
                hideHeader={true}
                compact={true}
              />
            </Card>
          </section>
        </>
      )}
    </main>
  );
}
