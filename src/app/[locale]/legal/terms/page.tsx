import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <FileText className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Términos de Servicio</h1>
                            <p className="text-xs text-muted-foreground mt-0.5">Última actualización: Julio 2026</p>
                        </div>
                    </div>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <ArrowLeft className="size-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">1. Aceptación de los Términos</h2>
                        <p>
                            Al registrarte y utilizar la plataforma SkillRadar (el &ldquo;Servicio&rdquo;), aceptas
                            cumplir y quedar sujeto a los siguientes Términos de Servicio. Si no estás de acuerdo con
                            estos términos, no debes utilizar el Servicio.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">2. Descripción del Servicio</h2>
                        <p>
                            SkillRadar es una plataforma basada en inteligencia artificial diseñada para analizar
                            perfiles profesionales de desarrolladores, optimizar currículums (CV), calcular afinidad con
                            ofertas laborales (Job Matching) y conectar talento con reclutadores.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            3. Cuentas de Usuario y Responsabilidad
                        </h2>
                        <p>
                            Eres responsable de mantener la seguridad y confidencialidad de tu cuenta y contraseña.
                            Además, declaras que toda la información que proporcionas al Servicio (incluyendo CVs
                            cargados y datos de perfil) es verídica, exacta y te pertenece o cuentas con la autorización
                            necesaria para utilizarla.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">4. Uso de API Keys de Terceros</h2>
                        <p>
                            SkillRadar permite a los usuarios avanzados configurar sus propias API keys de proveedores
                            de Modelos de Lenguaje (LLM) como Google Gemini, OpenAI, Anthropic y Groq. Al configurar tus
                            propias claves, aceptas que el contenido enviado a través de la plataforma será procesado
                            por dichos proveedores y queda sujeto a sus propios términos de uso y políticas de
                            privacidad.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            5. Uso Responsable de la Información del Candidato
                        </h2>
                        <p>
                            Para los reclutadores: La información obtenida a través de SkillRadar (incluyendo datos de
                            contacto revelados tras la aprobación del doble ciego) debe tratarse con la máxima
                            confidencialidad. Queda estrictamente prohibido utilizar dicha información para fines
                            distintos a la evaluación de vacantes de empleo específicas, ni compartirla con terceros no
                            autorizados.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">6. Limitación de Responsabilidad</h2>
                        <p>
                            El Servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;. No
                            garantizamos que los análisis de IA sean 100% exactos o estén libres de errores. En ningún
                            caso SkillRadar será responsable de daños directos, indirectos, incidentales o consecuentes
                            derivados del uso o imposibilidad de uso del Servicio.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">7. Modificaciones</h2>
                        <p>
                            Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso
                            continuado del Servicio tras la publicación de cambios constituye la aceptación de los
                            nuevos Términos de Servicio.
                        </p>
                    </section>
                </div>

                <div className="border-t border-border pt-6 flex items-center justify-between text-xs">
                    <p>© 2026 SkillRadar. Todos los derechos reservados.</p>
                    <Link href="/legal/privacy" className="text-primary hover:underline">
                        Política de Privacidad
                    </Link>
                </div>
            </div>
        </main>
    );
}
