import { PlantRecord, PlantStageValue, WeatherValue } from "@/lib/types";

export const STAGES = ["seed", "sprout", "seedling", "young-plant", "mature-plant"] as const;
export const WEATHER = ["sunny", "rainy", "cloudy"] as const;
export const HEALTH_STATES = ["healthy", "stressed", "wilted"] as const;

export type ClientPlant = {
  id: string;
  stage: (typeof STAGES)[number];
  health: number;
  moisture: number;
  growthPoints: number;
  lastWateredAt: string | null;
  currentWeather: (typeof WEATHER)[number];
  currentWeatherLabel: string;
  healthState: (typeof HEALTH_STATES)[number];
  imagePath: string;
  isDaytime: boolean;
  lastUpdatedAt: string;
};

const STAGE_THRESHOLDS: Array<{ stage: PlantStageValue; minGrowth: number }> = [
  { stage: "SEED", minGrowth: 0 },
  { stage: "SPROUT", minGrowth: 20 },
  { stage: "SEEDLING", minGrowth: 45 },
  { stage: "YOUNG_PLANT", minGrowth: 75 },
  { stage: "MATURE_PLANT", minGrowth: 120 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStageForGrowthPoints(growthPoints: number): PlantStageValue {
  return [...STAGE_THRESHOLDS].reverse().find((entry) => growthPoints >= entry.minGrowth)?.stage ?? "SEED";
}

function isDaytimeAt(date: Date) {
  const hour = date.getHours();
  return hour >= 6 && hour < 18;
}

export function getHealthState(health: number): (typeof HEALTH_STATES)[number] {
  if (health >= 70) return "healthy";
  if (health >= 35) return "stressed";
  return "wilted";
}

export function stageToClient(stage: PlantStageValue): (typeof STAGES)[number] {
  switch (stage) {
    case "SEED":
      return "seed";
    case "SPROUT":
      return "sprout";
    case "SEEDLING":
      return "seedling";
    case "YOUNG_PLANT":
      return "young-plant";
    case "MATURE_PLANT":
      return "mature-plant";
  }
}

export function weatherToClient(weather: WeatherValue): (typeof WEATHER)[number] {
  switch (weather) {
    case "SUNNY":
      return "sunny";
    case "RAINY":
      return "rainy";
    case "CLOUDY":
      return "cloudy";
  }
}

export function weatherLabel(weather: WeatherValue) {
  return weather.charAt(0) + weather.slice(1).toLowerCase();
}

export function getImagePath(stage: PlantStageValue, weather: WeatherValue, health: number) {
  return `/images/${stageToClient(stage)}_${weatherToClient(weather)}_${getHealthState(health)}.png`;
}

export function serializePlant(plant: PlantRecord, now = new Date()): ClientPlant {
  return {
    id: plant.id,
    stage: stageToClient(plant.stage),
    health: plant.health,
    moisture: plant.moisture,
    growthPoints: plant.growthPoints,
    lastWateredAt: plant.lastWateredAt,
    currentWeather: weatherToClient(plant.currentWeather),
    currentWeatherLabel: weatherLabel(plant.currentWeather),
    healthState: getHealthState(plant.health),
    imagePath: getImagePath(plant.stage, plant.currentWeather, plant.health),
    isDaytime: isDaytimeAt(now),
    lastUpdatedAt: plant.lastUpdatedAt,
  };
}

export function waterPlant(plant: PlantRecord, now = new Date()) {
  const nextMoisture = clamp(plant.moisture + 28, 0, 100);
  const recentlyWatered =
    plant.lastWateredAt && now.getTime() - new Date(plant.lastWateredAt).getTime() < 1000 * 60 * 45;

  let healthDelta = 2;
  if (plant.moisture > 82 || recentlyWatered) {
    healthDelta = -8;
  } else if (plant.moisture < 20) {
    healthDelta = 6;
  }

  return {
    ...plant,
    moisture: nextMoisture,
    health: clamp(plant.health + healthDelta, 0, 100),
    lastWateredAt: now.toISOString(),
    lastUpdatedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

export function setPlantWeather(weather: string): WeatherValue {
  const normalized = weather.toUpperCase();
  if (normalized === "SUNNY") return "SUNNY";
  if (normalized === "RAINY") return "RAINY";
  return "CLOUDY";
}

export function updatePlantState(plant: PlantRecord, currentTime: Date) {
  const previousTime = new Date(plant.lastUpdatedAt);
  const elapsedMs = Math.max(currentTime.getTime() - previousTime.getTime(), 0);
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  if (elapsedHours < 0.05) {
    return plant;
  }

  const daytime = isDaytimeAt(currentTime);

  let moistureDriftPerHour = 4;
  if (plant.currentWeather === "SUNNY") moistureDriftPerHour += 1.75;
  if (plant.currentWeather === "RAINY") moistureDriftPerHour -= 1.5;
  if (!daytime) moistureDriftPerHour -= 0.8;

  const nextMoisture = clamp(Math.round(plant.moisture - moistureDriftPerHour * elapsedHours), 0, 100);

  let healthDeltaPerHour = -0.2;
  if (nextMoisture < 15) healthDeltaPerHour -= 6;
  else if (nextMoisture < 30) healthDeltaPerHour -= 2.5;
  else if (nextMoisture > 90) healthDeltaPerHour -= 4.5;
  else if (nextMoisture > 78) healthDeltaPerHour -= 1.5;
  else healthDeltaPerHour += 0.6;

  if (plant.currentWeather === "SUNNY" && nextMoisture < 40) healthDeltaPerHour -= 1.5;
  if (plant.currentWeather === "RAINY" && nextMoisture > 80) healthDeltaPerHour -= 1;
  if (!daytime && nextMoisture >= 35 && nextMoisture <= 75) healthDeltaPerHour += 0.15;

  const nextHealth = clamp(Math.round(plant.health + healthDeltaPerHour * elapsedHours), 0, 100);

  let growthPerHour = 0;
  const balancedMoisture = nextMoisture >= 40 && nextMoisture <= 72;
  if (balancedMoisture && nextHealth >= 45 && daytime) {
    if (plant.currentWeather === "SUNNY") growthPerHour = 2.2;
    else if (plant.currentWeather === "CLOUDY") growthPerHour = 1.4;
    else growthPerHour = 0.9;
  } else if (nextHealth >= 35 && nextMoisture >= 30 && nextMoisture <= 80) {
    growthPerHour = 0.35;
  } else if (nextHealth < 20) {
    growthPerHour = -0.25;
  }

  const nextGrowthPoints = Math.max(0, Math.round(plant.growthPoints + growthPerHour * elapsedHours));

  return {
    ...plant,
    stage: getStageForGrowthPoints(nextGrowthPoints),
    health: nextHealth,
    moisture: nextMoisture,
    growthPoints: nextGrowthPoints,
    lastUpdatedAt: currentTime.toISOString(),
    updatedAt: currentTime.toISOString(),
  };
}