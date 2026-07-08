import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import React from "react";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const session = await auth();

    // 404 estricto si no es administrador (evita filtrar que la ruta existe)
    if (session?.user?.role !== "admin") {
        notFound();
    }

    return <div className="min-h-screen bg-background">{children}</div>;
}
