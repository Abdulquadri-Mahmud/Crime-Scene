"use client";

import { useState, FormEvent } from "react";
import { api, extractErrorMessage, TrackedReport } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { AlertCard } from "@/components/Card";
import { Search, ChevronLeft } from "lucide-react";

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
          <div className="case-tab" data-tab={report.trackingId}>
            <div className="space-y-8">
              {/* Header with Status */}
              <div className="flex items-start justify-between pb-6 border-b border-line">
                <div className="flex-1">
                  <p className="font-mono text-sm text-ink/50 mb-2">Tracking ID</p>
                  <h2 className="font-display text-2xl font-bold text-ink mb-3">{report.trackingId}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div>
                      <p className="text-xs text-ink/50 font-mono uppercase">Incident Type</p>
                      <p className="text-ink font-semibold">{report.incident.type}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/50 font-mono uppercase mb-2">Current Status</p>
                  <StatusBadge status={report.status} />
                </div>
              </div>

              {/* Report Info Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-2">Filed On</p>
                  <p className="text-ink font-semibold">{new Date(report.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-ink/60">{new Date(report.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-2">Incident Date</p>
                  <p className="text-ink font-semibold">
                    {new Date(report.incident.dateOfIncident).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-ink/60">
                    {new Date(report.incident.dateOfIncident).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink/50 font-mono uppercase tracking-widest mb-2">Days Since Report</p>
                  <p className="text-ink font-semibold">
                    {Math.floor((new Date().getTime() - new Date(report.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-sm text-ink/60">days ago</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="font-display text-lg font-semibold text-ink mb-6">Investigation Timeline</h3>
                
                <div className="timeline space-y-6">
                  {report.statusHistory.map((entry, i) => (
                    <div key={i} className="timeline-item">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusBadge status={entry.status} />
                            <span className="text-xs font-mono text-ink/40">
                              {new Date(entry.changedAt).toLocaleString()}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="mt-2 text-sm leading-relaxed text-ink/70 bg-surface p-3 rounded-lg border border-line">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Explanation */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 mb-3">📋 What do the statuses mean?</p>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li><strong>Received:</strong> Your report was successfully submitted</li>
                  <li><strong>Under Review:</strong> An officer is reviewing your report</li>
                  <li><strong>Investigating:</strong> Law enforcement is actively investigating</li>
                  <li><strong>Resolved:</strong> The case has been resolved</li>
                  <li><strong>Closed:</strong> The case has been closed</li>
                </ul>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-line">
                <button
                  onClick={() => setReport(null)}
                  className="btn btn-secondary flex-1"
                >
                  🔍 Track Another
                </button>
                <a href="/report/new" className="btn btn-primary flex-1">
                  📋 File New Report
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
