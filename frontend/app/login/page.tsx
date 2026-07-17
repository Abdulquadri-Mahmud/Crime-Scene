"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, setAuthToken, extractErrorMessage } from "@/lib/api";
import { AlertCard } from "@/components/Card";
import { User, ArrowLeft, LogOut } from "lucide-react";

export default function CitizenLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await api.post("/api/auth/login", {
        email: form.get("email"),
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
              <span className="badge badge-primary flex items-center gap-2"><User size={18} /> Community Account</span>
            </div>
            <h1 className="text-headline text-ink">Welcome Back</h1>
            <p className="mt-4 text-base text-ink/70">
              Sign in to your account to track your reports and manage your submissions.
            </p>
          </div>

          {/* Login Card */}
          <div className="card mb-6">
            <form onSubmit={handleSubmit} className="space-y-5">
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
                <label className="block text-sm font-semibold text-ink mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 border border-line rounded-lg bg-paper focus:border-seal focus:bg-white focus:ring-4 focus:ring-seal/20 transition-all"
                />
              </div>

              {error && (
                <AlertCard
                  type="error"
                  title="Login Failed"
                  message={error}
                />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary btn-lg mt-6"
              >
                {loading ? "🔄 Signing In..." : "✓ Sign In"}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
            <p className="text-blue-900">
              <strong>💡 Tip:</strong> You can also track reports without an account using your tracking ID and contact information.
            </p>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-ink/60">
              Don't have an account?{" "}
              <Link href="/register" className="text-seal font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="text-center mt-6 pt-6 border-t border-line">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-ink transition-colors">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
