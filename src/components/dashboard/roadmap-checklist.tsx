"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    listRoadmapTasksAction,
    createRoadmapTaskAction,
    toggleRoadmapTaskAction,
    deleteRoadmapTaskAction,
    type RoadmapTaskDTO,
} from "@/features/roadmap/actions";

export function RoadmapChecklist() {
    const [tasks, setTasks] = useState<RoadmapTaskDTO[]>([]);
    const [skill, setSkill] = useState("");
    const [step, setStep] = useState("");

    useEffect(() => {
        listRoadmapTasksAction()
            .then((res) => {
                if (res.success) setTasks(res.data);
            })
            .catch(() => undefined);
    }, []);

    const handleCreate = async () => {
        if (skill.trim().length < 1 || step.trim().length < 3) {
            toast.error("Indica el skill y un paso concreto.");
            return;
        }
        const res = await createRoadmapTaskAction({ skill: skill.trim(), step: step.trim(), source: "manual" });
        if (res.success) {
            setTasks((prev) => [res.data, ...prev]);
            setSkill("");
            setStep("");
        } else toast.error(res.error);
    };

    const done = tasks.filter((t) => t.done).length;

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ListChecks className="size-5 text-primary" />
                    Roadmap de cierre de brechas
                    {tasks.length > 0 ? (
                        <Badge variant="outline" className="ml-auto text-[10px]">
                            {done}/{tasks.length}
                        </Badge>
                    ) : null}
                </CardTitle>
                <CardDescription>Convierte tus missing skills en pasos accionables y táchalos.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        placeholder="Skill (ej: Docker)"
                        maxLength={80}
                        className="sm:w-40"
                    />
                    <Input
                        value={step}
                        onChange={(e) => setStep(e.target.value)}
                        placeholder="Paso concreto (ej: dockerizar mi API)..."
                        maxLength={500}
                        className="flex-1"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") void handleCreate();
                        }}
                    />
                    <Button size="sm" onClick={() => void handleCreate()}>
                        Agregar
                    </Button>
                </div>
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-center gap-2 rounded-lg border border-border/40 bg-muted/20 px-3 py-2 text-xs"
                    >
                        <input
                            type="checkbox"
                            className="size-4 accent-primary"
                            checked={task.done}
                            onChange={() =>
                                void toggleRoadmapTaskAction(task.id).then((res) => {
                                    if (res.success)
                                        setTasks((prev) => prev.map((x) => (x.id === task.id ? res.data : x)));
                                })
                            }
                        />
                        <span className="font-semibold text-primary">{task.skill}</span>
                        <span className={cn("flex-1 text-muted-foreground", task.done && "line-through opacity-60")}>
                            {task.step}
                        </span>
                        <button
                            onClick={() =>
                                void deleteRoadmapTaskAction(task.id).then((res) => {
                                    if (res.success) setTasks((prev) => prev.filter((x) => x.id !== task.id));
                                })
                            }
                            className="text-muted-foreground hover:text-destructive"
                        >
                            ×
                        </button>
                    </div>
                ))}
                {tasks.length === 0 ? (
                    <p className="text-[11px] text-muted-foreground">Sin tareas. Agrega tu primera brecha a cerrar.</p>
                ) : null}
            </CardContent>
        </Card>
    );
}
