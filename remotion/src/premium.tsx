// premium.tsx — biblioteca de componentes tech-premium pro reel ImpulsoX.
// Vocabulário: anéis radar, scanner line, corner brackets, partículas geométricas,
// glitch digital, HUD glassmorphism, logo draw-on. Cores da marca (dourado+roxo).
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  random,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { makeTransform, scale, translateY, rotate } from "@remotion/animation-utils";

export const C = {
  fundo: "#06060d",
  roxo: "#7c3aed",
  roxoProf: "#4c1d95",
  roxoSuave: "#a78bfa",
  dourado: "#d4af37",
  douradoClaro: "#e2c97e",
  texto: "#f0ebe0",
  textoSuave: "#8a8070",
  textoMudo: "#4a4540",
};

// ─── Fundo: gradiente radial respirando + noise + vinheta ───
export const FundoTech: React.FC<{ cor?: string }> = ({ cor = C.roxoProf }) => {
  const frame = useCurrentFrame();
  // fundo PREMIUM = sólido nítido + grade técnica fina + glow de TOPO sutil (não orb/bola).
  // o glow é linear de cima (não radial) → sem círculo visível, sem "bola".
  const glow = interpolate(Math.sin(frame * 0.04), [-1, 1], [0.05, 0.11]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#080510", overflow: "hidden" }}>
      {/* halo de cor suave no terço superior — começa transparente, pico discreto, some.
          NÃO cor cheia colada no topo (manchava). */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${cor} 22%, transparent 50%)`,
          opacity: glow,
        }}
      />
      {/* GRADE técnica fina dourada — estrutura premium, máscara linear (some nas bordas) */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.dourado}10 1px, transparent 1px), linear-gradient(90deg, ${C.dourado}10 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(180deg, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, black 25%, black 75%, transparent)",
          opacity: 0.6,
        }}
      />
      {/* vinheta MUITO leve só nas pontas */}
      <AbsoluteFill style={{ boxShadow: "inset 0 0 140px 20px rgba(0,0,0,0.4)" }} />
    </AbsoluteFill>
  );
};

// ─── Grade de feed (money shot): 9 células que preenchem em cascata ───
export const GradeFeed: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 3x3, cada célula com uma "cara" de post (cor da marca, barra de texto)
  const cells = [
    { c: C.roxo, t: "carrossel" }, { c: C.dourado, t: "reel" }, { c: C.roxoProf, t: "post" },
    { c: C.dourado, t: "linkedin" }, { c: C.roxo, t: "carrossel" }, { c: C.douradoClaro, t: "story" },
    { c: C.roxoProf, t: "reel" }, { c: C.dourado, t: "post" }, { c: C.roxo, t: "carrossel" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 150px)", gap: 14 }}>
      {cells.map((cell, i) => {
        const s = spring({ frame: frame - delay - i * 6, fps, config: { damping: 13, stiffness: 160 } });
        const esc = interpolate(s, [0, 1], [0.3, 1]);
        const op = interpolate(s, [0, 0.7], [0, 1], { extrapolateRight: "clamp" });
        return (
          <div key={i} style={{
            width: 150, height: 190, borderRadius: 10, opacity: op, transform: `scale(${esc})`,
            background: `linear-gradient(145deg, ${cell.c}cc, ${cell.c}55)`,
            border: `1px solid ${cell.c}`, boxShadow: `0 8px 24px ${cell.c}44`,
            display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 12, gap: 6,
          }}>
            <div style={{ width: "70%", height: 6, borderRadius: 3, background: "#ffffff99" }} />
            <div style={{ width: "45%", height: 6, borderRadius: 3, background: "#ffffff55" }} />
          </div>
        );
      })}
    </div>
  );
};

// grade VAZIA (estado "before") — só contornos cinza
export const GradeVazia: React.FC = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 150px)", gap: 14 }}>
    {new Array(9).fill(0).map((_, i) => (
      <div key={i} style={{
        width: 150, height: 190, borderRadius: 10,
        border: `1px dashed ${C.textoMudo}`, background: "#ffffff05",
      }} />
    ))}
  </div>
);

// ─── Anéis radar dashed girando (2 anéis, sentidos opostos) ───
export const AneisRadar: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => {
  const frame = useCurrentFrame();
  const giro1 = frame * 0.6;
  const giro2 = -frame * 0.4;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute" }}>
        <circle
          cx={cx} cy={cy} r={280}
          fill="none" stroke={C.dourado} strokeWidth={1.5}
          strokeDasharray="2 22" opacity={0.4}
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${giro1}deg)` }}
        />
        <circle
          cx={cx} cy={cy} r={360}
          fill="none" stroke={C.roxoSuave} strokeWidth={1} strokeDasharray="40 18"
          opacity={0.25}
          style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${giro2}deg)` }}
        />
        <circle cx={cx} cy={cy} r={200} fill="none" stroke={C.dourado} strokeWidth={0.5} opacity={0.15} />
      </svg>
    </AbsoluteFill>
  );
};

// ─── Scanner line vertical que varre a tela ───
export const Scanner: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const x = interpolate(frame % 120, [0, 120], [0, width]);
  const op = interpolate(frame % 120, [0, 10, 110, 120], [0, 0.6, 0.6, 0]);
  return (
    <div
      style={{
        position: "absolute", left: x, top: 0, bottom: 0, width: 2,
        background: `linear-gradient(180deg, transparent, ${C.dourado}, transparent)`,
        boxShadow: `0 0 20px ${C.dourado}`, opacity: op,
      }}
    />
  );
};

// ─── Corner brackets HUD (4 cantos) ───
export const CornerBrackets: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  const op = interpolate(s, [0, 1], [0, 0.6]);
  const L = 60, m = 70, t = 2;
  const bracket = (top: boolean, left: boolean): React.CSSProperties => ({
    position: "absolute",
    [top ? "top" : "bottom"]: m,
    [left ? "left" : "right"]: m,
    width: L, height: L,
    borderTop: top ? `${t}px solid ${C.dourado}` : "none",
    borderBottom: !top ? `${t}px solid ${C.dourado}` : "none",
    borderLeft: left ? `${t}px solid ${C.dourado}` : "none",
    borderRight: !left ? `${t}px solid ${C.dourado}` : "none",
    opacity: op,
  });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={bracket(true, true)} />
      <div style={bracket(true, false)} />
      <div style={bracket(false, true)} />
      <div style={bracket(false, false)} />
    </AbsoluteFill>
  );
};

// ─── Partículas geométricas flutuando (triângulos + hexágonos + pontos) ───
export const Particulas: React.FC<{ n?: number }> = ({ n = 22 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const seed = i * 11.3;
        const x = random(`px${i}`) * width;
        const y = random(`py${i}`) * height;
        const drift = interpolate(Math.sin(frame * 0.02 + seed), [-1, 1], [-25, 25]);
        const giro = frame * (0.3 + random(`pr${i}`)) + seed;
        const op = interpolate(Math.sin(frame * 0.035 + seed), [-1, 1], [0.05, 0.3]);
        const tipo = i % 3;
        const tam = 6 + random(`ps${i}`) * 10;
        const cor = i % 2 === 0 ? C.dourado : C.roxoSuave;
        const estiloBase: React.CSSProperties = {
          position: "absolute", left: x, top: y + drift, opacity: op,
          transform: `rotate(${giro}deg)`,
        };
        if (tipo === 0) {
          // ponto
          return <div key={i} style={{ ...estiloBase, width: 3, height: 3, borderRadius: "50%", background: cor, boxShadow: `0 0 8px ${cor}` }} />;
        }
        if (tipo === 1) {
          // triângulo (contorno)
          return (
            <div key={i} style={{ ...estiloBase, width: 0, height: 0, borderLeft: `${tam}px solid transparent`, borderRight: `${tam}px solid transparent`, borderBottom: `${tam * 1.6}px solid ${cor}`, opacity: op * 0.6 }} />
          );
        }
        // hexágono (svg)
        return (
          <svg key={i} width={tam * 2} height={tam * 2} style={estiloBase}>
            <polygon
              points={`${tam},2 ${tam * 1.9},${tam * 0.55} ${tam * 1.9},${tam * 1.45} ${tam},${tam * 2 - 2} ${tam * 0.1},${tam * 1.45} ${tam * 0.1},${tam * 0.55}`}
              fill="none" stroke={cor} strokeWidth={1}
            />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Glitch digital (skew + hue-rotate + offset RGB) num filho ───
export const Glitch: React.FC<{ children: React.ReactNode; intensidade?: number }> = ({
  children, intensidade = 1,
}) => {
  const frame = useCurrentFrame();
  // glitch dispara em rajadas curtas e raras
  const ativo = random(`g${Math.floor(frame / 7)}`) > 0.82;
  const sk = ativo ? (random(`s${frame}`) - 0.5) * 6 * intensidade : 0;
  const hue = ativo ? (random(`h${frame}`) - 0.5) * 30 * intensidade : 0;
  const dx = ativo ? (random(`d${frame}`) - 0.5) * 8 * intensidade : 0;
  return (
    <div style={{ transform: `skewX(${sk}deg) translateX(${dx}px)`, filter: `hue-rotate(${hue}deg)` }}>
      {children}
    </div>
  );
};

// ─── HUD glassmorphism com canto cortado (clip-path) deslizando ───
export const HudPainel: React.FC<{ titulo: string; linhas: string[]; delay?: number }> = ({
  titulo, linhas, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 90 } });
  const x = interpolate(s, [0, 1], [-600, 0]);
  const op = interpolate(s, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute", left: 70, top: "50%",
        transform: `translateY(-50%) translateX(${x}px)`, opacity: op,
        background: "rgba(124,58,237,0.10)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${C.dourado}55`,
        clipPath: "polygon(0 0, 100% 0, 100% 75%, 88% 100%, 0 100%)",
        padding: "28px 40px 36px", minWidth: 360,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      <div style={{ fontFamily: "monospace", fontSize: 22, letterSpacing: "0.18em", color: C.dourado, textTransform: "uppercase", marginBottom: 16 }}>
        {titulo}
      </div>
      {linhas.map((l, i) => (
        <div key={i} style={{ fontFamily: "monospace", fontSize: 26, color: C.texto, marginTop: 8, opacity: 0.85 }}>
          {l}
        </div>
      ))}
    </div>
  );
};

