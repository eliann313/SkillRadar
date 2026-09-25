import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://skillradar.dev";

export default function sitemap(): MetadataRoute.Sitemap {
    const locales = ["es", "en"];
    const routes = ["", "/demo", "/login"];

    return locales.flatMap((locale) =>
        routes.map((route) => ({
            url: `${siteUrl}/${locale}${route}`,
            lastModified: new Date(),
            changeFrequency: route === "" ? "weekly" : "monthly",
            priority: route === "" ? 1 : route === "/demo" ? 0.8 : 0.5,
        })),
    );
}
