import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillRadar — Optimiza tu perfil tecnológico con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#09090b",
                color: "#ffffff",
                fontFamily: "sans-serif",
            }}
        >
            <div style={{ fontSize: 28, color: "#10b981", fontWeight: 700, marginBottom: 16 }}>SkillRadar</div>
            <div style={{ fontSize: 64, fontWeight: 900, textAlign: "center", lineHeight: 1.1 }}>
                Deconstruye y optimiza
                <br />
                tu perfil tecnológico
            </div>
            <div style={{ fontSize: 24, color: "#94a3b8", marginTop: 24 }}>ATS 0-based · Job Match · Doble ciego</div>
        </div>,
        { ...size },
    );
}
