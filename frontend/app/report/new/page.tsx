"use client";

import { useState, FormEvent } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { AlertCard } from "@/components/Card";
import { FileText, AlertTriangle, DollarSign, Home, Heart, User, Bomb, HelpCircle, CheckCircle, Search, Lock } from "lucide-react";

const INCIDENT_TYPES = [
  "Theft",
  "Assault",
  "Burglary",
  "Vandalism",
  "Fraud",
  "Domestic Violence",
  "Kidnapping",
  "Cultism/Gang Activity",
  "Other",
];

const INCIDENT_ICONS: Record<string, React.ReactNode> = {
  "Theft": <AlertTriangle size={18} />,
  "Assault": <AlertTriangle size={18} />,
  "Burglary": <Home size={18} />,
  "Vandalism": <AlertTriangle size={18} />,
  "Fraud": <DollarSign size={18} />,
  "Domestic Violence": <Heart size={18} />,
  "Kidnapping": <User size={18} />,
  "Cultism/Gang Activity": <Bomb size={18} />,
  "Other": <HelpCircle size={18} />,
};

export default function NewReportPage() {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ trackingId: string } | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    data.set("isAnonymous", String(isAnonymous));
    if (files) {
      Array.from(files).forEach((file) => data.append("evidence", file));
    }

    try {
      const res = await api.post("/api/reports", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ trackingId: res.data.trackingId });
      form.reset();
      setFiles(null);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-paper to-surface flex items-center">
        <div className="mx-auto max-w-2xl w-full px-6 py-8">
          <div className="case-tab" data-tab="Confirmation">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle size={48} className="text-success" />
                </div>
              </div>

              <div>
                <h1 className="text-headline text-ink">Report Successfully Submitted</h1>
                <p className="mt-4 text-lg text-ink/70 leading-relaxed">
                  Your crime report has been securely logged in our system. Save your tracking ID below — you'll need it to check your report status.
                </p>
              </div>

              <div className="bg-gradient-to-r from-seal/10 to-sealDark/10 border-2 border-seal rounded-lg p-6 space-y-2">
                <p className="font-mono text-xs uppercase tracking-widest text-seal">Your Tracking ID</p>
                <p className="font-display text-3xl font-bold text-ink select-all">{result.trackingId}</p>
                <p className="text-sm text-ink/60">Save this ID and the email used to file this report</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
                <p className="font-semibold text-blue-900">ℹ️ What happens next?</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Your report will be reviewed by officers within 24 hours</li>
                  <li>You'll receive email updates as your case progresses</li>
                  <li>Track your case status anytime using your tracking ID</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a href="/report/track" className="btn btn-primary btn-lg flex-1 inline-flex items-center justify-center gap-2">
                  <Search size={20} /> Track This Report
                </a>
                <button
                  onClick={() => setResult(null)}
                  className="btn btn-secondary btn-lg flex-1 inline-flex items-center justify-center gap-2"
                >
                  <FileText size={20} /> File Another Report
                </button>
              </div>

              <div className="pt-6 border-t border-line text-center text-sm text-ink/60">
                <p>Need immediate help? Contact your local police emergency line.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-paper to-surface">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-4">
            <span className="badge badge-primary flex items-center gap-2">
              <FileText size={18} /> File an Incident Report
            </span>
          </div>
          <h1 className="text-headline text-ink">Report a Crime Incident</h1>
          <p className="mt-4 text-lg text-ink/70 leading-relaxed">
            Help us protect your community. Provide detailed information about the incident. 
            All information is confidential and will be reviewed by law enforcement officers.
          </p>
        </div>

        {/* Emergency Alert */}
        <div className="mb-8">
          <AlertCard
            type="error"
            title="Emergency Alert"
            message="If anyone is in immediate danger or a crime is actively occurring, call your local emergency line immediately instead of using this form."
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Reporter Details */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-seal/20 text-seal font-semibold text-sm">
                1
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Your Contact Information</h2>
            </div>

            {/* Anonymous Checkbox */}
            <div className="mb-6 p-4 bg-surface rounded-lg border border-line">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-5 h-5 rounded border-line cursor-pointer"
                />
                <span className="text-sm font-medium text-ink">
                  📋 Report anonymously (your name will not be stored)
                </span>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {!isAnonymous && (
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">Full Name</label>
                  <input
                    name="reporterName"
                    placeholder="John Doe"
                    className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Contact Email <span className="text-alert">*</span>
                </label>
                <input
                  name="reporterEmail"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
                <p className="mt-2 text-xs text-ink/60">
                  🔒 Used only for status updates and to verify your identity when tracking
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Phone (Optional)</label>
                <input
                  name="reporterPhone"
                  placeholder="+234 (0) 123 456 7890"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Incident Details */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-progress/20 text-progress font-semibold text-sm">
                2
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Incident Information</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Type of Incident <span className="text-alert">*</span>
                </label>
                <select
                  name="incidentType"
                  required
                  defaultValue=""
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                >
                  <option value="" disabled>
                    Select incident type
                  </option>
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Date & Time of Incident <span className="text-alert">*</span>
                </label>
                <input
                  name="dateOfIncident"
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-2">
                Description <span className="text-alert">*</span>
              </label>
              <textarea
                name="description"
                required
                minLength={20}
                maxLength={5000}
                rows={6}
                placeholder="Provide detailed information about what happened. Include:
• What you witnessed or experienced
• Who was involved (descriptions, if known)
• How the incident unfolded
• Any other relevant details"
                className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all resize-none"
              />
              <p className="mt-2 text-xs text-ink/60">Minimum 20 characters required</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Street / Address (Optional)</label>
                <input
                  name="address"
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Area / Location (Optional)</label>
                <input
                  name="area"
                  placeholder="Saapade, Ogun State"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Evidence */}
          <div className="card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-success font-semibold text-sm">
                3
              </div>
              <h2 className="font-display text-lg font-semibold text-ink">Evidence (Optional)</h2>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-ink/70">
                📸 Attach photos or documents that support your report. This helps officers investigate more effectively.
              </p>
              <div className="relative border-2 border-dashed border-line rounded-lg p-6 bg-surface hover:bg-paper transition-colors cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="text-center">
                  <span className="text-3xl mb-2 block">📁</span>
                  <p className="font-semibold text-ink">Click to upload or drag & drop</p>
                  <p className="text-sm text-ink/60 mt-1">
                    JPG, PNG, WebP, or PDF (max 5MB each, up to 3 files)
                  </p>
                </div>
              </div>
              {files && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-ink">Selected files:</p>
                  <ul className="space-y-1">
                    {Array.from(files).map((file, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-ink/70">
                        <span>📄</span> {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <AlertCard
              type="error"
              title="Submission Error"
              message={error}
            />
          )}

          {/* Submit Button */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn btn-primary btn-lg"
            >
              {submitting ? "⏳ Submitting Report..." : "✓ Submit Report"}
            </button>
            <p className="text-center text-sm text-ink/60">
              Your report will be reviewed by law enforcement officers. You can track progress using your tracking ID.
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
