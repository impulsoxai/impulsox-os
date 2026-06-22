// produto.tsx — mostra os POSTS REAIS da ImpulsoX (carrosséis que o sistema produziu)
// dentro de mockups, igual o reel do OpenClawd mostra o produto funcionando.
// As imagens vêm de remotion/public/carrosseis/<post>/slide-NN.png via staticFile.
import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { C } from "./premium";

// lista de slides de um carrossel (caminhos staticFile)
export function slidesDe(post: string, n: number): string[] {
  return new Array(n).fill(0).map((_, i) =>
    staticFile(`carrosseis/${post}/slide-${String(i + 1).padStart(2, "0")}.png`),
  );
}

// ─── Phone mockup (frame de celular) com um conteúdo dentro ───
export const Phone: React.FC<{ children: React.ReactNode; escala?: number }> = ({
  children, escala = 1,
}) => {
  const W = 480, H = 600; // proporção 4:5 do post + chrome
  const padTop = 90, padBottom = 60, padX = 24;
  return (
    <div style={{
      width: (W + padX * 2) * escala, height: (H + padTop + padBottom) * escala,
      transform: `scale(${escala})`, transformOrigin: "center",
      background: "#0a0a12", borderRadius: 54, border: `2px solid ${C.dourado}33`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 60px ${C.dourado}11, inset 0 1px 0 rgba(255,255,255,0.06)`,
      padding: `${padTop}px ${padX}px ${padBottom}px`, position: "relative",
    }}>
      {/* notch */}
      <div style={{
        position: "absolute", top: 28, left: "50%", transform: "translateX(-50%)",
        width: 130, height: 30, background: "#000", borderRadius: 16,
      }} />
      {/* header app (instagram-like) */}
      <div style={{
        position: "absolute", top: 64, left: padX + 6, right: padX + 6,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg, ${C.dourado}, ${C.roxo})` }} />
        <span style={{ fontFamily: "monospace", fontSize: 14, color: C.texto, fontWeight: 700 }}>impulsox.ai</span>
      </div>
      {/* conteúdo (o post) */}
      <div style={{ borderRadius: 18, overflow: "hidden", width: W, height: H, background: "#000" }}>
        {children}
      </div>
    </div>
  );
};

// ─── Carrossel real deslizando: troca de slide a cada `framesPorSlide` ───
export const CarrosselReal: React.FC<{
  slides: string[]; framesPorSlide?: number; delay?: number;
}> = ({ slides, framesPorSlide = 28, delay = 0 }) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  const total = slides.length;
  const idx = Math.min(total - 1, Math.floor(f / framesPorSlide));
  // desliza: cada slide entra da direita com easing
  const dentroDoSlide = (f % framesPorSlide) / framesPorSlide;
  const desliza = interpolate(dentroDoSlide, [0, 0.35], [1, 0], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {idx > 0 && (
        <Img src={slides[idx - 1]} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `translateX(${-desliza * 30}%)`, opacity: desliza }} />
      )}
      <Img
        src={slides[idx]}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", transform: `translateX(${desliza * 100}%)` }}
      />
      {/* dots de paginação */}
      <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
        {slides.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 14 : 6, height: 6, borderRadius: 3, background: i === idx ? C.dourado : "#ffffff44" }} />
        ))}
      </div>
    </div>
  );
};

