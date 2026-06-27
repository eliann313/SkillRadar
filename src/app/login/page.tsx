import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth";

export default async function LoginPage() {
    const session = await auth();

    // Si ya está autenticado, redirigir directo al dashboard
    if (session?.user?.role) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-background">
            <LoginForm />
        </main>
    );
}
