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
                    from: "SkillRadar <onboarding@resend.dev>",
                    to: params.to,
                    subject: params.subject,
                    html: params.html,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.error("❌ [Mail] Resend error response:", errText);
                return { success: false, error: errText };
            }

            console.warn(`✉️ [Mail] Email successfully sent to ${params.to} using Resend`);
            return { success: true };
        } catch (mailError) {
            console.error("❌ [Mail] Error sending email with Resend:", mailError);
            return { success: false, error: String(mailError) };
        }
    } else {
        console.warn(
            `\n✉️ [Mail Simulation] Email would be sent to ${params.to}:\nSubject: ${params.subject}\nHTML: ${params.html}\n`,
        );
        return { success: true };
    }
}
