

"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  return (
    <Suspense fallback={<AuthShellLoader />}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      setMessage(
        "Email berhasil diverifikasi. Sekarang lo bisa login."
      );
    }

    let mounted = true;

    async function checkSession() {
      const { data } = await supabase.auth.getSession();

      if (mounted && data.session) {
        router.replace("/");
      }
    }

    void checkSession();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (loginError) {
        const text = loginError.message.toLowerCase();

        if (
          text.includes("email not confirmed") ||
          text.includes("email_not_confirmed")
        ) {
          setError(
            "Email lo belum diverifikasi. Buka email dari Supabase, lalu klik tautan verifikasinya."
          );
        } else {
          setError(
            "Login gagal. Periksa email dan password, lalu coba lagi."
          );
        }

        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung. Coba lagi beberapa saat.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <Link href="/" className="auth-brand">
        <span className="brand-mark">V</span>
        <span>vibe<span className="brand-light">sound</span></span>
      </Link>

      <section className="auth-card">
        <div className="auth-eyebrow">
          <span className="status-dot" />
          WELCOME BACK TO YOUR SOUND
        </div>

        <h1>Good to hear you.</h1>
        <p className="auth-description">
          Sign in and get back to the music you love.
        </p>

        <form onSubmit={handleLogin} className="auth-form">
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && (
            <p className="auth-alert auth-error" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-alert auth-success" role="status">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="auth-switch">
          New to VibeSound?{" "}
          <Link href="/register">Create an account</Link>
        </p>

        <p className="auth-terms">
          Your music journey continues here.
        </p>
      </section>

      <footer className="auth-footer">
        VIBESOUND © 2026 · MADE FOR YOUR MOMENTS
      </footer>
    </main>
  );
}

function AuthShellLoader() {
  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <div className="auth-card auth-card-loading" aria-live="polite">
        <div className="auth-card-skeleton" />
      </div>
    </main>
  );
}
