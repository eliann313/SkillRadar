import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
    locales: ["es", "en"],
    defaultLocale: "es",
});

export const { Link, usePathname, useRouter } = createNavigation(routing);
