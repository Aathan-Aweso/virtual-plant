import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="shell">
      <section className="hero-card">
        <span className="eyebrow">Real-time care simulation</span>
        <h1 className="page-title">Grow one plant, keep it alive, come back tomorrow.</h1>
        <p className="page-copy">
          Virtual Plant is a persistent growth game where watering, weather, and real-world time shape the same
          plant across every session. Sign up once, care for your plant over time, and watch it progress from seed to
          maturity.
        </p>
        <div className="hero-actions">
          <Link className="button" href="/signup">
            Create account
          </Link>
          <Link className="button-secondary" href="/login">
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
