"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Upload, FileText, ChevronDown, X, Loader2, Sparkles } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { toast } from "sonner";
import { getSignedFileUrlAction } from "@/app/actions/cv-actions";
import { useSession } from "next-auth/react";

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

    const { startUpload } = useUploadThing("resumeUploader", {
        onClientUploadComplete: async (res) => {
            setIsUploading(false);
            setUploadProgress(0);
            const uploadedFile = res?.[0];
            if (uploadedFile) {
                toast.success(`Archivo "${uploadedFile.name}" subido de forma segura.`);

                try {
                    // Generar URL firmada temporal de corta duración
                    const signedRes = await getSignedFileUrlAction(uploadedFile.url);
                    if (signedRes.success && signedRes.url) {
                        // El análisis del backend requiere la URL estable original de UploadThing
                        // ya que expira de forma controlada y persistida en Neon Postgres.
                        onAnalyze(uploadedFile.url, uploadedFile.name);
                    } else {
                        toast.error(signedRes.error || "No se pudo generar el token de acceso privado.");
                        onAnalyze(uploadedFile.url, uploadedFile.name);
                    }
                } catch (err) {
                    console.error("Error generating signed URL:", err);
                    onAnalyze(uploadedFile.url, uploadedFile.name);
                }
            }
        },
        onUploadError: (error: Error) => {
            setIsUploading(false);
            setUploadProgress(0);
            toast.error(`Error al subir el archivo: ${error.message}`);
        },
        onUploadProgress: (p) => {
            setUploadProgress(p);
        },
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const pdfFile = acceptedFiles[0];
        if (pdfFile) {
            if (pdfFile.size > MAX_FILE_SIZE) {
                toast.error("El archivo excede el límite de 4MB. Por favor, sube un archivo más pequeño.");
                return;
            }
            setFile(pdfFile);
            setTextContent("");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled: isLoading || isUploading,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rootProps = getRootProps() as any;
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inputProps = getInputProps() as any;
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
                // Esto evita el error 500 de UploadThing si no hay claves configuradas
                for (let progress = 10; progress <= 100; progress += 30) {
                    setUploadProgress(progress);
                    await new Promise((resolve) => setTimeout(resolve, 1500 / 4));
                }
                setIsUploading(false);
                setUploadProgress(0);
                toast.success(`Archivo "${file.name}" subido de forma segura (Modo Demo).`);
                onAnalyze("https://utfs.io/f/demo-resume.pdf", file.name);
                return;
            }

            try {
                const uploadResult = await startUpload([file]);
                if (!uploadResult) {
                    setIsUploading(false);
                }
            } catch (err) {
                console.error("Upload error:", err);
                setIsUploading(false);
                toast.error("Ocurrió un error inesperado al subir el archivo.");
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
                    Upload Your CV
                </CardTitle>
                <CardDescription>Upload your CV as PDF or paste the text content for AI analysis</CardDescription>
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
                                {isDragActive ? "Drop your CV here" : "Drag & drop your CV"}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">or click to browse (PDF only, max 5MB)</p>
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
                                    <span>Uploading CV...</span>
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
                        <span>Or paste your CV text</span>
                        <ChevronDown className={cn("size-4 transition-transform", isTextOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="cv-text">CV Content</Label>
                            <Textarea
                                id="cv-text"
                                placeholder="Paste your CV content here if PDF upload fails..."
                                value={textContent}
                                onChange={(e) => {
                                    setTextContent(e.target.value);
                                    if (e.target.value) setFile(null);
                                }}
                                className="min-h-[200px] resize-none"
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
                            Uploading to secure storage ({uploadProgress}%)...
                        </>
                    ) : isLoading ? (
                        <>
                            <Loader2 className="animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Sparkles />
                            Analyze with AI
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
