import { useEffect, useState } from "react";
import { Button, Card, Spinner, Badge } from "flowbite-react";
import ListResults from "@/components/ListResults";
import { HONEYPOT_URLS } from "@/config/honeypot_urls";
import { SNAPSHOT_URL, BOT_EVENTS_URL, AGGREGATE_IPS_URL, AGGREGATE_PATHS_URL } from "@/config/api";
import { botEventColumns, pathColumns, ipColumns, detailComponentInfo } from "@/config/columns";
import Link from "next/link";

const backend_url = process.env.NEXT_PUBLIC_API_URL;

console.log("This is the backend url: ", backend_url);

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

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

  // Path columns - using imported pathColumns from columns.js

  // Path row click handler (matching path-list)
  const pathCustomHandleRowClick = (row) => {
    window.location.href = `/bot-event-list?exact_request_path=${encodeURIComponent(row.request_path)}`;
  };

  // IP columns - using imported ipColumns from columns.js
  const handleFakeSubmit = async (e, urlString) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(e.target);

    // Always set error message immediately, regardless of fetch result
    setErrors((prev) => {
      const newErrors = {
        ...prev,
        [urlString]: "Wrong username or password",
      };
      console.log("Setting error for", urlString, newErrors);
      return newErrors;
    });

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${backendUrl}/${urlString}`, {
        method: "POST",
        body: formData,
      });
    } catch (err) {
      console.error(err);
    }

    form.reset();
  };

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
                columns={botEventColumns}
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
      {/* Honeypot forms only target specific urls,
      if url includes "contact", 
       */}
      <div className="flex flex-wrap gap-2 honeypot-stealth">
        {HONEYPOT_URLS.map((url) => {
          const urlString = typeof url === "string" ? url : url.url;
          const urlName = typeof url === "string" ? url : url.name;

          if (urlString.includes("contact")) {
            return (
              <form
                key={urlString}
                action={"/" + urlString}
                method="POST"
                onSubmit={(e) => handleFakeSubmit(e, urlString)}
              >
                <input name="email" placeholder="Enter your email" />
                <input name="message" placeholder="Enter your message" />
                <button type="submit">Submit</button>
              </form>
            );
          }
          if (urlString.includes("login")) {
            return (
              <div key={urlString} className="flex flex-col gap-2">
                <form action={"/" + urlString} method="POST" onSubmit={(e) => handleFakeSubmit(e, urlString)}>
                  <input name="username" placeholder="Enter your username" />
                  <input name="email" placeholder="Enter your email" />
                  <input name="password" type="password" placeholder="Enter your password" />
                  <button type="submit">Submit</button>
                </form>
                {errors[urlString] && <p className="text-red-600 text-sm">{errors[urlString]}</p>}
              </div>
            );
          }
          return null;
        })}
      </div>

      <footer className="honeypot-stealth">
        {HONEYPOT_URLS.map((url) => {
          const urlString = typeof url === "string" ? url : url.url;
          const urlName = typeof url === "string" ? url : url.name;
          return (
            <a key={urlString} href={"/" + urlString}>
              {urlName}
            </a>
          );
        })}
      </footer>
    </main>
  );
}
