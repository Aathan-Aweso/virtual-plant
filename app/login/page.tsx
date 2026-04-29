import { redirect } from "next/navigation";
import { AuthForm } from "@/app/components/AuthForm";
import { getServerSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return <AuthForm mode="login" />;
}
