import Link from "next/link";
import { BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    return {
        title: locale === "es" ? "Documentación" : "Documentation",
        description:
            locale === "es"
                ? "Cómo funciona SkillRadar: puntaje ATS, doble ciego, BYOK, demo y límites."
                : "How SkillRadar works: ATS scoring, double-blind, BYOK, demo and limits.",
        alternates: {
            canonical: `/${locale}/docs`,
            languages: { es: "/es/docs", en: "/en/docs" },
        },
    };
}

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function DocsPage({ params }: PageProps) {
    const { locale } = await params;
    const isEs = locale === "es";

    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <BookOpen className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEs ? "Documentación" : "Documentation"}
                            </h1>
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
                    {isEs ? (
                        <>
                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">1. Qué es SkillRadar</h2>
                                <p>
                                    SkillRadar analiza tu CV contra estándares ATS reales, lo cruza con ofertas del Job
                                    Board y te muestra brechas accionables. Para reclutadores, ofrece un Talent Pool con
                                    doble ciego y pipeline de seguimiento.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    2. Cómo funciona el puntaje ATS
                                </h2>
                                <p>
                                    El puntaje es <strong>aditivo desde base 0</strong>: cada análisis parte de 0 y suma
                                    puntos en 5 dimensiones (experiencia, habilidades, educación, formato y palabras
                                    clave). Cada punto ganado cita la evidencia exacta de tu CV. Verás siempre el
                                    desglose completo y las citas: si un punto no tiene evidencia, no se otorga.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">3. Doble ciego</h2>
                                <p>
                                    Tu nombre, email, foto y usuario de GitHub permanecen ocultos para los reclutadores
                                    hasta que aceptás una solicitud de contacto. En el pool aparecés como un ID anónimo
                                    con scores y justificación. Al aceptar, se habilitan tus datos y se abre un hilo de
                                    contacto.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. BYOK: usá tus propias API keys
                                </h2>
                                <p>
                                    En Ajustes podés conectar tus propias keys de OpenAI, Anthropic, Google, Groq u
                                    OpenRouter. Se cifran con AES-256-GCM antes de guardarse y solo se descifran en
                                    memoria del servidor al usarlas. Sin keys propias, la app usa un motor offline
                                    determinista (etiquetado como &ldquo;sin IA&rdquo;).
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    5. Demo y límites del plan gratuito
                                </h2>
                                <p>
                                    La{" "}
                                    <Link
                                        href={`/${locale}/demo`}
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        demo interactiva
                                    </Link>{" "}
                                    muestra resultados de ejemplo sin crear cuenta. Con cuenta gratuita tenés 5 análisis
                                    de CV, 3 matches y 2 entrevistas simuladas; el plan Pro los hace ilimitados y
                                    habilita BYOK.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">6. Soporte y contacto</h2>
                                <p>
                                    Para errores, preguntas o sugerencias, abrí un issue en{" "}
                                    <a
                                        href="https://github.com/eliann313/SkillRadar/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        GitHub Issues
                                    </a>
                                    . Para privacidad y datos personales, escribinos por esa misma vía con la etiqueta{" "}
                                    <code>privacy</code>.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">1. What SkillRadar is</h2>
                                <p>
                                    SkillRadar scores your CV against real ATS standards, matches it with Job Board
                                    postings and shows actionable gaps. For recruiters, it offers a double-blind Talent
                                    Pool with a tracking pipeline.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">2. How the ATS score works</h2>
                                <p>
                                    Scoring is <strong>additive from a 0 base</strong>: every analysis starts at 0 and
                                    adds points across 5 dimensions (experience, skills, education, format, keywords).
                                    Each point cites exact evidence from your CV. You always see the full breakdown: no
                                    evidence, no points.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">3. Double-blind</h2>
                                <p>
                                    Your name, email, photo and GitHub username stay hidden from recruiters until you
                                    accept a contact request. In the pool you appear as an anonymous ID with scores and
                                    rationale. Accepting reveals your data and opens a contact thread.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. BYOK: bring your own API keys
                                </h2>
                                <p>
                                    In Settings you can connect your own OpenAI, Anthropic, Google, Groq or OpenRouter
                                    keys. They are encrypted with AES-256-GCM before storage and only decrypted in
                                    server memory when used. Without your own keys, the app uses a deterministic offline
                                    engine (labeled &ldquo;no AI&rdquo;).
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    5. Demo and free plan limits
                                </h2>
                                <p>
                                    The{" "}
                                    <Link
                                        href={`/${locale}/demo`}
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        interactive demo
                                    </Link>{" "}
                                    shows sample results without signing up. A free account includes 5 CV analyses, 3
                                    matches and 2 mock interviews; the Pro plan makes them unlimited and enables BYOK.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">6. Support and contact</h2>
                                <p>
                                    For bugs, questions or suggestions, open an issue on{" "}
                                    <a
                                        href="https://github.com/eliann313/SkillRadar/issues"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        GitHub Issues
                                    </a>
                                    . For privacy and personal data matters, use the same channel with the{" "}
                                    <code>privacy</code> label.
                                </p>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
