"use client";

import type { ClientPlant } from "@/lib/plant";

type Props = {
  plant: ClientPlant;
};

const STAGE_GROWTH: Record<ClientPlant["stage"], number> = {
  seed: 0,
  sprout: 0.18,
  seedling: 0.4,
  "young-plant": 0.7,
  "mature-plant": 1,
};

const HEALTH_PALETTE: Record<
  ClientPlant["healthState"],
  { stem: string; leafA: string; leafB: string; leafEdge: string; droop: number; saturate: number }
> = {
  healthy: {
    stem: "#3f7d3b",
    leafA: "#5fae4c",
    leafB: "#84c46f",
    leafEdge: "#2f6a2c",
    droop: 0,
    saturate: 1,
  },
  stressed: {
    stem: "#7b8a3a",
    leafA: "#a7b551",
    leafB: "#c3cd76",
    leafEdge: "#6a7635",
    droop: 6,
    saturate: 0.78,
  },
  wilted: {
    stem: "#7a6a3c",
    leafA: "#9c8c4b",
    leafB: "#b4a565",
    leafEdge: "#65582d",
    droop: 14,
    saturate: 0.55,
  },
};

type Leaf = {
  side: "L" | "R";
  along: number;
  size: number;
  delay: number;
};

function buildLeaves(growth: number): Leaf[] {
  if (growth <= 0) return [];
  const slots: Array<Omit<Leaf, "delay">> = [
    { side: "L", along: 0.62, size: 0.55 },
    { side: "R", along: 0.5, size: 0.6 },
    { side: "L", along: 0.36, size: 0.78 },
    { side: "R", along: 0.24, size: 0.85 },
    { side: "L", along: 0.12, size: 1 },
    { side: "R", along: 0.05, size: 0.9 },
  ];
  const count = Math.max(1, Math.round(slots.length * growth));
  return slots.slice(0, count).map((slot, i) => ({ ...slot, delay: i * 0.18 }));
}

