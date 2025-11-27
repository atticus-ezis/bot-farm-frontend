// start with end in mind
// reference backend filters + html
// create function to call API and set data
// create variables to store ordering, filtering and searching
// build a handleFilter function that sets filter params passed and creates a new url and calls the fecth function
// handle pagination and create cutom method to find current page number

import { useState, useEffect } from "react";
import { Table, Button, Card, Spinner, Badge, TextInput, Pagination, Select } from "flowbite-react";
import { AGGREGATE_IPS_URL } from "@/config/api";
import { extractPageNumber } from "@/utils/helper";

export default function IPList() {
  const [ipList, setIpList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, page: 1, currentPage: 1 });
  const [ordering, setOrdering] = useState("-created_at");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ ip: "", port: "", protocol: "", country: "", city: "" });

  const orderingOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
    { value: "-traffic_count", label: "Total Hits" },
    { value: "-scan_count", label: "Scan Count" },
    { value: "-spam_count", label: "Spam Count" },
    { value: "-attack_count", label: "Attack Count" },
  ];

  const getIpList = async (updatedUrl = null) => {
    setLoading(true);
    setError(null);
    let url;
    if (updatedUrl) {
      url = updatedUrl;
    } else {
      url = AGGREGATE_IPS_URL;
    }
    try {
      const response = await fetch(url);

      console.log("response", response);

      if (!response.ok) throw new Error("Unable to load IP list");
      const data = await response.json();
      setIpList(data.results);

      const currentPage = extractPageNumber(url) || 1;
      setPagination({
        next: data.next,
        previous: data.previous,
        count: data.count,
        page: extractPageNumber(url) || 1,
        pageSize: data.page_size || 25,
        currentPage: currentPage,
      });
    } catch (err) {
      console.log("error", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  const buildUrl = ({ page = null, search = null, ordering = null }) => {
    const params = new URLSearchParams();
    if (page) {
      params.append("page", page);
    }
    if (search) {
      params.append("search", search);
    }
    if (ordering) {
      params.append("ordering", ordering);
    }

    const queryString = params.toString();
    return queryString ? `${AGGREGATE_IPS_URL}?${queryString}` : AGGREGATE_IPS_URL;
  };

  const handleOrderingChange = (newOrdering) => {
    setOrdering(newOrdering);
    const url = buildUrl({
      ordering: newOrdering,
      page: 1,
      search: search || null,
    });
    getIpList(url);
  };

  const handleSearchChange = ({ search: searchValue = null }) => {
    setSearch(searchValue);
    const url = buildUrl({
      search: searchValue,
      page: 1,
      ordering: ordering || null,
    });
    getIpList(url);
  };

  const handlePageChange = (page) => {
    const url = buildUrl({
      page: page,
      search: search || null,
      ordering: ordering || null,
    });
    getIpList(url);
  };

  useEffect(() => {
    // Initial fetch with default ordering
    const url = buildUrl({ page: 1, search: null, ordering: ordering });
    getIpList(url);
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-2"></header>
      {loading && (
        <div className="flex items-center gap-3 rounded-lg bg-white p-6 shadow">
          <Spinner />
          <p className="text-sm text-slate-500">Loading IP list...</p>
        </div>
      )}
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      {/* Pagination Info */}
      <Card>
        <div className="flex items-center gap-2">
          <Badge color="purple" size="lg">
            Total: {pagination.count}
          </Badge>
          <span className="text-sm text-slate-600">
            Page {pagination.currentPage} of {totalPages || 1}
          </span>
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
              handleSearchChange({ search: query });
            }}
            className="flex-1 flex gap-2"
          >
            <TextInput
              id="search"
              name="search"
              placeholder="Search by IP, email, location..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="flex-1"
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
              className="w-48"
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

      {/* Table with scrollable container */}
      <Card>
        <div className="overflow-x-auto rounded-lg border bg-white shadow">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>IP Address</Table.HeadCell>
              <Table.HeadCell>Location</Table.HeadCell>
              <Table.HeadCell>Language</Table.HeadCell>
              <Table.HeadCell>Referer</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Traffic Count</Table.HeadCell>
              <Table.HeadCell>Scan Count</Table.HeadCell>
              <Table.HeadCell>Spam Count</Table.HeadCell>
              <Table.HeadCell>Attack Count</Table.HeadCell>
            </Table.Head>

            <Table.Body className="divide-y">
              {ipList?.map((ip) => (
                <Table.Row key={ip?.ip_address || Math.random()} className="bg-white hover:bg-gray-50">
                  <Table.Cell className="whitespace-nowrap">{ip?.ip_address}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.geo_location || "—"}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.language || "—"}</Table.Cell>
                  <Table.Cell className="max-w-xs truncate">{ip?.referer || "—"}</Table.Cell>
                  <Table.Cell className="max-w-xs truncate">
                    {ip?.email && Array.isArray(ip.email) ? ip.email.join(", ") : "—"}
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.traffic_count || 0}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.attack_count || 0}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.scan_count || 0}</Table.Cell>
                  <Table.Cell className="whitespace-nowrap">{ip?.spam_count || 0}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
          {ipList.length === 0 && !loading && (
            <div className="text-center text-slate-500 p-4">No IP addresses found.</div>
          )}
        </div>
      </Card>
      {ipList.length === 0 && !loading && <div className="text-center text-slate-500 p-4">No IP addresses found.</div>}

      <Card>
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage || 1}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
            showIcons
          />
        </div>
      </Card>
    </main>
  );
}

// search_fields = ["ip_address", "referer", "email", "geo_location", "language"];

// ordering_fields = [
//   "traffic_count",
//   "scan_count",
//   "spam_count",
//   "attack_count",
//   "ip_address",
//   "created_at",
//   "email_count",
//   "geo_location",
//   "language",
// ];

// filter_fields = ["attack_categories", "agent"];
