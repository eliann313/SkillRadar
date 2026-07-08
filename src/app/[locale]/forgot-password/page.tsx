"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/lib/auth-actions";
import { toast } from "sonner";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
    const t = useTranslations("Auth");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsLoading(true);

        try {
            const res = await requestPasswordResetAction(email);
            if (res.success) {
                toast.success(res.message);
                setIsSubmitted(true);
            } else {
                toast.error(res.error || "Ocurrió un error.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Ocurrió un error inesperado.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-xl bg-primary/10 glow-emerald transition-all duration-300">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-8 text-primary"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">SkillRadar</h1>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">{t("resetPasswordTitle")}</CardTitle>
                        <CardDescription>
                            {isSubmitted ? t("forgotPasswordSuccessDesc") : t("forgotPasswordDesc")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isSubmitted ? (
                            <div className="flex flex-col gap-4 text-center">
                                <div className="p-4 rounded-xl bg-primary/5 text-sm text-muted-foreground border border-primary/10">
                                    {t("forgotPasswordSuccessMessage", { email })}
                                </div>
                                <Link
                                    href="/login"
                                    className="mt-2 text-sm text-primary hover:underline flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="size-4" /> {t("backToLogin")}
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <Label htmlFor="email">{t("emailLabel")}</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder={t("emailPlaceholder")}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9"
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full gap-2 mt-2" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            {t("sending")}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="size-4" />
                                            {t("sendLinkBtn")}
                                        </>
                                    )}
                                </Button>

                                <Link
                                    href="/login"
                                    className="text-sm text-muted-foreground hover:text-foreground hover:underline text-center flex items-center justify-center gap-2 mt-2"
                                >
                                    <ArrowLeft className="size-4" /> {t("backToLogin")}
                                </Link>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
