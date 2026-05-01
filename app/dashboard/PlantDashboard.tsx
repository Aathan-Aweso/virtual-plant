"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ClientPlant } from "@/lib/plant";
import { PlantScene } from "@/app/components/PlantScene";

type Props = {
  initialPlant: ClientPlant;
  userEmail: string;
};

type ApiResult = {
  plant?: ClientPlant;
  error?: string;
};

function getContextualTip(plant: ClientPlant): string {
  const recentlyWatered = plant.lastWateredAt
    ? Date.now() - new Date(plant.lastWateredAt).getTime() < 45 * 60 * 1000
    : false;

  if (plant.healthState === "wilted") {
    return "Your plant is struggling. Settle into balanced moisture and gentle weather so it can recover before it slips back a stage.";
  }
  if (recentlyWatered && plant.moisture > 75) {
    return "Just watered. Let the soil drink it in before topping up again — fresh waterings on already-damp soil cost health.";
  }
  if (plant.moisture > 82) {
    return "The soil is waterlogged. Skip the watering can for now and let sunny weather draw it back to a healthy level.";
  }
  if (plant.moisture < 20) {
    return "The soil is parched. A good watering will lift it back into the comfortable range.";
  }
  if (plant.moisture < 30) {
    return "Soil is drifting dry. A modest watering will bring it back to the sweet spot.";
  }
  if (plant.healthState === "stressed") {
    return "The plant is stressed. Keep moisture in the middle of the meter and avoid harsh weather while it recovers.";
  }
  if (!plant.isDaytime) {
    return "Resting overnight. Conditions look healthy — growth picks back up when the sun is up.";
  }
  if (plant.currentWeather === "sunny") {
    return "Excellent growing conditions. Keep an eye on the moisture meter — sunny stretches dry the soil faster.";
  }
  if (plant.currentWeather === "cloudy") {
    return "Steady growing weather. Switching to sunny would push growth faster while moisture is well-balanced.";
  }
  return "Rain keeps the soil topped up but slows growth. Once moisture is comfortable, sunny skies will drive faster gains.";
}

