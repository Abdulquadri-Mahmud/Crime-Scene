"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuthToken, extractErrorMessage } from "@/lib/api";
import { AlertCard } from "@/components/Card";
import { Lock, Unlock, ArrowLeft, Info, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");

    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { accessToken, refreshToken, user } = res.data;

      if (!["officer", "admin"].includes(user.role)) {
        setError("This account does not have officer or admin access.");
        setLoading(false);
        return;
      }

      setAuthToken(accessToken);
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("user", JSON.stringify(user));
      router.push("/admin/dashboard");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink via-paper to-surface pointer-events-none"></div>

      {/* Content Container */}
      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-seal to-sealDark mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <span className="badge badge-primary inline-block">
            Officer Access
          </span>
        </div>

        {/* Form Card */}
        <div className="card p-8">
          <div className="mb-6">
            <h1 className="text-headline text-ink">Officer Sign In</h1>
            <p className="mt-2 text-base text-ink/70">
              Authorized personnel authentication
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/70 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="officer@law.enforcement"
                className="w-full px-4 py-3 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-ink/70 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
              />
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mt-4">
                <AlertCard
                  type="error"
                  title="Authentication Failed"
                  message={error}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-block mt-6 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <Unlock size={20} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-info/10 border border-info/30 rounded-lg">
            <p className="text-xs text-ink/70 leading-relaxed flex items-start gap-2">
              <Info size={16} className="text-info flex-shrink-0 mt-0.5" />
              <span><strong className="text-info">Note:</strong> Officer and admin accounts are created by system administrators only. If you need access, contact your supervisor.</span>
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-seal transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
