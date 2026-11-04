import type { MatchProvider } from "@/features/jobs/domain/jobs.ports";

export const matchProvider: MatchProvider = {
    async createJobMatch(input) {
        const { JobMatchService } = await import("@/features/job-match/application/job-match.service");
        return JobMatchService.createJobMatch(input);
    },
};
