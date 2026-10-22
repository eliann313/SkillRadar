import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { assertActiveUser } from "@/infrastructure/auth";
import { MAX_CV_FILE_SIZE } from "@/infrastructure/file-storage";

export async function POST(request: Request): Promise<Response> {
    let session: Awaited<ReturnType<typeof assertActiveUser>>;
    try {
        session = await assertActiveUser();
    } catch {
        return Response.json({ error: "No autorizado. Inicie sesión nuevamente." }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId || session.user.isGuest === true) {
        return Response.json({ error: "Solo las cuentas activas pueden subir CVs." }, { status: 403 });
    }

    try {
        const body = (await request.json()) as HandleUploadBody;
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname, clientPayload) => {
                // El cliente declara su userId: debe coincidir con la sesión activa (anti-spoofing).
                if (clientPayload !== userId) {
                    throw new Error("No autorizado");
                }
                return {
                    allowedContentTypes: ["application/pdf"],
                    maximumSizeInBytes: MAX_CV_FILE_SIZE,
                    addRandomSuffix: true,
                    tokenPayload: JSON.stringify({ userId }),
                };
            },
        });

        return Response.json(jsonResponse);
    } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 400 });
    }
}
