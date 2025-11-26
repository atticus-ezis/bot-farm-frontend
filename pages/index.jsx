import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import DashboardTable from "@/components/DashboardTable";
import SubmissionModal from "@/components/SubmissionModal";
import { SNAPSHOT_URL, BOT_EVENTS_URL } from "@/config/api";
import Link from "next/link";

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError("");
    try {
      // parrallel fetch snapshot
      const [snapshotResponse, botEvents] = await Promise.all([fetch(SNAPSHOT_URL), fetch(BOT_EVENTS_URL)]);
      // Fetch snapshot data
      console.log({ snapshotResponse });
      if (!snapshotResponse.ok) throw new Error("Unable to load analytics data");
      const snapshotData = await snapshotResponse.json();
      setSummary(snapshotData);

      // Fetch recent bot events
      if (botEvents.ok) {
        const recentData = await botEvents.json();
        console.log("Recent bot events response:", recentData);
        console.log("Recent bot events count:", recentData.results?.length || 0);
        setRecent(recentData.results || []);
      }
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
    { label: "Unique IPs", value: summary?.total_ips ?? "—" },
  ];

  console.log("Summary data:", summary);
  console.log("Recent submissions:", recent);
  console.log(
    "Recent submissions details:",
    recent.map((item) => ({
      id: item.id,
      created_at: item.created_at,
      ip_address: item.ip_address,
      method: item.method,
      request_path: item.request_path,
      attack_attempted: item.attack_attempted,
      attack_count: item.attack_count,
      attack_categories: item.attack_categories,
    }))
  );

  const attackCategorySnapshot = summary?.attack_category_snapshot ?? "-";

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Bot Analytics</p>
        <h1 className="text-3xl font-bold">Live bot submission telemetry</h1>
        <p className="text-slate-600">Everything that spam bots submit to our fake contact form. No humans harmed.</p>
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

            {attackCategorySnapshot?.map((category, index) => (
              <Card key={index}>
                <p className="text-xs uppercase text-slate-500">{category.category}</p>
                <p className="text-3xl font-semibold">{category.total_count}</p>

                {category?.most_popular_paths?.map((path, index) => (
                  <p key={index}>{path.request_path}</p>
                ))}
              </Card>
            ))}
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Link href="/bot-event-list">
                  <h2 className="text-xl font-semibold">Recent submissions</h2>
                </Link>
                <Link href="/attack-list">
                  <h2 className="text-xl font-semibold">List of Attacks</h2>
                </Link>
                <p className="text-sm text-slate-500">
                  Showing up to {recent.length} most recent events. Tags are sanitized and no raw HTML is rendered.
                </p>
              </div>
            </div>
            <DashboardTable submissions={recent} onSelect={setSelected} />
          </section>
        </>
      )}

      <SubmissionModal submission={selected} open={Boolean(selected)} onClose={() => setSelected(null)} />
    </main>
  );
}
