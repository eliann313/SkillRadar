import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalysisSkeleton() {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-pulse lg:col-span-2">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="size-10 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-3 w-60" />
                        </div>
                    </div>
                    <Skeleton className="h-6 w-24 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
                {/* Score Section */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-2xl border border-border/30">
                    <Skeleton className="size-32 rounded-full mb-4" />
                    <Skeleton className="h-4 w-48" />
                </div>

                {/* Grid lists */}
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-wrap gap-1.5">
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <Skeleton className="h-6 w-20 rounded-md" />
                            <Skeleton className="h-6 w-24 rounded-md" />
                            <Skeleton className="h-6 w-14 rounded-md" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex flex-wrap gap-1.5">
                            <Skeleton className="h-6 w-20 rounded-md" />
                            <Skeleton className="h-6 w-16 rounded-md" />
                            <Skeleton className="h-6 w-22 rounded-md" />
                        </div>
                    </div>
                </div>

                {/* Suggestions */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-40" />
                    <div className="space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-5/6" />
                        <Skeleton className="h-3.5 w-4/5" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function MatchSkeleton() {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-pulse">
            <CardHeader className="pb-4 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                {/* Score Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-8 w-14" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                </div>

                {/* Skills aligned */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-6 w-16 rounded-md" />
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-18 rounded-md" />
                    </div>
                </div>

                {/* Gaps */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-16 rounded-md" />
                    </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-44" />
                    <div className="space-y-2">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-3.5 w-11/12" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
