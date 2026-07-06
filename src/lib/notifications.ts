import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function createNotification(params: {
    userId: string;
    type: "new_job_match" | "new_application" | "application_status_changed";
    title: string;
    message: string;
    link: string;
    metadata?: unknown;
}) {
    try {
        const notification = await db.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                link: params.link,
                metadata: params.metadata !== undefined ? (params.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
            },
        });

        // Chequeo e inicio de envío de correo en segundo plano
        try {
            const user = await db.user.findUnique({
                where: { id: params.userId },
                select: {
                    email: true,
                    emailNotifications: true,
                    emailNewApplication: true,
                    emailApplicationStatusChanged: true,
                },
            });

            if (user && user.emailNotifications) {
                let shouldSendEmail = false;

                if (params.type === "new_application" && user.emailNewApplication) {
                    shouldSendEmail = true;
                } else if (params.type === "application_status_changed" && user.emailApplicationStatusChanged) {
                    shouldSendEmail = true;
                }

                if (shouldSendEmail) {
                    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
                    const emailHtml = `
                        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff; color: #1a202c;">
                            <div style="text-align: center; border-bottom: 1px solid #edf2f7; padding-bottom: 20px;">
                                <h1 style="color: #10b981; font-size: 24px; margin: 0;">SkillRadar</h1>
                                <p style="font-size: 14px; color: #718096; margin: 5px 0 0 0;">AI-powered Talent Matching</p>
                            </div>
                            <div style="padding: 20px 0;">
                                <h2 style="font-size: 18px; color: #2d3748; margin-top: 0;">${params.title}</h2>
                                <p style="font-size: 16px; line-height: 1.5; color: #4a5568;">${params.message}</p>
                                <div style="margin-top: 25px; text-align: center;">
                                    <a href="${baseUrl}${params.link}" style="background-color: #10b981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; display: inline-block;">Ver en mi Dashboard</a>
                                </div>
                            </div>
                            <div style="border-top: 1px solid #edf2f7; padding-top: 20px; text-align: center; font-size: 12px; color: #a0aec0;">
                                <p style="margin: 0;">Este es un correo automático. Puedes cambiar tus preferencias de notificación en <a href="${baseUrl}/dashboard/settings" style="color: #10b981; text-decoration: none;">Ajustes</a>.</p>
                            </div>
                        </div>
                    `;

                    const { sendEmail } = await import("@/lib/mail");
                    void sendEmail({
                        to: user.email,
                        subject: params.title,
                        html: emailHtml,
                    });
                }
            }
        } catch (mailError) {
            console.error("[createNotification] Error processing email logic:", mailError);
        }

        return notification;
    } catch (error) {
        console.error("[createNotification] Error creating notification in database:", error);
        throw error;
    }
}