export function PlantDashboard({ initialPlant, userEmail }: Props) {
  const router = useRouter();
  const [plant, setPlant] = useState(initialPlant);
  const [status, setStatus] = useState("");
  const [busyAction, setBusyAction] = useState<"water" | "weather" | "logout" | null>(null);
  const tip = getContextualTip(plant);

  async function refreshPlant() {
    const response = await fetch("/api/plant");
    const result: ApiResult = await response.json();
    if (response.ok && result.plant) {
      setPlant(result.plant);
    }
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshPlant().catch(() => undefined);
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  async function water() {
    setBusyAction("water");
    setStatus("");
    const response = await fetch("/api/plant/water", { method: "POST" });
    const result: ApiResult = await response.json();
    setBusyAction(null);

    if (!response.ok || !result.plant) {
      setStatus(result.error || "Unable to water plant right now.");
      return;
    }

    setPlant(result.plant);
    setStatus("Plant watered. Moisture changed immediately.");
  }

  async function updateWeather(weather: ClientPlant["currentWeather"]) {
    setBusyAction("weather");
    setStatus("");
    const response = await fetch("/api/plant/weather", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ weather }),
    });
    const result: ApiResult = await response.json();
    setBusyAction(null);

    if (!response.ok || !result.plant) {
      setStatus(result.error || "Unable to update weather.");
      return;
    }

    setPlant(result.plant);
    setStatus(`Weather updated to ${result.plant.currentWeatherLabel}.`);
  }

  async function logout() {
    setBusyAction("logout");
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="shell">
      <section className="hero-card">
        <div className="header-row">
          <div>
            <span className="eyebrow">Persistent plant dashboard</span>
            <h1 className="panel-title" style={{ marginTop: "16px", fontSize: "2.4rem" }}>
              Your plant is currently a {plant.stage.replace("-", " ")}.
            </h1>
            <p className="muted">
              Signed in as {userEmail}. Simulation accounts for offline progression using the time since your last visit.
            </p>
          </div>
          <button className="button-secondary" onClick={logout} disabled={busyAction === "logout"}>
            {busyAction === "logout" ? "Logging out..." : "Log out"}
          </button>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <p className="summary-label">Weather</p>
            <p className="summary-value">{plant.currentWeatherLabel}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Growth points</p>
            <p className="summary-value">{plant.growthPoints}</p>
          </div>
          <div className="summary-card">
            <p className="summary-label">Cycle</p>
            <p className="summary-value">{plant.isDaytime ? "Daylight" : "Night"}</p>
          </div>
        </div>
      </section>

      <section className="grid dashboard-grid" style={{ marginTop: "24px" }}>
        <div className="panel">
          <div className="plant-frame">
            <span className="plant-badge">{plant.healthState}</span>
            <PlantScene plant={plant} />
          </div>
          <p className="note">
            Live SVG scene reacting to stage, weather, daylight, moisture, and health. Stage:{" "}
            <code>{plant.stage}</code>.
          </p>
        </div>

        <div className="grid">
          <section className="panel">
            <h2 className="panel-title">Plant health</h2>
            <div className="stat-list">
              <div>
                <div className="meter-label">
                  <strong>Health</strong>
                  <span>{plant.health}/100</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill health-fill" style={{ width: `${plant.health}%` }} />
                </div>
              </div>

              <div>
                <div className="meter-label">
                  <strong>Moisture</strong>
                  <span>{plant.moisture}/100</span>
                </div>
                <div className="meter-track">
                  <div className="meter-fill moisture-fill" style={{ width: `${plant.moisture}%` }} />
                </div>
              </div>
            </div>

            <div className="inline-actions">
              <button className="button" onClick={water} disabled={busyAction !== null}>
                {busyAction === "water" ? "Watering..." : "Water plant"}
              </button>
            </div>

            <p className="note">{tip}</p>
          </section>

          <section className="panel">
            <h2 className="panel-title">Weather controls</h2>
            <p className="muted">Adjust the current condition to influence moisture loss, sunlight stress, and growth speed.</p>
            <div className="chip-row" style={{ marginTop: "14px" }}>
              {(["sunny", "rainy", "cloudy"] as const).map((weather) => (
                <button
                  key={weather}
                  className={`chip ${weather} ${plant.currentWeather === weather ? `active ${weather}` : ""}`}
                  disabled={busyAction !== null}
                  onClick={() => updateWeather(weather)}
                >
                  {weather}
                </button>
              ))}
            </div>
            <div className={`status-line ${status && status.toLowerCase().includes("unable") ? "error" : ""}`}>{status}</div>
          </section>
        </div>
      </section>

      <section className="panel care-guide" style={{ marginTop: "24px" }}>
        <h2 className="panel-title">Care guide</h2>
        <p className="muted" style={{ marginTop: "8px" }}>
          A handful of habits that take a seed all the way to a mature plant.
        </p>
        <ul className="tips-list">
          <li>
            <strong>Aim for the middle of the moisture meter.</strong> Both dry soil
            and waterlogged roots stall growth and slowly drain health.
          </li>
          <li>
            <strong>Pace your waterings.</strong> Pouring more onto already-damp soil
            costs health — wait until the meter has eased back down before topping up.
          </li>
          <li>
            <strong>Sunny daylight grows fastest.</strong> Cloudy days are steady, rainy
            days are slowest. Rain is still useful when the soil is on the dry side.
          </li>
          <li>
            <strong>Match the weather to the soil.</strong> Sunny skies dry it out, rain
            tops it up. Use the weather chips to balance whichever way the meter is leaning.
          </li>
          <li>
            <strong>Plants rest at night.</strong> Real growth happens during daylight,
            so daytime visits do most of the heavy lifting.
          </li>
          <li>
            <strong>Recover stressed plants gently.</strong> If health is low, settle
            into balanced conditions and avoid swings — pushing harder can cost a stage.
          </li>
          <li>
            <strong>Check in regularly.</strong> Time keeps moving while you&apos;re away,
            so a quick visit catches drifting moisture before it bites.
          </li>
        </ul>
      </section>
    </main>
  );
}
