import { db } from "@/lib/db";

export class ResumeRepository {
  static async create(data: {
    userId: string;
    fileName: string;
    fileUrl: string;
    rawText: string;
  }) {
    return await db.resume.create({
      data,
    });
  }

  static async findByUserId(userId: string) {
    return await db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async delete(id: string, userId: string) {
    return await db.resume.delete({
      where: { id, userId },
    });
  }
}