export function PlantScene({ plant }: Props) {
  const growth = STAGE_GROWTH[plant.stage];
  const palette = HEALTH_PALETTE[plant.healthState];
  const leaves = buildLeaves(growth);

  const baseY = 460;
  const tipY = baseY - 60 - growth * 280;
  const stemHeight = baseY - tipY;

  const moistureBand = Math.max(8, Math.min(54, plant.moisture * 0.54));
  const flowering = plant.stage === "mature-plant";

  return (
    <div className={`plant-scene ${plant.currentWeather} ${plant.isDaytime ? "day" : "night"} health-${plant.healthState}`}>
      <svg
        viewBox="0 0 600 600"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`A ${plant.healthState} ${plant.stage.replace("-", " ")} plant in ${plant.currentWeather} weather`}
      >
        <defs>
          <linearGradient id="sky-day" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9f4ff" />
            <stop offset="60%" stopColor="#fff7d8" />
            <stop offset="100%" stopColor="#fdeec0" />
          </linearGradient>
          <linearGradient id="sky-night" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a2746" />
            <stop offset="100%" stopColor="#3a4a6e" />
          </linearGradient>
          <linearGradient id="sky-rainy" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#bdc8d4" />
            <stop offset="100%" stopColor="#dde4ea" />
          </linearGradient>
          <linearGradient id="sky-cloudy" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d6dee5" />
            <stop offset="100%" stopColor="#eaf0e6" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffe48a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffe48a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pot" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#c98e63" />
            <stop offset="100%" stopColor="#92633f" />
          </linearGradient>
          <linearGradient id="soil" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5b3a23" />
            <stop offset="100%" stopColor="#3e2716" />
          </linearGradient>
          <linearGradient id="moisture" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5b86b8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3a6798" stopOpacity="0.8" />
          </linearGradient>
          <radialGradient id="flower" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#ffd9e4" />
            <stop offset="100%" stopColor="#e87aa1" />
          </radialGradient>
          <filter id="leaf-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* sky */}
        <rect width="600" height="600" fill={skyFill(plant)} />

        {/* stars at night */}
        {!plant.isDaytime &&
          STAR_POSITIONS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity="0.85" className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}

        {/* sun (sunny day) */}
        {plant.currentWeather === "sunny" && plant.isDaytime && (
          <g className="sun" transform="translate(470 130)">
            <circle r="80" fill="url(#sun-glow)" />
            <g className="sun-rays">
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x="-2" y="-58" width="4" height="22" fill="#f5bf4f" rx="2" transform={`rotate(${i * 30})`} />
              ))}
            </g>
            <circle r="34" fill="#f7c850" />
            <circle r="34" fill="#fde08a" opacity="0.6" />
          </g>
        )}

        {/* moon at night */}
        {!plant.isDaytime && (
          <g transform="translate(470 130)">
            <circle r="38" fill="#f3eccd" />
            <circle cx="14" cy="-6" r="32" fill={skyFill(plant)} />
          </g>
        )}

        {/* clouds */}
        {(plant.currentWeather === "cloudy" || plant.currentWeather === "rainy") && (
          <g className="cloud-layer" opacity={plant.currentWeather === "rainy" ? 0.95 : 0.85}>
            <Cloud x={120} y={110} scale={1} delay={0} />
            <Cloud x={360} y={80} scale={0.7} delay={3} />
            <Cloud x={250} y={170} scale={0.85} delay={6} />
          </g>
        )}

        {/* rain */}
        {plant.currentWeather === "rainy" && (
          <g className="rain">
            {RAIN_POSITIONS.map((d, i) => (
              <line
                key={i}
                x1={d.x}
                y1={d.y}
                x2={d.x - 6}
                y2={d.y + 18}
                stroke="#7fa8d3"
                strokeWidth="2"
                strokeLinecap="round"
                className="raindrop"
                style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.duration}s` }}
              />
            ))}
          </g>
        )}

        {/* ground shadow */}
        <ellipse cx="300" cy="555" rx="220" ry="14" fill="rgba(40,55,30,0.18)" />

        {/* pot */}
        <g>
          <path d="M180 470 L420 470 L400 560 Q300 575 200 560 Z" fill="url(#pot)" />
          <rect x="170" y="455" width="260" height="22" rx="6" fill="#a06b41" />
          {/* soil */}
          <ellipse cx="300" cy="467" rx="118" ry="14" fill="url(#soil)" />
          {/* moisture indicator */}
          <rect x={200} y={478} width={moistureBand * 4} height="4" rx="2" fill="url(#moisture)" opacity="0.55" />
        </g>

        {/* plant: seed renders inside soil */}
        {plant.stage === "seed" ? (
          <g className="seed-group">
            <ellipse cx="300" cy="465" rx="14" ry="10" fill="#6b4a2b" />
            <path d="M300 465 Q302 455 306 451" stroke={palette.stem} strokeWidth="2" fill="none" strokeLinecap="round" className="seed-crack" />
          </g>
        ) : (
          <g
            className="plant-group"
            style={{
              transformOrigin: "300px 460px",
              transform: `rotate(${palette.droop * -0.3}deg)`,
            }}
          >
            {/* stem */}
            <path
              d={`M300 ${baseY} Q${298} ${baseY - stemHeight * 0.5} 300 ${tipY}`}
              stroke={palette.stem}
              strokeWidth={Math.max(4, 6 + growth * 4)}
              strokeLinecap="round"
              fill="none"
              className="stem"
            />

            {/* leaves */}
            {leaves.map((leaf, i) => {
              const y = baseY - stemHeight * (1 - leaf.along);
              const dir = leaf.side === "L" ? -1 : 1;
              const size = 36 + leaf.size * 70 * Math.max(0.5, growth);
              return (
                <g
                  key={i}
                  className={`leaf leaf-${leaf.side}`}
                  style={{
                    transformOrigin: `300px ${y}px`,
                    animationDelay: `${leaf.delay}s`,
                  }}
                >
                  <path
                    d={leafPath(300, y, dir, size, palette.droop)}
                    fill={leaf.side === "L" ? palette.leafA : palette.leafB}
                    stroke={palette.leafEdge}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d={`M300 ${y} q${dir * size * 0.4} ${-size * 0.15} ${dir * size * 0.85} ${-size * 0.05}`}
                    stroke={palette.leafEdge}
                    strokeWidth="1"
                    fill="none"
                    opacity="0.6"
                  />
                </g>
              );
            })}

            {/* tip bud / flower */}
            {flowering ? (
              <g className="flower" style={{ transformOrigin: `300px ${tipY}px` }}>
                {[0, 72, 144, 216, 288].map((angle) => (
                  <ellipse
                    key={angle}
                    cx="300"
                    cy={tipY - 14}
                    rx="10"
                    ry="18"
                    fill="url(#flower)"
                    transform={`rotate(${angle} 300 ${tipY})`}
                  />
                ))}
                <circle cx="300" cy={tipY} r="6" fill="#f8d24a" />
              </g>
            ) : (
              growth > 0 && (
                <circle cx="300" cy={tipY} r={3 + growth * 4} fill={palette.leafA} className="bud" />
              )
            )}
          </g>
        )}

        {/* sparkle when watered recently */}
        {plant.moisture > 60 && plant.currentWeather !== "rainy" && (
          <g className="sparkles" opacity="0.9">
            {SPARKLE_POSITIONS.map((s, i) => (
              <circle
                key={i}
                cx={s.x}
                cy={s.y}
                r="2"
                fill="#9ed3ff"
                className="sparkle"
                style={{ animationDelay: `${i * 0.5}s` }}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

function skyFill(plant: ClientPlant) {
  if (!plant.isDaytime) return "url(#sky-night)";
  if (plant.currentWeather === "rainy") return "url(#sky-rainy)";
  if (plant.currentWeather === "cloudy") return "url(#sky-cloudy)";
  return "url(#sky-day)";
}

function leafPath(x: number, y: number, dir: number, size: number, droop: number) {
  const dx = dir * size;
  const droopY = droop * 0.6;
  return `M${x} ${y}
    q${dx * 0.25} ${-size * 0.55 + droopY} ${dx * 0.7} ${-size * 0.35 + droopY}
    q${dx * 0.45} ${size * 0.05 + droopY} ${dx * 0.95} ${size * 0.2 + droopY}
    q${-dx * 0.4} ${-size * 0.05} ${-dx * 0.95} ${-size * 0.05}
    Z`;
}

function Cloud({ x, y, scale, delay }: { x: number; y: number; scale: number; delay: number }) {
  return (
    <g className="cloud" transform={`translate(${x} ${y}) scale(${scale})`} style={{ animationDelay: `${delay}s` }}>
      <ellipse cx="0" cy="0" rx="40" ry="18" fill="#fff" />
      <ellipse cx="-28" cy="6" rx="26" ry="14" fill="#fff" />
      <ellipse cx="32" cy="6" rx="30" ry="16" fill="#fff" />
      <ellipse cx="0" cy="10" rx="46" ry="14" fill="#f3f5f7" />
    </g>
  );
}

const RAIN_POSITIONS = Array.from({ length: 28 }).map((_, i) => ({
  x: 60 + ((i * 53) % 480) + (i % 3) * 7,
  y: 150 + (i % 4) * 25,
  delay: (i % 7) * 0.18,
  duration: 0.9 + ((i * 13) % 5) * 0.12,
}));

const STAR_POSITIONS = [
  { x: 80, y: 70, r: 1.6 },
  { x: 150, y: 40, r: 2 },
  { x: 220, y: 90, r: 1.4 },
  { x: 320, y: 50, r: 1.8 },
  { x: 400, y: 100, r: 1.5 },
  { x: 540, y: 60, r: 1.7 },
  { x: 100, y: 180, r: 1.2 },
  { x: 560, y: 200, r: 1.4 },
];

const SPARKLE_POSITIONS = [
  { x: 240, y: 430 },
  { x: 360, y: 425 },
  { x: 270, y: 445 },
  { x: 340, y: 450 },
];