// ─── Pilha de posts (3 carrosséis em leque, profundidade) ───
export const LequePosts: React.FC<{ capas: string[]; delay?: number }> = ({ capas, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: 480, height: 600 }}>
      {capas.map((capa, i) => {
        const s = spring({ frame: frame - delay - i * 8, fps, config: { damping: 14, stiffness: 120 } });
        const ang = (i - 1) * 12; // -12, 0, 12 graus
        const dx = (i - 1) * 90;
        const op = interpolate(s, [0, 1], [0, 1]);
        const esc = interpolate(s, [0, 1], [0.7, i === 1 ? 1 : 0.86]);
        return (
          <div key={i} style={{
            position: "absolute", inset: 0, opacity: op,
            transform: `translateX(${dx * s}px) rotate(${ang * s}deg) scale(${esc})`,
            transformOrigin: "bottom center", zIndex: i === 1 ? 3 : 1,
            borderRadius: 18, overflow: "hidden",
            boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 30px ${C.dourado}10`,
            border: `1px solid ${C.dourado}22`,
          }}>
            <Img src={capa} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </div>
  );
};
// ═══ LANDING PAGES (mesma fórmula: mostrar a página REAL no mockup) ═══

export function paginaTop(slug: string): string { return staticFile(`paginas/${slug}-top.png`); }
export function paginaFull(slug: string): string { return staticFile(`paginas/${slug}-full.png`); }

// ─── Browser-mockup: frame de navegador com barra de URL + página dentro ───
export const Browser: React.FC<{ url: string; children: React.ReactNode; largura?: number; altura?: number }> = ({
  url, children, largura = 760, altura = 950,
}) => {
  return (
    <div style={{
      width: largura, height: altura, borderRadius: 16, overflow: "hidden",
      background: "#0a0a12", border: `1px solid ${C.dourado}33`,
      boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 60px ${C.dourado}10`,
    }}>
      {/* chrome: traffic lights + barra de URL */}
      <div style={{ height: 52, background: "#13131f", display: "flex", alignItems: "center", padding: "0 18px", gap: 14, borderBottom: `1px solid ${C.dourado}18` }}>
        <div style={{ display: "flex", gap: 8 }}>
          {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 30, borderRadius: 8, background: "#0a0a12", display: "flex", alignItems: "center", padding: "0 16px", gap: 10 }}>
          <span style={{ color: C.dourado, fontSize: 13 }}>🔒</span>
          <span style={{ fontFamily: "monospace", fontSize: 16, color: C.textoSuave, letterSpacing: "0.04em" }}>{url}</span>
        </div>
      </div>
      {/* viewport */}
      <div style={{ width: "100%", height: altura - 52, overflow: "hidden", position: "relative", background: "#000" }}>
        {children}
      </div>
    </div>
  );
};

// ─── Scroll da página: a imagem full-page rola dentro do viewport ───
export const ScrollPagina: React.FC<{ src: string; delay?: number; dur?: number; maxScroll?: number }> = ({
  src, delay = 0, dur = 130, maxScroll = 45,
}) => {
  const frame = useCurrentFrame();
  const f = Math.max(0, frame - delay);
  // rola de 0% até -maxScroll% (hero → 1ª seção); maxScroll baixo evita parar no vazio
  const y = interpolate(f, [0, dur], [0, -maxScroll], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <Img src={src} style={{ width: "100%", position: "absolute", top: 0, left: 0, transform: `translateY(${y}%)` }} />
  );
};

// ─── Leque de 3 páginas (browsers em profundidade) ───
export const LequePaginas: React.FC<{ tops: string[]; urls: string[]; delay?: number }> = ({
  tops, urls, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "relative", width: 700, height: 880 }}>
      {tops.map((top, i) => {
        const s = spring({ frame: frame - delay - i * 9, fps, config: { damping: 15, stiffness: 110 } });
        const dx = (i - 1) * 120;
        const ang = (i - 1) * 10;
        const op = interpolate(s, [0, 1], [0, 1]);
        const esc = interpolate(s, [0, 1], [0.7, i === 1 ? 1 : 0.84]);
        return (
          <div key={i} style={{
            position: "absolute", inset: 0, opacity: op,
            transform: `translateX(${dx * s}px) rotate(${ang * s}deg) scale(${esc})`,
            transformOrigin: "bottom center", zIndex: i === 1 ? 3 : 1,
          }}>
            <Browser url={urls[i]} largura={700} altura={880}>
              <Img src={top} style={{ width: "100%", position: "absolute", top: 0, left: 0 }} />
            </Browser>
          </div>
        );
      })}
    </div>
  );
};
