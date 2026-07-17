"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuthToken, extractErrorMessage, AdminReport } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { AlertCard, StatCard } from "@/components/Card";
import { Lock, BarChart3, Download, FileText, Search, CheckCircle2, LogOut, Mail, Loader2, ChevronLeft, Calendar, Clock, MapPin, User, Eye, Paperclip } from "lucide-react";

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

  const [modalOpen, setModalOpen] = useState(false);
  const [modalNextStatus, setModalNextStatus] = useState<string | null>(null);
  const [modalNote, setModalNote] = useState("");

  function handleStatusChange(report: AdminReport, nextStatus: string) {
    setModalNextStatus(nextStatus);
    setModalNote("");
    setModalOpen(true);
  }

  async function confirmStatusChange() {
    if (!selected || !modalNextStatus) return;
    setUpdating(true);
    setError(null);
    try {
      const res = await api.patch(`/api/admin/reports/${selected._id}/status`, {
        status: modalNextStatus,
        note: modalNote.trim() || undefined,
      });
      setSelected(res.data.report);
      await loadReports();
      setModalOpen(false);
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
            <div className="case-tab overflow-hidden shadow-lg border border-line" data-tab={selected.trackingId}>
              {/* Top gold accent line */}
              <div style={{ height: 4, background: "linear-gradient(90deg, #C9A561, #A37D3F, #C9A561)" }} />

              <div className="p-6 md:p-8 space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-line gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C9A561]/10 border border-[#C9A561]/30 text-[#A37D3F] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                      Active Investigation
                    </span>
                    <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight">
                      {selected.incident.type}
                    </h2>
                    <p className="font-mono text-xs text-ink/40 uppercase tracking-widest mt-1.5">
                      ID: {selected.trackingId}
                    </p>
                  </div>
                  <div>
                    <StatusBadge status={selected.status} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-display text-sm font-bold text-ink mb-2">Incident Description</h3>
                  <div className="p-4 rounded-xl border border-line bg-[#F8F7F3] text-sm text-ink/80 leading-relaxed whitespace-pre-wrap shadow-inner">
                    {selected.incident.description}
                  </div>
                </div>

                <div className="divider"></div>

                {/* Details Grid */}
                <div>
                  <h3 className="font-display text-sm font-bold text-ink mb-4">Metadata & Contact Info</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Reporter */}
                    <div className="p-3 rounded-lg border border-line bg-[#F8F7F3] flex items-center gap-3">
                      <div className="p-2 rounded bg-[#C9A561]/10 text-[#A37D3F]">
                        <User size={16} />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-ink/40">Reporter</p>
                        <p className="text-ink font-semibold text-sm">
                          {selected.reporter.isAnonymous ? "Anonymous Citizen" : selected.reporter.name}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="p-3 rounded-lg border border-line bg-[#F8F7F3] flex items-center gap-3">
                      <div className="p-2 rounded bg-[#C9A561]/10 text-[#A37D3F]">
                        <Mail size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[9px] uppercase tracking-wider text-ink/40">Contact Email</p>
                        <p className="text-ink font-mono text-sm truncate">{selected.reporter.email}</p>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="p-3 rounded-lg border border-line bg-[#F8F7F3] flex items-center gap-3">
                      <div className="p-2 rounded bg-[#C9A561]/10 text-[#A37D3F]">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-ink/40">Location</p>
                        <p className="text-ink text-sm">
                          {selected.incident.location?.area || "Unspecified Area"}
                        </p>
                      </div>
                    </div>

                    {/* Filed On */}
                    <div className="p-3 rounded-lg border border-line bg-[#F8F7F3] flex items-center gap-3">
                      <div className="p-2 rounded bg-[#C9A561]/10 text-[#A37D3F]">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-wider text-ink/40">Filed On</p>
                        <p className="text-ink text-sm">
                          {new Date(selected.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence Files */}
                {selected.incident.evidenceFiles && selected.incident.evidenceFiles.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Paperclip size={16} className="text-[#A37D3F]" />
                        <h3 className="font-display text-sm font-bold text-ink">Evidence Attachments</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {selected.incident.evidenceFiles.map((file, i) => {
                          const fileUrl = file.url.startsWith("http")
                            ? file.url
                            : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"}${file.url}`;
                          const isImage = file.type.startsWith("image/");

                          if (isImage) {
                            return (
                              <div key={i} className="group relative overflow-hidden rounded-xl border border-line bg-surface hover:border-[#C9A561]/60 transition-all shadow-sm">
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="block">
                                  <div className="relative h-40 bg-black/5 flex items-center justify-center overflow-hidden">
                                    {/* Image with simple zoom effect */}
                                    <img
                                      src={fileUrl}
                                      alt={file.originalName || "Evidence Image"}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {/* Glassmorphism tag overlay */}
                                    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1">
                                      <Eye size={10} /> View Full
                                    </div>
                                  </div>
                                  <div className="p-3 bg-white border-t border-line flex items-center justify-between text-xs">
                                    <span className="font-semibold text-ink truncate max-w-[75%]" title={file.originalName}>
                                      {file.originalName || `Evidence Image ${i + 1}`}
                                    </span>
                                    <span className="text-[10px] text-ink/40 font-mono uppercase">
                                      {file.type.split("/")[1].toUpperCase()}
                                    </span>
                                  </div>
                                </a>
                              </div>
                            );
                          }

                          // Non-image fallback (e.g. PDF)
                          return (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-line bg-[#F8F7F3] hover:border-[#C9A561]/60 transition-all shadow-sm">
                              <div className="p-2.5 rounded-lg bg-red-50 text-red-600 shrink-0">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-ink truncate" title={file.originalName}>
                                  {file.originalName || `Document Attachment ${i + 1}`}
                                </p>
                                <p className="text-[9px] text-ink/40 font-mono uppercase tracking-widest mt-0.5">
                                  {file.type.split("/")[1].toUpperCase() || "FILE"}
                                </p>
                              </div>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm inline-flex items-center gap-1.5 py-1.5 px-3">
                                <Eye size={12} /> Open
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="divider"></div>

                {/* Status Transition */}
                <div>
                  <h3 className="font-display text-sm font-bold text-ink mb-3">Advance Status Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {(NEXT_STATUS[selected.status] || []).map((next) => (
                      <button
                        key={next}
                        disabled={updating}
                        onClick={() => handleStatusChange(selected, next)}
                        className="btn btn-sm btn-primary inline-flex items-center gap-1.5 shadow-sm"
                      >
                        Change to {next === "under_review" && "Under Review"}
                        {next === "investigating" && "Investigating"}
                        {next === "resolved" && "Resolved"}
                        {next === "closed" && "Closed"}
                      </button>
                    ))}
                    {(NEXT_STATUS[selected.status] || []).length === 0 && (
                      <div className="w-full bg-[#F8F7F3] border border-[#E5E2DB] rounded-lg p-3">
                        <p className="text-xs text-ink/50 italic">Case status is in a final, locked state. No further status changes are allowed.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* History */}
                {selected.statusHistory && selected.statusHistory.length > 0 && (
                  <>
                    <div className="divider"></div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-ink mb-6">Status Log & Updates</h3>
                      <div className="timeline space-y-6">
                        {selected.statusHistory.map((entry, i) => (
                          <div key={i} className="timeline-item pb-1">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 flex-wrap">
                                  <StatusBadge status={entry.status} />
                                  <span className="text-xs font-mono text-ink/40">
                                    {new Date(entry.changedAt).toLocaleString(undefined, {
                                      dateStyle: 'medium',
                                      timeStyle: 'short'
                                    })}
                                  </span>
                                </div>
                                {entry.note ? (
                                  <div className="mt-3 text-sm leading-relaxed text-ink/70 bg-[#F8F7F3] p-4 rounded-xl border border-line shadow-sm relative">
                                    <div className="hidden md:block absolute -left-1.5 top-4 w-3 h-3 bg-[#F8F7F3] border-l border-b border-line rotate-45" />
                                    {entry.note}
                                  </div>
                                ) : (
                                  <p className="text-xs text-ink/40 italic mt-2">No official update note attached</p>
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

      {/* Custom Status Update Modal */}
      {modalOpen && modalNextStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="bg-white rounded-xl border border-line shadow-2xl max-w-md w-full overflow-hidden">
            {/* Top gold bar */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #C9A561, #A37D3F, #C9A561)" }} />
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#A37D3F]">
                <FileText size={18} />
                <span className="font-mono text-xs font-semibold uppercase tracking-wider">
                  Update Case Status
                </span>
              </div>
              
              <div>
                <h3 className="font-display text-xl font-bold text-ink">
                  Move to &quot;{modalNextStatus === "under_review" ? "Under Review" : modalNextStatus.replace(/_/g, " ").split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}&quot;
                </h3>
                <p className="text-xs text-[#0F1B2D]/60 mt-1">
                  You are changing this report's classification. Please log any official internal notes below.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F1B2D] mb-1.5">
                  Add a note for moving this report to &quot;{modalNextStatus === "under_review" ? "under_review" : modalNextStatus}&quot; (optional):
                </label>
                <textarea
                  value={modalNote}
                  onChange={(e) => setModalNote(e.target.value)}
                  rows={4}
                  placeholder="Provide investigation details or instructions for other officers..."
                  className="w-full px-3 py-2 border border-[#E5E2DB] rounded-lg bg-[#F8F7F3] focus:border-[#C9A561] focus:bg-white focus:ring-4 focus:ring-[#C9A561]/20 transition-all text-sm resize-none"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={updating}
                  className="btn btn-secondary py-2 px-4"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmStatusChange}
                  disabled={updating}
                  className="btn btn-primary py-2 px-4 inline-flex items-center gap-1.5"
                >
                  {updating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Confirm Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
