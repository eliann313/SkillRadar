"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Upload,
  FileText,
  ChevronDown,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";

interface CVUploadFormProps {
  onAnalyze: (content: string) => void;
  isLoading?: boolean;
}

export function CVUploadForm({
  onAnalyze,
  isLoading = false,
}: CVUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState("");
  const [isTextOpen, setIsTextOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile) {
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
    disabled: isLoading,
  });

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = () => {
    if (file) {
      // In real app, parse PDF content
      onAnalyze(`PDF content from: ${file.name}`);
    } else if (textContent.trim()) {
      onAnalyze(textContent);
    }
  };

  const canAnalyze = (file || textContent.trim()) && !isLoading;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-5 text-primary" />
          Upload Your CV
        </CardTitle>
        <CardDescription>
          Upload your CV as PDF or paste the text content for AI analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Dropzone */}
        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              isLoading && "pointer-events-none opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Upload className="size-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">
                {isDragActive ? "Drop your CV here" : "Drag & drop your CV"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse (PDF only, max 5MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleRemoveFile}
              disabled={isLoading}
            >
              <X />
            </Button>
          </div>
        )}

        {/* Collapsible text input */}
        <Collapsible open={isTextOpen} onOpenChange={setIsTextOpen}>
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-between text-muted-foreground"
                disabled={isLoading}
              />
            }
          >
            <span>Or paste your CV text</span>
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                isTextOpen && "rotate-180",
              )}
            />
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
                disabled={isLoading}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Analyze button */}
        <Button
          size="lg"
          className="w-full gap-2"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
        >
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles data-icon="inline-start" />
              Analyze with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
