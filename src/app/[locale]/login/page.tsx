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
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm animate-pulse">
                    Cargando formulario...
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
