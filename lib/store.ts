import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseShape, PlantRecord, UserRecord } from "@/lib/types";

const databasePath = path.join(process.cwd(), "data", "database.json");

async function ensureDatabase() {
  try {
    await fs.access(databasePath);
  } catch {
    await fs.mkdir(path.dirname(databasePath), { recursive: true });
    await fs.writeFile(databasePath, JSON.stringify({ users: [], plants: [] }, null, 2));
  }
}

export async function readDatabase(): Promise<DatabaseShape> {
  await ensureDatabase();
  const raw = await fs.readFile(databasePath, "utf8");
  return JSON.parse(raw) as DatabaseShape;
}

export async function writeDatabase(data: DatabaseShape) {
  await fs.writeFile(databasePath, JSON.stringify(data, null, 2));
}

export async function findUserByEmail(email: string) {
  const db = await readDatabase();
  return db.users.find((user) => user.email === email) ?? null;
}

export async function findUserById(id: string) {
  const db = await readDatabase();
  return db.users.find((user) => user.id === id) ?? null;
}

export async function findPlantByUserId(userId: string) {
  const db = await readDatabase();
  return db.plants.find((plant) => plant.userId === userId) ?? null;
}

export async function createUserWithPlant(email: string, passwordHash: string) {
  const db = await readDatabase();
  const existingUser = db.users.find((user) => user.email === email);

  if (existingUser) {
    throw new Error("USER_EXISTS");
  }

  const now = new Date().toISOString();
  const user: UserRecord = {
    id: randomUUID(),
    email,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  const plant: PlantRecord = {
    id: randomUUID(),
    userId: user.id,
    stage: "SEED",
    health: 82,
    moisture: 68,
    growthPoints: 0,
    lastWateredAt: null,
    currentWeather: "CLOUDY",
    lastUpdatedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(user);
  db.plants.push(plant);
  await writeDatabase(db);

  return { user, plant };
}

export async function updatePlantRecord(updatedPlant: PlantRecord) {
  const db = await readDatabase();
  const index = db.plants.findIndex((plant) => plant.id === updatedPlant.id);

  if (index === -1) {
    return null;
  }

  db.plants[index] = updatedPlant;
  await writeDatabase(db);
  return updatedPlant;
}