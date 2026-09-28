"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    listNotesAction,
    createNoteAction,
    deleteNoteAction,
    getScorecardAction,
    saveScorecardAction,
    type CandidateNoteDTO,
    type ScorecardDTO,
} from "@/features/application-notes/actions";

interface Criterion {
    question: string;
    score: number;
    note: string;
}

export function CandidateWorkspace({ applicationId }: { applicationId: string }) {
    const [notes, setNotes] = useState<CandidateNoteDTO[]>([]);
    const [draft, setDraft] = useState("");
    const [scorecard, setScorecard] = useState<ScorecardDTO | null>(null);
    const [criteria, setCriteria] = useState<Criterion[]>([{ question: "", score: 3, note: "" }]);
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const [n, s] = await Promise.all([listNotesAction(applicationId), getScorecardAction(applicationId)]);
            if (cancelled) return;
            if (n.success) setNotes(n.data);
            if (s.success && s.data) {
                setScorecard(s.data);
                setCriteria(s.data.criteria);
                setComment(s.data.comment ?? "");
            }
        })().catch(() => undefined);
        return () => {
            cancelled = true;
        };
    }, [applicationId]);

    const addNote = async () => {
        if (!draft.trim()) return;
        const res = await createNoteAction(applicationId, draft);
        if (res.success) {
            setNotes((prev) => [res.data, ...prev]);
            setDraft("");
        } else toast.error(res.error);
    };

    const removeNote = async (id: string) => {
        const res = await deleteNoteAction(id);
        if (res.success) setNotes((prev) => prev.filter((n) => n.id !== id));
        else toast.error(res.error);
    };

    const saveCard = async () => {
        const filled = criteria.filter((c) => c.question.trim());
        if (filled.length === 0) {
            toast.error("Agrega al menos una pregunta evaluada.");
            return;
        }
        setSaving(true);
        try {
            const res = await saveScorecardAction(applicationId, filled, comment);
            if (res.success) {
                setScorecard(res.data);
                toast.success(`Scorecard guardada (${res.data.overall}/100).`);
            } else toast.error(res.error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Tabs defaultValue="notes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes">Notas internas</TabsTrigger>
                <TabsTrigger value="scorecard">Scorecard{scorecard ? ` (${scorecard.overall})` : ""}</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="flex flex-col gap-2 pt-2">
                <div className="flex gap-2">
                    <Input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        placeholder="Nota privada del equipo (no visible al candidato)..."
                        maxLength={2000}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") void addNote();
                        }}
                    />
                    <Button size="sm" onClick={() => void addNote()} disabled={!draft.trim()}>
                        Guardar
                    </Button>
                </div>
                {notes.map((n) => (
                    <div key={n.id} className="rounded-lg border border-border/40 bg-muted/20 p-2.5 text-xs">
                        <p className="text-foreground">{n.body}</p>
                        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>{new Date(n.createdAt).toLocaleString()}</span>
                            <button
                                type="button"
                                aria-label="Eliminar nota"
                                onClick={() => void removeNote(n.id)}
                                className="text-destructive hover:underline"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
                {notes.length === 0 ? <p className="text-[11px] text-muted-foreground">Sin notas todavía.</p> : null}
            </TabsContent>
            <TabsContent value="scorecard" className="flex flex-col gap-3 pt-2">
                {criteria.map((c, i) => (
                    <div key={i} className="flex flex-col gap-1 rounded-lg border border-border/40 p-2.5">
                        <Input
                            value={c.question}
                            onChange={(e) =>
                                setCriteria((prev) =>
                                    prev.map((p, j) => (j === i ? { ...p, question: e.target.value } : p)),
                                )
                            }
                            placeholder={`Pregunta ${i + 1}`}
                            maxLength={500}
                            className="text-xs"
                        />
                        <div className="flex items-center gap-2">
                            <label className="text-[11px] text-muted-foreground">Puntaje: {c.score}/5</label>
                            <input
                                type="range"
                                min={1}
                                max={5}
                                step={1}
                                value={c.score}
                                onChange={(e) =>
                                    setCriteria((prev) =>
                                        prev.map((p, j) => (j === i ? { ...p, score: Number(e.target.value) } : p)),
                                    )
                                }
                                className="w-28 accent-primary"
                            />
                            <Input
                                value={c.note}
                                onChange={(e) =>
                                    setCriteria((prev) =>
                                        prev.map((p, j) => (j === i ? { ...p, note: e.target.value } : p)),
                                    )
                                }
                                placeholder="Nota (opcional)"
                                maxLength={1000}
                                className="text-xs"
                            />
                        </div>
                    </div>
                ))}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCriteria((prev) => [...prev, { question: "", score: 3, note: "" }])}
                        disabled={criteria.length >= 20}
                    >
                        + Criterio
                    </Button>
                </div>
                <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Comentario general..."
                    rows={2}
                    maxLength={2000}
                    className="text-xs"
                />
                <Button size="sm" onClick={() => void saveCard()} disabled={saving} className="w-fit">
                    {saving ? "Guardando..." : "Guardar scorecard"}
                </Button>
            </TabsContent>
        </Tabs>
    );
}
