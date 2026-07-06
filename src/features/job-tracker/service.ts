import { JobTrackerRepository } from "./repository";

export class JobTrackerService {
    static async getJobApplications(userId: string) {
        return await JobTrackerRepository.listByUserId(userId);
    }

    static async createJobApplication(params: {
        userId: string;
        title: string;
        company: string;
        url?: string;
        status?: string;
    }) {
        if (!params.title.trim()) {
            throw new Error("El título del cargo es obligatorio.");
        }
        if (!params.company.trim()) {
            throw new Error("El nombre de la empresa es obligatorio.");
        }
        return await JobTrackerRepository.create(params);
    }

    static async updateJobApplicationStatus(id: string, userId: string, status: string) {
        const validStatuses = ["to_apply", "applied", "interviewing", "offer"];
        if (!validStatuses.includes(status)) {
            throw new Error(`Estado inválido: ${status}`);
        }
        return await JobTrackerRepository.updateStatus(id, userId, status);
    }

    static async deleteJobApplication(id: string, userId: string) {
        return await JobTrackerRepository.delete(id, userId);
    }
}
