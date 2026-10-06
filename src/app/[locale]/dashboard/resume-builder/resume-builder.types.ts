"use client";

/** Tipos del constructor de CV (ex interfaces de resume-builder/page). */

export interface PersonalInfo {
    name: string;
    title: string;
    email: string;
    phone: string;
    website: string;
    github: string;
    linkedin: string;
    summary: string;
}

export interface ExperienceItem {
    id: string;
    company: string;
    role: string;
    dates: string;
    description: string;
}

export interface ProjectItem {
    id: string;
    name: string;
    role: string;
    dates: string;
    description: string;
}

export interface LanguageItem {
    id: string;
    name: string;
    level: string;
}

export interface EducationItem {
    id: string;
    institution: string;
    degree: string;
    dates: string;
    description: string;
}
