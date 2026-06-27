import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, EyeOff, Eye, Star, StarOff, Trash2, ExternalLink, Search } from "lucide-react";

import {
  adminLogin,
  adminListCases,
  adminToggleHidden,
  adminToggleFeatured,
  adminDeleteCase,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/dc-admin-z9x7")({
  head: () => ({
    meta: [
      { title: "Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const STORAGE_KEY = "dc.admin.token";

type Row = {
  id: string;
  slug: string;
  title: string;
  category: string;
  status: string;
  created_at: string;
  view_count: number;
  votes_a: number;
  votes_b: number;
  votes_both: number;
  is_hidden: boolean;
  is_featured: boolean;
};

function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);
  const [loginInput, setLoginInput] = useState("");
  const [loginErr, setLoginErr] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setPassword(atob(stored));
    } catch {
      /* ignore */
    }
  }, []);

  const login = useServerFn(adminLogin);

  async function attemptLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginBusy(true);
    setLoginErr(null);
    try {
      const { ok } = await login({ data: { password: loginInput } });
      if (!ok) {
        setLoginErr("Incorrect");
      } else {
        localStorage.setItem(STORAGE_KEY, btoa(loginInput));
        setPassword(loginInput);
      }
    } catch (err) {
      setLoginErr((err as Error).message);
    } finally {
      setLoginBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setPassword(null);
    setLoginInput("");
  }

  if (!password) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <form onSubmit={attemptLogin} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
          <h1 className="font-display text-xl font-bold">Admin</h1>
          <input
            type="password"
            autoComplete="off"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/40 px-4 py-3 outline-none focus:border-foreground"
          />
          {loginErr && <p className="text-xs text-destructive">{loginErr}</p>}
          <button
            type="submit"
            disabled={loginBusy || !loginInput}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-40"
          >
            {loginBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enter"}
          </button>
        </form>
      </div>
    );
  }

  return <AdminDashboard password={password} onLogout={logout} />;
}

function AdminDashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const list = useServerFn(adminListCases);
  const toggleHidden = useServerFn(adminToggleHidden);
  const toggleFeatured = useServerFn(adminToggleFeatured);
  const del = useServerFn(adminDeleteCase);

  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh(q?: string) {
    setLoading(true);
    setErr(null);
    try {
      const r = (await list({ data: { password, search: q || undefined } })) as Row[];
      setRows(r);
    } catch (e) {
      const msg = (e as Error).message;
      setErr(msg);
      if (msg === "Unauthorized") onLogout();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      hidden: rows.filter((r) => r.is_hidden).length,
      featured: rows.filter((r) => r.is_featured).length,
      ready: rows.filter((r) => r.status === "ready").length,
    };
  }, [rows]);

  async function onToggleHidden(row: Row) {
    await toggleHidden({ data: { password, case_id: row.id, value: !row.is_hidden } });
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_hidden: !r.is_hidden } : r)));
  }
  async function onToggleFeatured(row: Row) {
    await toggleFeatured({ data: { password, case_id: row.id, value: !row.is_featured } });
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, is_featured: !r.is_featured } : r)));
  }
  async function onDelete(row: Row) {
    if (!confirm(`Delete "${row.title}"? This cannot be undone.`)) return;
    await del({ data: { password, case_id: row.id } });
    setRows((rs) => rs.filter((r) => r.id !== row.id));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="font-display text-xl font-bold">Drama Court — Admin</h1>
          <button onClick={onLogout} className="text-xs text-muted-foreground hover:text-foreground">
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total" value={stats.total} />
          <Stat label="Ready" value={stats.ready} />
          <Stat label="Hidden" value={stats.hidden} />
          <Stat label="Featured" value={stats.featured} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            refresh(search);
          }}
          className="mt-6 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or category"
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-4 text-sm outline-none focus:border-foreground"
            />
          </div>
          <button className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background">Search</button>
        </form>

        {err && <p className="mt-4 text-sm text-destructive">{err}</p>}

        <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Title</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Created</th>
                <th className="px-3 py-3">Views</th>
                <th className="px-3 py-3">Votes</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && rows.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">No cases.</td></tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{r.title}</div>
                    <div className="text-xs text-muted-foreground">{r.slug}</div>
                  </td>
                  <td className="px-3 py-3 text-xs">{r.category}</td>
                  <td className="px-3 py-3 text-xs">{r.status}</td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3 text-xs">{r.view_count}</td>
                  <td className="px-3 py-3 text-xs">{r.votes_a + r.votes_b + r.votes_both}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/case/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-border p-1.5 hover:bg-secondary"
                        title="View"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => onToggleHidden(r)}
                        className="rounded-full border border-border p-1.5 hover:bg-secondary"
                        title={r.is_hidden ? "Unhide" : "Hide"}
                      >
                        {r.is_hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onToggleFeatured(r)}
                        className="rounded-full border border-border p-1.5 hover:bg-secondary"
                        title={r.is_featured ? "Unfeature" : "Feature"}
                      >
                        {r.is_featured ? <Star className="h-3.5 w-3.5 fill-current" /> : <StarOff className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => onDelete(r)}
                        className="rounded-full border border-destructive/40 p-1.5 text-destructive hover:bg-destructive/10"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}