"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Briefcase, Sparkles, Loader2 } from "lucide-react";

interface JobOfferInputProps {
  onMatch: (offer: string) => void;
  isLoading?: boolean;
}

export function JobOfferInput({
  onMatch,
  isLoading = false,
}: JobOfferInputProps) {
  const [offerText, setOfferText] = useState("");

  const handleMatch = () => {
    if (offerText.trim()) {
      onMatch(offerText);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="size-5 text-primary" />
          Job Offer
        </CardTitle>
        <CardDescription>
          Paste the job description to analyze your compatibility
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="job-offer">Job Description</Label>
          <Textarea
            id="job-offer"
            placeholder="Paste the full job description here...

Example:
We are looking for a Senior Frontend Developer with 5+ years of experience in React, TypeScript, and Next.js. You will be responsible for building scalable web applications..."
            value={offerText}
            onChange={(e) => setOfferText(e.target.value)}
            className="min-h-[250px] resize-none"
            disabled={isLoading}
          />
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          onClick={handleMatch}
          disabled={!offerText.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Analyzing Match...
            </>
          ) : (
            <>
              <Sparkles data-icon="inline-start" />
              Analyze Match
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
