"use client";

import { useState, FormEvent } from "react";
import { api, extractErrorMessage } from "@/lib/api";
import { AlertCard } from "@/components/Card";
import {
  FileText, AlertTriangle, DollarSign, Home, Heart, User, Bomb,
  HelpCircle, CheckCircle, Search, Lock, Copy, Check, Phone,
  Clock, Mail, ShieldCheck,
} from "lucide-react";

const INCIDENT_TYPES = [
  "Theft", "Assault", "Burglary", "Vandalism", "Fraud",
  "Domestic Violence", "Kidnapping", "Cultism/Gang Activity", "Other",
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
  const [copied, setCopied] = useState(false);

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

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.trackingId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (result) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #F8F7F3 0%, #F0EDE5 50%, #EAE5D8 100%)" }}>

        {/* Decorative radial glows — brand gold */}
        <div className="pointer-events-none absolute inset-0">
          <div style={{
            position: "absolute", top: "5%", left: "50%", transform: "translateX(-50%)",
            width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,165,97,0.18) 0%, transparent 65%)",
          }} />
          <div style={{
            position: "absolute", bottom: "5%", right: "8%",
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(163,125,63,0.12) 0%, transparent 70%)",
          }} />
        </div>

        <div className="relative w-full max-w-lg">

          {/* ── Success Icon ── */}
          <div className="flex justify-center mb-8">
            <div style={{ position: "relative", width: 96, height: 96 }}>
              {/* Outer pulse ring — brand gold */}
              <div style={{
                position: "absolute", inset: -8, borderRadius: "50%",
                background: "rgba(201,165,97,0.2)",
                animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite",
              }} />
              <div style={{
                position: "absolute", inset: -4, borderRadius: "50%",
                background: "rgba(201,165,97,0.12)",
              }} />
              <div style={{
                width: 96, height: 96, borderRadius: "50%",
                background: "linear-gradient(135deg, #C9A561 0%, #A37D3F 100%)",
                boxShadow: "0 0 40px rgba(201,165,97,0.45)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CheckCircle size={48} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* ── Card ── */}
          <div style={{
            background: "#FFFFFF",
            border: "1px solid rgba(201,165,97,0.35)",
            borderRadius: 16,
            boxShadow: "0 8px 40px rgba(163,125,63,0.12), 0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}>

            {/* Top accent bar — brand gold */}
            <div style={{ height: 4, background: "linear-gradient(90deg, #C9A561, #A37D3F, #C9A561)" }} />

            <div style={{ padding: "2rem 2rem 2.5rem" }}>

              {/* Title */}
              <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 12px", borderRadius: 20,
                    background: "rgba(201,165,97,0.12)",
                    border: "1px solid rgba(201,165,97,0.4)",
                    color: "#A37D3F", fontSize: 11, fontWeight: 700,
                    letterSpacing: "0.1em", textTransform: "uppercase",
                    fontFamily: "JetBrains Mono, monospace",
                  }}>
                    <ShieldCheck size={12} /> Securely Logged
                  </span>
                </div>
                <h1 style={{
                  fontFamily: "'Source Serif 4', Georgia, serif",
                  fontSize: "1.75rem", fontWeight: 700, color: "#0F1B2D",
                  letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: "0.75rem",
                }}>
                  Report Successfully Submitted
                </h1>
                <p style={{ color: "rgba(15,27,45,0.6)", fontSize: "0.9rem", lineHeight: 1.65 }}>
                  Your crime report has been securely logged in our system. Save your
                  tracking ID below — you&apos;ll need it to check your report status.
                </p>
              </div>

              {/* ── Tracking ID Card ── */}
              <div style={{
                borderRadius: 12, padding: "1.5rem",
                background: "linear-gradient(135deg, rgba(201,165,97,0.08), rgba(163,125,63,0.12))",
                border: "1.5px solid rgba(201,165,97,0.4)",
                marginBottom: "1.5rem",
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle corner watermark */}
                <div style={{
                  position: "absolute", top: -20, right: -20,
                  width: 80, height: 80, borderRadius: "50%",
                  background: "rgba(201,165,97,0.06)",
                }} />

                <p style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase",
                  color: "#A37D3F", marginBottom: "0.75rem", fontWeight: 600,
                }}>
                  Your Tracking ID
                </p>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "2rem", fontWeight: 700, color: "#0F1B2D",
                    letterSpacing: "0.05em", userSelect: "all",
                  }}>
                    {result.trackingId}
                  </p>

                  {/* Copy button */}
                  <button
                    onClick={handleCopy}
                    title="Copy tracking ID"
                    style={{
                      flexShrink: 0,
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                      border: copied ? "1px solid #A37D3F" : "1px solid rgba(201,165,97,0.5)",
                      background: copied ? "#A37D3F" : "rgba(201,165,97,0.15)",
                      color: copied ? "#fff" : "#A37D3F",
                      fontSize: "0.8rem", fontWeight: 600, fontFamily: "Inter, sans-serif",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                <p style={{ marginTop: "0.75rem", fontSize: "0.78rem", color: "rgba(15,27,45,0.45)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Mail size={12} /> Save this ID and the email address used to file this report
                </p>
              </div>

              {/* ── What happens next — timeline ── */}
              <div style={{
                borderRadius: 10, padding: "1.25rem 1.25rem 0.75rem",
                background: "rgba(201,165,97,0.07)",
                border: "1px solid rgba(201,165,97,0.25)",
                marginBottom: "1.75rem",
              }}>
                <p style={{
                  fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "#A37D3F",
                  fontFamily: "JetBrains Mono, monospace", marginBottom: "1rem",
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <Clock size={13} /> What happens next
                </p>

                {[
                  { step: "01", text: "Your report is reviewed by officers within 24 hours", icon: <ShieldCheck size={14} /> },
                  { step: "02", text: "You'll receive email updates as your case progresses", icon: <Mail size={14} /> },
                  { step: "03", text: "Track your case status anytime using your tracking ID", icon: <Search size={14} /> },
                ].map(({ step, text, icon }, i) => (
                  <div key={step} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    paddingBottom: i < 2 ? "0.875rem" : 0,
                    marginBottom: i < 2 ? "0.875rem" : 0,
                    borderBottom: i < 2 ? "1px solid rgba(201,165,97,0.15)" : "none",
                  }}>
                    <div style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: "50%",
                      background: "rgba(201,165,97,0.15)", border: "1px solid rgba(201,165,97,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#A37D3F",
                    }}>
                      {icon}
                    </div>
                    <div>
                      <span style={{
                        fontFamily: "JetBrains Mono, monospace", fontSize: 9,
                        color: "#C9A561", letterSpacing: "0.1em", fontWeight: 600,
                      }}>STEP {step}</span>
                      <p style={{ color: "rgba(15,27,45,0.7)", fontSize: "0.84rem", lineHeight: 1.5, marginTop: 2 }}>
                        {text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Action Buttons ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <a
                  href="/report/track"
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 24px", borderRadius: 10, textDecoration: "none",
                    background: "linear-gradient(135deg, #C9A561 0%, #A37D3F 100%)",
                    color: "#fff", fontWeight: 700, fontSize: "0.95rem",
                    boxShadow: "0 4px 20px rgba(201,165,97,0.35)",
                    transition: "all 0.2s ease",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  <Search size={18} /> Track This Report
                </a>

                <button
                  onClick={() => { setResult(null); setCopied(false); }}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 24px", borderRadius: 10, cursor: "pointer",
                    background: "transparent",
                    border: "1.5px solid rgba(15,27,45,0.2)",
                    color: "rgba(15,27,45,0.65)", fontWeight: 600, fontSize: "0.95rem",
                    transition: "all 0.2s ease",
                    fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "#C9A561";
                    e.currentTarget.style.color = "#A37D3F";
                    e.currentTarget.style.background = "rgba(201,165,97,0.08)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(15,27,45,0.2)";
                    e.currentTarget.style.color = "rgba(15,27,45,0.65)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <FileText size={18} /> File Another Report
                </button>
              </div>

              {/* ── Emergency footer ── */}
              <div style={{
                marginTop: "1.75rem", paddingTop: "1.25rem",
                borderTop: "1px solid rgba(201,165,97,0.2)",
                textAlign: "center",
              }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 20,
                  background: "rgba(220,38,38,0.07)",
                  border: "1px solid rgba(220,38,38,0.2)",
                }}>
                  <Phone size={13} color="#DC2626" />
                  <span style={{ color: "#DC2626", fontSize: "0.78rem", fontWeight: 600 }}>
                    Need immediate help?&nbsp;
                  </span>
                  <span style={{ color: "rgba(15,27,45,0.5)", fontSize: "0.78rem" }}>
                    Contact your local police emergency line.
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Ping animation keyframes */}
        <style>{`
          @keyframes ping {
            75%, 100% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>
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
