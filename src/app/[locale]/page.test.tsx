import { vi, expect, test } from "vitest";

vi.mock("@/i18n/routing", () => ({
    Link: ({ children }: { children: React.ReactNode }) => children,
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));

import Home from "./page";

test("Home component exports a function", () => {
    expect(typeof Home).toBe("function");
});
