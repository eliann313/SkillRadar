import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
    Sparkles,
    FileText,
    Briefcase,
    MessageSquare,
    ArrowRight,
    Rocket,
    ShieldCheck,
    Upload,
    EyeOff,
    KeyRound,
    Menu,
    Check,
    FlaskConical,
    Quote,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher, ThemeToggle } from "@/components/layout";
import { ScorePreview } from "@/components/landing/score-preview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Home" });
    return {
        title: t("title"),
        description: t("description"),
        alternates: {
            canonical: `/${locale}`,
            languages: { es: "/es", en: "/en" },
        },
    };
}

export default async function Home({ params: _params }: { params: Promise<{ locale: string }> }) {
    const session = await auth();

    // Redirigir al dashboard si ya tiene sesión activa
    if (session?.user?.role) {
        redirect("/dashboard");
    }

    void _params;
    const t = await getTranslations("Home");

    const faqItems = [1, 2, 3, 4, 5, 6].map((n) => ({
        q: t(`faqQ${n}`),
        a: t(`faqA${n}`),
    }));

    const siteUrl = process.env.NEXTAUTH_URL || "https://skillradar.dev";

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                name: "SkillRadar",
                url: siteUrl,
            },
            {
                "@type": "WebSite",
                name: "SkillRadar",
                url: siteUrl,
                inLanguage: ["es", "en"],
            },
            {
                "@type": "SoftwareApplication",
                name: "SkillRadar",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            {
                "@type": "FAQPage",
                mainEntity: faqItems.map((item) => ({
                    "@type": "Question",
                    name: item.q,
                    acceptedAnswer: { "@type": "Answer", text: item.a },
                })),
            },
        ],
    };

    const howSteps = [
        { icon: Upload, title: t("howStep1Title"), desc: t("howStep1Desc") },
        { icon: EyeOff, title: t("howStep2Title"), desc: t("howStep2Desc") },
        { icon: KeyRound, title: t("howStep3Title"), desc: t("howStep3Desc") },
    ];

    const testimonials = [1, 2, 3].map((n) => ({
        text: t(`testi${n}Text`),
        name: t(`testi${n}Name`),
        role: t(`testi${n}Role`),
    }));

    return (
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
            >
                {t("getStarted")}
            </a>
            {/* Static gradient (perf: no full-screen blur animation) */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-gradient-to-b from-primary/10 via-transparent to-transparent"
            />

            {/* Navigation Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/50 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-lg font-bold text-background shadow-lg shadow-primary/20">
                            SR
                        </div>
                        <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                            SkillRadar
                        </span>
                    </Link>

                    <nav
                        aria-label="Primary"
                        className="hidden items-center gap-6 text-sm text-muted-foreground md:flex"
                    >
                        <Link href="#features" className="transition-colors hover:text-foreground">
                            {t("navFeatures")}
                        </Link>
                        <Link href="/demo" className="transition-colors hover:text-foreground">
                            {t("navDemo")}
                        </Link>
                        <Link href="#pricing" className="transition-colors hover:text-foreground">
                            {t("navPricing")}
                        </Link>
                        <Link href="#faq" className="transition-colors hover:text-foreground">
                            {t("navFaq")}
                        </Link>
                    </nav>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        <Link href="/login" className="hidden sm:block">
                            <Button variant="ghost" size="sm" className="text-sm hover:bg-muted/80">
                                {t("signIn")}
                            </Button>
                        </Link>
                        <Link href="/login?register=true" className="hidden sm:block">
                            <Button size="sm" className="shadow-md shadow-primary/20">
                                {t("getStarted")}
                            </Button>
                        </Link>
                        <details className="relative md:hidden">
                            <summary
                                aria-label="Menu"
                                className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md hover:bg-muted/80 [&::-webkit-details-marker]:hidden"
                            >
                                <Menu className="size-5" aria-hidden />
                            </summary>
                            <div className="absolute right-0 top-11 flex w-48 flex-col gap-1 rounded-xl border border-border bg-popover p-2 text-sm shadow-xl">
                                <Link href="#features" className="rounded-md px-3 py-2 hover:bg-muted">
                                    {t("navFeatures")}
                                </Link>
                                <Link href="/demo" className="rounded-md px-3 py-2 hover:bg-muted">
                                    {t("navDemo")}
                                </Link>
                                <Link href="#pricing" className="rounded-md px-3 py-2 hover:bg-muted">
                                    {t("navPricing")}
                                </Link>
                                <Link href="#faq" className="rounded-md px-3 py-2 hover:bg-muted">
                                    {t("navFaq")}
                                </Link>
                                <Link href="/login" className="rounded-md px-3 py-2 hover:bg-muted">
                                    {t("signIn")}
                                </Link>
                                <Link
                                    href="/login?register=true"
                                    className="rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground"
                                >
                                    {t("skipToContent")}
                                </Link>
                            </div>
                        </details>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main id="main" className="flex flex-1 flex-col items-center">
                <section className="container relative mx-auto flex max-w-6xl flex-col items-center px-6 py-16 text-center md:py-20">
                    <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" aria-hidden />
                        {t("tag")}
                    </div>

                    <h1 className="mb-6 max-w-3xl text-balance text-4xl font-black leading-[1.1] tracking-tight sm:text-6xl">
                        {t.rich("heroTitle", {
                            bold: (chunks) => (
                                <span className="bg-gradient-to-r from-primary via-emerald to-accent bg-clip-text text-transparent">
                                    {chunks}
                                </span>
                            ),
                        })}
                    </h1>

                    <p className="mb-10 max-w-2xl text-balance text-lg font-medium text-muted-foreground sm:text-xl">
                        {t("heroSubtitle")}
                    </p>

                    <div className="mb-12 flex w-full max-w-md flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/login?register=true" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] hover:shadow-primary/35 active:scale-[0.98]"
                            >
                                <Rocket className="size-5" aria-hidden />
                                {t("startFree")}
                            </Button>
                        </Link>
                        <Link href="/demo" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full gap-2 border-border/80 text-base font-semibold transition-colors hover:bg-muted/40"
                            >
                                {t("demoCta")}
                                <ArrowRight className="size-4" aria-hidden />
                            </Button>
                        </Link>
                    </div>

                    <div className="w-full max-w-xl">
                        <ScorePreview />
                    </div>

                    {/* Feature Cards Grid */}
                    <div id="features" className="mt-16 grid w-full scroll-mt-20 gap-6 text-left md:grid-cols-3">
                        <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <FileText className="size-6" aria-hidden />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-bold">{t("feature1Title")}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{t("feature1Desc")}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                <Briefcase className="size-6" aria-hidden />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-bold">{t("feature2Title")}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{t("feature2Desc")}</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <MessageSquare className="size-6" aria-hidden />
                            </div>
                            <div>
                                <h3 className="mb-1 text-lg font-bold">{t("feature3Title")}</h3>
                                <p className="text-sm leading-relaxed text-muted-foreground">{t("feature3Desc")}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Double-blind */}
                <section className="container mx-auto w-full max-w-6xl px-6 py-12">
                    <div className="rounded-2xl border border-emerald/20 bg-emerald/5 p-8 text-center md:p-10">
                        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald/30 px-3 py-1 text-xs font-semibold text-emerald">
                            <ShieldCheck className="size-3.5" aria-hidden />
                            {t("howBadge")}
                        </div>
                        <h2 className="mb-2 text-2xl font-bold tracking-tight md:text-3xl">{t("howTitle")}</h2>
                        <p className="mx-auto mb-8 max-w-2xl text-sm text-muted-foreground md:text-base">
                            {t("howSubtitle")}
                        </p>
                        <div className="grid gap-6 text-left md:grid-cols-3">
                            {howSteps.map((step) => (
                                <div
                                    key={step.title}
                                    className="flex flex-col gap-3 rounded-xl border border-border/40 bg-card/60 p-5"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-emerald/10 text-emerald">
                                        <step.icon className="size-5" aria-hidden />
                                    </div>
                                    <h3 className="font-bold">{step.title}</h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Social proof (demo data, clearly labeled) */}
                <section className="container mx-auto w-full max-w-6xl px-6 py-12">
                    <div className="mb-6 flex items-center justify-center gap-2 text-center">
                        <FlaskConical className="size-4 text-warning" aria-hidden />
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            {t("socialBadge")}
                        </p>
                    </div>
                    <div className="mb-8 grid gap-6 text-center sm:grid-cols-3">
                        {[
                            { value: t("metric1Value"), label: t("metric1Label") },
                            { value: t("metric2Value"), label: t("metric2Label") },
                            { value: t("metric3Value"), label: t("metric3Label") },
                        ].map((m) => (
                            <div key={m.label} className="rounded-2xl border border-border/40 bg-card/40 p-6">
                                <p className="text-3xl font-black text-primary">{m.value}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{m.label}</p>
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {testimonials.map((testi) => (
                            <figure
                                key={testi.name}
                                className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 p-6"
                            >
                                <Quote className="size-5 text-primary" aria-hidden />
                                <blockquote className="flex-1 text-sm italic leading-relaxed text-foreground/90">
                                    &ldquo;{testi.text}&rdquo;
                                </blockquote>
                                <figcaption className="text-xs text-muted-foreground">
                                    <span className="font-bold text-foreground">{testi.name}</span> · {testi.role}
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                {/* Pricing */}
                <section id="pricing" className="container mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-12">
                    <h2 className="mb-6 text-center text-2xl font-bold tracking-tight md:text-3xl">
                        {t("pricingTitle")}
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold">{t("pricingFreeTitle")}</h3>
                            <p className="text-3xl font-black">{t("pricingFreePrice")}</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">{t("pricingFreeDesc")}</p>
                            <Link href="/login?register=true" className="mt-auto pt-2">
                                <Button className="w-full">{t("pricingCtaFree")}</Button>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-6 backdrop-blur-sm">
                            <h3 className="text-lg font-bold">{t("pricingProTitle")}</h3>
                            <p className="text-3xl font-black">{t("pricingProPrice")}</p>
                            <p className="text-sm leading-relaxed text-muted-foreground">{t("pricingProDesc")}</p>
                            <Link href="/login?register=true" className="mt-auto pt-2">
                                <Button variant="outline" className="w-full">
                                    {t("pricingCtaPro")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="mx-auto mt-6 max-w-2xl overflow-hidden rounded-2xl border border-border/40">
                        <table className="w-full text-left text-xs sm:text-sm">
                            <caption className="border-b border-border/40 bg-muted/30 px-4 py-2 text-left font-bold">
                                {t("pricingCompareTitle")}
                            </caption>
                            <tbody>
                                {[
                                    { label: t("pricingFeatAnalyses"), free: "5", pro: "∞" },
                                    { label: t("pricingFeatMatches"), free: "3", pro: "∞" },
                                    { label: t("pricingFeatMocks"), free: "2", pro: "∞" },
                                    { label: t("pricingFeatKeys"), free: "—", pro: "✓" },
                                    { label: t("pricingFeatBlind"), free: "✓", pro: "✓" },
                                ].map((row) => (
                                    <tr key={row.label} className="border-b border-border/20 last:border-0">
                                        <td className="px-4 py-2.5 text-muted-foreground">{row.label}</td>
                                        <td className="px-4 py-2.5 text-center font-semibold">{row.free}</td>
                                        <td className="px-4 py-2.5 text-center font-semibold text-primary">
                                            {row.pro === "✓" ? (
                                                <Check className="mx-auto size-4" aria-hidden />
                                            ) : (
                                                row.pro
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-center text-xs text-muted-foreground">{t("pricingNote")}</p>
                </section>

                {/* FAQ */}
                <section id="faq" className="container mx-auto w-full max-w-3xl scroll-mt-20 px-6 py-12">
                    <h2 className="mb-6 text-center text-2xl font-bold tracking-tight md:text-3xl">{t("faqTitle")}</h2>
                    <div className="flex flex-col gap-3">
                        {faqItems.map((item) => (
                            <details
                                key={item.q}
                                className="group rounded-xl border border-border/40 bg-card/40 px-5 py-4 open:bg-card/70"
                            >
                                <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden">
                                    <span className="flex items-center justify-between gap-3">
                                        {item.q}
                                        <span
                                            aria-hidden
                                            className="text-primary transition-transform group-open:rotate-45"
                                        >
                                            +
                                        </span>
                                    </span>
                                </summary>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="container mx-auto w-full max-w-6xl px-6 pb-16">
                    <div className="rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 text-center">
                        <h2 className="mb-2 text-2xl font-black tracking-tight md:text-4xl">{t("finalTitle")}</h2>
                        <p className="mx-auto mb-8 max-w-xl text-sm text-muted-foreground md:text-base">
                            {t("finalSubtitle")}
                        </p>
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <Link href="/login?register=true">
                                <Button size="lg" className="gap-2">
                                    <Rocket className="size-5" aria-hidden />
                                    {t("startFree")}
                                </Button>
                            </Link>
                            <Link href="/demo">
                                <Button size="lg" variant="outline" className="gap-2">
                                    {t("finalCtaSecondary")}
                                    <ArrowRight className="size-4" aria-hidden />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/20 bg-background/30 py-10 backdrop-blur-sm">
                <div className="container mx-auto grid gap-8 px-6 text-sm md:grid-cols-4">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-background">
                                SR
                            </div>
                            <span className="font-bold">SkillRadar</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{t("footerText")}</p>
                    </div>
                    <nav aria-label={t("footerProduct")}>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {t("footerProduct")}
                        </p>
                        <ul className="flex flex-col gap-2 text-muted-foreground">
                            <li>
                                <Link href="#features" className="transition-colors hover:text-foreground">
                                    {t("navFeatures")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/demo" className="transition-colors hover:text-foreground">
                                    {t("footerDemo")}
                                </Link>
                            </li>
                            <li>
                                <Link href="#pricing" className="transition-colors hover:text-foreground">
                                    {t("navPricing")}
                                </Link>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label={t("footerResources")}>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {t("footerResources")}
                        </p>
                        <ul className="flex flex-col gap-2 text-muted-foreground">
                            <li>
                                <Link href="/demo" className="transition-colors hover:text-foreground">
                                    {t("footerDocs")}
                                </Link>
                            </li>
                            <li>
                                <span className="cursor-default">{t("footerChangelog")}</span>
                            </li>
                            <li>
                                <span className="cursor-default">{t("footerStatus")}</span>
                            </li>
                        </ul>
                    </nav>
                    <nav aria-label={t("footerLegal")}>
                        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            {t("footerLegal")}
                        </p>
                        <ul className="flex flex-col gap-2 text-muted-foreground">
                            <li>
                                <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
                                    {t("privacyPolicy")}
                                </Link>
                            </li>
                            <li>
                                <Link href="/legal/terms" className="transition-colors hover:text-foreground">
                                    {t("termsOfService")}
                                </Link>
                            </li>
                            <li>
                                <span className="cursor-default">{t("footerCookies")}</span>
                            </li>
                            <li>
                                <span className="cursor-default">{t("footerContact")}</span>
                            </li>
                        </ul>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
