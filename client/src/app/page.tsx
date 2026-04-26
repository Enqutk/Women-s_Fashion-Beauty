import Link from "next/link";

type HealthResponse = {
  ok: boolean;
  message: string;
  serverTime?: string | null;
  error?: string;
};

async function getBackendStatus(): Promise<HealthResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${apiUrl}/api/health`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        ok: false,
        message: "Request failed",
        error: `HTTP ${response.status}`,
      };
    }

    return (await response.json()) as HealthResponse;
  } catch (error) {
    return {
      ok: false,
      message: "Could not reach backend",
      error: error instanceof Error ? error.message : "Unknown network error",
    };
  }
}

export default async function Home() {
  const status = await getBackendStatus();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1>Women&apos;s Fashion & Beauty</h1>
      <p>Sprint 0 setup check: frontend, backend, and PostgreSQL connectivity.</p>
      <div style={{ marginTop: "0.8rem", display: "flex", gap: "1rem" }}>
        <Link href="/products">Shop</Link>
        <Link href="/login">Login</Link>
        <Link href="/register">Register</Link>
        <Link href="/admin/products">Admin Products</Link>
      </div>

      <section
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "0.5rem",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Backend status</h2>
        <p>
          <strong>Connected:</strong> {status.ok ? "Yes" : "No"}
        </p>
        <p>
          <strong>Message:</strong> {status.message}
        </p>
        {status.serverTime ? (
          <p>
            <strong>Server time:</strong> {status.serverTime}
          </p>
        ) : null}
        {status.error ? (
          <p>
            <strong>Error:</strong> {status.error}
          </p>
        ) : null}
      </section>
    </main>
  );
}
