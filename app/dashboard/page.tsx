import { redirect } from "next/navigation";
import { PlantDashboard } from "@/app/dashboard/PlantDashboard";
import { getServerSession } from "@/lib/auth";
import { getSerializedPlantForUser } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const plant = await getSerializedPlantForUser(session.sub);

  if (!plant) {
    redirect("/login");
  }

  return <PlantDashboard initialPlant={plant} userEmail={session.email} />;
}
