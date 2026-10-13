
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password.length < 8) {
      setError("Password harus terdiri dari minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              display_name: name.trim(),
            },
            emailRedirectTo: `${window.location.origin}/login?verified=1`,
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        setMessage(
          "Akun berhasil dibuat. Mengalihkan ke halaman musik..."
        );
        window.location.assign("/");
        return;
      }

      setMessage(
        "Registrasi berhasil! Periksa email lo dan klik tautan verifikasi sebelum login."
      );
    } catch {
      setError("Terjadi kesalahan. Coba lagi beberapa saat.");
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
          YOUR NEXT FAVORITE SONG STARTS HERE
        </div>

        <h1>Create your account.</h1>
        <p className="auth-description">
          Join VibeSound and make every moment sound better.
        </p>

        <form onSubmit={handleRegister} className="auth-form">
          <label>
            Display name
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nama lo"
              autoComplete="name"
              maxLength={60}
              required
            />
          </label>

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
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Masukkan password sekali lagi"
              autoComplete="new-password"
              minLength={8}
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
            {loading ? "Creating account..." : "Create account"}
            {!loading && <span>→</span>}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link href="/login">Sign in</Link>
        </p>

        <p className="auth-terms">
          By creating an account, you agree to use VibeSound responsibly.
        </p>
      </section>

      <footer className="auth-footer">
        VIBESOUND © 2026 · MADE FOR YOUR MOMENTS
      </footer>
    </main>
  );
}
