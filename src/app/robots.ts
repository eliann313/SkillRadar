import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXTAUTH_URL || "https://skillradar.dev";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/demo"],
                disallow: ["/dashboard", "/api/"],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
