import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Briefcase, MessageSquare, ArrowRight } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "SkillRadar | AI-Powered Tech Profile Optimizer",
    description:
        "Analyze your CV, match profiles with job requirements, and practice technical interviews. High-fidelity optimization for developers.",
};

export default async function Home() {
    const session = await auth();

    // Redirigir al dashboard si ya tiene sesión activa
    if (session?.user?.role) {
        redirect("/dashboard");
    }

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
                        <Link href="/login">
                            <Button variant="ghost" size="sm" className="text-sm hover:bg-muted/80">
                                Sign In
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button
                                size="sm"
                                className="shadow-md shadow-primary/20 hover:scale-[1.02] transition-transform"
                            >
                                Get Started
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
                        Next-Gen Developer Optimizer
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-balance">
                        Deconstruct and Optimize Your{" "}
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-emerald to-accent">
                            Tech Profile
                        </span>{" "}
                        with AI
                    </h1>

                    <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-10 text-balance font-medium">
                        Compare your CV against real job descriptions, close engineering skill gaps, and prepare for
                        core mock interviews. Built by developers, for developers.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md mb-16">
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                className="w-full gap-2 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <GitHubLogoIcon className="size-5" />
                                Start for Free
                            </Button>
                        </Link>
                        <Link href="/login" className="w-full sm:w-auto">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full gap-2 text-base font-semibold border-border/80 hover:bg-muted/40 transition-colors"
                            >
                                Explore Features
                                <ArrowRight className="size-4" />
                            </Button>
                        </Link>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid gap-6 md:grid-cols-3 w-full text-left mt-8">
                        {/* CV Analysis */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">ATS Optimization</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Instant breakdown of your CV structure. Extract skills, detect phrasing
                                    improvements, and calculate real ATS scores.
                                </p>
                            </div>
                        </div>

                        {/* Job Match */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                                <Briefcase className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Context Job Matching</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Match your stored CV analysis directly with raw Job Descriptions. Identify missing
                                    stack keywords and tech gaps.
                                </p>
                            </div>
                        </div>

                        {/* Mock Interviews */}
                        <div className="border border-border/40 bg-card/40 backdrop-blur-sm p-6 rounded-2xl flex flex-col gap-4 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                            <div className="size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <MessageSquare className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Simulated Interviews</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Practice core questions tailored to your resume gaps using Google Gemini. Receive
                                    dynamic, structured feedback.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/20 py-8 bg-background/30 backdrop-blur-sm">
                <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© 2026 SkillRadar. Secure cryptographic ATS optimizer.</p>
                    <div className="flex gap-4">
                        <a href="#" className="hover:text-foreground transition-colors">
                            Privacy Policy
                        </a>
                        <a href="#" className="hover:text-foreground transition-colors">
                            Terms of Service
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
