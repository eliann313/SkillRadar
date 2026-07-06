import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <Shield className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Política de Privacidad</h1>
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
                        <h2 className="text-base font-semibold text-foreground">1. Información que Recolectamos</h2>
                        <p>
                            Recolectamos información personal identificable (PII) que nos proporcionas de forma
                            voluntaria al registrarte, como tu nombre, dirección de correo electrónico, imagen de perfil
                            e historial laboral. También almacenamos los documentos de Currículum (CV) que decides subir
                            para su respectivo análisis técnico por parte de nuestro motor de inteligencia artificial.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">2. Uso de la Información</h2>
                        <p>
                            Utilizamos tu información principalmente para proveer el Servicio, procesar los análisis
                            automatizados, realizar el matching inteligente con ofertas laborales del Job Board, y
                            facilitar la comunicación segura entre desarrolladores y reclutadores.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            3. El Flujo &ldquo;Doble Ciego&rdquo;
                        </h2>
                        <p>
                            SkillRadar implementa de manera rigurosa un mecanismo de <strong>Doble Ciego</strong> para
                            salvaguardar la privacidad de los desarrolladores. Tu información de contacto directo e
                            identidad (nombre, foto, email, enlaces personales) permanecerán ocultos y serán omitidos de
                            los payloads del cliente por el servidor para cualquier reclutador, hasta que apruebes
                            formalmente una solicitud de contacto de su parte.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            4. Procesamiento por API Keys de Terceros (IA)
                        </h2>
                        <p>
                            Si decides configurar tus propias API keys de inteligencia artificial (Google Gemini,
                            OpenAI, Anthropic, Groq) en tus ajustes de cuenta, debes saber que el Servicio procesará y
                            enviará los datos del currículum y de las ofertas de empleo directamente a las APIs
                            oficiales de dichos proveedores. Estos datos son tratados de acuerdo a las directivas de
                            privacidad comerciales de cada plataforma de LLMs.
                        </p>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">
                            5. GDPR: Derecho al Olvido y Portabilidad
                        </h2>
                        <p>
                            Cumplimos con las mejores prácticas globales de protección de datos personales y
                            regulaciones como GDPR:
                        </p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>
                                <strong>Derecho al Olvido (Eliminación de Cuenta):</strong> Puedes eliminar tu cuenta de
                                forma permanente en cualquier momento desde tu panel de Ajustes. Toda tu información
                                sensible y documentos asociados se borrarán en cascada de nuestros servidores
                                inmediatamente.
                            </li>
                            <li>
                                <strong>Portabilidad de Datos:</strong> Ofrecemos una herramienta de descarga
                                instantánea en tus Ajustes que te permite exportar toda tu información personal y
                                registros en un archivo estructurado en formato JSON.
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-2">
                        <h2 className="text-base font-semibold text-foreground">6. Cifrado de Datos y Seguridad</h2>
                        <p>
                            Toda la comunicación de datos se realiza a través de protocolos seguros HTTPS. Tus API keys
                            configuradas en el servidor son cifradas mediante algoritmos simétricos autenticados{" "}
                            <strong>AES-256-GCM</strong> y jamás son expuestas en el navegador ni enviadas al lado del
                            cliente.
                        </p>
                    </section>
                </div>

                <div className="border-t border-border pt-6 flex items-center justify-between text-xs">
                    <p>© 2026 SkillRadar. Todos los derechos reservados.</p>
                    <Link href="/legal/terms" className="text-primary hover:underline">
                        Términos de Servicio
                    </Link>
                </div>
            </div>
        </main>
    );
}
