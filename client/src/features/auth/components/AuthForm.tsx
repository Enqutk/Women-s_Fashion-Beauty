"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { loginUser, registerUser } from "../services/auth.api";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const TOKEN_KEY = "auth_token";

export default function AuthForm({ mode }: AuthFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
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
        ? await registerUser({ name, email, password, role })
        : await loginUser({ email, password });

      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem("auth_user_role", result.user.role);
      localStorage.setItem("auth_user_email", result.user.email);
      setMessage(
        `${isRegister ? "Registration" : "Login"} successful. Token stored in localStorage.`,
      );
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 440, margin: "3rem auto", padding: "0 1rem" }}>
      <h1 style={{ marginBottom: "0.8rem" }}>{isRegister ? "Register" : "Login"}</h1>
      <p style={{ marginBottom: "1.2rem" }}>
        {isRegister ? "Create your account" : "Sign in to continue"}
      </p>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem" }}>
        {isRegister ? (
          <input
            required
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
            style={{ padding: "0.65rem" }}
          />
        ) : null}

        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email"
          style={{ padding: "0.65rem" }}
        />

        <input
          required
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          minLength={6}
          style={{ padding: "0.65rem" }}
        />

        {isRegister ? (
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as "admin" | "user")}
            style={{ padding: "0.65rem" }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        ) : null}

        <button type="submit" disabled={loading} style={{ padding: "0.7rem 1rem" }}>
          {loading ? "Please wait..." : isRegister ? "Create account" : "Login"}
        </button>
      </form>

      {message ? <p style={{ marginTop: "1rem", color: "green" }}>{message}</p> : null}
      {error ? <p style={{ marginTop: "1rem", color: "crimson" }}>{error}</p> : null}

      <p style={{ marginTop: "1rem" }}>
        {isRegister ? "Already registered? " : "Don't have an account? "}
        <Link href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Login" : "Register"}
        </Link>
      </p>
    </main>
  );
}
