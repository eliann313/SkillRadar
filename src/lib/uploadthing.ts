import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";
import "@/lib/env";

const f = createUploadthing();

export const ourFileRouter = {
    resumeUploader: f({ pdf: { maxFileSize: "4MB" } })
        .middleware(async () => {
            const session = await auth();
            if (!session?.user?.id) throw new Error("No autorizado");
            return { userId: session.user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // eslint-disable-next-line no-console
            console.log(`[UploadThing] Carga completada por usuario: ${metadata.userId}`);
            return { uploadedBy: metadata.userId, url: file.url };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
