// efeitos.tsx — efeitos de câmera e atmosfera: parallax/DOF, dolly 2D, bloom,
// aberração cromática, light leak da marca. Compõem por cima das cenas.
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { C } from "./tema";

// ─── Câmera 2D: dolly-in (scale) + pan (translate) com transformOrigin no detalhe ───
export const Camera: React.FC<{
  children: React.ReactNode;
  zoomDe?: number; zoomPara?: number;
  panX?: number; panY?: number;
  origem?: string; dur?: number;
}> = ({ children, zoomDe = 1, zoomPara = 1.15, panX = 0, panY = 0, origem = "50% 45%", dur = 90 }) => {
  const frame = useCurrentFrame();
  const z = interpolate(frame, [0, dur], [zoomDe, zoomPara], { extrapolateRight: "clamp" });
  const px = interpolate(frame, [0, dur], [0, panX], { extrapolateRight: "clamp" });
  const py = interpolate(frame, [0, dur], [0, panY], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${z}) translate(${px}px, ${py}px)`, transformOrigin: origem }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Parallax: camadas em z diferente movem em velocidade diferente + DOF blur ───
// camada 0 = fundo (lento, mais blur), 1 = frente (rápido, nítido).
export const CamadaParallax: React.FC<{
  children: React.ReactNode; profundidade: number; blur?: number;
}> = ({ children, profundidade, blur }) => {
  const frame = useCurrentFrame();
  // drift lateral lento, mais forte na frente
  const x = interpolate(Math.sin(frame * 0.02), [-1, 1], [-1, 1]) * 40 * profundidade;
  const y = interpolate(Math.cos(frame * 0.015), [-1, 1], [-1, 1]) * 25 * profundidade;
  // fundo (profundidade baixa) = mais blur (fora de foco)
  const desfoque = blur ?? (1 - profundidade) * 8;
  const op = 0.4 + profundidade * 0.6;
  return (
    <AbsoluteFill style={{ transform: `translate(${x}px, ${y}px)`, filter: desfoque > 0.3 ? `blur(${desfoque}px)` : "none", opacity: op }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Bloom/glow: duplica o elemento borrado+brilhante atrás do nítido ───
export const Bloom: React.FC<{ children: React.ReactNode; forca?: number }> = ({
  children, forca = 1,
}) => (
  <div style={{ position: "relative" }}>
    <div style={{ position: "absolute", inset: 0, filter: `blur(${18 * forca}px) brightness(1.5)`, opacity: 0.7 * forca }} aria-hidden>
      {children}
    </div>
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);

// ─── Aberração cromática: 3 cópias RGB com offset, mixBlendMode screen ───
export const Aberracao: React.FC<{ children: React.ReactNode; intensidade?: number }> = ({
  children, intensidade = 2,
}) => {
  const frame = useCurrentFrame();
  // a aberração pulsa de leve
  const off = intensidade * (1 + Math.sin(frame * 0.1) * 0.4);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, filter: "url(#red)", transform: `translateX(${-off}px)`, mixBlendMode: "screen", opacity: 0.9 }} aria-hidden>
        {children}
      </div>
      <div style={{ position: "absolute", inset: 0, filter: "url(#blue)", transform: `translateX(${off}px)`, mixBlendMode: "screen", opacity: 0.9 }} aria-hidden>
        {children}
      </div>
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
};

// filtros SVG pra aberração (montar uma vez no topo da composição)
export const FiltrosRGB: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <filter id="red">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="blue">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
    </defs>
  </svg>
);

// ─── Light leak da marca: faixa de luz dourada varrendo (entra e sai) ───
export const LightLeakMarca: React.FC<{ delay?: number; dur?: number; cor?: string }> = ({
  delay = 0, dur = 50, cor = C.dourado,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const f = frame - delay;
  // entra na 1ª metade, sai na 2ª
  const prog = interpolate(f, [0, dur / 2, dur], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const x = interpolate(f, [0, dur], [-width * 0.3, width * 1.3], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity: prog }}>
      <div
        style={{
          position: "absolute", top: -height * 0.2, left: x, width: width * 0.5, height: height * 1.4,
          background: `linear-gradient(105deg, transparent, ${cor}66 40%, ${cor}aa 50%, ${cor}66 60%, transparent)`,
          filter: "blur(40px)", transform: "rotate(12deg)",
        }}
      />
    </AbsoluteFill>
  );
};