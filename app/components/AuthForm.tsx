"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type AuthFormProps = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json().catch(() => ({ error: "Unexpected response." }));

    setLoading(false);

    if (!response.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const title = mode === "signup" ? "Create your plant account" : "Welcome back to your plant";
  const switchCopy =
    mode === "signup" ? (
      <>
        Already have an account? <Link href="/login">Log in</Link>
      </>
    ) : (
      <>
        Need an account? <Link href="/signup">Create one</Link>
      </>
    );

  return (
    <div className="auth-wrap">
      <div className="panel auth-card">
        <span className="eyebrow">{mode === "signup" ? "Sign up" : "Log in"}</span>
        <h1 className="panel-title" style={{ marginTop: "18px" }}>
          {title}
        </h1>
        <p className="muted">Each account gets exactly one persistent plant that keeps evolving while you’re away.</p>
        <form onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <input type="email" name="email" placeholder="you@example.com" autoComplete="email" required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" name="password" placeholder="At least 8 characters" autoComplete="current-password" required />
          </label>
          <div className={`status-line ${error ? "error" : ""}`}>{error}</div>
          <button className="button" type="submit" disabled={loading} style={{ width: "100%" }}>
            {loading ? "Working..." : mode === "signup" ? "Create account" : "Log in"}
          </button>
        </form>
        <p className="muted" style={{ marginTop: "18px" }}>
          {switchCopy}
        </p>
      </div>
    </div>
  );
}
