import { getTranslations } from "next-intl/server";
import DemoClient from "./demo-client";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Home" });
    return {
        title: t("demoTitle"),
        description: t("demoSubtitle"),
        alternates: {
            canonical: `/${locale}/demo`,
            languages: { es: "/es/demo", en: "/en/demo" },
        },
        openGraph: {
            title: t("demoTitle"),
            description: t("demoSubtitle"),
        },
    };
}

export default function DemoPage() {
    return <DemoClient />;
}
