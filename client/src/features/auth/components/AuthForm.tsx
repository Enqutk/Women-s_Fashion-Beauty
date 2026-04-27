"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginUser, registerUser } from "../services/auth.api";
import { setAuthSession } from "../utils/auth-storage";
import styles from "./AuthForm.module.css";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = isRegister
        ? await registerUser({ name, email, password })
        : await loginUser({ email, password });

      setAuthSession(result.token, result.user.role, result.user.email);
      setMessage(
        `${isRegister ? "Registration" : "Login"} successful.`,
      );
      window.dispatchEvent(new Event("cart:changed"));
      const destination = result.user.role === "admin" ? "/admin/dashboard" : "/";
      router.push(destination);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.glowA} aria-hidden="true" />
      <div className={styles.glowB} aria-hidden="true" />
      <section className={styles.card}>
        <p className={styles.badge}>{isRegister ? "New Member" : "Welcome Back"}</p>
        <h1 className={styles.title}>{isRegister ? "Register" : "Login"}</h1>
        <p className={styles.subtitle}>
          {isRegister ? "Create your account" : "Sign in to continue"}
        </p>

        <form onSubmit={onSubmit} className={styles.form}>
          {isRegister ? (
            <input
              required
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
            />
          ) : null}

          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email"
          />

          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            minLength={6}
          />

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>

        {message ? <p className={styles.message}>{message}</p> : null}
        {error ? <p className={styles.error}>{error}</p> : null}

        <p className={styles.switch}>
          {isRegister ? "Already registered? " : "Don't have an account? "}
          <Link href={isRegister ? "/login" : "/register"}>
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </section>
    </main>
  );
}
