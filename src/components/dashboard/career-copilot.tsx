"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Bot, X, MessageCircle, Send, Loader2, Minimize2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { getUserApiKeysStatusAction } from "@/app/[locale]/dashboard/settings/actions";

export function CareerCopilot() {
    const t = useTranslations("CareerCopilot");
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const [provider, setProvider] = useState("gemini");
    const [model, setModel] = useState("gemini-2.5-flash");
    const [providerKeys, setProviderKeys] = useState({
        gemini: true,
        groq: true,
        openrouter: true,
        openai: false,
        anthropic: false,
    });

    // Fetch user key settings and default AI preferences when the chat opens
    useEffect(() => {
        if (!isOpen) return;
        const fetchStatus = async () => {
            try {
                const res = await getUserApiKeysStatusAction();
                if (res && res.success && res.data) {
                    setProviderKeys({
                        gemini: true,
                        groq: true,
                        openrouter: true,
                        openai: res.data.hasOpenaiKey,
                        anthropic: res.data.hasAnthropicKey,
                    });
                    if (res.data.defaultAiProvider) {
                        setProvider(res.data.defaultAiProvider);
                    }
                    if (res.data.defaultAiModel) {
                        setModel(res.data.defaultAiModel);
                    }
                }
            } catch (err) {
                console.error("Error fetching API keys status for Career Copilot:", err);
            }
        };
        void fetchStatus();
    }, [isOpen]);

    const transport = useMemo(() => {
        return new DefaultChatTransport({
            api: "/api/chat/career-copilot",
            body: {
                provider,
                model,
            },
        });
    }, [provider, model]);

    const { messages, sendMessage, status } = useChat({
        transport,
    });

    const isLoading = status === "streaming" || status === "submitted";

    // Auto-scroll al fondo
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;
        void sendMessage({ text: trimmed });
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Visible para cualquier usuario autenticado
    if (!session?.user) return null;

    const isRecruiter = session.user.role === "recruiter";

    return (
        <>
            {/* Floating bubble */}
            {!isOpen && (
                <button
                    id="career-copilot-open"
                    onClick={() => setIsOpen(true)}
                    aria-label={t("openLabel")}
                    className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 text-primary-foreground transition-all hover:scale-110 hover:shadow-primary/50 active:scale-95"
                >
                    <MessageCircle className="size-6" />
                    {messages.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                            {messages.filter((m: UIMessage) => m.role === "assistant").length}
                        </span>
                    )}
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div
                    className={cn(
                        "fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-border/50 bg-background/95 shadow-2xl backdrop-blur-md transition-all duration-300",
                        isMinimized ? "h-14 w-72" : "h-[520px] w-[340px] sm:w-[380px]",
                    )}
                >
                    {/* Header */}
                    <div className="flex h-14 shrink-0 items-center justify-between rounded-t-2xl bg-primary/10 px-4 border-b border-border/30">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/20">
                                <Bot className="size-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground leading-none">{t("title")}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{t("subtitle")}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                onClick={() => setIsMinimized(!isMinimized)}
                                aria-label={isMinimized ? t("expandLabel") : t("minimizeLabel")}
                            >
                                <Minimize2 className="size-3.5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-7"
                                id="career-copilot-close"
                                onClick={() => setIsOpen(false)}
                                aria-label={t("closeLabel")}
                            >
                                <X className="size-3.5" />
                            </Button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {/* Model Selector Bar */}
                            <div className="flex items-center justify-between border-b border-border/20 bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground shrink-0 select-none">
                                <span className="font-medium tracking-wide">MODEL:</span>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={provider}
                                        onChange={(e) => {
                                            const newProvider = e.target.value;
                                            setProvider(newProvider);
                                            if (newProvider === "gemini") setModel("gemini-2.5-flash");
                                            else if (newProvider === "groq") setModel("llama-3.3-70b-versatile");
                                            else if (newProvider === "openrouter")
                                                setModel("google/gemini-2.5-flash:free");
                                            else if (newProvider === "openai") setModel("gpt-4o");
                                            else if (newProvider === "anthropic") setModel("claude-4.6-sonnet");
                                        }}
                                        className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none font-bold text-foreground text-[11px] cursor-pointer hover:text-primary transition-colors pr-1"
                                    >
                                        <option
                                            value="gemini"
                                            className="bg-popover text-popover-foreground font-semibold"
                                        >
                                            Gemini
                                        </option>
                                        <option
                                            value="groq"
                                            className="bg-popover text-popover-foreground font-semibold"
                                        >
                                            Groq
                                        </option>
                                        <option
                                            value="openrouter"
                                            className="bg-popover text-popover-foreground font-semibold"
                                        >
                                            OpenRouter
                                        </option>
                                        <option
                                            value="openai"
                                            disabled={!providerKeys.openai}
                                            className="bg-popover text-popover-foreground font-semibold"
                                        >
                                            OpenAI {!providerKeys.openai && "🔒"}
                                        </option>
                                        <option
                                            value="anthropic"
                                            disabled={!providerKeys.anthropic}
                                            className="bg-popover text-popover-foreground font-semibold"
                                        >
                                            Anthropic {!providerKeys.anthropic && "🔒"}
                                        </option>
                                    </select>
                                    <span className="text-muted-foreground/30">|</span>
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer max-w-[150px] truncate pr-1"
                                    >
                                        {provider === "gemini" && (
                                            <>
                                                <option
                                                    value="gemini-2.5-flash"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Gemini 2.5 Flash
                                                </option>
                                                <option
                                                    value="gemini-2.5-pro"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Gemini 2.5 Pro
                                                </option>
                                                <option
                                                    value="gemini-3.5-flash"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Gemini 3.5 Flash
                                                </option>
                                                <option
                                                    value="gemini-3.1-pro"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Gemini 3.1 Pro
                                                </option>
                                            </>
                                        )}
                                        {provider === "groq" && (
                                            <>
                                                <option
                                                    value="llama-3.3-70b-versatile"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Llama 3.3 70B
                                                </option>
                                                <option
                                                    value="mixtral-8x7b-32768"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Mixtral 8x7B
                                                </option>
                                            </>
                                        )}
                                        {provider === "openrouter" && (
                                            <>
                                                <option
                                                    value="google/gemini-2.5-flash:free"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Gemini 2.5 Free
                                                </option>
                                                <option
                                                    value="meta-llama/llama-3.1-70b-instruct:free"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Llama 3.1 Free
                                                </option>
                                            </>
                                        )}
                                        {provider === "openai" && (
                                            <>
                                                <option value="gpt-4o" className="bg-popover text-popover-foreground">
                                                    GPT-4o
                                                </option>
                                                <option value="gpt-5.5" className="bg-popover text-popover-foreground">
                                                    GPT-5.5
                                                </option>
                                                <option
                                                    value="gpt-5.5-instant"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    GPT-5.5 Instant
                                                </option>
                                            </>
                                        )}
                                        {provider === "anthropic" && (
                                            <>
                                                <option
                                                    value="claude-4.6-sonnet"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Claude 4.6 Sonnet
                                                </option>
                                                <option
                                                    value="claude-4.7-opus"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Claude 4.7 Opus
                                                </option>
                                                <option
                                                    value="claude-4.5-haiku"
                                                    className="bg-popover text-popover-foreground"
                                                >
                                                    Claude 4.5 Haiku
                                                </option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-3" ref={scrollRef}>
                                {messages.length === 0 ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
                                        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                                            <Bot className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{t("welcome")}</p>
                                            <p className="mt-1 text-xs text-muted-foreground max-w-[220px]">
                                                {isRecruiter ? t("descriptionRecruiter") : t("descriptionDeveloper")}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
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
                                                    className={cn(
                                                        "flex gap-2",
                                                        message.role === "user" && "flex-row-reverse",
                                                    )}
                                                >
                                                    <Avatar className="size-6 shrink-0 mt-0.5">
                                                        <AvatarFallback
                                                            className={cn(
                                                                "text-[10px]",
                                                                message.role === "assistant"
                                                                    ? "bg-primary/10 text-primary"
                                                                    : "bg-muted text-muted-foreground",
                                                            )}
                                                        >
                                                            {message.role === "assistant" ? (
                                                                <Bot className="size-3" />
                                                            ) : (
                                                                (session.user?.name?.[0]?.toUpperCase() ?? "U")
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className={cn(
                                                            "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                                                            message.role === "assistant"
                                                                ? "rounded-tl-sm bg-muted text-foreground"
                                                                : "rounded-tr-sm bg-primary text-primary-foreground",
                                                        )}
                                                    >
                                                        <p className="whitespace-pre-wrap">{textContent}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Typing indicator */}
                                        {isLoading && (
                                            <div className="flex gap-2">
                                                <Avatar className="size-6 shrink-0">
                                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                                                        <Bot className="size-3" />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 flex items-center gap-1">
                                                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:0ms]" />
                                                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:150ms]" />
                                                    <span className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:300ms]" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Input */}
                            <div className="shrink-0 border-t border-border/30 p-3">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSend();
                                    }}
                                    className="flex gap-2 items-end"
                                >
                                    <Textarea
                                        id="career-copilot-input"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={
                                            isRecruiter ? t("placeholderRecruiter") : t("placeholderDeveloper")
                                        }
                                        className="min-h-0 resize-none text-xs leading-relaxed py-2 max-h-24"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        id="career-copilot-send"
                                        disabled={!input.trim() || isLoading}
                                        className="size-9 shrink-0"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Send className="size-3.5" />
                                        )}
                                    </Button>
                                </form>
                                <p className="mt-1.5 text-[10px] text-muted-foreground/60 text-center">
                                    {t("keyboardInstructions")}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}
