"use client";

import { useState, FormEvent } from "react";
import { api, extractErrorMessage, TrackedReport } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { AlertCard } from "@/components/Card";
import { Search, ChevronLeft, Calendar, Clock, Activity, FileText, Info, HelpCircle, ArrowLeft, Plus } from "lucide-react";

export default function TrackReportPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<TrackedReport | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setReport(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const trackingId = String(form.get("trackingId") || "").trim();
    const contact = String(form.get("contact") || "").trim();

    try {
      const res = await api.get("/api/reports/track", { params: { trackingId, contact } });
      setReport(res.data.report);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-paper to-surface">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-4">
            <span className="badge badge-primary flex items-center gap-2">
              <Search size={18} /> Case Lookup
            </span>
          </div>
          <h1 className="text-headline text-ink">Track Your Report</h1>
          <p className="mt-4 text-lg text-ink/70 leading-relaxed">
            Check the status of your crime report. Enter your tracking ID and the contact information 
            you used when filing the report. This keeps your report secure and private.
          </p>
        </div>

        {/* Search Form */}
        <div className="card mb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Tracking ID <span className="text-alert">*</span>
                </label>
                <input
                  name="trackingId"
                  required
                  placeholder="CR-2026-000482"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper font-mono focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Email or Phone <span className="text-alert">*</span>
                </label>
                <input
                  name="contact"
                  required
                  placeholder="your@email.com or +234XXXXXXXXXX"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary btn-lg"
            >
              {loading ? "🔍 Looking up..." : "🔍 Find Report"}
            </button>
          </form>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8">
            <AlertCard
              type="error"
              title="Report Not Found"
              message={error}
            />
          </div>
        )}

        {/* Report Details */}
        {report && (
          <div className="case-tab overflow-hidden shadow-lg border border-line" data-tab={report.trackingId}>
            {/* Top gold accent line */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #C9A561, #A37D3F, #C9A561)" }} />

            <div className="p-6 md:p-8 space-y-8">
              {/* Header with Status */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-line gap-4">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#C9A561]/10 border border-[#C9A561]/30 text-[#A37D3F] text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                    Case File
                  </span>
                  <h2 className="font-display text-3xl font-extrabold text-ink tracking-tight mb-1">
                    {report.trackingId}
                  </h2>
                  <p className="text-sm text-ink/60">
                    Incident Type: <strong className="text-ink font-semibold">{report.incident.type}</strong>
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <span className="font-mono text-xs text-ink/40 uppercase tracking-widest mb-1.5">
                    Current Status
                  </span>
                  <StatusBadge status={report.status} />
                </div>
              </div>

              {/* Report Info Grid */}
              <div className="grid gap-4 md:grid-cols-3">
                {/* Filed On Card */}
                <div className="p-4 rounded-xl border border-line bg-[#F8F7F3] hover:border-[#C9A561]/50 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#C9A561]/10 text-[#A37D3F] shrink-0">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40 mb-1">Filed On</p>
                    <p className="text-ink font-bold text-sm">
                      {new Date(report.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {new Date(report.createdAt).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Incident Date Card */}
                <div className="p-4 rounded-xl border border-line bg-[#F8F7F3] hover:border-[#C9A561]/50 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#C9A561]/10 text-[#A37D3F] shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40 mb-1">Incident Date</p>
                    <p className="text-ink font-bold text-sm">
                      {new Date(report.incident.dateOfIncident).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      {new Date(report.incident.dateOfIncident).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Days Elapsed Card */}
                <div className="p-4 rounded-xl border border-line bg-[#F8F7F3] hover:border-[#C9A561]/50 transition-all flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#C9A561]/10 text-[#A37D3F] shrink-0">
                    <Activity size={18} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-ink/40 mb-1">Duration</p>
                    <p className="text-ink font-bold text-sm">
                      {Math.max(0, Math.floor((new Date().getTime() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24)))} Days Elapsed
                    </p>
                    <p className="text-xs text-ink/50 mt-0.5">
                      Since initial submission
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={18} className="text-[#A37D3F]" />
                  <h3 className="font-display text-lg font-bold text-ink tracking-tight">
                    Investigation Timeline
                  </h3>
                </div>
                
                <div className="timeline space-y-8">
                  {report.statusHistory.map((entry, i) => (
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
                              {/* Speech bubble pointer */}
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

              {/* Status Explanation */}
              <div className="bg-[#F8F7F3] border border-[#E5E2DB] rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-[#A37D3F]" />
                  <p className="font-display font-bold text-ink text-sm">
                    Status Reference Guide
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 text-xs text-ink/70">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <p><strong>Received:</strong> The incident report has been securely registered in the digital queue.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                    <p><strong>Under Review:</strong> Assignment officer is verifying the information and evidence files.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                    <p><strong>Investigating:</strong> Case is officially assigned to an officer for active investigation.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                    <p><strong>Resolved:</strong> Actions completed. Appropriate results are logged in database.</p>
                  </div>
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-500 mt-1.5 shrink-0" />
                    <p><strong>Closed:</strong> No further activity required. Archive record completed.</p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-line">
                <button
                  onClick={() => setReport(null)}
                  className="btn btn-secondary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Track Another
                </button>
                <a
                  href="/report/new"
                  className="btn btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> File New Report
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Info Box when no report shown */}
        {!report && !error && (
          <div className="card text-center py-12">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">Track Your Case</h3>
            <p className="text-ink/70">
              Use the search form above to find your report. You'll need your tracking ID 
              and the email/phone used when filing.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
