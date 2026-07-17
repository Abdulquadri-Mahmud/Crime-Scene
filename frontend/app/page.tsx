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
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-seal rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-progress rounded-full blur-3xl"></div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-16 md:grid-cols-[1.4fr_1fr] md:items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="badge badge-primary flex items-center gap-2">
                    <Shield size={18} /> Community Crime Reporting System
                  </span>
                </div>
                <h1 className="text-headline text-ink">
                  Report Crime. <br />
                  <span className="bg-gradient-to-r from-seal to-sealDark bg-clip-text text-transparent">
                    Track Justice.
                  </span>
                </h1>
                <p className="text-lg leading-relaxed text-ink/70 max-w-lg">
                  A secure platform for community members to report incidents anonymously, track their cases in real-time, and help law enforcement keep our neighborhoods safe.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/report/new" className="btn btn-primary btn-lg inline-flex items-center gap-2 justify-center">
                  <FileText size={20} /> File a Report
                </Link>
                <Link href="/report/track" className="btn btn-secondary btn-lg inline-flex items-center gap-2 justify-center">
                  <Search size={20} /> Track a Report
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-line flex items-center gap-8 text-sm">
                <div>
                  <p className="font-semibold text-ink">Secure</p>
                  <p className="text-ink/60">End-to-end encrypted</p>
                </div>
                <div>
                  <p className="font-semibold text-ink">Anonymous</p>
                  <p className="text-ink/60">Optional reporting</p>
                </div>
                <div>
                  <p className="font-semibold text-ink">24/7</p>
                  <p className="text-ink/60">Always available</p>
                </div>
              </div>
            </div>

            {/* Right - Case File Preview */}
            <div className="hidden md:block">
              <div className="case-tab" data-tab="Preview Case CR-2026-001547">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-mono text-ink/50">Case Tracking ID</p>
                      <p className="font-display text-xl font-bold text-ink mt-1">CR-2026-001547</p>
                    </div>
                    <span className="badge badge-info">Investigating</span>
                  </div>

                  <div className="divider"></div>

                  <div className="grid gap-4">
                    <div>
                      <p className="text-xs text-ink/50 font-mono uppercase">Incident Type</p>
                      <p className="text-ink font-semibold mt-1">Theft</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50 font-mono uppercase">Location</p>
                      <p className="text-ink">Saapade Community Market, Ogun State</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50 font-mono uppercase">Date Filed</p>
                      <p className="text-ink">Jan 15, 2026 • 2:34 PM</p>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="timeline space-y-3">
                    <div className="timeline-item">
                      <p className="font-semibold text-sm text-ink">Report Received</p>
                      <p className="text-xs text-ink/60 mt-1">Jan 15, 2:35 PM</p>
                    </div>
                    <div className="timeline-item">
                      <p className="font-semibold text-sm text-ink">Under Review</p>
                      <p className="text-xs text-ink/60 mt-1">Jan 16, 10:15 AM</p>
                    </div>
                    <div className="timeline-item">
                      <p className="font-semibold text-sm text-ink">Investigating</p>
                      <p className="text-xs text-ink/60 mt-1">Jan 17, 3:45 PM</p>
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
            </div>
          ))}
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
