export type PlantStageValue = "SEED" | "SPROUT" | "SEEDLING" | "YOUNG_PLANT" | "MATURE_PLANT";
export type WeatherValue = "SUNNY" | "RAINY" | "CLOUDY";

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type PlantRecord = {
  id: string;
  userId: string;
  stage: PlantStageValue;
  health: number;
  moisture: number;
  growthPoints: number;
  lastWateredAt: string | null;
  currentWeather: WeatherValue;
  lastUpdatedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type DatabaseShape = {
  users: UserRecord[];
  plants: PlantRecord[];
};