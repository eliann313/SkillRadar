"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Edit, Eye, X, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    createJobPostingAction,
    updateJobPostingAction,
    publishJobPostingAction,
    closeJobPostingAction,
} from "@/features/jobs/actions";
import { toast } from "sonner";

interface JobPosting {
    id: string;
    recruiterId: string;
    title: string;
    company: string;
    location: string;
    remoteType: string;
    description: string;
    requiredSkills: unknown; // array de strings
    seniorityLevel: string;
    status: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    _count?: {
        applications: number;
    };
}

interface PostingsClientPageProps {
    initialPostings: JobPosting[];
}

export function PostingsClientPage({ initialPostings }: PostingsClientPageProps) {
    const [postings, setPostings] = useState<JobPosting[]>(initialPostings);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPosting, setEditingPosting] = useState<JobPosting | null>(null);
    const [loading, setLoading] = useState(false);

    // Campos del formulario
    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [remoteType, setRemoteType] = useState<"remote" | "hybrid" | "onsite">("remote");
    const [description, setDescription] = useState("");
    const [skillInput, setSkillInput] = useState("");
    const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
    const [seniorityLevel, setSeniorityLevel] = useState("senior");

    const openCreateDialog = () => {
        setEditingPosting(null);
        setTitle("");
        setCompany("");
        setLocation("");
        setRemoteType("remote");
        setDescription("");
        setRequiredSkills([]);
        setSeniorityLevel("senior");
        setIsDialogOpen(true);
    };

    const openEditDialog = (posting: JobPosting) => {
        setEditingPosting(posting);
        setTitle(posting.title);
        setCompany(posting.company);
        setLocation(posting.location);
        setRemoteType(posting.remoteType as "remote" | "hybrid" | "onsite");
        setDescription(posting.description);

        let skills: string[] = [];
        if (posting.requiredSkills) {
            skills = Array.isArray(posting.requiredSkills)
                ? posting.requiredSkills
                : typeof posting.requiredSkills === "string"
                  ? JSON.parse(posting.requiredSkills)
                  : [];
        }
        setRequiredSkills(skills);
        setSeniorityLevel(posting.seniorityLevel);
        setIsDialogOpen(true);
    };

    const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const val = skillInput.trim().replace(/,$/, "");
            if (val && !requiredSkills.includes(val)) {
                setRequiredSkills([...requiredSkills, val]);
                setSkillInput("");
            }
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setRequiredSkills(requiredSkills.filter((s) => s !== skill));
    };

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!title || !company || !location || !description || requiredSkills.length === 0) {
            toast.error("Por favor completa todos los campos requeridos y añade al menos una habilidad.");
            return;
        }

        setLoading(true);
        const payload = {
            title,
            company,
            location,
            remoteType,
            description,
            requiredSkills,
            seniorityLevel,
        };

        if (editingPosting) {
            const res = await updateJobPostingAction(editingPosting.id, payload);
            if (!res.success) {
                toast.error(res.error || "Error al actualizar la oferta.");
            } else {
                setPostings((prev) =>
                    prev.map((p) => (p.id === editingPosting.id ? { ...p, ...res.data, _count: p._count } : p)),
                );
                toast.success("Oferta laboral actualizada correctamente.");
                setIsDialogOpen(false);
            }
        } else {
            const res = await createJobPostingAction(payload);
            if (!res.success) {
                toast.error(res.error || "Error al crear la oferta.");
            } else {
                setPostings((prev) => [{ ...res.data, _count: { applications: 0 } }, ...prev]);
                toast.success("Oferta laboral creada en borrador.");
                setIsDialogOpen(false);
            }
        }
        setLoading(false);
    };

    const handlePublish = async (id: string) => {
        const res = await publishJobPostingAction(id);
        if (!res.success) {
            toast.error(res.error || "Error al publicar la oferta.");
        } else {
            setPostings((prev) => prev.map((p) => (p.id === id ? { ...p, status: "published" } : p)));
            toast.success("¡Oferta publicada exitosamente! Iniciando matching proactivo...");
        }
    };

    const handleClose = async (id: string) => {
        const res = await closeJobPostingAction(id);
        if (!res.success) {
            toast.error(res.error || "Error al cerrar la oferta.");
        } else {
            setPostings((prev) => prev.map((p) => (p.id === id ? { ...p, status: "closed" } : p)));
            toast.success("Oferta cerrada correctamente.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "published":
                return (
                    <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Publicada</Badge>
                );
            case "closed":
                return <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20">Cerrada</Badge>;
            default:
                return <Badge className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">Borrador</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Ofertas Laborales</h1>
                    <p className="text-sm text-muted-foreground">
                        Crea, edita y gestiona las posiciones de empleo de tu empresa.
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                    <Plus className="size-4" />
                    <span>Crear Oferta</span>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {postings.length === 0 ? (
                    <Card className="col-span-full border-dashed border-2 py-12 flex flex-col items-center justify-center text-center">
                        <CardHeader>
                            <CardTitle className="text-muted-foreground font-medium">
                                No tienes ofertas creadas
                            </CardTitle>
                            <CardDescription>
                                Comienza publicando tu primera vacante técnica para atraer talento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={openCreateDialog} variant="outline" className="mt-2">
                                Crear Oferta
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    postings.map((posting) => {
                        const skills: string[] = Array.isArray(posting.requiredSkills)
                            ? posting.requiredSkills
                            : typeof posting.requiredSkills === "string"
                              ? JSON.parse(posting.requiredSkills)
                              : [];

                        return (
                            <Card
                                key={posting.id}
                                className="flex flex-col justify-between border border-border shadow-xs hover:shadow-md transition-shadow"
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        {getStatusBadge(posting.status)}
                                        <span className="text-[11px] text-muted-foreground">
                                            {new Date(posting.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base font-semibold leading-tight line-clamp-1">
                                        {posting.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs font-medium text-foreground/80">
                                        {posting.company} — {posting.location}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 pb-4 flex-1">
                                    <div className="flex flex-wrap gap-1">
                                        <Badge variant="outline" className="text-[10px] uppercase">
                                            {posting.remoteType}
                                        </Badge>
                                        <Badge variant="outline" className="text-[10px] uppercase">
                                            {posting.seniorityLevel}
                                        </Badge>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                                        {posting.description}
                                    </p>

                                    <div className="flex flex-wrap gap-1">
                                        {skills.slice(0, 4).map((skill) => (
                                            <Badge key={skill} variant="secondary" className="text-[10px]">
                                                {skill}
                                            </Badge>
                                        ))}
                                        {skills.length > 4 && (
                                            <span className="text-[10px] text-muted-foreground self-center px-1">
                                                +{skills.length - 4}
                                            </span>
                                        )}
                                    </div>
                                </CardContent>

                                <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
                                    <Link
                                        href={`/dashboard/recruiter/postings/${posting.id}/applications`}
                                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                                    >
                                        <Eye className="size-3.5" />
                                        <span>{posting._count?.applications || 0} Aplicaciones</span>
                                    </Link>

                                    <div className="flex gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon-sm"
                                            onClick={() => openEditDialog(posting)}
                                            title="Editar oferta"
                                            className="size-8"
                                        >
                                            <Edit className="size-3.5" />
                                        </Button>

                                        {posting.status !== "published" && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    void handlePublish(posting.id);
                                                }}
                                                title="Publicar oferta"
                                                className="size-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/10"
                                            >
                                                <Send className="size-3.5" />
                                            </Button>
                                        )}

                                        {posting.status === "published" && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    void handleClose(posting.id);
                                                }}
                                                title="Cerrar oferta"
                                                className="size-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/10"
                                            >
                                                <Lock className="size-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md sm:max-w-lg bg-popover text-popover-foreground">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPosting ? "Editar Oferta Laboral" : "Crear Nueva Oferta Laboral"}
                        </DialogTitle>
                        <DialogDescription>
                            Completa los campos a continuación para configurar la vacante técnica.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            void handleSave();
                        }}
                        className="space-y-4 py-2"
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Título del Puesto *</label>
                                <Input
                                    required
                                    placeholder="Ej: Senior Frontend Developer"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Empresa *</label>
                                <Input
                                    required
                                    placeholder="Ej: Acme Corp"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5 col-span-2">
                                <label className="text-xs font-semibold">Ubicación *</label>
                                <Input
                                    required
                                    placeholder="Ej: Buenos Aires, Argentina"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Modalidad</label>
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                                    value={remoteType}
                                    onChange={(e) => setRemoteType(e.target.value as "remote" | "hybrid" | "onsite")}
                                >
                                    <option value="remote">Remoto</option>
                                    <option value="hybrid">Híbrido</option>
                                    <option value="onsite">Presencial</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Seniority Requerido</label>
                                <Input
                                    required
                                    placeholder="Ej: senior, semi-senior, junior"
                                    value={seniorityLevel}
                                    onChange={(e) => setSeniorityLevel(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold">Habilidades Requeridas (tags) *</label>
                                <Input
                                    placeholder="Escribe y presiona Enter o ,"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                />
                            </div>
                        </div>

                        {requiredSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-md border border-border">
                                {requiredSkills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="text-xs flex items-center gap-1">
                                        <span>{skill}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="text-muted-foreground hover:text-foreground focus:outline-hidden"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold">Descripción del Puesto *</label>
                            <Textarea
                                required
                                rows={5}
                                placeholder="Detalla los requerimientos, responsabilidades y lo que ofrece el puesto..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <DialogFooter showCloseButton />
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Guardar Oferta"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
