import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { Table, Button, Card, Spinner, Badge, TextInput, Pagination, Select, Modal } from "flowbite-react";
import { extractPageNumber } from "@/utils/helper";
import DetailComponent from "@/components/DetailComponent";

export default function ListResults({
  baseUrl,
  columns = [],
  orderingOptions = [],
  filters = [],
  title = "Results",
  description = "Browse results with pagination",
  searchPlaceholder = "Search...",
  emptyMessage = "No results found.",
  loadingMessage = "Loading...",
  defaultOrdering = "-created_at",
  customCellRenderers = {},
  additionalParams = {},
  detailFields = null,
  useDetailView = true,
  customHandleRowClick = null,
  hideSearch = false,
  hidePagination = false,
  hideHeader = false,
  compact = false,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    next: null,
    previous: null,
    count: 0,
    currentPage: 1,
    pageSize: 25,
  });
  const [ordering, setOrdering] = useState(defaultOrdering);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState(() => {
    const initialFilters = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = filter.defaultValue || "";
    });
    return initialFilters;
  });
  const [selectedRow, setSelectedRow] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const router = useRouter();

  // Create detail component instance from configuration
  const DetailComponentInstance = useMemo(() => {
    return detailFields ? DetailComponent(detailFields) : null;
  }, [detailFields]);

  const buildUrl = ({ page = null, search = null, orderBy = null, filterParams = {}, additional = {} }) => {
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

    // Add filter parameters
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value && value !== "") {
        params.append(key, value);
      }
    });

    // Add additional parameters
    Object.entries(additional).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  };

  const fetchData = async (pageUrl = null) => {
    setLoading(true);
    setError(null);
    try {
      let url;
      if (pageUrl) {
        url = pageUrl;
      } else {
        url = buildUrl({
          page: null,
          search: searchQuery || null,
          orderBy: ordering || null,
          filterParams: filterValues,
          additional: additionalParams,
        });
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Unable to load data from ${baseUrl}`);
      const result = await response.json();

      setData(result.results || []);

      const currentPage = extractPageNumber(pageUrl || result.next || result.previous) || 1;
      setPagination({
        count: result.count || 0,
        pageSize: result.page_size || 25,
        next: result.next,
        previous: result.previous,
        currentPage: currentPage,
      });
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(pagination.count / pagination.pageSize);

  const handlePageChange = (page) => {
    const url = buildUrl({
      page: page,
      search: searchQuery || null,
      orderBy: ordering || null,
      filterParams: filterValues,
      additional: additionalParams,
    });
    fetchData(url);
  };

  const handleOrderingChange = (newOrdering) => {
    setOrdering(newOrdering);
    const url = buildUrl({
      page: 1,
      search: searchQuery || null,
      orderBy: newOrdering,
      filterParams: filterValues,
      additional: additionalParams,
    });
    fetchData(url);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = event.target.search.value;
    setSearchQuery(query);
    const url = buildUrl({
      page: 1,
      search: query,
      orderBy: ordering || null,
      filterParams: filterValues,
      additional: additionalParams,
    });
    fetchData(url);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilterValues = { ...filterValues, [filterKey]: value };
    setFilterValues(newFilterValues);
    const url = buildUrl({
      page: 1,
      search: searchQuery || null,
      orderBy: ordering || null,
      filterParams: newFilterValues,
      additional: additionalParams,
    });
    fetchData(url);
  };

  const handleRefresh = () => {
    // Reset all filters to default values
    const resetFilters = {};
    filters.forEach((filter) => {
      resetFilters[filter.key] = filter.defaultValue || "";
    });
    setFilterValues(resetFilters);
    setSearchQuery("");
    setOrdering(defaultOrdering);

    // Clear URL query parameters by navigating to the same page without query params
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      router.replace(currentPath, undefined, { shallow: true });
    }

    // Fetch fresh data with only additionalParams that are not from URL (like page_size)
    // Filter out URL-based params (ip_address, exact_request_path, request_path, etc.)
    const urlBasedParams = ["ip_address", "exact_request_path", "request_path"];
    const cleanAdditionalParams = {};
    Object.entries(additionalParams).forEach(([key, value]) => {
      // Only keep params that are not URL-based (like page_size)
      if (!urlBasedParams.includes(key)) {
        cleanAdditionalParams[key] = value;
      }
    });

    const url = buildUrl({
      page: null,
      search: null,
      orderBy: defaultOrdering,
      filterParams: {},
      additional: cleanAdditionalParams,
    });
    fetchData(url);
  };

  const fetchDetailData = async (url) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      console.log("Fetching detail data from:", url);
      const response = await fetch(url);
      console.log("Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Unable to load detail data (${response.status} ${response.statusText}): ${errorText || url}`);
      }
      const data = await response.json();
      console.log("Detail data received:", data);
      setDetailData(data);
    } catch (err) {
      console.error("Error fetching detail data:", err);
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Helper to determine if row should be clickable (for styling)
  const isRowClickable = () => {
    return (useDetailView && detailFields) || customHandleRowClick;
  };

  // Central command for row click - handles all cases
  const defaultHandleRowClick = (row) => {
    // If custom handler is provided, use it (overrides default behavior)
    if (customHandleRowClick) {
      customHandleRowClick(row);
      return;
    }

    // If detail view is disabled, do nothing
    if (useDetailView === false) {
      return;
    }

    // Default behavior: show detail modal if detailFields are provided
    if (useDetailView && DetailComponentInstance) {
      setSelectedRow(row);
      setIsModalOpen(true);
      setDetailData(null);

      const base = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
      const detailUrl = `${base}/${row.id}/`;
      fetchDetailData(detailUrl);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setDetailData(null);
    setDetailError(null);
  };

  const renderCell = (row, column) => {
    // Check if column has a custom render function
    if (column.render && typeof column.render === "function") {
      return column.render(row);
    }
    // Check if there's a custom renderer for this column
    if (customCellRenderers[column.key]) {
      return customCellRenderers[column.key](row, column);
    }

    // Check if column has a custom accessor function
    if (column.accessor && typeof column.accessor === "function") {
      return column.accessor(row);
    }

    // Default: use the key to access the value
    const value = row[column.key];

    // Handle date formatting if it's a date field
    if (column.type === "date" && value) {
      return new Date(value).toLocaleString();
    }

    // Handle array values
    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return value || "—";
  };

  useEffect(() => {
    const url = buildUrl({
      page: 1,
      search: null,
      orderBy: ordering,
      filterParams: filterValues,
      additional: additionalParams,
    });
    fetchData(url);
  }, []);

  return (
    <main className={compact ? "space-y-6" : "mx-auto max-w-7xl space-y-6 p-6"}>
      {!hideHeader && (
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-slate-600">{description}</p>
        </header>
      )}

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

      {/* search and filters */}
      {(filters.length > 0 || orderingOptions.length > 0 || !hideSearch) && (
        <Card>
          <div className="space-y-4">
            {/* search */}
            {!hideSearch && (
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <TextInput
                  type="text"
                  name="search"
                  placeholder={searchPlaceholder}
                  className="flex-1"
                  defaultValue={searchQuery}
                />
                <Button type="submit" color="blue">
                  Search
                </Button>
                <Button onClick={handleRefresh} color="light" outline>
                  Refresh
                </Button>
              </form>
            )}

            {/* Refresh button when search is hidden but filters/ordering exist */}
            {hideSearch && (filters.length > 0 || orderingOptions.length > 0) && (
              <div className="flex justify-end">
                <Button onClick={handleRefresh} color="light" outline>
                  Refresh
                </Button>
              </div>
            )}

            {/* Filters */}
            {filters.length > 0 && (
              <div className="flex flex-wrap items-center gap-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="flex items-center gap-2 min-w-0 flex-shrink-0">
                    <label htmlFor={filter.key} className="text-sm font-medium text-slate-700 whitespace-nowrap">
                      {filter.label}:
                    </label>
                    <Select
                      id={filter.key}
                      value={filterValues[filter.key] || ""}
                      onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                      className="w-48 flex-shrink-0"
                    >
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            )}

            {/* Ordering - Bottom row */}
            {orderingOptions.length > 0 && (
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
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
            )}
          </div>
        </Card>
      )}
      {/* pagination info */}
      {!hidePagination && (
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
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-3 rounded-lg bg-white p-6 shadow">
          <Spinner />
          <p className="text-sm text-slate-500">{loadingMessage}</p>
        </div>
      ) : (
        <>
          <div
            className={`rounded-lg border bg-white shadow ${
              compact ? "max-h-[300px] overflow-auto" : "overflow-x-auto"
            }`}
          >
            {data.length === 0 ? (
              <p className="p-4 text-center text-sm text-slate-500">{emptyMessage}</p>
            ) : (
              <Table hoverable>
                <Table.Head>
                  {columns.map((column, index) => (
                    <Table.HeadCell key={column.key || index}>{column.label}</Table.HeadCell>
                  ))}
                </Table.Head>
                <Table.Body className="divide-y">
                  {data.map((row) => {
                    const hasAttack = row.attack_attempted === true || (row.attack_count && row.attack_count > 0);
                    return (
                      <Table.Row
                        key={row.id || Math.random()}
                        className={`${
                          isRowClickable() ? "bg-white hover:bg-gray-50 cursor-pointer" : "bg-white hover:bg-gray-50"
                        } ${hasAttack ? "border-l-4 border-red-500" : ""}`}
                        onClick={() => defaultHandleRowClick(row)}
                      >
                        {columns.map((column, index) => (
                          <Table.Cell key={column.key || index} className={column.cellClassName || ""}>
                            {renderCell(row, column)}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )}
            {!compact && data.length === 0 && <p className="p-4 text-center text-sm text-slate-500">{emptyMessage}</p>}
          </div>
          {!hidePagination && (
            <Card>
              {/* pagination */}
              <div className="flex flex-col justify-center sm:flex-row items-center gap-4">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={totalPages || 1}
                  onPageChange={handlePageChange}
                  showIcons
                />
              </div>
            </Card>
          )}
        </>
      )}

      {/* Detail Modal */}
      {DetailComponentInstance && (
        <Modal dismissible show={isModalOpen} onClose={handleCloseModal} size="xl">
          <Modal.Header>Details</Modal.Header>
          <Modal.Body>
            {detailLoading ? (
              <div className="flex items-center gap-3 p-6">
                <Spinner />
                <p className="text-sm text-slate-500">Loading details…</p>
              </div>
            ) : detailError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{detailError}</div>
            ) : detailData ? (
              <DetailComponentInstance row={detailData} onClose={handleCloseModal} />
            ) : (
              <p className="text-sm text-slate-500">No data available.</p>
            )}
          </Modal.Body>
        </Modal>
      )}
    </main>
  );
}
