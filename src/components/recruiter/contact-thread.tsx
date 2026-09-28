"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    getThreadMessagesAction,
    sendThreadMessageAction,
    type ThreadMessage,
} from "@/features/contact-thread/actions";

export function ContactThread({ requestId }: { requestId: string }) {
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await getThreadMessagesAction(requestId);
            if (!cancelled) {
                if (res.success) setMessages(res.data);
                setLoading(false);
            }
        })().catch(() => setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [requestId]);

    const handleSend = async () => {
        if (!draft.trim() || sending) return;
        setSending(true);
        try {
            const res = await sendThreadMessageAction(requestId, draft);
            if (res.success) {
                setMessages((prev) => [...prev, res.data]);
                setDraft("");
            } else {
                toast.error(res.error);
            }
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-border/40 bg-muted/20 p-3">
                {loading ? (
                    <p className="text-xs text-muted-foreground">Cargando conversación...</p>
                ) : messages.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                        Sin mensajes todavía. Escribe el primero para romper el hielo.
                    </p>
                ) : (
                    messages.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                "max-w-[85%] rounded-lg px-3 py-2 text-xs",
                                m.isMine
                                    ? "self-end bg-primary/15 text-foreground"
                                    : "self-start bg-card text-muted-foreground border border-border/40",
                            )}
                        >
                            {m.body}
                        </div>
                    ))
                )}
            </div>
            <div className="flex gap-2">
                <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    maxLength={2000}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") void handleSend();
                    }}
                />
                <Button
                    type="button"
                    size="icon"
                    aria-label="Enviar mensaje"
                    onClick={() => void handleSend()}
                    disabled={sending || !draft.trim()}
                >
                    <Send className="size-4" />
                </Button>
            </div>
        </div>
    );
}
