"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Menu, X } from "lucide-react";

interface MobileMenuProps {
    labels: {
        navFeatures: string;
        navDemo: string;
        navPricing: string;
        navFaq: string;
        signIn: string;
        getStarted: string;
    };
}

export function MobileMenu({ labels }: MobileMenuProps) {
    const [open, setOpen] = useState(false);

    const links = [
        { href: "#features", label: labels.navFeatures },
        { href: "/demo", label: labels.navDemo },
        { href: "#pricing", label: labels.navPricing },
        { href: "#faq", label: labels.navFaq },
        { href: "/login", label: labels.signIn },
    ];

    return (
        <div className="relative md:hidden">
            <button
                type="button"
                aria-label="Menu"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="flex size-9 items-center justify-center rounded-md hover:bg-muted/80"
            >
                {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
            {open && (
                <div className="absolute right-0 top-11 flex w-48 flex-col gap-1 rounded-xl border border-border bg-popover p-2 text-sm shadow-xl">
                    {links.map((l) => (
                        <Link
                            key={l.href + l.label}
                            href={l.href}
                            onClick={() => setOpen(false)}
                            className="rounded-md px-3 py-2 hover:bg-muted"
                        >
                            {l.label}
                        </Link>
                    ))}
                    <Link
                        href="/login?register=true"
                        onClick={() => setOpen(false)}
                        className="rounded-md bg-primary px-3 py-2 font-semibold text-primary-foreground"
                    >
                        {labels.getStarted}
                    </Link>
                </div>
            )}
        </div>
    );
}
