import { createUserWithPlant, findPlantByUserId, findUserByEmail, updatePlantRecord } from "@/lib/store";
import { serializePlant, setPlantWeather, updatePlantState, waterPlant } from "@/lib/plant";

export async function getUserByEmail(email: string) {
  return findUserByEmail(email);
}

export async function registerUser(email: string, passwordHash: string) {
  return createUserWithPlant(email, passwordHash);
}

export async function syncPlant(userId: string, now = new Date()) {
  const plant = await findPlantByUserId(userId);

  if (!plant) {
    return null;
  }

  const updatedPlant = updatePlantState(plant, now);

  if (updatedPlant.lastUpdatedAt !== plant.lastUpdatedAt || updatedPlant.health !== plant.health || updatedPlant.moisture !== plant.moisture || updatedPlant.growthPoints !== plant.growthPoints || updatedPlant.stage !== plant.stage) {
    await updatePlantRecord(updatedPlant);
    return updatedPlant;
  }

  return plant;
}

export async function getSerializedPlantForUser(userId: string) {
  const plant = await syncPlant(userId);
  return plant ? serializePlant(plant) : null;
}

export async function waterUserPlant(userId: string) {
  const syncedPlant = await syncPlant(userId, new Date());
  if (!syncedPlant) return null;

  const updated = waterPlant(syncedPlant, new Date());
  await updatePlantRecord(updated);
  return serializePlant(updated);
}

export async function updateUserPlantWeather(userId: string, weather: string) {
  const syncedPlant = await syncPlant(userId, new Date());
  if (!syncedPlant) return null;

  const now = new Date().toISOString();
  const updated = {
    ...syncedPlant,
    currentWeather: setPlantWeather(weather),
    lastUpdatedAt: now,
    updatedAt: now,
  };

  await updatePlantRecord(updated);
  return serializePlant(updated);
}