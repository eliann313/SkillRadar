/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { authConfig } from "./auth.config";

describe("authConfig callbacks.authorized", () => {
    const authorized = authConfig.callbacks.authorized;

    it("debe autorizar a un usuario autenticado en el dashboard con prefijo de idioma", () => {
        const nextUrl = new URL("http://localhost:3000/es/dashboard");
        const result = authorized({
            auth: { user: { id: "user-123" } } as any,
            request: { nextUrl } as any,
        });
        expect(result).toBe(true);
    });

    it("debe denegar el acceso a un usuario no autenticado en el dashboard con prefijo de idioma", () => {
        const nextUrl = new URL("http://localhost:3000/en/dashboard/settings");
        const result = authorized({
            auth: null,
            request: { nextUrl } as any,
        });
        expect(result).toBe(false);
    });

    it("debe permitir el acceso a un usuario no autenticado en páginas públicas con prefijo de idioma", () => {
        const nextUrl = new URL("http://localhost:3000/es/login");
        const result = authorized({
            auth: null,
            request: { nextUrl } as any,
        });
        expect(result).toBe(true);
    });

    it("debe redirigir al login limpio si se detectan callbackUrl infinitas o anidadas", () => {
        const nextUrl = new URL("http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Flogin%3FcallbackUrl%3D... ");
        const responseRedirectSpy = vi.spyOn(Response, "redirect");

        authorized({
            auth: null,
            request: { nextUrl } as any,
        });

        expect(responseRedirectSpy).toHaveBeenCalled();
        const redirectUrl = responseRedirectSpy.mock.calls[0][0] as URL;
        expect(redirectUrl.pathname).toBe("/login");
    });
});
