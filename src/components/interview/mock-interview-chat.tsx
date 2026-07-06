"use client";

import { useState, useRef, useEffect } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { startInterviewAction, saveInterviewMessagesAction, finishInterviewAction } from "@/features/interview/actions";
import { cn } from "@/lib/utils";
import { Send, Bot, User, Sparkles, CheckCircle2, Zap, Award as Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";

function serializeMessages(msgs: UIMessage[]): Array<{ role: string; content: string }> {
    return msgs.map((msg) => {
        let contentStr = "";
        if (msg.parts) {
            contentStr = msg.parts
                .filter((part) => part.type === "text")
                .map((part) => (part as { text: string }).text)
                .join("");
        }
        return {
            role: msg.role,
            content: contentStr,
        };
    });
}

export function MockInterviewChat() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isFinishing, setIsFinishing] = useState(false);
    const [debrief, setDebrief] = useState<{
        score: number;
        communicationScore: number;
        technicalScore: number;
        architectureScore: number;
        feedback: string;
        strengths: string[];
        improvements: string[];
    } | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const [input, setInput] = useState("");

    const { messages, sendMessage, status, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat/interview",
            body: {
                sessionId,
            },
        }),
        onFinish: ({ message }) => {
            if (sessionId) {
                const serialized = serializeMessages([...messages, message]);
                void saveInterviewMessagesAction(sessionId, serialized);
            }
        },
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Auto-scroll al fondo
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const startInterview = async () => {
        setIsStarting(true);
        try {
            const res = await startInterviewAction();
            if (res.success && res.data) {
                setSessionId(res.data.id);
                toast.success("Sesión de entrevista inicializada.");
                // Primer mensaje de bienvenida automático
                const initialMsg: UIMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant" as const,
                    parts: [
                        {
                            type: "text" as const,
                            text: "¡Hola! Bienvenido a tu simulación de entrevista técnica. Para empezar, cuéntame brevemente sobre tu experiencia general en desarrollo de software y qué tecnologías has dominado recientemente.",
                        },
                    ],
                };
                setMessages([initialMsg]);
                await saveInterviewMessagesAction(res.data.id, [
                    {
                        role: initialMsg.role,
                        content:
                            "¡Hola! Bienvenido a tu simulación de entrevista técnica. Para empezar, cuéntame brevemente sobre tu experiencia general en desarrollo de software y qué tecnologías has dominado recientemente.",
                    },
                ]);
            } else {
                toast.error(res.error || "No se pudo iniciar la entrevista.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ocurrió un error inesperado al iniciar.");
        } finally {
            setIsStarting(false);
        }
    };

    const handleFinish = async () => {
        if (!sessionId) return;
        setIsFinishing(true);

        const promise = finishInterviewAction(sessionId);

        toast.promise(promise, {
            loading: "Generando tu reporte cualitativo y calificaciones...",
            success: (res: {
                success: boolean;
                data?: {
                    score: number;
                    communicationScore: number;
                    technicalScore: number;
                    architectureScore: number;
                    feedback: string;
                    strengths: string[];
                    improvements: string[];
                };
                error?: string;
            }) => {
                if (res.success && res.data) {
                    setDebrief(res.data);
                    setIsFinishing(false);
                    return "¡Reporte compilado con éxito!";
                } else {
                    setIsFinishing(false);
                    throw new Error(res.error || "No se pudo compilar el debrief.");
                }
            },
            error: (err: Error) => {
                setIsFinishing(false);
                return err.message;
            },
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            // Ejecutar el submit del hook useChat
            const form = e.currentTarget.closest("form");
            if (form) form.requestSubmit();
        }
    };

    // Renderizado del Debrief (Reporte Final)
    if (debrief) {
        return (
            <div className="space-y-6 animate-fade-in">
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm shadow-xl p-6">
                    <CardHeader className="text-center pb-4">
                        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-primary/10 glow-emerald">
                            <Trophy className="size-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-black">Resultado de la Entrevista</CardTitle>
                        <CardDescription>Calificaciones estructuradas por el motor de IA de SkillRadar</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Scores Grid */}
                        <div className="grid gap-4 sm:grid-cols-4">
                            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Score Global</p>
                                <p className="text-3xl font-black text-primary mt-1">{debrief.score}%</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/50 bg-card/30 text-center">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Conocimiento Técnico
                                </p>
                                <p className="text-3xl font-black text-foreground mt-1">{debrief.technicalScore}%</p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/50 bg-card/30 text-center">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">Comunicación</p>
                                <p className="text-3xl font-black text-foreground mt-1">
                                    {debrief.communicationScore}%
                                </p>
                            </div>
                            <div className="p-4 rounded-xl border border-border/50 bg-card/30 text-center">
                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                    Arquitectura & Test
                                </p>
                                <p className="text-3xl font-black text-foreground mt-1">{debrief.architectureScore}%</p>
                            </div>
                        </div>

                        {/* Feedback Cualitativo */}
                        <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                            <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-2">
                                <Zap className="size-4 text-primary" />
                                Evaluación General
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">{debrief.feedback}</p>
                        </div>

                        {/* Fortalezas y Puntos de Mejora */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h4 className="font-bold text-sm text-emerald-500 mb-2 flex items-center gap-2">
                                    <CheckCircle2 className="size-4" />
                                    Fortalezas
                                </h4>
                                <ul className="space-y-1.5">
                                    {debrief.strengths.map((str, idx) => (
                                        <li
                                            key={idx}
                                            className="text-xs text-muted-foreground leading-relaxed flex gap-2"
                                        >
                                            <span className="text-emerald-500">•</span>
                                            <span>{str}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-primary mb-2 flex items-center gap-2">
                                    <Sparkles className="size-4" />
                                    Puntos de Mejora
                                </h4>
                                <ul className="space-y-1.5">
                                    {debrief.improvements.map((imp, idx) => (
                                        <li
                                            key={idx}
                                            className="text-xs text-muted-foreground leading-relaxed flex gap-2"
                                        >
                                            <span className="text-primary">•</span>
                                            <span>{imp}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="text-center pt-2">
                            <Button
                                onClick={() => {
                                    setDebrief(null);
                                    setSessionId(null);
                                    setMessages([]);
                                }}
                                className="gap-2"
                            >
                                Realizar Nueva Entrevista
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <Card className="flex h-[600px] flex-col border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader className="shrink-0 border-b border-border flex flex-row items-center justify-between py-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="size-5 text-primary" />
                        Simulador de Entrevista
                    </CardTitle>
                    <CardDescription>Práctica interactiva adaptada a tu perfil y CV</CardDescription>
                </div>
                {sessionId && !isFinishing && (
                    <Button variant="destructive" size="sm" onClick={() => void handleFinish()}>
                        Finalizar Entrevista
                    </Button>
                )}
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden p-0">
                {/* Scroll Area */}
                <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    {!sessionId ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4 py-24">
                            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                                <Sparkles className="size-8 text-primary animate-pulse" />
                            </div>
                            <div className="text-center">
                                <h3 className="font-semibold text-foreground">¿Listo para practicar?</h3>
                                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                                    Inicia una simulación de entrevista adaptada al CV y ofertas asociadas a tu cuenta.
                                </p>
                            </div>
                            <Button onClick={() => void startInterview()} className="gap-2" disabled={isStarting}>
                                {isStarting ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        <Bot className="size-4" />
                                        Comenzar Entrevista
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map((message: UIMessage) => {
                                const textContent = message.parts
                                    ? message.parts
                                          .filter((part) => part.type === "text")
                                          .map((part) => (part as { text: string }).text)
                                          .join("")
                                    : "";
                                return (
                                    <div
                                        key={message.id}
                                        className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
                                    >
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarFallback
                                                className={cn(
                                                    message.role === "assistant"
                                                        ? "bg-primary/10 text-primary"
                                                        : "bg-indigo/10 text-indigo",
                                                )}
                                            >
                                                {message.role === "assistant" ? (
                                                    <Bot className="size-4" />
                                                ) : (
                                                    <User className="size-4" />
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div
                                            className={cn(
                                                "max-w-[80%] rounded-2xl px-4 py-3",
                                                message.role === "assistant"
                                                    ? "rounded-tl-sm bg-muted text-sm text-foreground"
                                                    : "rounded-tr-sm bg-primary text-primary-foreground text-sm",
                                            )}
                                        >
                                            <p className="leading-relaxed whitespace-pre-wrap">{textContent}</p>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Loader de IA */}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            <Bot className="size-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
                                        <Skeleton className="size-2 rounded-full animate-bounce" />
                                        <Skeleton className="size-2 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <Skeleton className="size-2 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </ScrollArea>

                {/* Input Form */}
                {sessionId && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!input.trim() || isLoading || isFinishing) return;
                            void sendMessage({ text: input });
                            setInput("");
                        }}
                        className="shrink-0 border-t border-border p-4"
                    >
                        <div className="flex gap-3">
                            <Textarea
                                ref={inputRef}
                                placeholder="Escribe tu respuesta..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading || isFinishing}
                                className="min-h-[44px] max-h-32 resize-none"
                                rows={1}
                            />
                            <Button size="icon" type="submit" disabled={!input.trim() || isLoading || isFinishing}>
                                <Send className="size-4" />
                                <span className="sr-only">Enviar mensaje</span>
                            </Button>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Presiona Enter para enviar, Shift+Enter para salto de línea
                        </p>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
