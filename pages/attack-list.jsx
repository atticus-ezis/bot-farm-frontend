import { ATTACK_TYPES_URL } from "@/config/api";
import { useState, useEffect } from "react";
import { Table, Button, Card, Spinner, Badge, TextInput, Pagination, Select } from "flowbite-react";

export default function AttackTypeList() {
  const [attackTypes, setAttackTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, currentPage: 1, pageSize: 25 });
  const [ordering, setOrdering] = useState("-created_at");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");

  const buildUrl = ({ page = null, search = null, orderBy = null, category = null }) => {
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
    if (category) {
      params.append("category", category);
    }
    const queryString = params.toString();
    return queryString ? `${ATTACK_TYPES_URL}?${queryString}` : ATTACK_TYPES_URL;
  };

  const getAttackList = async (pageUrl = null) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (pageUrl) {
        // If it's a full URL (from pagination.next/previous), use it directly
        url = pageUrl;
      } else {
        // Build URL with current filters
        url = buildUrl({
          page: null,
          search: searchQuery || null,
          orderBy: ordering || null,
          category: category || null,
        });
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Unable to load attack types");
      const data = await response.json();
      setAttackTypes(data.results || []);

      const currentPage = extractPageNumber(pageUrl || data.next || data.previous) || 1;

      setPagination({
        count: data.count || 0,
        pageSize: data.page_size || 25,
        next: data.next,
        previous: data.previous,
        currentPage: currentPage,
      });
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

  // Helper function to check if value is defined
  const isDefined = (value) => value !== undefined;

  // Helper function to get value or fallback
  const getValue = (value, fallback) => (isDefined(value) ? value : fallback);

  // Unified filter change handler - accepts partial updates
  const handleFilterChange = (updates) => {
    // Update state for any provided values
    if (isDefined(updates.ordering)) {
      setOrdering(updates.ordering);
    }
    if (isDefined(updates.category)) {
      setCategory(updates.category);
    }
    if (isDefined(updates.search)) {
      setSearchQuery(updates.search);
    }

    // Build URL with current state, overriding with updates
    const url = buildUrl({
      page: getValue(updates.page, 1), // Reset to page 1 when filters change
      search: getValue(updates.search, searchQuery || null),
      orderBy: getValue(updates.ordering, ordering || null),
      category: getValue(updates.category, category || null),
    });
    getAttackList(url);
  };

  const handlePageChange = (page) => {
    const url = buildUrl({
      page: page,
      search: searchQuery || null,
      orderBy: ordering || null,
      category: category || null,
    });
    getAttackList(url);
  };

  const orderingOptions = [
    { value: "-created_at", label: "Newest First" },
    { value: "created_at", label: "Oldest First" },
  ];

  const categoryOptions = [
    { value: "", label: "All" },
    { value: "XSS", label: "XSS" },
    { value: "SQLI", label: "SQL Injection" },
    { value: "LFI", label: "LFI" },
    { value: "CMD", label: "CMD" },
    { value: "TRAVERSAL", label: "TRAVERSAL" },
    { value: "SSTI", label: "SSTI" },
    { value: "Other", label: "Other" },
  ];
  console.log("Attack list:", attackTypes);

  useEffect(() => {
    const url = buildUrl({ page: 1, search: null, orderBy: ordering, category: null });
    getAttackList(url);
  }, []);

  return (
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">All Attacks</h1>
        <p className="text-slate-600">Browse all Attacks with pagination</p>
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
              handleFilterChange({ search: query, page: 1 });
            }}
            className="flex-1 flex gap-2"
          >
            <TextInput
              type="text"
              name="search"
              className="flex-1"
              defaultValue={searchQuery}
              placeholder="Search by pattern, target field..."
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
              onChange={(e) => handleFilterChange({ ordering: e.target.value, page: 1 })}
              className="w-48 flex items-center"
            >
              {orderingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              id="category"
              value={category}
              onChange={(e) => handleFilterChange({ category: e.target.value, page: 1 })}
              className="w-48 flex items-center"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </Card>
      {/* Attack List */}
      <Table>
        <Table.Head>
          <Table.HeadCell>Timestamp</Table.HeadCell>
          <Table.HeadCell>Category</Table.HeadCell>
          <Table.HeadCell>Pattern</Table.HeadCell>
          <Table.HeadCell>Request Path</Table.HeadCell>
          <Table.HeadCell>Target Field</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {attackTypes.map((attack) => (
            <Table.Row key={attack.id}>
              <Table.Cell className="font-medium">{new Date(attack.created_at).toLocaleString()}</Table.Cell>
              <Table.Cell>{attack.category}</Table.Cell>
              <Table.Cell>{attack.pattern}</Table.Cell>
              <Table.Cell>{attack.request_path}</Table.Cell>
              <Table.Cell>{attack.target_field}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {attackTypes.length === 0 && <div className="text-center text-slate-600">No attacks found.</div>}
      <Card>
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={totalPages || 1}
            onPageChange={handlePageChange}
            showIcons
          />
        </div>
      </Card>
    </main>
  );
}
