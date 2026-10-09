"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ShieldCheck, Clock } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { requestRecruiterVerification } from "@/infrastructure/recruiter-guard";

export function RecruiterVerificationGate({ requested }: { requested: boolean }) {
    const t = useTranslations("Recruiter");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [sent, setSent] = useState(requested);

    const handleSend = async () => {
        setSaving(true);
        try {
            const res = await requestRecruiterVerification(note);
            if (res.success) {
                if ("autoApproved" in res && res.autoApproved) {
                    toast.success(t("verificationAutoApproved"));
                    window.location.reload();
                    return;
                }
                setSent(true);
                toast.success(t("verificationSent"));
            } else {
                toast.error(res.error);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="mx-auto w-full max-w-xl border-border/50 bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {sent ? <Clock className="size-5 text-warning" /> : <ShieldCheck className="size-5 text-primary" />}
                    {t(sent ? "verificationPendingTitle" : "verificationTitle")}
                </CardTitle>
                <CardDescription>{t(sent ? "verificationPendingDesc" : "verificationDesc")}</CardDescription>
            </CardHeader>
            {!sent && (
                <CardContent className="flex flex-col gap-3">
                    <Textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={t("verificationNotePh")}
                        rows={4}
                        maxLength={500}
                    />
                    <Button
                        onClick={() => void handleSend()}
                        disabled={saving || note.trim().length < 10}
                        className="w-fit"
                    >
                        {t("verificationSubmit")}
                    </Button>
                </CardContent>
            )}
        </Card>
    );
}
