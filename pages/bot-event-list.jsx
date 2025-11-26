// create a results page for all bot events

import { BOT_EVENTS_URL } from "@/config/api";
import { useEffect, useState } from "react";
import { Table, Button, Card, Spinner, Badge, TextInput, Pagination, Select } from "flowbite-react";

export default function BotEventList() {
  const [botEvents, setBotEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, currentPage: 1, pageSize: 25 });
  const [ordering, setOrdering] = useState("-created_at");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBotEvents = async (pageUrl = null, orderBy = null) => {
    setLoading(true);
    setError(null);
    try {
      let url;

      if (pageUrl) {
        // If it's a full URL (from pagination.next/previous), use it directly
        // The backend already includes all query params in these URLs
        url = pageUrl;
      } else {
        // Build URL with current filters
        url = buildUrl({ page: null, search: searchQuery || null, orderBy: orderBy || ordering });
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to load bot events");
      const data = await response.json();
      setBotEvents(data.results || []);

      // Extract current page from URL or response
      const currentPage = extractPageNumber(pageUrl || data.next || data.previous) || 1;

      setPagination({
        count: data.count || 0,
        pageSize: data.page_size || 25,
        next: data.next,
        previous: data.previous,
        currentPage: currentPage,
      });

      // Update ordering state if it changed
      if (orderBy) {
        setOrdering(orderBy);
      }
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const extractPageNumber = (url) => {
    if (!url) return null;
    const match = url.match(/[?&]page=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  // Helper function to build URLs with filters
  const buildUrl = ({ page = null, search = null, orderBy = null }) => {
    const params = new URLSearchParams();

    if (page) {
      params.append("page", page);
    }
    if (search) {
      params.append("search", search);
    }
    if (orderBy) {
      params.append("ordering", orderBy);
    }

    const queryString = params.toString();
    return queryString ? `${BOT_EVENTS_URL}?${queryString}` : BOT_EVENTS_URL;
  };

  // Handler for page changes from Pagination component
  const handlePageChange = (page) => {
    const url = buildUrl({ page: page, search: searchQuery || null, orderBy: ordering || null });
    fetchBotEvents(url);
  };

  const handleOrderingChange = (newOrdering) => {
    setOrdering(newOrdering);
    // Reset to page 1 when ordering changes
    const url = buildUrl({ page: 1, search: searchQuery || null, orderBy: newOrdering });
    fetchBotEvents(url);
  };
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

  console.log("Bot events:", botEvents);

  useEffect(() => {
    // Initial fetch with default ordering
    const url = buildUrl({ page: 1, search: null, orderBy: ordering });
    fetchBotEvents(url);
  }, []);
  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">All Bot Events</h1>
        <p className="text-slate-600">Browse all bot submission events with pagination</p>
      </header>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}
      {/* Pagination Info and Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge color="purple" size="lg">
              Total: {pagination.count}
            </Badge>
            <span className="text-sm text-slate-600">
              Page {pagination.currentPage} of {totalPages || 1}
            </span>
          </div>
        </div>
      </Card>
      {/* Filters and Ordering */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const query = event.target.search.value;
              setSearchQuery(query);
              const url = buildUrl({ page: 1, search: query, orderBy: ordering || null });
              fetchBotEvents(url);
            }}
            className="flex-1 flex gap-2"
          >
            <TextInput
              type="text"
              name="search"
              placeholder="Search by IP, email, path..."
              className="flex-1"
              defaultValue={searchQuery}
            />
            <Button type="submit" color="blue">
              Search
            </Button>
          </form>

          {/* Ordering */}
          <div className="flex items-center gap-2">
            <label htmlFor="ordering" className="text-sm font-medium text-slate-700 whitespace-nowrap">
              Sort by:
            </label>
            <Select
              id="ordering"
              value={ordering}
              onChange={(e) => handleOrderingChange(e.target.value)}
              className="w-48 flex items-center"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-lg bg-white p-6 shadow">
          <Spinner />
          <p className="text-sm text-slate-500">Loading bot events…</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Timestamp</Table.HeadCell>
              <Table.HeadCell>IP Address</Table.HeadCell>
              <Table.HeadCell>Path</Table.HeadCell>
              <Table.HeadCell>Method</Table.HeadCell>
              <Table.HeadCell>Location</Table.HeadCell>
              <Table.HeadCell>Attack Categories</Table.HeadCell>
              <Table.HeadCell>Attack Count</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {botEvents.map((event) => (
                <Table.Row key={event.id} className="bg-white hover:bg-gray-50">
                  <Table.Cell className="font-medium">{new Date(event.created_at).toLocaleString()}</Table.Cell>
                  <Table.Cell>{event.ip_address}</Table.Cell>
                  <Table.Cell>{event.request_path}</Table.Cell>
                  <Table.Cell>{event.method}</Table.Cell>
                  <Table.Cell>{event.geo_location}</Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-wrap gap-1">
                      {event.attack_categories?.map((cat) => (
                        <Badge key={`${event.id}-${cat}`} color="info">
                          {cat}
                        </Badge>
                      ))}
                      {(!event.attack_categories || event.attack_categories.length === 0) && (
                        <Badge color="gray">none</Badge>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>{event.attack_count || 0}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {botEvents.length === 0 && <p className="p-4 text-center text-sm text-slate-500">No bot events found.</p>}
          <Card>
            <div className="flex flex-col justify-center sm:flex-row items-center gap-4">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={totalPages || 1}
                onPageChange={handlePageChange}
                showIcons
              />
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
