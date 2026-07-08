import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function TermsPage({ params }: PageProps) {
    const { locale } = await params;
    const isEs = locale === "es";

    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <FileText className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEs ? "Términos de Servicio" : "Terms of Service"}
                            </h1>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {isEs ? "Última actualización: Julio 2026" : "Last updated: July 2026"}
                            </p>
                        </div>
                    </div>
                    <Link href={`/${locale}/login`}>
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
                                <h2 className="text-base font-semibold text-foreground">
                                    1. Aceptación de los Términos
                                </h2>
                                <p>
                                    Al registrarte y utilizar la plataforma SkillRadar (el &ldquo;Servicio&rdquo;),
                                    aceptas cumplir y quedar sujeto a los siguientes Términos de Servicio. Si no estás
                                    de acuerdo con estos términos, no debes utilizar el Servicio.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">2. Descripción del Servicio</h2>
                                <p>
                                    SkillRadar es una plataforma basada en inteligencia artificial diseñada para
                                    analizar perfiles profesionales de desarrolladores, optimizar currículums (CV),
                                    calcular afinidad con ofertas laborales (Job Matching) y conectar talento con
                                    reclutadores.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    3. Cuentas de Usuario y Responsabilidad
                                </h2>
                                <p>
                                    Eres responsable de mantener la seguridad y confidencialidad de tu cuenta y
                                    contraseña. Además, declaras que toda la información que proporcionas al Servicio
                                    (incluyendo CVs cargados y datos de perfil) es verídica, exacta y te pertenece o
                                    cuentas con la autorización necesaria para utilizarla.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. Uso de API Keys de Terceros
                                </h2>
                                <p>
                                    SkillRadar permite a los usuarios avanzados configurar sus propias API keys de
                                    proveedores de Modelos de Lenguaje (LLM) como Google Gemini, OpenAI, Anthropic y
                                    Groq. Al configurar tus propias claves, aceptas que el contenido enviado a través de
                                    la plataforma será procesado por dichos proveedores y queda sujeto a sus propios
                                    términos de uso y políticas de privacidad.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    5. Uso Responsable de la Información del Candidato
                                </h2>
                                <p>
                                    Para los reclutadores: La información obtenida a través de SkillRadar (incluyendo
                                    datos de contacto revelados tras la aprobación del doble ciego) debe tratarse con la
                                    máxima confidencialidad. Queda estrictamente prohibido utilizar dicha información
                                    para fines distintos a la evaluación de vacantes de empleo específicas, ni
                                    compartirla con terceros no autorizados.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    6. Limitación de Responsabilidad
                                </h2>
                                <p>
                                    El Servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según
                                    disponibilidad&rdquo;. No garantizamos que los análisis de IA sean 100% exactos o
                                    estén libres de errores. En ningún caso SkillRadar será responsable de daños
                                    directos, indirectos, incidentales o consecuentes derivados del uso o imposibilidad
                                    de uso del Servicio.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">7. Modificaciones</h2>
                                <p>
                                    Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso
                                    continuado del Servicio tras la publicación de cambios constituye la aceptación de
                                    los nuevos Términos de Servicio.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">1. Acceptance of Terms</h2>
                                <p>
                                    By registering and using the SkillRadar platform (the &ldquo;Service&rdquo;), you
                                    agree to comply with and be bound by the following Terms of Service. If you do not
                                    agree with these terms, you must not use the Service.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    2. Description of the Service
                                </h2>
                                <p>
                                    SkillRadar is an artificial intelligence powered platform designed to analyze
                                    developers&apos; professional profiles, optimize resumes (CVs), calculate affinity
                                    scores with job opportunities (Job Matching), and connect talent with recruiters.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    3. User Accounts and Responsibility
                                </h2>
                                <p>
                                    You are responsible for maintaining the security and confidentiality of your account
                                    and password. Additionally, you declare that all information you provide to the
                                    Service (including uploaded CVs and profile data) is true, accurate, and belongs to
                                    you or that you have the necessary authorization to use it.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. Use of Third-Party API Keys
                                </h2>
                                <p>
                                    SkillRadar allows advanced users to configure their own API keys from Language Model
                                    (LLM) providers such as Google Gemini, OpenAI, Anthropic, and Groq. By configuring
                                    your own keys, you agree that the content sent through the platform will be
                                    processed by those providers and is subject to their own terms of use and privacy
                                    policies.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    5. Responsible Use of Candidate Information
                                </h2>
                                <p>
                                    For recruiters: The information obtained through SkillRadar (including contact
                                    details revealed after double-blind approval) must be treated with the utmost
                                    confidentiality. It is strictly prohibited to use this information for purposes
                                    other than evaluating specific job vacancies, or to share it with unauthorized third
                                    parties.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">6. Limitation of Liability</h2>
                                <p>
                                    The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;. We do
                                    not guarantee that the AI analyses will be 100% accurate or free of errors. In no
                                    event shall SkillRadar be liable for any direct, indirect, incidental, or
                                    consequential damages resulting from the use or inability to use the Service.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">7. Modifications</h2>
                                <p>
                                    We reserve the right to modify these terms at any time. Continued use of the Service
                                    after changes are published constitutes acceptance of the new Terms of Service.
                                </p>
                            </section>
                        </>
                    )}
                </div>

                <div className="border-t border-border pt-6 flex items-center justify-between text-xs">
                    <p>
                        {isEs
                            ? "© 2026 SkillRadar. Todos los derechos reservados."
                            : "© 2026 SkillRadar. All rights reserved."}
                    </p>
                    <Link href={`/${locale}/legal/privacy`} className="text-primary hover:underline font-semibold">
                        {isEs ? "Política de Privacidad" : "Privacy Policy"}
                    </Link>
                </div>
            </div>
        </main>
    );
}
