"use client";

import Link from "next/link";
import { StatCard } from "@/components/Card";
import { FileText, Search, Barcode, BarChart3, Lock, Shield, Clock, MapPin, ClipboardList, GraduationCap } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "File a Report",
    description: "Describe the incident with detailed information, attach evidence photos/documents. Optional anonymous submission.",
  },
  {
    icon: Barcode,
    title: "Unique Tracking ID",
    description: "Receive a unique case number (e.g., CR-2026-000482). Use this to check your report status anytime.",
  },
  {
    icon: BarChart3,
    title: "Real-time Updates",
    description: "Track your case status through every step: Received → Review → Investigation → Resolution.",
  },
  {
    icon: Lock,
    title: "Secure & Private",
    description: "Your report is encrypted and accessible only with your tracking ID and contact verification.",
  },
  {
    icon: Shield,
    title: "Professional Review",
    description: "Law enforcement officers review and manage cases through a dedicated secure dashboard.",
  },
  {
    icon: ClipboardList,
    title: "Complete History",
    description: "Every status change is logged with timestamps and notes for full audit trails.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Submit Your Report",
    body: "Fill out the incident form with detailed information about what happened, when, and where. Attach photos or evidence if available.",
  },
  {
    step: "2",
    title: "Get Tracking ID",
    body: "The system assigns a unique tracking ID instantly. Save this - it's your access key to monitor your report.",
  },
  {
    step: "3",
    title: "Follow Progress",
    body: "Check back anytime using your tracking ID to see the investigation status and any updates from officers.",
  },
];

const STATS = [
  { label: "Reports Processed", value: "2,847", icon: BarChart3 },
  { label: "Average Resolution", value: "14 days", icon: Clock },
  { label: "Community Coverage", value: "15 areas", icon: MapPin },
];

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-paper via-paper to-surface">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-40">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-seal rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-progress rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-16 lg:grid-cols-[1.35fr_1fr] lg:items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3 rounded-full border border-seal/20 bg-seal/5 px-5 py-2 text-sm font-medium text-seal shadow-sm shadow-seal/10">
                <Shield size={18} />
                <span>Secure community reporting with real-time tracking and privacy-first protection.</span>
              </div>

              <div className="space-y-5">
                <h1 className="text-headline text-ink tracking-tight sm:text-[3.5rem]">
                  Report crime safely, <br />
                  <span className="bg-gradient-to-r from-seal to-sealDark bg-clip-text text-transparent">
                    track justice faster.
                  </span>
                </h1>
                <p className="max-w-3xl text-lg leading-relaxed text-ink/75">
                  A trusted platform for community members to submit incidents confidentially, receive a unique tracking ID, and follow every update until resolution.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/report/new" className="btn btn-primary btn-lg inline-flex items-center gap-2 justify-center">
                  <FileText size={20} /> File a Report
                </Link>
                <Link href="/report/track" className="btn btn-secondary btn-lg inline-flex items-center gap-2 justify-center">
                  <Search size={20} /> Track a Report
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-line bg-paper/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Secure</p>
                  <p className="mt-3 font-semibold text-ink">Encrypted reports & case notes</p>
                </div>
                <div className="rounded-3xl border border-line bg-paper/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Instant</p>
                  <p className="mt-3 font-semibold text-ink">Unique tracking ID delivered instantly</p>
                </div>
                <div className="rounded-3xl border border-line bg-paper/90 p-5 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-ink/50">Transparent</p>
                  <p className="mt-3 font-semibold text-ink">Status updates at every stage</p>
                </div>
              </div>
            </div>

            {/* Right - Case File Preview */}
            <div className="relative">
              <div className="absolute -inset-x-6 top-4 hidden h-72 rounded-[2rem] bg-gradient-to-b from-seal/20 to-transparent blur-3xl lg:block"></div>
              <div className="relative overflow-hidden rounded-[2rem] border border-line bg-surface/95 p-6 shadow-2xl shadow-ink/10 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-4 rounded-3xl bg-paper/90 p-5 shadow-sm">
                  <div>
                    <p className="text-sm font-mono text-ink/50">Live Case Preview</p>
                    <p className="font-display text-xl font-bold text-ink mt-1">CR-2026-001547</p>
                  </div>
                  <span className="badge badge-info">Investigating</span>
                </div>

                <div className="mt-6 rounded-3xl border border-line bg-paper/90 p-5 shadow-sm">
                  <div className="grid gap-4">
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-[0.2em]">Incident Type</p>
                      <p className="mt-2 text-ink font-semibold">Theft</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-[0.2em]">Location</p>
                      <p className="mt-2 text-ink">Saapade Community Market, Ogun State</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50 uppercase tracking-[0.2em]">Date Filed</p>
                      <p className="mt-2 text-ink">Jan 15, 2026 • 2:34 PM</p>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="space-y-4">
                    <div className="rounded-3xl bg-emerald-50/90 p-4 text-ink">
                      <p className="text-sm font-semibold">Current status</p>
                      <p className="mt-1 text-xs text-ink/60">The case is actively under investigation by our local review team.</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-ink/60">
                        <span>Report Received</span>
                        <span>Jan 15</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-ink/60">
                        <span>Under Review</span>
                        <span>Jan 16</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-ink/60">
                        <span>Investigating</span>
                        <span>Jan 17</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <StatCard
                key={idx}
                label={stat.label}
                value={stat.value}
                icon={<Icon size={48} />}
                color={idx === 0 ? "primary" : idx === 1 ? "info" : "success"}
              />
            );
          })}
        </div>
      </section>

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 space-y-4">
          <h2 className="text-subheadline">Why Choose Our System?</h2>
          <p className="text-lg text-ink/70 max-w-2xl">
            Designed for communities, built for law enforcement, powered by modern technology.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="card group hover:shadow-lg">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform text-seal opacity-80">
                  <Icon size={40} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-ink/70">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-16 space-y-4">
          <h2 className="text-subheadline">How It Works in 3 Steps</h2>
          <p className="text-lg text-ink/70 max-w-2xl">
            Simple, secure, and straightforward process from report to resolution.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {HOW_IT_WORKS.map((item, idx) => (
            <div key={idx} className="relative">
              {idx < HOW_IT_WORKS.length - 1 && (
                <div className="hidden md:block absolute top-12 -right-4 text-3xl text-seal/30">→</div>
              )}
              <div className="card h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-seal to-sealDark text-white font-semibold">
                    {item.step}
                  </div>
                  <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                </div>
                <p className="text-sm leading-relaxed text-ink/70">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section for Officers */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="card elevated bg-gradient-to-r from-dark to-ink text-paper border-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="font-display text-2xl font-bold text-paper">For Law Enforcement Officers</h2>
              <p className="mt-3 text-paper/80 leading-relaxed">
                Access the secure officer dashboard to review incoming reports, manage cases, update status, and collaborate with your team.
              </p>
            </div>
            <Link href="/admin/login" className="btn btn-secondary whitespace-nowrap inline-flex items-center gap-2">
              <Lock size={20} /> Officer Access
            </Link>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16 text-center border-t border-line">
        <h2 className="font-display text-xl font-semibold text-ink">Ready to Report?</h2>
        <p className="mt-2 text-ink/70 mb-6">Start with a few simple details about the incident.</p>
        <Link href="/report/new" className="btn btn-primary btn-lg inline-block">
          File a Report Now
        </Link>
      </section>
    </main>
  );
}
