"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
    createTemplateAction,
    deleteTemplateAction,
    type OutreachTemplateDTO,
} from "@/features/outreach-templates/application/outreach-templates.use-cases";
import { EmptyState } from "@/components/ui/empty-state";
import { Mail } from "lucide-react";

export function TemplatesClientPage({ initial }: { initial: OutreachTemplateDTO[] }) {
    const t = useTranslations("Templates");
    const [items, setItems] = useState(initial);
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [saving, setSaving] = useState(false);
    const [varPuesto, setVarPuesto] = useState("");
    const [varEmpresa, setVarEmpresa] = useState("");

    const handleCreate = async () => {
        setSaving(true);
        try {
            const res = await createTemplateAction({ name, subject: subject || undefined, body });
            if (res.success) {
                setItems((prev) => [res.data, ...prev]);
                setName("");
                setSubject("");
                setBody("");
                toast.success(t("created"));
            } else {
                toast.error(res.error);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteTemplateAction(id);
        if (res.success) setItems((prev) => prev.filter((i) => i.id !== id));
        else toast.error(res.error);
    };

    const copyBody = async (text: string) => {
        const replaced = text
            .replaceAll("{{puesto}}", varPuesto)
            .replaceAll("{{empresa}}", varEmpresa)
            .replaceAll("{puesto}", varPuesto)
            .replaceAll("{empresa}", varEmpresa);
        try {
            await navigator.clipboard.writeText(replaced);
            toast.success(t("copied"));
        } catch {
            toast.error(t("copyError"));
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
            </div>

            <Card className="border-border/50 bg-card/50">
                <CardHeader>
                    <CardTitle className="text-base">{t("newTemplate")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("namePh")}
                        maxLength={80}
                    />
                    <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder={t("subjectPh")}
                        maxLength={140}
                    />
                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder={t("bodyPh")}
                        rows={5}
                        maxLength={5000}
                    />
                    <p className="text-[11px] text-muted-foreground">{t("hint")}</p>
                    <Button
                        onClick={() => void handleCreate()}
                        disabled={saving || name.trim().length < 2 || body.trim().length < 10}
                        className="w-fit"
                    >
                        {t("save")}
                    </Button>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
                <Input
                    value={varPuesto}
                    onChange={(e) => setVarPuesto(e.target.value)}
                    placeholder={t("varPuestoPh")}
                    maxLength={80}
                />
                <Input
                    value={varEmpresa}
                    onChange={(e) => setVarEmpresa(e.target.value)}
                    placeholder={t("varEmpresaPh")}
                    maxLength={80}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {items.map((tpl) => (
                    <Card key={tpl.id} className="border-border/50 bg-card/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">{tpl.name}</CardTitle>
                            {tpl.subject ? <p className="text-xs text-muted-foreground">{tpl.subject}</p> : null}
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            <p className="line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">{tpl.body}</p>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => void copyBody(tpl.body)}>
                                    {t("copy")}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive"
                                    onClick={() => void handleDelete(tpl.id)}
                                >
                                    {t("delete")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {items.length === 0 ? (
                    <EmptyState
                        icon={<Mail className="size-5 text-muted-foreground" />}
                        title={t("empty")}
                        description={t("subtitle")}
                    />
                ) : null}
            </div>
        </div>
    );
}
