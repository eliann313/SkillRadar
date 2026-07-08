"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "./theme-toggle";
import { LanguageSwitcher } from "./language-switcher";
import { useTranslations } from "next-intl";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Menu,
    Sparkles,
    Kanban,
    LineChart,
} from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { CareerCopilot } from "@/components/dashboard/career-copilot";
import { NotificationBell } from "@/components/dashboard/notification-bell";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" {...props}>
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
);

const developerNavItems = [
    { href: "/dashboard", label: "Overview", key: "overview", icon: LayoutDashboard },
    { href: "/dashboard/cv-analysis", label: "CV Analysis", key: "cvAnalysis", icon: FileText },
    { href: "/dashboard/jobs", label: "Job Board", key: "jobBoard", icon: Briefcase },
    { href: "/dashboard/job-match", label: "Job Match", key: "jobMatch", icon: Briefcase },
    { href: "/dashboard/job-tracker", label: "Job Tracker", key: "jobTracker", icon: Kanban },
    {
        href: "/dashboard/interview",
        label: "Mock Interview",
        key: "mockInterview",
        icon: MessageSquare,
    },
    {
        href: "/dashboard/github",
        label: "GitHub Analysis",
        key: "githubAnalysis",
        icon: GitHubLogoIcon,
    },
    {
        href: "/dashboard/progress",
        label: "Progress",
        key: "progress",
        icon: LineChart,
    },
    {
        href: "/dashboard/resume-builder",
        label: "Resume Builder",
        key: "resumeBuilder",
        icon: Sparkles,
    },
    {
        href: "/dashboard/linkedin-audit",
        label: "LinkedIn Audit",
        key: "linkedinAudit",
        icon: LinkedinIcon,
    },
];

const recruiterNavItems = [
    { href: "/dashboard", label: "Talent Pool", key: "talentPool", icon: Users },
    { href: "/dashboard/recruiter/postings", label: "Job Postings", key: "jobPostings", icon: Briefcase },
    { href: "/dashboard/settings", label: "Settings", key: "settings", icon: Settings },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    isMobile?: boolean;
}

function SidebarContent({ collapsed, onToggle, isMobile = false }: SidebarProps) {
    const pathname = usePathname();
    const t = useTranslations("Sidebar");
    const { data: session } = useSession();
    const user = session?.user;
    const logout = () => {
        void signOut({ callbackUrl: "/" });
    };

    const navItems = user?.role === "recruiter" ? recruiterNavItems : developerNavItems;

    return (
        <div className="flex h-full flex-col bg-sidebar">
            {/* Logo */}
            <div className="flex h-16 items-center justify-between px-4">
                <Link
                    href="/dashboard"
                    className={cn("flex items-center gap-3 transition-all", collapsed && "justify-center")}
                >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            className="size-5 text-primary"
                            stroke="currentColor"
                            strokeWidth="1.5"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    {!collapsed && <span className="text-lg font-semibold text-sidebar-foreground">SkillRadar</span>}
                </Link>
                <Button variant="ghost" size="icon-sm" className="hidden lg:flex" onClick={onToggle}>
                    {collapsed ? (
                        <ChevronRight className="text-sidebar-foreground" />
                    ) : (
                        <ChevronLeft className="text-sidebar-foreground" />
                    )}
                </Button>
            </div>

            <Separator className="bg-sidebar-border" />

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
                <ul className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        const linkContent = (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-primary"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    collapsed && "justify-center px-2",
                                )}
                            >
                                <Icon className="size-5 shrink-0" />
                                {!collapsed && <span>{t(item.key)}</span>}
                            </Link>
                        );

                        if (collapsed) {
                            return (
                                <li key={item.href}>
                                    <Tooltip>
                                        <TooltipTrigger render={linkContent} />
                                        <TooltipContent side="right" sideOffset={8}>
                                            {t(item.key)}
                                        </TooltipContent>
                                    </Tooltip>
                                </li>
                            );
                        }

                        return <li key={item.href}>{linkContent}</li>;
                    })}
                </ul>
            </nav>

            <Separator className="bg-sidebar-border" />

            {/* User section */}
            <div className="p-3">
                {isMobile ? (
                    <div className="flex flex-col gap-2 rounded-lg bg-sidebar-accent/30 p-3">
                        <div className="flex items-center gap-3 px-1">
                            <Avatar className="size-9 shrink-0">
                                <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                                    {user?.name || "User"}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user?.email || "user@example.com"}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Link
                                href="/dashboard/settings"
                                className="flex items-center justify-center gap-2 rounded-md bg-sidebar-accent/50 hover:bg-sidebar-accent px-3 py-2 text-xs font-medium text-sidebar-foreground transition-colors border border-sidebar-border/30"
                                onClick={onToggle}
                            >
                                <Settings className="size-3.5" />
                                <span>{t("settings")}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="flex items-center justify-center gap-2 rounded-md bg-destructive/10 hover:bg-destructive/20 px-3 py-2 text-xs font-medium text-destructive transition-colors border border-destructive/20"
                            >
                                <LogOut className="size-3.5" />
                                <span>{t("logout")}</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger
                            render={
                                <button
                                    className={cn(
                                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sidebar-accent",
                                        collapsed && "justify-center px-2",
                                    )}
                                >
                                    <Avatar className="size-8 shrink-0">
                                        <AvatarImage src={user?.image || undefined} alt={user?.name || undefined} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {user?.name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase() || "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                    {!collapsed && (
                                        <div className="flex-1 overflow-hidden">
                                            <p className="truncate text-sm font-medium text-sidebar-foreground">
                                                {user?.name || "User"}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {user?.email || "user@example.com"}
                                            </p>
                                        </div>
                                    )}
                                </button>
                            }
                        />
                        <DropdownMenuContent align={collapsed ? "center" : "start"} className="w-56">
                            <div className="px-2 py-1.5">
                                <p className="text-sm font-medium">{user?.name}</p>
                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                render={
                                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                                        <Settings className="size-4" />
                                        {t("settings")}
                                    </Link>
                                }
                            />
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="flex items-center gap-2 text-destructive focus:text-destructive"
                                onClick={logout}
                            >
                                <LogOut className="size-4" />
                                {t("logout")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </div>
    );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:block sticky top-0 h-screen",
                    collapsed ? "w-[68px]" : "w-64",
                )}
            >
                <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetContent side="left" className="w-64 p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} isMobile />
                </SheetContent>
            </Sheet>

            {/* Main content */}
            <div className="flex flex-1 flex-col bg-background">
                {/* Top header */}
                <header className="flex h-16 items-center justify-between border-b border-border bg-background px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger
                                render={
                                    <Button variant="ghost" size="icon" className="lg:hidden">
                                        <Menu />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                }
                            />
                        </Sheet>
                        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    className="size-4 text-primary"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                    <path d="M2 17l10 5 10-5" />
                                    <path d="M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <span className="font-semibold text-foreground">SkillRadar</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationBell />
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
                </main>
            </div>

            {/* 7.2: Career Copilot floating widget */}
            <CareerCopilot />
        </div>
    );
}
