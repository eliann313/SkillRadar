"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordAction } from "@/lib/auth-actions";
import { toast } from "sonner";
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

function ResetPasswordForm() {
    const t = useTranslations("Auth");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Validaciones en tiempo real
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const passwordsMatch = password === confirmPassword && password.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            toast.error("Falta el token de restablecimiento.");
            return;
        }

        if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber) {
            toast.error("La contraseña no cumple con los requisitos de seguridad.");
            return;
        }

        if (!passwordsMatch) {
            toast.error("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);

        try {
            const res = await resetPasswordAction({ token, password });
            if (res.success) {
                toast.success(res.message);
                setIsSuccess(true);
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

    if (!token) {
        return (
            <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center">
                    <AlertTriangle className="mx-auto size-12 text-destructive mb-2" />
                    <CardTitle className="text-destructive">{t("invalidTokenTitle")}</CardTitle>
                    <CardDescription>{t("invalidTokenDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <Link href="/login" className="text-sm text-primary hover:underline">
                        {t("backToLogin")}
                    </Link>
                </CardContent>
            </Card>
        );
    }

    if (isSuccess) {
        return (
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm shadow-xl">
                <CardHeader className="text-center">
                    <CheckCircle2 className="mx-auto size-12 text-primary mb-2" />
                    <CardTitle>{t("successResetTitle")}</CardTitle>
                    <CardDescription>{t("successResetDesc")}</CardDescription>
                </CardHeader>
                <CardContent className="text-center flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">{t("successResetNext")}</p>
                    <Link href="/login" className="text-sm text-primary hover:underline font-semibold">
                        {t("signInNow")}
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl">{t("newPasswordTitle")}</CardTitle>
                <CardDescription>{t("newPasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
                    {/* Contraseña */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="password">{t("newPasswordLabel")}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-9 pr-9"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 size-4 text-muted-foreground hover:text-foreground"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar Contraseña */}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="confirmPassword">{t("confirmPasswordLabel")}</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-9 pr-9"
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Indicadores de Requisitos */}
                    <div className="text-xs space-y-1.5 my-1 p-3 rounded-lg bg-muted/40">
                        <p className="font-semibold text-muted-foreground">{t("requirementsTitle")}</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`size-1.5 rounded-full ${hasMinLength ? "bg-primary" : "bg-muted-foreground"}`}
                                />
                                <span className={hasMinLength ? "text-primary" : "text-muted-foreground"}>
                                    {t("reqMinLength")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`size-1.5 rounded-full ${hasUppercase ? "bg-primary" : "bg-muted-foreground"}`}
                                />
                                <span className={hasUppercase ? "text-primary" : "text-muted-foreground"}>
                                    {t("reqUppercase")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`size-1.5 rounded-full ${hasLowercase ? "bg-primary" : "bg-muted-foreground"}`}
                                />
                                <span className={hasLowercase ? "text-primary" : "text-muted-foreground"}>
                                    {t("reqLowercase")}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div
                                    className={`size-1.5 rounded-full ${hasNumber ? "bg-primary" : "bg-muted-foreground"}`}
                                />
                                <span className={hasNumber ? "text-primary" : "text-muted-foreground"}>
                                    {t("reqNumber")}
                                </span>
                            </div>
                        </div>
                        <div className="pt-1.5 border-t border-border/40 flex items-center gap-1.5">
                            <div
                                className={`size-1.5 rounded-full ${passwordsMatch ? "bg-primary" : "bg-muted-foreground"}`}
                            />
                            <span className={passwordsMatch ? "text-primary" : "text-muted-foreground"}>
                                {t("reqMatch")}
                            </span>
                        </div>
                    </div>
                    <Button
                        type="submit"
                        className="w-full gap-2 mt-1"
                        disabled={
                            isLoading ||
                            !hasMinLength ||
                            !hasUppercase ||
                            !hasLowercase ||
                            !hasNumber ||
                            !passwordsMatch
                        }
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />
                                {t("resettingBtn")}
                            </>
                        ) : (
                            t("resetPasswordTitle")
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    const t = useTranslations("Auth");

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

                <Suspense
                    fallback={
                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-xl p-6 text-center">
                            <Loader2 className="size-8 animate-spin mx-auto text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">{t("loading")}</p>
                        </Card>
                    }
                >
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}
