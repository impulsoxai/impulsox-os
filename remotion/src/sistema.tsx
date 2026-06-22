// sistema.tsx — componentes pro reel do ImpulsoX-OS: terminal estilo mac digitando os
// comandos (/identidade, /post, /pagina) + mock do Open Design construindo a identidade.
// Mostra o "produto" (o sistema trabalhando), igual o reel do OpenClawd.
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { C } from "./premium";

// ─── Terminal mac: digita um comando char-a-char + mostra saída em linhas ───
export const Terminal: React.FC<{
  comando: string;
  saida?: string[];
  delayComando?: number;
  largura?: number;
  altura?: number;
}> = ({ comando, saida = [], delayComando = 0, largura = 820, altura = 520 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delayComando);
  // digita 1 char a cada 4 frames (devagar, dá pra ler letra a letra)
  const chars = Math.min(comando.length, Math.floor(f / 4));
  const digitado = comando.slice(0, chars);
  const terminouComando = chars >= comando.length;
  const cursorOn = Math.floor(frame / 8) % 2 === 0;
  // saída aparece um tempo depois do comando terminar
  const fSaida = f - comando.length * 4 - 10;
  const linhasVisiveis = terminouComando ? Math.max(0, Math.floor(fSaida / 6)) : 0;

  // Paleta do Claude Code (deixa claro que o sistema roda lá): fundo escuro neutro,
  // acento terracota/laranja (#d97757), texto creme. Prompt "✻" característico do CC.
  const CC = { fundo: "#1c1b1a", chrome: "#262422", borda: "#3a3633", laranja: "#d97757", texto: "#e8e3dc", mudo: "#8a8378", verde: "#7ec699" };
  return (
    <div style={{
      width: largura, height: altura, borderRadius: 14, overflow: "hidden",
      background: CC.fundo, border: `1px solid ${CC.borda}`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 50px rgba(217,119,87,0.08)`,
      fontFamily: "monospace",
    }}>
      {/* chrome estilo Claude Code */}
      <div style={{ height: 44, background: CC.chrome, display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: `1px solid ${CC.borda}` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 14, fontSize: 15, color: CC.laranja, fontWeight: 700 }}>✻ claude code</span>
        <span style={{ marginLeft: 10, fontSize: 14, color: CC.mudo }}>— impulsox-os</span>
      </div>
      {/* corpo */}
      <div style={{ padding: "24px 28px", fontSize: 26, lineHeight: 1.6 }}>
        <div style={{ color: CC.texto }}>
          <span style={{ color: CC.laranja }}>❯</span>{" "}
          <span style={{ color: CC.texto }}>{digitado}</span>
          {!terminouComando && <span style={{ opacity: cursorOn ? 1 : 0, color: CC.laranja }}>▌</span>}
        </div>
        {saida.slice(0, linhasVisiveis).map((l, i) => (
          <div key={i} style={{ color: l.startsWith("✓") ? CC.verde : CC.mudo, fontSize: 22, marginTop: i === 0 ? 14 : 4 }}>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Mock do Open Design construindo a identidade: paleta + fonte + logo ───
export const OpenDesignMock: React.FC<{ delay?: number; cores: string[] }> = ({
  delay = 0, cores,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = Math.max(0, frame - delay);
  const logoOp = interpolate(f, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const logoEsc = spring({ frame: f - 40, fps, config: { damping: 12 } });

  return (
    <div style={{
      width: 820, height: 560, borderRadius: 14, overflow: "hidden",
      background: "#0e0c16", border: `1px solid ${C.dourado}33`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6)`,
    }}>
      {/* chrome */}
      <div style={{ height: 44, background: "#15131f", display: "flex", alignItems: "center", padding: "0 16px", gap: 8, borderBottom: `1px solid ${C.dourado}18` }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
        <span style={{ marginLeft: 14, fontFamily: "monospace", fontSize: 15, color: C.textoMudo }}>Open Design · identidade</span>
      </div>
      <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 26 }}>
        {/* paleta surgindo */}
        <div>
          <div style={{ fontFamily: "monospace", fontSize: 16, color: C.textoMudo, letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>paleta</div>
          <div style={{ display: "flex", gap: 12 }}>
            {cores.map((cor, i) => {
              const s = spring({ frame: f - 5 - i * 6, fps, config: { damping: 13, stiffness: 160 } });
              return (
                <div key={i} style={{
                  width: 88, height: 88, borderRadius: 10, background: cor,
                  transform: `scale(${s})`, boxShadow: `0 8px 24px ${cor}55`,
                  border: "1px solid rgba(255,255,255,0.1)",
                }} />
              );
            })}
          </div>
        </div>
        {/* fonte sendo aplicada */}
        <div style={{ opacity: interpolate(f, [24, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ fontFamily: "monospace", fontSize: 16, color: C.textoMudo, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>tipografia</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, color: C.texto }}>Aa Bb Cc <span style={{ color: C.dourado }}>123</span></div>
        </div>
        {/* logo montando */}
        <div style={{ opacity: logoOp, transform: `scale(${0.8 + logoEsc * 0.2})`, alignSelf: "flex-start" }}>
          <div style={{ fontFamily: "monospace", fontSize: 16, color: C.textoMudo, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>logo</div>
          <Img src={staticFile("logo-impulsox.svg")} style={{ height: 90 }} />
        </div>
      </div>
    </div>
  );
};