// ─── Logo ImpulsoX draw-on: a seta dourada se desenha + barras sobem ───
export const LogoDrawOn: React.FC<{ delay?: number; tamanho?: number }> = ({
  delay = 0, tamanho = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  // path da seta (do logo original, escalado)
  const setaPath = "M 50 262 C 70 244 88 224 108 198 C 118 184 126 168 134 148";
  const prog = interpolate(f, [0, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ev = evolvePath(prog, setaPath);
  // barras: cada uma sobe com spring escalonado
  const barras = [
    { x: 48, y: 244, h: 28 },
    { x: 70, y: 222, h: 50 },
    { x: 92, y: 198, h: 74 },
    { x: 114, y: 168, h: 104 },
  ];
  const pontaOp = interpolate(f, [30, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <svg width={300 * tamanho} height={300 * tamanho} viewBox="0 0 200 300">
      <defs>
        <linearGradient id="goldR" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#8a6418" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e9cd6a" />
        </linearGradient>
      </defs>
      {barras.map((b, i) => {
        const s = spring({ frame: f - i * 5, fps, config: { damping: 16 } });
        const h = b.h * s;
        return (
          <rect key={i} x={b.x} y={b.y + (b.h - h)} width={13} height={h} rx={6.5} fill="url(#goldR)" />
        );
      })}
      <path
        d={setaPath} fill="none" stroke={C.douradoClaro} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset}
        style={{ filter: `drop-shadow(0 0 8px ${C.dourado})` }}
      />
      <polygon points="134,134 119,152 141,156" fill={C.douradoClaro} opacity={pontaOp} />
      <circle cx={50} cy={262} r={3.5} fill={C.douradoClaro} opacity={prog > 0 ? 1 : 0} />
    </svg>
  );
};

// ─── Número contando (roll-up) ───
export const Contador: React.FC<{ alvo: number; delay?: number; sufixo?: string; tamanho?: number }> = ({
  alvo, delay = 0, sufixo = "", tamanho = 130,
}) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame - delay, [0, 45], [0, alvo], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: tamanho, color: C.dourado, textShadow: `0 0 30px ${C.dourado}66`, letterSpacing: "-0.02em" }}>
      {v}{sufixo}
    </span>
  );
};

// ─── Anel de progresso (preenche) ───
export const AnelProgresso: React.FC<{ r?: number; delay?: number; cor?: string }> = ({
  r = 150, delay = 0, cor = C.roxo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20 } });
  const circ = 2 * Math.PI * r;
  const seg = circ * s;
  const cx = r + 20, cy = r + 20;
  return (
    <svg width={(r + 20) * 2} height={(r + 20) * 2}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.textoMudo} strokeWidth={4} opacity={0.3} />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={cor} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${seg} ${circ}`}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 12px ${cor})` }}
      />
    </svg>
  );
};