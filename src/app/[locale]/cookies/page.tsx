import Link from "next/link";
import { Cookie, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: "Cookies",
        description:
            locale === "es"
                ? "Qué cookies y almacenamiento local usa SkillRadar: sesión, idioma y preferencias. Sin rastreo."
                : "What cookies and local storage SkillRadar uses: session, language and preferences. No tracking.",
        alternates: {
            canonical: `/${locale}/cookies`,
            languages: { es: "/es/cookies", en: "/en/cookies" },
        },
    };
}

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function CookiesPage({ params }: PageProps) {
    const { locale } = await params;
    const isEs = locale === "es";

    const cookies = isEs
        ? [
              {
                  name: "authjs.session-token",
                  purpose: "Mantiene tu sesión iniciada. Sin ella no hay login.",
                  type: "Esencial",
              },
              {
                  name: "authjs.csrf-token",
                  purpose: "Protege el inicio de sesión contra ataques CSRF.",
                  type: "Esencial · seguridad",
              },
              {
                  name: "authjs.callback-url",
                  purpose: "Recuerda a dónde volver después del login.",
                  type: "Esencial",
              },
              {
                  name: "NEXT_LOCALE",
                  purpose: "Recuerda tu idioma (español o inglés).",
                  type: "Funcional",
              },
          ]
        : [
              {
                  name: "authjs.session-token",
                  purpose: "Keeps you signed in. No login works without it.",
                  type: "Essential",
              },
              {
                  name: "authjs.csrf-token",
                  purpose: "Protects sign-in against CSRF attacks.",
                  type: "Essential · security",
              },
              {
                  name: "authjs.callback-url",
                  purpose: "Remembers where to return after sign-in.",
                  type: "Essential",
              },
              {
                  name: "NEXT_LOCALE",
                  purpose: "Remembers your language (Spanish or English).",
                  type: "Functional",
              },
          ];

    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <Cookie className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Cookies</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isEs ? "Última actualización: Septiembre 2026" : "Last updated: September 2026"}
                            </p>
                        </div>
                    </div>
                    <Link href={`/${locale}`}>
                        <Button variant="ghost" size="sm" className="gap-1">
                            <ArrowLeft className="size-4" />
                            {isEs ? "Volver" : "Back"}
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                    <p>
                        {isEs
                            ? "SkillRadar usa el mínimo de cookies necesario para funcionar. No usamos cookies de analítica, publicidad ni rastreo de terceros."
                            : "SkillRadar uses the minimum cookies needed to work. No analytics, advertising or third-party tracking cookies."}
                    </p>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEs ? "1. Cookies que usamos" : "1. Cookies we use"}
                        </h2>
                        <div className="overflow-hidden rounded-xl border border-border/40">
                            <table className="w-full text-left text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-border/40 bg-muted/30">
                                        <th className="px-4 py-2.5 font-bold text-foreground">
                                            {isEs ? "Cookie" : "Cookie"}
                                        </th>
                                        <th className="px-4 py-2.5 font-bold text-foreground">
                                            {isEs ? "Finalidad" : "Purpose"}
                                        </th>
                                        <th className="px-4 py-2.5 font-bold text-foreground">
                                            {isEs ? "Tipo" : "Type"}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cookies.map((c) => (
                                        <tr key={c.name} className="border-b border-border/20 last:border-0">
                                            <td className="px-4 py-2.5 font-mono text-foreground">{c.name}</td>
                                            <td className="px-4 py-2.5">{c.purpose}</td>
                                            <td className="px-4 py-2.5 whitespace-nowrap">{c.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-xs">
                            {isEs
                                ? "La cookie de sesión es httpOnly: ningún script del navegador puede leerla, lo que la protege contra robo por XSS."
                                : "The session cookie is httpOnly: no browser script can read it, which protects it against XSS theft."}
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEs ? "2. Almacenamiento local (no son cookies)" : "2. Local storage (not cookies)"}
                        </h2>
                        <p>
                            {isEs
                                ? "Tu navegador guarda dos preferencias solo en tu dispositivo, sin enviarse al servidor: el tema claro/oscuro (clave theme) y los grupos abiertos del menú lateral (clave sr-sidebar-groups). Se pueden borrar desde las herramientas del navegador sin afectar tu cuenta."
                                : "Your browser stores two preferences on your device only, never sent to the server: the light/dark theme (theme key) and the sidebar open groups (sr-sidebar-groups key). They can be cleared from browser devtools without affecting your account."}
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            {isEs ? "3. Cómo gestionarlas" : "3. How to manage them"}
                        </h2>
                        <p>
                            {isEs
                                ? "Podés borrar todas las cookies desde la configuración de tu navegador. Si borrás la de sesión, simplemente se cerrará tu sesión. Al no usar cookies opcionales, no mostramos banner de consentimiento: no hay nada que aceptar."
                                : "You can delete all cookies from your browser settings. Clearing the session cookie simply signs you out. Since we use no optional cookies, there is no consent banner: there is nothing to accept."}
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
