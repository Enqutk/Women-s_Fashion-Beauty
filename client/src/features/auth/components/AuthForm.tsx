"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CSSProperties, FormEvent, useState } from "react";
import { loginUser, registerUser } from "../services/auth.api";
import { setAuthSession } from "../utils/auth-storage";
import styles from "./AuthForm.module.css";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const FASHION_SLIDES = [
  {
    image:
      "https://images.unsplash.com/photo-1464863979621-258859e62245?auto=format&fit=crop&w=1600&q=80",
    title: "Modern Street Style",
    subtitle: "Curated edits for everyday confidence.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80",
    title: "Premium Seasonal Picks",
    subtitle: "Fresh drops inspired by global fashion trends.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    title: "Beauty Meets Elegance",
    subtitle: "From statement looks to timeless essentials.",
  },
];

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const strengthScore = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSymbol,
  ].filter(Boolean).length;

  const passwordStrengthLabel =
    strengthScore <= 2 ? "Weak password" : strengthScore <= 4 ? "Medium password" : "Strong password";
  const passwordStrengthClass =
    strengthScore <= 2
      ? styles.strengthWeak
      : strengthScore <= 4
        ? styles.strengthMedium
        : styles.strengthStrong;
  const showPasswordStrength = isRegister && password.length > 0;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        if (strengthScore < 5) {
          throw new Error(
            "Use a stronger password with 8+ characters, uppercase, lowercase, number, and symbol.",
          );
        }
      }

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
      <section className={styles.shell}>
        <aside className={styles.visualPanel}>
          {FASHION_SLIDES.map((slide, index) => (
            <div
              key={slide.title}
              className={styles.visualSlide}
              style={
                {
                  "--slide-image": `url("${slide.image}")`,
                  "--slide-delay": `${index * 6}s`,
                } as CSSProperties
              }
            />
          ))}
          <div className={styles.visualOverlay} />
          <div className={styles.visualContent}>
            <p className={styles.visualLabel}>Fashion Journal</p>
            <h2>{isRegister ? "Create your style account" : "Welcome back"}</h2>
            <p>Sign in to explore curated fashion, beauty, and accessories collections.</p>
          </div>
        </aside>

        <div className={styles.card}>
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
            {isRegister ? (
              <>
                {showPasswordStrength ? (
                  <>
                    <p className={`${styles.strength} ${passwordStrengthClass}`}>
                      {passwordStrengthLabel}
                    </p>
                    <p className={styles.strengthHint}>
                      Use 8+ chars with uppercase, lowercase, number, and symbol.
                    </p>
                  </>
                ) : null}
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Repeat password"
                  minLength={8}
                />
              </>
            ) : null}

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
        </div>
      </section>
    </main>
  );
}
