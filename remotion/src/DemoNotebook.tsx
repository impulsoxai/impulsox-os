import React from "react";
import {
  AbsoluteFill, Sequence, Video, staticFile,
  interpolate, useCurrentFrame, useVideoConfig, spring, Easing,
} from "remotion";

// cores da logo ImpulsoX — gradientes REAIS do SVG (metalico, nao chapado claro)
const GRAD_ROXO = "linear-gradient(160deg, #a974ff 0%, #6d28d9 100%)";
const GRAD_OURO = "linear-gradient(160deg, #fbeec0 0%, #e9cd6a 38%, #c89e30 70%, #9c7415 100%)";
const ROXO = "#8b5cf6";          // roxo solido forte (labels)
const OURO = "#d4af37";          // dourado solido forte (kickers/fios)
const BG = "#070510";
const DISPLAY = "Sora, 'Segoe UI', sans-serif";
const BODY = "Inter, 'Segoe UI', sans-serif";

// duracoes (frames @30fps)
const FPS = 30;
const INTRO = 42;
const CLIPES = [
  { src: "demos/maresia.mp4", nome: "Maresia", tag: "Restaurante", dur: 8 * FPS },
  { src: "demos/stellaris.mp4", nome: "Stellaris", tag: "Tecnologia", dur: 5 * FPS },
  { src: "demos/atrio.mp4", nome: "Atrio", tag: "Incorporadora", dur: 8 * FPS },
];
const FECHO = 66;
export const DEMO_DUR =
  INTRO + CLIPES.reduce((a, c) => a + c.dur, 0) + FECHO;

// mesh de fundo (gradiente da marca)
const Mesh: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <AbsoluteFill style={{
      background: `radial-gradient(60% 55% at 28% 18%, rgba(139,92,246,.22), transparent 60%),
                   radial-gradient(55% 55% at 82% 92%, rgba(233,205,106,.14), transparent 60%)`,
    }} />
  </AbsoluteFill>
);

// um clipe dentro de uma moldura de browser, com label
const ClipeBrowser: React.FC<{ src: string; nome: string; tag: string; localFrame: number; dur: number }> =
  ({ src, nome, tag, localFrame, dur }) => {
    const { fps } = useVideoConfig();
    // entrada: sobe e ganha foco; saida: leve fade
    const inP = spring({ frame: localFrame, fps, config: { damping: 200 }, durationInFrames: 18 });
    const out = interpolate(localFrame, [dur - 14, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const y = interpolate(inP, [0, 1], [40, 0]);
    const op = inP * out;
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 1360, opacity: op, transform: `translateY(${y}px)`,
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 40px 120px rgba(0,0,0,.6), 0 0 0 1px rgba(233,205,106,.18), 0 0 80px rgba(139,92,246,.12)",
        }}>
          {/* barra do browser */}
          <div style={{
            height: 46, background: "#13131f", display: "flex", alignItems: "center", gap: 8, padding: "0 18px",
            borderBottom: "1px solid rgba(255,255,255,.05)",
          }}>
            <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#3a3a44" }} />
            <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#3a3a44" }} />
            <i style={{ width: 11, height: 11, borderRadius: "50%", background: "#3a3a44" }} />
            <span style={{ marginLeft: 14, fontFamily: BODY, fontSize: 14, color: "#6a6478", letterSpacing: ".04em" }}>
              {nome.toLowerCase()}.impulsox.ai
            </span>
          </div>
          {/* o video real rolando */}
          <Video src={staticFile(src)} startFrom={0} style={{ width: "100%", display: "block" }} />
        </div>
        {/* label do nicho */}
        <div style={{ marginTop: 26, opacity: op, textAlign: "center" }}>
          <div style={{ fontFamily: BODY, fontSize: 14, letterSpacing: ".24em", textTransform: "uppercase", color: OURO }}>{tag}</div>
          <div style={{ fontFamily: DISPLAY, fontSize: 34, fontWeight: 700, color: "#f4f1ea", marginTop: 4 }}>{nome}</div>
        </div>
      </AbsoluteFill>
    );
  };

// intro: "entrar no notebook" — um frame que cresce e some revelando o conteudo
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const grow = spring({ frame, fps, config: { damping: 200 }, durationInFrames: INTRO });
  const scale = interpolate(grow, [0, 1], [0.6, 1.04]);
  const frameOp = interpolate(frame, [0, INTRO - 12, INTRO], [1, 1, 0], { extrapolateRight: "clamp" });
  const kicker = interpolate(frame, [6, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ opacity: kicker, position: "absolute", top: 150, fontFamily: BODY, fontSize: 16, letterSpacing: ".3em", textTransform: "uppercase", color: OURO }}>
        O nível que entregamos
      </div>
      <div style={{
        width: 1100, aspectRatio: "16/10", transform: `scale(${scale})`, opacity: frameOp,
        borderRadius: 18, border: "2px solid rgba(233,205,106,.3)", background: "rgba(10,10,18,.4)",
        boxShadow: "0 0 80px rgba(139,92,246,.18)",
      }} />
    </AbsoluteFill>
  );
};

// fecho: marca ImpulsoX
const Fecho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 22 });
  const y = interpolate(up, [0, 1], [30, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${y}px)`, opacity: up, textAlign: "center", display: "flex", fontFamily: DISPLAY, fontWeight: 800, fontSize: 104, letterSpacing: "-.02em" }}>
        <span style={{ background: GRAD_ROXO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Impulso</span>
        <span style={{ background: GRAD_OURO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
        <span style={{ background: GRAD_OURO, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>&nbsp;AI</span>
      </div>
    </AbsoluteFill>
  );
};

export const DemoNotebook: React.FC = () => {
  let from = INTRO;
  return (
    <AbsoluteFill>
      <Mesh />
      <Sequence durationInFrames={INTRO}><Intro /></Sequence>
      {CLIPES.map((c, i) => {
        const el = (
          <Sequence key={i} from={from} durationInFrames={c.dur}>
            <ClipeLocal {...c} />
          </Sequence>
        );
        from += c.dur;
        return el;
      })}
      <Sequence from={from} durationInFrames={FECHO}><Fecho /></Sequence>
    </AbsoluteFill>
  );
};

// wrapper que passa o frame local pro ClipeBrowser
const ClipeLocal: React.FC<{ src: string; nome: string; tag: string; dur: number }> = (p) => {
  const localFrame = useCurrentFrame();
  return <ClipeBrowser {...p} localFrame={localFrame} />;
};
