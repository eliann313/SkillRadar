"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Send } from "lucide-react";

interface ContactRequestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message: string;
    onMessageChange: (value: string) => void;
    sending: boolean;
    onSend: () => void;
}

/** Modal de solicitud de contacto doble ciego (ex bloque del screen monolítico). */
export function ContactRequestDialog({
    open,
    onOpenChange,
    message,
    onMessageChange,
    sending,
    onSend,
}: ContactRequestDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md bg-popover text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Solicitar Datos de Contacto (Doble Ciego)</DialogTitle>
                    <DialogDescription>
                        Envía un mensaje al desarrollador para invitarlo a revelar su PII (Nombre, Email, Redes).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <label htmlFor="contact-message" className="text-xs font-semibold">
                            Mensaje de Propuesta *
                        </label>
                        <Textarea
                            id="contact-message"
                            rows={5}
                            value={message}
                            onChange={(e) => onMessageChange(e.target.value)}
                            placeholder="Hola, me gustaría conversar contigo sobre..."
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter showCloseButton>
                    <Button onClick={onSend} disabled={sending} className="flex items-center gap-1.5">
                        <Send className="size-4" />
                        <span>{sending ? "Enviando..." : "Enviar Solicitud"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
