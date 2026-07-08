import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Briefcase, MessageSquare, ArrowRight, Rocket } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Home" });
    return {
        title: t("title"),
        description: t("description"),
    };
}

export default async function Home({ params: _params }: { params: Promise<{ locale: string }> }) {
    const session = await auth();

    // Redirigir al dashboard si ya tiene sesión activa
    if (session?.user?.role) {
        redirect("/dashboard");
    }

    const t = await getTranslations("Home");

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
            {/* Background decorative gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

            {/* Navigation Header */}
            <header className="border-b border-border/40 bg-background/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                        <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-background text-lg shadow-lg shadow-primary/20">
                            SR
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                            SkillRadar
                        </span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-sm hover:bg-muted/80">
                                {t("signIn")}
                            </Button>
                        </Link>
                        <Link href="/login?register=true">
                            <Button
                                size="sm"
                                className="shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                {t("getStarted")}
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col justify-center items-center">
                <section className="container mx-auto px-6 py-20 text-center flex flex-col items-center max-w-4xl relative">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary font-semibold mb-6 animate-pulse">
                        <Sparkles className="size-3.5" />
                        {t("tag")}
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-balance">
                        {t.rich("heroTitle", {
                            bold: (chunks) => (
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald to-accent">
                                    {chunks}
                                </span>
                            ),
                        })}
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 text-balance font-medium">
                        {t("heroSubtitle")}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-16">
                        <Link href="/login?register=true" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Rocket className="size-5" />
                                {t("startFree")}
                            </Button>
                        </Link>
                        <Link href="#features" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full gap-2 text-base font-semibold border-border/80 hover:bg-muted/40 transition-colors"
                            >
                                {t("exploreFeatures")}
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Feature Cards Grid */}
                    <div id="features" className="grid gap-6 md:grid-cols-3 w-full text-left mt-8 scroll-mt-20">
                        {/* CV Analysis */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{t("feature1Title")}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t("feature1Desc")}</p>
                            </div>
                        </div>

                        {/* Job Match */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Briefcase className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{t("feature2Title")}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t("feature2Desc")}</p>
                            </div>
                        </div>

                        {/* Mock Interviews */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <MessageSquare className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">{t("feature3Title")}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{t("feature3Desc")}</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/20 py-8 bg-background/30 backdrop-blur-sm">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>{t("footerText")}</p>
                    <div className="flex gap-4">
                        <Link href="/legal/privacy" className="hover:text-foreground transition-colors">
                            {t("privacyPolicy")}
                        </Link>
                        <Link href="/legal/terms" className="hover:text-foreground transition-colors">
                            {t("termsOfService")}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
