import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48 rounded-lg bg-muted/60" />
        <Skeleton className="h-4 w-96 rounded bg-muted/40" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* ATS Score Card Skeleton */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded bg-muted/60" />
              <Skeleton className="h-3 w-40 rounded bg-muted/40" />
            </div>
            <Skeleton className="h-5 w-20 rounded bg-muted/50" />
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 pt-4">
            {/* Radial Progress Circle Skeleton */}
            <div className="relative flex items-center justify-center">
              <div className="size-[140px] rounded-full border-[10px] border-muted/20 animate-pulse" />
              <div className="absolute flex flex-col items-center gap-1">
                <Skeleton className="h-8 w-12 rounded bg-muted/60" />
                <Skeleton className="h-3 w-16 rounded bg-muted/40" />
              </div>
            </div>
            {/* Subtext info */}
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full bg-muted/50" />
              <Skeleton className="h-4 w-36 rounded bg-muted/40" />
            </div>
            {/* Action button skeleton */}
            <Skeleton className="h-9 w-full rounded-lg bg-muted/60" />
          </CardContent>
        </Card>

        {/* Job Match Card Skeleton */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24 rounded bg-muted/60" />
              <Skeleton className="h-3 w-40 rounded bg-muted/40" />
            </div>
            <Skeleton className="h-5 w-16 rounded bg-muted/50" />
          </CardHeader>
          <CardContent className="flex flex-col gap-6 pt-4">
            {/* Progress Bar & Compatibility info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-36 rounded bg-muted/50" />
                <Skeleton className="h-6 w-10 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-2 w-full rounded bg-muted/30" />
            </div>
            {/* Technologies tags skeleton */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-14 rounded-full bg-muted/50" />
              <Skeleton className="h-6 w-20 rounded-full bg-muted/50" />
              <Skeleton className="h-6 w-16 rounded-full bg-muted/50" />
              <Skeleton className="h-6 w-12 rounded-full bg-muted/40" />
            </div>
            {/* Action button skeleton */}
            <Skeleton className="h-9 w-full rounded-lg bg-muted/60" />
          </CardContent>
        </Card>

        {/* Account Limits Card Skeleton */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-sm md:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32 rounded bg-muted/60" />
              <Skeleton className="h-3 w-36 rounded bg-muted/40" />
            </div>
            <Skeleton className="h-5 w-16 rounded bg-muted/50" />
          </CardHeader>
          <CardContent className="flex flex-col gap-5 pt-4">
            {/* Limits Row 1 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-muted/50" />
                  <Skeleton className="h-3.5 w-20 rounded bg-muted/45" />
                </div>
                <Skeleton className="h-3.5 w-8 rounded bg-muted/50" />
              </div>
              <Skeleton className="h-1.5 w-full rounded bg-muted/30" />
            </div>
            {/* Limits Row 2 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-muted/50" />
                  <Skeleton className="h-3.5 w-16 rounded bg-muted/45" />
                </div>
                <Skeleton className="h-3.5 w-8 rounded bg-muted/50" />
              </div>
              <Skeleton className="h-1.5 w-full rounded bg-muted/30" />
            </div>
            {/* Limits Row 3 */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-muted/50" />
                  <Skeleton className="h-3.5 w-24 rounded bg-muted/45" />
                </div>
                <Skeleton className="h-3.5 w-8 rounded bg-muted/50" />
              </div>
              <Skeleton className="h-1.5 w-full rounded bg-muted/30" />
            </div>
            {/* Upgrade action button */}
            <Skeleton className="h-9 w-full rounded-lg bg-muted/60 mt-1" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
