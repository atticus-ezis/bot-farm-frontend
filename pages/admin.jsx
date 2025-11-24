import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Label, Spinner, TextInput } from 'flowbite-react';
import DashboardTable from '@/components/DashboardTable';
import SubmissionModal from '@/components/SubmissionModal';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

const toBase64 = (value) => {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(value);
  }
  return Buffer.from(value).toString('base64');
};

export default function AdminDashboard() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [authToken, setAuthToken] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ email: '', ip: '', tag: '' });
  const [appliedFilters, setAppliedFilters] = useState({ email: '', ip: '', tag: '' });
  const [pagination, setPagination] = useState({ next: null, previous: null, count: 0, page: 1 });
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState(null);

  const headers = useMemo(() => {
    if (!authToken) return {};
    return {
      Authorization: `Basic ${authToken}`
    };
  }, [authToken]);

  const fetchSubmissions = useCallback(
    async (page = 1, filterOverride = null) => {
      if (!authToken) return;
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      const activeFilters = filterOverride ?? appliedFilters;
      Object.entries(activeFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', String(page));
      try {
        const response = await fetch(`${API_BASE}/submissions/?${params.toString()}`, { headers });
        if (response.status === 401 || response.status === 403) {
          setError('Authentication required or insufficient permissions.');
          setSubmissions([]);
          return;
        }
        if (!response.ok) throw new Error('Unable to load submissions.');
        const data = await response.json();
        setSubmissions(data.results);
        setPagination({
          next: data.next,
          previous: data.previous,
          count: data.count,
          page
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, authToken, headers]
  );

  const handleLogin = (event) => {
    event.preventDefault();
    setError('');
    if (!credentials.username || !credentials.password) {
      setError('Provide username and password.');
      return;
    }
    const encoded = toBase64(`${credentials.username}:${credentials.password}`);
    setAuthToken(encoded);
  };

  useEffect(() => {
    if (authToken) {
      fetchSubmissions(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const handleSelect = async (submission) => {
    setSelectedSummary(submission);
    setSelectedDetail(null);
    try {
      const response = await fetch(`${API_BASE}/submissions/${submission.id}/`, { headers });
      if (!response.ok) throw new Error('Unable to load submission detail.');
      setSelectedDetail(await response.json());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    if (!authToken) return;
    const params = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    try {
      const response = await fetch(`${API_BASE}/submissions/export/?${params.toString()}`, { headers });
      if (!response.ok) throw new Error('Unable to export CSV');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bot-submissions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  const activeSubmission = selectedDetail || selectedSummary;

  return (
    <main className="mx-auto max-w-6xl space-y-8 p-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Admin Dashboard</p>
        <h1 className="text-3xl font-bold">Full submission telemetry</h1>
      </header>

      {!authToken && (
        <Card>
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <Label htmlFor="username" value="Admin Username" />
              <TextInput
                id="username"
                name="username"
                onChange={(event) => setCredentials((prev) => ({ ...prev, username: event.target.value }))}
                placeholder="admin"
                required
                value={credentials.username}
              />
            </div>
            <div>
              <Label htmlFor="password" value="Password" />
              <TextInput
                id="password"
                name="password"
                onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="••••••••"
                required
                type="password"
                value={credentials.password}
              />
            </div>
            <Button type="submit">Connect</Button>
          </form>
        </Card>
      )}

      {authToken && (
        <>
          <Card>
            <form
              className="grid gap-4 md:grid-cols-4"
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedFilters(filters);
                fetchSubmissions(1, filters);
              }}
            >
              <div>
                <Label htmlFor="email-filter" value="Email contains" />
                <TextInput
                  id="email-filter"
                  onChange={(event) => setFilters((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="bot@"
                  value={filters.email}
                />
              </div>
              <div>
                <Label htmlFor="ip-filter" value="IP contains" />
                <TextInput
                  id="ip-filter"
                  onChange={(event) => setFilters((prev) => ({ ...prev, ip: event.target.value }))}
                  placeholder="203.0.113."
                  value={filters.ip}
                />
              </div>
              <div>
                <Label htmlFor="tag-filter" value="Tag" />
                <TextInput
                  id="tag-filter"
                  onChange={(event) => setFilters((prev) => ({ ...prev, tag: event.target.value }))}
                  placeholder="honeypot-hit"
                  value={filters.tag}
                />
              </div>
              <div className="flex items-end gap-3">
                <Button color="light" type="submit">
                  Filter
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    const cleared = { email: '', ip: '', tag: '' };
                    setFilters(cleared);
                    setAppliedFilters(cleared);
                    fetchSubmissions(1, cleared);
                  }}
                  type="button"
                >
                  Clear
                </Button>
              </div>
            </form>
          </Card>

          <div className="flex items-center justify-between">
            <Badge color="purple">Total: {pagination.count}</Badge>
            <div className="flex gap-2">
              <Button color="gray" disabled={!pagination.previous} onClick={() => fetchSubmissions(pagination.page - 1)}>
                Previous
              </Button>
              <Button color="gray" disabled={!pagination.next} onClick={() => fetchSubmissions(pagination.page + 1)}>
                Next
              </Button>
              <Button color="light" onClick={handleExport}>
                Export CSV
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-3 rounded-lg bg-white p-6 shadow">
              <Spinner />
              <p className="text-sm text-slate-500">Loading submissions…</p>
            </div>
          ) : (
            <DashboardTable submissions={submissions} onSelect={handleSelect} />
          )}
        </>
      )}

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      <SubmissionModal
        submission={activeSubmission}
        open={Boolean(activeSubmission)}
        onClose={() => {
          setSelectedDetail(null);
          setSelectedSummary(null);
        }}
      />
    </main>
  );
}
