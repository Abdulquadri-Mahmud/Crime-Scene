"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuthToken, extractErrorMessage } from "@/lib/api";
import { AlertCard } from "@/components/Card";
import { Sparkles, ArrowLeft, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await api.post("/api/auth/register", {
        fullName: form.get("fullName"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password"),
      });
      sessionStorage.setItem("accessToken", res.data.accessToken);
      sessionStorage.setItem("refreshToken", res.data.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));
      setAuthToken(res.data.accessToken);
      router.push("/report/track");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-paper to-surface flex items-center">
      <div className="w-full">
        <div className="mx-auto max-w-md px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 justify-center mb-8">
            <div className="flex h-12 w-12 items-center justify-center bg-gradient-to-br from-seal to-sealDark rounded-lg shadow-md">
              <span className="font-display text-white font-bold text-xl">CR</span>
            </div>
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="badge badge-primary flex items-center gap-2"><Sparkles size={18} /> Join Community</span>
            </div>
            <h1 className="text-headline text-ink">Create Account</h1>
            <p className="mt-4 text-base text-ink/70">
              Build a community account to organize and track all your incident reports in one place.
            </p>
          </div>

          {/* Registration Card */}
          <div className="card mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Full Name</label>
                <input
                  name="fullName"
                  required
                  minLength={2}
                  placeholder="John Doe"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Phone (Optional)</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+234 (0) 123 456 7890"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
                <p className="mt-2 text-xs text-ink/60">Minimum 6 characters</p>
              </div>

              {error && (
                <AlertCard
                  type="error"
                  title="Registration Failed"
                  message={error}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg mt-6"
              >
                {loading ? "🔄 Creating Account..." : "✓ Create Account"}
              </button>
            </form>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="text-center">
              <span className="text-2xl mb-2 block">📋</span>
              <p className="text-ink/60">Track all reports</p>
            </div>
            <div className="text-center">
              <span className="text-2xl mb-2 block">🔔</span>
              <p className="text-ink/60">Get notifications</p>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-ink/60">
              Already have an account?{" "}
              <Link href="/login" className="text-seal font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Privacy Note */}
          <div className="text-center mt-6 pt-6 border-t border-line">
            <p className="text-xs text-ink/50">
              Your information is secure and will never be shared with unauthorized parties.
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
