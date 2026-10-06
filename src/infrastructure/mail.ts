import { logger } from "@/infrastructure/logger";

/** Remitente verificable: dominio propio vía EMAIL_FROM (legales/CAN-SPAM). */
export function getEmailFrom(): string {
    return process.env.EMAIL_FROM || "SkillRadar <onboarding@resend.dev>";
}

export async function sendEmail(params: { to: string; subject: string; html: string }) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
        try {
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                    from: getEmailFrom(),
                    to: params.to,
                    subject: params.subject,
                    html: params.html,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                logger.error("❌ [Mail] Resend error response:", errText);
                return { success: false, error: errText };
            }

            logger.warn(`✉️ [Mail] Email successfully sent to ${params.to} using Resend`);
            return { success: true };
        } catch (mailError) {
            logger.error("❌ [Mail] Error sending email with Resend:", mailError);
            return { success: false, error: String(mailError) };
        }
    } else {
        logger.warn(
            `\n✉️ [Mail Simulation] Email would be sent to ${params.to}:\nSubject: ${params.subject}\nHTML: ${params.html}\n`,
        );
        return { success: true };
    }
}
