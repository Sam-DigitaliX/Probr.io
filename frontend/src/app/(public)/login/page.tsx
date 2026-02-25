"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError(null);

    // TODO: Replace with real auth API call
    try {
      // Simulate login — accept any credentials for now
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(276_51%_57%/0.4),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(35_97%_63%/0.3),transparent_60%)]" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-12">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={160}
              height={53}
              className="h-12 w-auto"
              priority
            />
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Your tracking infrastructure,<br />under control.
          </h2>
          <p className="text-white/70 text-lg max-w-md">
            Monitor sGTM, GTM, GA4, BigQuery & CMP across all your clients from a single dashboard.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            {[
              "Real-time probes",
              "Slack & email alerts",
              "Multi-client support",
              "Auto-resolution",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-white/80 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Image
              src="/images/Probr_logo.webp"
              alt="Probr"
              width={120}
              height={40}
              className="h-8 w-auto"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-8">
            Log in to access your monitoring dashboard.
          </p>

          {error && (
            <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-grad" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="ev-input w-full pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/60"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 icon-grad" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="ev-input w-full pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 icon-grad" /> : <Eye className="h-4 w-4 icon-grad" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="ev-btn-primary w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-4 w-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              ) : (
                <>
                  Log in
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
