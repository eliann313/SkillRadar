"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import type { SavedSearchDTO } from "@/features/saved-searches/application/saved-searches.use-cases";

interface TalentFiltersToolbarProps {
    searchQuery: string;
    onSearchQuery: (value: string) => void;
    seniorityFilter: string[];
    onToggleSeniority: (level: string, checked: boolean) => void;
    minScore: number;
    onMinScore: (value: number) => void;
    onlyShortlisted: boolean;
    onOnlyShortlisted: (value: boolean) => void;
    sortBy: "score" | "recent";
    onSortBy: (value: "score" | "recent") => void;
    onClearFilters: () => void;
    savedName: string;
    onSavedName: (value: string) => void;
    savedSearches: SavedSearchDTO[];
    onSaveSearch: () => void;
    onApplySaved: (s: SavedSearchDTO) => void;
    onDeleteSaved: (id: string) => void;
}

/** Barra de filtros + búsquedas guardadas (ex bloque del dashboard monolítico). */
export function TalentFiltersToolbar({
    searchQuery,
    onSearchQuery,
    seniorityFilter,
    onToggleSeniority,
    minScore,
    onMinScore,
    onlyShortlisted,
    onOnlyShortlisted,
    sortBy,
    onSortBy,
    onClearFilters,
    savedName,
    onSavedName,
    savedSearches,
    onSaveSearch,
    onApplySaved,
    onDeleteSaved,
}: TalentFiltersToolbarProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search by skill, name or anonymous ID (e.g., React, DEV-9B1C)..."
                    value={searchQuery}
                    onChange={(e) => onSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border"
                />
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {(["junior", "mid", "senior", "lead"] as const).map((level) => (
                    <label key={level} className="flex cursor-pointer items-center gap-1.5 capitalize">
                        <input
                            type="checkbox"
                            className="size-3.5 accent-primary"
                            checked={seniorityFilter.includes(level)}
                            onChange={(e) => onToggleSeniority(level, e.target.checked)}
                        />
                        {level}
                    </label>
                ))}
                <label className="flex items-center gap-1.5">
                    Score ≥ {minScore}
                    <input
                        type="range"
                        min={0}
                        max={100}
                        step={5}
                        value={minScore}
                        onChange={(e) => onMinScore(Number(e.target.value))}
                        className="w-24 accent-primary"
                    />
                </label>
                <label className="flex cursor-pointer items-center gap-1.5">
                    <input
                        type="checkbox"
                        className="size-3.5 accent-primary"
                        checked={onlyShortlisted}
                        onChange={(e) => onOnlyShortlisted(e.target.checked)}
                    />
                    Solo shortlist
                </label>
                <label className="flex items-center gap-1.5">
                    Orden:
                    <select
                        value={sortBy}
                        onChange={(e) => onSortBy(e.target.value as "score" | "recent")}
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground"
                    >
                        <option value="score">Mayor score</option>
                        <option value="recent">Más recientes</option>
                    </select>
                </label>
                {(seniorityFilter.length > 0 || minScore > 0 || onlyShortlisted || searchQuery.trim()) && (
                    <button
                        onClick={onClearFilters}
                        className="ml-auto flex items-center gap-1 text-primary hover:underline"
                    >
                        <X className="size-3" />
                        Limpiar filtros
                    </button>
                )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <Input
                    value={savedName}
                    onChange={(e) => onSavedName(e.target.value)}
                    placeholder="Guardar filtros actuales como..."
                    maxLength={60}
                    className="h-8 w-52 bg-card text-xs"
                />
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={onSaveSearch}>
                    Guardar búsqueda
                </Button>
                {savedSearches.map((s) => (
                    <span
                        key={s.id}
                        className="flex items-center gap-1 rounded-full border border-border/40 bg-card px-2.5 py-1"
                    >
                        <button onClick={() => onApplySaved(s)} className="hover:text-primary">
                            {s.name}
                        </button>
                        <button
                            onClick={() => onDeleteSaved(s.id)}
                            className="text-muted-foreground hover:text-destructive"
                            title="Eliminar"
                        >
                            <X className="size-3" />
                        </button>
                    </span>
                ))}
            </div>
        </div>
    );
}
