import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageProps {
    params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PageProps) {
    const { locale } = await params;
    const isEs = locale === "es";

    return (
        <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 sm:p-10 shadow-xl">
                <div className="flex items-center justify-between border-b border-border pb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                            <Shield className="size-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                {isEs ? "Política de Privacidad" : "Privacy Policy"}
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
                                    1. Información que Recolectamos
                                </h2>
                                <p>
                                    Recolectamos información personal identificable (PII) que nos proporcionas de forma
                                    voluntaria al registrarte, como tu nombre, dirección de correo electrónico, imagen
                                    de perfil e historial laboral. También almacenamos los documentos de Currículum (CV)
                                    que decides subir para su respectivo análisis técnico por parte de nuestro motor de
                                    inteligencia artificial.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">2. Uso de la Información</h2>
                                <p>
                                    Utilizamos tu información principalmente para proveer el Servicio, procesar los
                                    análisis automatizados, realizar el matching inteligente con ofertas laborales del
                                    Job Board, y facilitar la comunicación segura entre desarrolladores y reclutadores.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    3. El Flujo &ldquo;Doble Ciego&rdquo;
                                </h2>
                                <p>
                                    SkillRadar implementa de manera rigurosa un mecanismo de{" "}
                                    <strong>Doble Ciego</strong> para salvaguardar la privacidad de los desarrolladores.
                                    Tu información de contacto directo e identidad (nombre, foto, email, enlaces
                                    personales) permanecerán ocultos y serán omitidos de los payloads del cliente por el
                                    servidor para cualquier reclutador, hasta que apruebes formalmente una solicitud de
                                    contacto de su parte.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. Procesamiento por API Keys de Terceros (IA)
                                </h2>
                                <p>
                                    Si decides configurar tus propias API keys de inteligencia artificial (Google
                                    Gemini, OpenAI, Anthropic, Groq) en tus ajustes de cuenta, debes saber que el
                                    Servicio procesará y enviará los datos del currículum y de las ofertas de empleo
                                    directamente a las APIs oficiales de dichos proveedores. Estos datos son tratados de
                                    acuerdo a las directivas de privacidad comerciales de cada plataforma de LLMs.
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
                                        <strong>Derecho al Olvido (Eliminación de Cuenta):</strong> Puedes eliminar tu
                                        cuenta de forma permanente en cualquier momento desde tu panel de Ajustes. Toda
                                        tu información sensible y documentos asociados se borrarán en cascada de
                                        nuestros servidores inmediatamente.
                                    </li>
                                    <li>
                                        <strong>Portabilidad de Datos:</strong> Ofrecemos una herramienta de descarga
                                        instantánea en tus Ajustes que te permite exportar toda tu información personal
                                        y registros en un archivo estructurado en formato JSON.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    6. Cifrado de Datos y Seguridad
                                </h2>
                                <p>
                                    Toda la comunicación de datos se realiza a través de protocolos seguros HTTPS. Tus
                                    API keys configuradas en el servidor son cifradas mediante algoritmos simétricos
                                    autenticados <strong>AES-256-GCM</strong> y jamás son expuestas en el navegador ni
                                    enviadas al lado del cliente.
                                </p>
                            </section>
                        </>
                    ) : (
                        <>
                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
                                <p>
                                    We collect personally identifiable information (PII) that you voluntarily provide to
                                    us when registering, such as your name, email address, profile picture, and
                                    employment history. We also store the resume (CV) documents you choose to upload for
                                    technical analysis by our artificial intelligence engine.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">2. Use of Information</h2>
                                <p>
                                    We use your information primarily to provide the Service, process automated
                                    analyses, perform smart matching with job postings on the Job Board, and facilitate
                                    secure communication between developers and recruiters.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    3. The &ldquo;Double-Blind&rdquo; Flow
                                </h2>
                                <p>
                                    SkillRadar strictly implements a <strong>Double-Blind</strong> mechanism to
                                    safeguard developer privacy. Your direct contact information and identity (name,
                                    photo, email, personal links) will remain hidden and will be stripped from client
                                    payloads by the server for any recruiter, until you formally approve a contact
                                    request from them.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    4. Processing by Third-Party API Keys (AI)
                                </h2>
                                <p>
                                    If you decide to configure your own artificial intelligence API keys (Google Gemini,
                                    OpenAI, Anthropic, Groq) in your account settings, you should know that the Service
                                    will process and send the resume and job posting data directly to the official APIs
                                    of those providers. This data is handled in accordance with the commercial privacy
                                    policies of each LLM platform.
                                </p>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    5. GDPR: Right to be Forgotten and Portability
                                </h2>
                                <p>
                                    We comply with global personal data protection best practices and regulations such
                                    as GDPR:
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>
                                        <strong>Right to be Forgotten (Account Deletion):</strong> You can permanently
                                        delete your account at any time from your Settings panel. All your sensitive
                                        information and associated documents will be cascadingly deleted from our
                                        servers immediately.
                                    </li>
                                    <li>
                                        <strong>Data Portability:</strong> We offer an instant download tool in your
                                        Settings that allows you to export all your personal information and records in
                                        a structured JSON format.
                                    </li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h2 className="text-base font-semibold text-foreground">
                                    6. Data Encryption and Security
                                </h2>
                                <p>
                                    All data communication is performed over secure HTTPS protocols. Your configured API
                                    keys on the server are encrypted using <strong>AES-256-GCM</strong> authenticated
                                    symmetric algorithms and are never exposed in the browser or sent to the client
                                    side.
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
                    <Link href={`/${locale}/legal/terms`} className="text-primary hover:underline font-semibold">
                        {isEs ? "Términos de Servicio" : "Terms of Service"}
                    </Link>
                </div>
            </div>
        </main>
    );
}
