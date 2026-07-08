// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { LoginForm } from "./login-form";

// Mock next-auth
vi.mock("next-auth/react", () => ({
    useSession: () => ({ data: null, status: "unauthenticated" }),
    signIn: vi.fn(),
}));

// Mock routing Link
vi.mock("@/i18n/routing", () => ({
    Link: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Mock next-intl useTranslations
vi.mock("next-intl", () => ({
    useTranslations: () => (key: string) => {
        const translations: Record<string, string> = {
            signUpTitle: "Crear una cuenta",
            signInTitle: "Bienvenido de nuevo",
            registerBtn: "Registrarse",
            loginBtn: "Iniciar Sesión",
        };
        return translations[key] || key;
    },
    useLocale: () => "es",
}));

// Mock language switcher and theme toggle
vi.mock("@/components/layout", () => ({
    LanguageSwitcher: () => <div>LanguageSwitcher</div>,
    ThemeToggle: () => <div>ThemeToggle</div>,
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
    useSearchParams: () => mockSearchParams,
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe("LoginForm Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it("debe inicializarse en modo Login por defecto si no hay query params", () => {
        render(<LoginForm />);

        // Encabezado del modo Login
        expect(screen.getByText("Bienvenido de nuevo")).toBeDefined();
        // Botón de submit del modo Login
        expect(screen.getByText("Iniciar Sesión")).toBeDefined();
    });

    it("debe inicializarse en modo Registro si el parámetro ?register=true está presente", () => {
        mockSearchParams = new URLSearchParams("register=true");
        render(<LoginForm />);

        // Encabezado del modo Registro
        expect(screen.getByText("Crear una cuenta")).toBeDefined();
        // Botón de submit del modo Registro
        expect(screen.getByText("Registrarse")).toBeDefined();
    });
});
