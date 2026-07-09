import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    const isGuest = session.user.isGuest === true;
    const isRecruiter = session.user.role === "recruiter";
    const t = await getTranslations("DashboardLayout");

    return (
        <div className="flex flex-col min-h-screen">
            {isGuest && (
                <div
                    data-testid="guest-mode-banner"
                    className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 px-4 py-2 text-center text-xs font-semibold text-white shadow-md select-none animate-fade-in transition-all"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="size-4 shrink-0 animate-pulse text-amber-100"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                    </svg>
                    <span>
                        {t.rich("demoBanner", {
                            mode: isRecruiter ? t("recruiterMode") : t("developerMode"),
                            strongName: (chunks) => <strong>{chunks}</strong>,
                        })}
                    </span>
                </div>
            )}
            <div className="flex-1">
                <DashboardShell>{children}</DashboardShell>
            </div>
        </div>
    );
}
