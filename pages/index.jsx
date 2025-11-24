import { useEffect, useState } from "react";
import { Button, Card, Spinner } from "flowbite-react";
import DashboardTable from "@/components/DashboardTable";
import SubmissionModal from "@/components/SubmissionModal";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

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
      // Fetch snapshot data
      const snapshotResponse = await fetch(`${API_BASE}/snapshot/`);
      if (!snapshotResponse.ok) throw new Error("Unable to load analytics data");
      const snapshotData = await snapshotResponse.json();
      setSummary(snapshotData);

      // Fetch recent bot events
      const recentResponse = await fetch(`${API_BASE}/bot-events/`);
      if (recentResponse.ok) {
        const recentData = await recentResponse.json();
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
  // this is a data structure like this:
  // { "attack_category_snapshot":[{"category":"SQL Injection","total_count":1,"most_popular_paths":[{"request_path":"/api/bot-events/","path_count":1}]}]}
  const attackCategorySnapshot = summary?.attack_category_snapshot ?? [];

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
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Recent submissions</h2>
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
