import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth";
import { Suspense } from "react";

export default async function LoginPage() {
    const session = await auth();

    // Si ya está autenticado, redirigir directo al dashboard
    if (session?.user?.role) {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24 bg-background">
            <Suspense
                fallback={<div className="text-muted-foreground text-sm animate-pulse">Cargando formulario...</div>}
            >
                <LoginForm />
            </Suspense>
        </main>
    );
}
