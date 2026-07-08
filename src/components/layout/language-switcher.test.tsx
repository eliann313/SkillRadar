// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { LanguageSwitcher } from "./language-switcher";

const mockReplace = vi.fn();
vi.mock("next-intl", () => ({
    useLocale: () => "es",
}));
vi.mock("@/i18n/routing", () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),
    usePathname: () => "/some-path",
}));

// Mock DropdownMenu para simplificar y aislar el test del DOM de Radix
vi.mock("@/components/ui/dropdown-menu", () => ({
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ render }: any) => render,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

describe("LanguageSwitcher Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("debe renderizar el botón selector de idioma", () => {
        render(<LanguageSwitcher />);
        expect(screen.getByLabelText("Select language")).toBeDefined();
    });

    it("debe invocar el reemplazo de idioma a inglés al hacer clic en English", () => {
        render(<LanguageSwitcher />);
        const englishButton = screen.getByText("English");
        fireEvent.click(englishButton);
        expect(mockReplace).toHaveBeenCalledWith("/some-path", { locale: "en" });
    });

    it("debe invocar el reemplazo de idioma a español al hacer clic en Español", () => {
        render(<LanguageSwitcher />);
        const spanishButton = screen.getByText("Español");
        fireEvent.click(spanishButton);
        expect(mockReplace).toHaveBeenCalledWith("/some-path", { locale: "es" });
    });
});
