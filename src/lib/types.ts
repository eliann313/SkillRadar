export type UserRole = "developer" | "recruiter";

export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: UserRole;
    createdAt: Date;
}

export interface DeveloperProfile extends User {
    role: "developer";
    skills: string[];
    seniority?: "junior" | "mid" | "senior" | "lead";
    lastAtsScore?: number;
    cvAnalysisCount: number;
    jobMatchCount: number;
    mockInterviewCount: number;
}

export interface RecruiterProfile extends User {
    role: "recruiter";
    company?: string;
    talentSearchCount: number;
}

export interface CVAnalysis {
    id: string;
    userId: string;
    atsScore: number;
    detectedKeywords: string[];
    missingKeywords: string[];
    estimatedSeniority: "junior" | "mid" | "senior" | "lead";
    suggestions: string[];
    createdAt: Date;
    explainability?: {
        justification: string;
        evidenceFound: string[];
        missingEvidence: string[];
    };
}

export interface JobMatch {
    id: string;
    userId: string;
    jobTitle: string;
    company?: string;
    matchScore: number;
    alignedSkills: string[];
    missingSkills: string[];
    createdAt: Date;
    recommendations?: string[];
    explainability?: {
        justification: string;
        evidenceFound: string[];
        missingEvidence: string[];
    };
    actionPlan?: Array<{
        skill: string;
        steps: string[];
    }>;
}

export interface TalentCard {
    id: string;
    anonymousId: string;
    estimatedSeniority: "junior" | "mid" | "senior" | "lead";
    averageScore: number;
    topSkills: string[];
    languages: string[];
    lastActive: Date;
    name?: string | null;
    email?: string | null;
    githubUsername?: string | null;
    image?: string | null;
    contactStatus?: "none" | "pending" | "accepted" | "declined";
    requestId?: string;
    justification?: string;
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export interface AccountLimits {
    cvAnalysis: { used: number; limit: number };
    jobMatch: { used: number; limit: number };
    mockInterview: { used: number; limit: number };
}
