"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useEffect } from "react";
import { useDropzone, type DropzoneRootProps, type DropzoneInputProps } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, FileText, ChevronDown, X, Loader2, Sparkles } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { getSignedFileUrlAction } from "@/app/actions/cv-actions";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

interface CVUploadFormProps {
    onAnalyze: (content: string, fileName?: string) => void;
    isLoading?: boolean;
}

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function CVUploadForm({ onAnalyze, isLoading = false }: CVUploadFormProps) {
    const { data: session } = useSession();
    const isGuest = session?.user?.isGuest === true;
    const [file, setFile] = useState<File | null>(null);
    const [textContent, setTextContent] = useState("");
    const [isTextOpen, setIsTextOpen] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [hasUploadError, setHasUploadError] = useState(false);
    const t = useTranslations("CVAnalysis");

    useEffect(() => {
        const handlePdfNotReadable = () => {
            setIsTextOpen(true);
            setFile(null); // Limpiar el archivo erróneo
            setHasUploadError(true);
            // Timeout para esperar que la animación del Collapsible se complete y enfocar el Textarea
            setTimeout(() => {
                const textarea = document.getElementById("cv-text");
                if (textarea) {
                    textarea.focus();
                }
            }, 200);
        };

        window.addEventListener("cv-pdf-not-readable", handlePdfNotReadable);
        return () => {
            window.removeEventListener("cv-pdf-not-readable", handlePdfNotReadable);
        };
    }, []);

    const handleUploadComplete = async (blobUrl: string, blobName: string) => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.success(
            t("uploadSuccess", {
                file: blobName,
                default: `Archivo "${blobName}" subido de forma segura.`,
            }),
        );

        try {
            // Generar URL de vista vía proxy con ownership
            const signedRes = await getSignedFileUrlAction(blobUrl);
            if (!signedRes.success) {
                toast.error(signedRes.error || "No se pudo generar el token de acceso privado.");
            }
            // El análisis del backend requiere la URL estable original de Blob
            // ya que expira de forma controlada y persistida en Neon Postgres.
            onAnalyze(blobUrl, blobName);
        } catch (err) {
            logger.error("Error generating signed URL:", err);
            onAnalyze(blobUrl, blobName);
        }
    };

    const handleUploadError = (error: Error) => {
        setIsUploading(false);
        setUploadProgress(0);
        toast.error(
            t("uploadError", {
                error: error.message,
                default: `Error al subir el archivo: ${error.message}`,
            }),
        );
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const pdfFile = acceptedFiles[0];
            if (pdfFile) {
                if (pdfFile.size > MAX_FILE_SIZE) {
                    toast.error(
                        t("sizeLimitError", {
                            default: "El archivo excede el límite de 4MB. Por favor, sube un archivo más pequeño.",
                        }),
                    );
                    return;
                }
                setFile(pdfFile);
                setTextContent("");
            }
        },
        [t],
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled: isLoading || isUploading,
    });

    const rootProps = getRootProps() as DropzoneRootProps;
    const {
        ref: rootRef,
        role: rootRole,
        tabIndex: rootTabIndex,
        onClick: rootOnClick,
        onKeyDown: rootOnKeyDown,
        onFocus: rootOnFocus,
        onBlur: rootOnBlur,
        onDragStart: rootOnDragStart,
        onDragEnter: rootOnDragEnter,
        onDragOver: rootOnDragOver,
        onDragLeave: rootOnDragLeave,
        onDrop: rootOnDrop,
    } = rootProps;

    const inputProps = getInputProps() as DropzoneInputProps & { ref?: React.Ref<HTMLInputElement> };
    const {
        ref: inputRef,
        type: inputType,
        style: inputStyle,
        accept: inputAccept,
        multiple: inputMultiple,
        onChange: inputOnChange,
        onClick: inputOnClick,
        tabIndex: inputTabIndex,
        autoComplete: inputAutoComplete,
    } = inputProps;

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleAnalyze = async () => {
        if (file) {
            setIsUploading(true);

            if (isGuest) {
                // Simulación local de progreso de subida para el modo Demo/Guest
                // (los guests no tienen acceso al storage real)
                for (let progress = 10; progress <= 100; progress += 30) {
                    setUploadProgress(progress);
                    await new Promise((resolve) => setTimeout(resolve, 1500 / 4));
                }
                setIsUploading(false);
                setUploadProgress(0);
                toast.success(
                    t("uploadSuccessDemo", {
                        file: file.name,
                        default: `Archivo "${file.name}" subido de forma segura (Modo Demo).`,
                    }),
                );
                onAnalyze("demo://guest-cv.pdf", file.name);
                return;
            }

            try {
                const userId = session?.user?.id;
                const blob = await upload(`cvs/${userId}/${file.name}`, file, {
                    access: "private",
                    handleUploadUrl: "/api/files/upload",
                    clientPayload: userId ?? "",
                    onUploadProgress: ({ percentage }) => {
                        setUploadProgress(Math.round(percentage));
                    },
                });
                await handleUploadComplete(blob.url, file.name);
            } catch (err) {
                logger.error("Upload error:", err);
                setIsUploading(false);
                handleUploadError(err instanceof Error ? err : new Error("Upload failed"));
            }
        } else if (textContent.trim()) {
            onAnalyze(textContent);
        }
    };

    const canAnalyze = (file || textContent.trim()) && !isLoading && !isUploading;

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="size-5 text-primary" />
                    {t("uploadCvCardTitle", { default: "Subir Currículum" })}
                </CardTitle>
                <CardDescription>
                    {t("uploadCvCardDesc", {
                        default: "Sube tu CV en formato PDF o pega el contenido para su análisis.",
                    })}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
                {/* Dropzone */}
                {!file ? (
                    <div
                        ref={rootRef}
                        role={rootRole}
                        tabIndex={rootTabIndex}
                        onClick={rootOnClick}
                        onKeyDown={rootOnKeyDown}
                        onFocus={rootOnFocus}
                        onBlur={rootOnBlur}
                        onDragStart={rootOnDragStart}
                        onDragEnter={rootOnDragEnter}
                        onDragOver={rootOnDragOver}
                        onDragLeave={rootOnDragLeave}
                        onDrop={rootOnDrop}
                        className={cn(
                            "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors",
                            isDragActive
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50 hover:bg-muted/50",
                            isLoading && "pointer-events-none opacity-50",
                        )}
                    >
                        <input
                            ref={inputRef}
                            type={inputType}
                            style={inputStyle}
                            accept={inputAccept}
                            multiple={inputMultiple}
                            onChange={inputOnChange}
                            onClick={inputOnClick}
                            tabIndex={inputTabIndex}
                            autoComplete={inputAutoComplete}
                        />
                        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                            <Upload className="size-7 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <p className="font-medium text-foreground">
                                {isDragActive
                                    ? t("dropCvHere", { default: "Suelta tu CV aquí" })
                                    : t("dragDropCv", { default: "Arrastra y suelta tu CV" })}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("clickToBrowse", { default: "o haz clic para explorar (PDF, máx 4MB)" })}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                    <FileText className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{file.name}</p>
                                    <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={handleRemoveFile}
                                disabled={isLoading || isUploading}
                            >
                                <X />
                            </Button>
                        </div>
                        {isUploading && (
                            <div className="mt-2 space-y-1.5">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t("uploadingCv", { default: "Subiendo CV..." })}</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Collapsible text input */}
                <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen}>
                    <CollapsibleTrigger
                        render={
                            <Button
                                variant="ghost"
                                className="w-full justify-between text-muted-foreground"
                                disabled={isLoading || isUploading}
                            />
                        }
                    >
                        <span>{t("orPasteCvText", { default: "O pega el texto de tu CV" })}</span>
                        <ChevronDown className={cn("size-4 transition-transform", isTextOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cv-text">{t("cvContentLabel", { default: "Contenido del CV" })}</Label>
                            <Textarea
                                id="cv-text"
                                placeholder={t("pasteCvPlaceholder", {
                                    default: "Pega el texto aquí si la subida del PDF falla...",
                                })}
                                value={textContent}
                                onChange={(e) => {
                                    setTextContent(e.target.value);
                                    if (e.target.value) {
                                        setFile(null);
                                        setHasUploadError(false); // Limpiar el error visual al editar
                                    }
                                }}
                                className={cn(
                                    "min-h-[200px] resize-none transition-all duration-300",
                                    hasUploadError
                                        ? "border-amber-500/80 ring-1 ring-amber-500/50 bg-amber-500/5 focus-visible:ring-amber-500/80"
                                        : "focus-visible:ring-primary",
                                )}
                                disabled={isLoading || isUploading}
                            />
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Analyze button */}
                <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => {
                        void handleAnalyze();
                    }}
                    disabled={!canAnalyze}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            {t("uploadingToStorage", {
                                progress: uploadProgress,
                                default: `Subiendo al almacenamiento seguro (${uploadProgress}%)...`,
                            })}
                        </>
                    ) : isLoading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            {t("analyzing", { default: "Analizando..." })}
                        </>
                    ) : (
                        <>
                            <Sparkles />
                            {t("analyzeWithAi", { default: "Analizar con IA" })}
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
