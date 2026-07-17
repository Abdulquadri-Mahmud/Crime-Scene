"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuthToken, extractErrorMessage, AdminReport } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { AlertCard, StatCard } from "@/components/Card";
import { Lock, BarChart3, Download, FileText, Search, CheckCircle2, LogOut, Mail, Loader2, ChevronLeft } from "lucide-react";

const STATUS_FILTERS = ["all", "received", "under_review", "investigating", "resolved", "closed"];

const NEXT_STATUS: Record<string, string[]> = {
  received: ["under_review", "closed"],
  under_review: ["investigating", "closed"],
  investigating: ["resolved", "closed"],
  resolved: ["closed"],
  closed: [],
};

interface Stats {
  totalReports: number;
  statusCounts: { _id: string; count: number }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Restore session and redirect unauthenticated visitors before rendering
  // any report data, so the dashboard never briefly flashes protected content.
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setAuthToken(token);
    setReady(true);
  }, [router]);

  const loadReports = useCallback(async () => {
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== "all") params.status = statusFilter;
      if (search) params.search = search;

      const [reportsRes, statsRes] = await Promise.all([
        api.get("/api/admin/reports", { params }),
        api.get("/api/admin/stats"),
      ]);
      setReports(reportsRes.data.reports);
      setStats(statsRes.data);
    } catch (err) {
      setError(extractErrorMessage(err));
    }
  }, [statusFilter, search]);

  useEffect(() => {
    if (ready) loadReports();
  }, [ready, loadReports]);

  async function handleStatusChange(report: AdminReport, nextStatus: string) {
    const note = window.prompt(`Add a note for moving this report to "${nextStatus}" (optional):`) || undefined;
    setUpdating(true);
    setError(null);
    try {
      const res = await api.patch(`/api/admin/reports/${report._id}/status`, { status: nextStatus, note });
      setSelected(res.data.report);
      await loadReports();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  }

  function handleLogout() {
    sessionStorage.clear();
    setAuthToken(null);
    router.push("/admin/login");
  }

  if (!ready) return null;

  const statusColorMap: Record<string, "primary" | "info" | "success" | "warning" | "alert"> = {
    received: "warning",
    under_review: "info",
    investigating: "info",
    resolved: "success",
    closed: "primary",
  };

  const getStatusCount = (status: string) => {
    if (!stats) return 0;
    return stats.statusCounts.find((c) => c._id === status)?.count || 0;
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-paper to-surface">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <div className="inline-block mb-4">
              <span className="badge badge-primary flex items-center gap-2">
                <Lock size={18} /> Officer Dashboard
              </span>
            </div>
            <h1 className="text-headline text-ink">Case Management System</h1>
            <p className="mt-2 text-base text-ink/70">Review, track, and manage community crime reports</p>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary self-start md:self-auto inline-flex items-center gap-2"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-6 mb-8">
            <StatCard
              label="Total Reports"
              value={stats.totalReports}
              icon={<BarChart3 size={48} />}
              color="primary"
            />
            <StatCard
              label="Received"
              value={getStatusCount("received")}
              icon={<Download size={48} />}
              color="warning"
            />
            <StatCard
              label="Under Review"
              value={getStatusCount("under_review")}
              icon={<FileText size={48} />}
              color="info"
            />
            <StatCard
              label="Investigating"
              value={getStatusCount("investigating")}
              icon={<Search size={48} />}
              color="info"
            />
            <StatCard
              label="Resolved"
              value={getStatusCount("resolved")}
              icon={<CheckCircle2 size={48} />}
              color="success"
            />
            <StatCard
              label="Closed"
              value={getStatusCount("closed")}
              icon={<Lock size={48} />}
              color="primary"
            />
          </div>
        )}

        {/* Filters & Search */}
        <div className="card mb-8">
          <div className="space-y-4">
            {/* Status Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                    statusFilter === s
                      ? "bg-gradient-to-r from-seal to-sealDark text-white shadow-md"
                      : "bg-surface border border-line text-ink/60 hover:border-seal hover:text-seal"
                  }`}
                >
                  {s === "all" ? "📋 All" : s.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 Search tracking ID, description, reporter name..."
                className="w-full px-4 py-3 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <AlertCard
              type="error"
              title="Error Loading Reports"
              message={error}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
          {/* Reports Table */}
          <div className="card p-0 overflow-hidden">
            <div className="border-b border-line bg-surface px-6 py-4">
              <h2 className="font-display text-lg font-semibold text-ink">
                Reports
                <span className="ml-2 text-sm font-normal text-ink/60">({reports.length})</span>
              </h2>
            </div>

            {reports.length === 0 ? (
              <div className="p-12 text-center">
                <div className="flex justify-center mb-3"><Mail size={48} className="text-ink/40" /></div>
                <p className="text-ink/60">No reports match your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-line bg-surface text-xs uppercase tracking-widest text-ink/50 font-semibold">
                    <tr>
                      <th className="px-6 py-3 text-left">Tracking ID</th>
                      <th className="px-6 py-3 text-left">Type</th>
                      <th className="px-6 py-3 text-left">Filed</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r._id}
                        onClick={() => setSelected(r)}
                        className={`border-b border-line cursor-pointer transition-colors last:border-0 ${
                          selected?._id === r._id
                            ? "bg-seal/10 hover:bg-seal/15"
                            : "hover:bg-surface"
                        }`}
                      >
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-seal">
                          {r.trackingId}
                        </td>
                        <td className="px-6 py-4 text-ink font-medium">{r.incident.type}</td>
                        <td className="px-6 py-4 text-ink/60">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={r.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {!selected ? (
            <div className="card flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="flex justify-center mb-3"><ChevronLeft size={48} className="text-ink/40" /></div>
                <p className="text-ink/60">Select a report from the list to view details</p>
              </div>
            </div>
          ) : (
            <div className="case-tab" data-tab={selected.trackingId}>
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-mono text-xs text-ink/50 uppercase tracking-widest">Tracking ID</p>
                    <StatusBadge status={selected.status} />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-ink">{selected.incident.type}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">
                    {selected.incident.description}
                  </p>
                </div>

                <div className="divider"></div>

                {/* Details Grid */}
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-1">Reporter</p>
                    <p className="text-ink font-semibold">
                      {selected.reporter.isAnonymous ? "Anonymous Reporter" : selected.reporter.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-1">Contact Email</p>
                    <p className="text-ink font-mono text-sm">{selected.reporter.email}</p>
                  </div>
                  {selected.incident.location?.area && (
                    <div>
                      <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-1">Location</p>
                      <p className="text-ink">{selected.incident.location.area}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-1">Filed On</p>
                    <p className="text-ink">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Evidence Files */}
                {selected.incident.evidenceFiles && selected.incident.evidenceFiles.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">Evidence Files</p>
                      <div className="space-y-2">
                        {selected.incident.evidenceFiles.map((file, i) => {
                          const fileUrl = file.url.startsWith("http")
                            ? file.url
                            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}${file.url}`;
                          return (
                            <a
                              key={i}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-seal hover:underline bg-surface p-2 rounded border border-line"
                            >
                              <FileText size={16} />
                              <span className="truncate flex-1">{file.originalName || `Evidence ${i + 1}`}</span>
                              <span className="text-xs text-ink/40">({file.type.split("/")[1].toUpperCase()})</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="divider"></div>

                {/* Status Transition */}
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">Next Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {(NEXT_STATUS[selected.status] || []).map((next) => (
                      <button
                        key={next}
                        disabled={updating}
                        onClick={() => handleStatusChange(selected, next)}
                        className="btn btn-sm btn-primary"
                      >
                        {next === "under_review" && "Under Review"}
                        {next === "investigating" && "Investigating"}
                        {next === "resolved" && "Resolved"}
                        {next === "closed" && "Closed"}
                      </button>
                    ))}
                    {(NEXT_STATUS[selected.status] || []).length === 0 && (
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-xs text-gray-600">This report is in a final state. No further actions available.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* History */}
                {selected.statusHistory && selected.statusHistory.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-ink/50 mb-3">Status History</p>
                      <div className="timeline space-y-3">
                        {selected.statusHistory.map((entry, i) => (
                          <div key={i} className="timeline-item">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <StatusBadge status={entry.status} />
                                  <span className="text-xs font-mono text-ink/40">
                                    {new Date(entry.changedAt).toLocaleString()}
                                  </span>
                                </div>
                                {entry.note && (
                                  <p className="mt-2 text-sm text-ink/70 bg-surface p-2 rounded border border-line">
                                    {entry.note}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
