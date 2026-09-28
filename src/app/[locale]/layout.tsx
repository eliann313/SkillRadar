import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
});

const siteUrl = process.env.NEXTAUTH_URL || "https://skillradar.dev";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: "SkillRadar | AI-Powered Developer Profile Analysis",
        template: "%s | SkillRadar",
    },
    description:
        "Analyze your technical profile with AI, match with job offers, and prepare for interviews. For developers and recruiters.",
    keywords: ["developer", "CV analysis", "job matching", "AI", "technical skills", "recruiters"],
    authors: [{ name: "SkillRadar" }],
    alternates: {
        canonical: "/",
        languages: {
            es: "/es",
            en: "/en",
            "x-default": "/es",
        },
    },
    openGraph: {
        type: "website",
        siteName: "SkillRadar",
        locale: "es_ES",
        alternateLocale: ["en_US"],
    },
    twitter: {
        card: "summary_large_image",
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const viewport: Viewport = {
    themeColor: "#09090b",
    width: "device-width",
    initialScale: 1,
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    // Validate that the incoming locale is supported
    if (!routing.locales.includes(locale as "es" | "en")) {
        notFound();
    }

    // Load messages for the provider
    const messages = await getMessages();

    return (
        <html
            lang={locale}
            className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
                <NextIntlClientProvider locale={locale} messages={messages}>
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        <SessionProvider>
                            <TooltipProvider delay={300}>{children}</TooltipProvider>
                        </SessionProvider>
                        <Toaster richColors position="top-right" />
                    </ThemeProvider>
                    <Analytics />
                    <SpeedInsights />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
