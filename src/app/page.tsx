import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth";

export default async function Home() {
  const session = await auth();

  // Si ya tiene una sesión con rol, redirigir directo al dashboard
  if (session?.user?.role) {
    redirect("/dashboard");
  }

  return <LoginForm />;
}
