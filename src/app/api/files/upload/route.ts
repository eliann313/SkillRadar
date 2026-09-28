import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/lib/auth";
import { MAX_CV_FILE_SIZE } from "@/lib/file-storage";

export async function POST(request: Request): Promise<Response> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async (_pathname, clientPayload) => {
                // Solo usuarios autenticados (no guests) pueden subir CVs
                const session = await auth();
                const userId = session?.user?.id;
                if (!userId || session?.user?.isGuest === true) {
                    throw new Error("No autorizado");
                }
                // El cliente declara su userId: debe coincidir con la sesión (anti-spoofing)
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
