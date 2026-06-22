// ReelTeste.tsx — reel institucional ImpulsoX: "Landing Pages Premium".
// HERÓI = as páginas REAIS que a ImpulsoX fez (Stellaris no money shot + leque 3 nichos).
// Narrativa: hook (site template?) → money shot (página real fazendo scroll) → variedade
// (3 nichos) → diferencial (não é template) → assinatura. Voz calibrada, oferta ATIVA.
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { makeTransform, scale } from "@remotion/animation-utils";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";
import { C, FundoTech, Particulas, CornerBrackets } from "./premium";
import { Camera, Bloom, LightLeakMarca } from "./efeitos";
import { Browser, ScrollPagina, LequePaginas, paginaTop, paginaFull } from "./produto";

const { fontFamily: GROTESK } = loadGrotesk();
const { fontFamily: MONO } = loadMono();

const Legenda: React.FC<{ texto: string; destaque?: string; delay?: number }> = ({
  texto, destaque, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div style={{
      position: "absolute", bottom: 130, left: 0, right: 0, textAlign: "center",
      padding: "0 70px", opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
    }}>
      <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 56, color: C.texto, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
        {texto}{destaque && <span style={{ color: C.dourado }}>{destaque}</span>}
      </span>
    </div>
  );
};

const Kicker: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 20 } });
  const w = interpolate(s, [0, 1], [0, 80]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <div style={{ width: w, height: 1, background: `linear-gradient(90deg, transparent, ${C.dourado})` }} />
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", color: C.dourado, opacity: interpolate(s, [0.4, 1], [0, 1], { extrapolateRight: "clamp" }) }}>
        {texto}
      </span>
      <div style={{ width: w, height: 1, background: `linear-gradient(90deg, ${C.dourado}, transparent)` }} />
    </div>
  );
};

// ═══ CENA 1 — HOOK: site template genérico ═══
const Cena1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tremor = Math.sin(frame * 0.8) * (frame > 40 ? 2 : 0);
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Movimento>
      <Camera zoomDe={1.0} zoomPara={1.06} origem="50% 42%" dur={105}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 120 }}>
          {/* mock de site genérico/template feio — cinza, blocos sem graça */}
          <div style={{ transform: `translateX(${tremor}px)`, opacity: interpolate(frame, [0, 20], [0, 0.85], { extrapolateRight: "clamp" }) }}>
            <Browser url="seusite.com.br" largura={620} altura={720}>
              <div style={{ padding: 30, background: "#1a1a1a", height: "100%" }}>
                <div style={{ height: 40, background: "#2a2a2a", borderRadius: 4, marginBottom: 24, width: "40%" }} />
                <div style={{ height: 160, background: "#222", borderRadius: 6, marginBottom: 20 }} />
                <div style={{ height: 16, background: "#2a2a2a", borderRadius: 3, marginBottom: 12, width: "90%" }} />
                <div style={{ height: 16, background: "#2a2a2a", borderRadius: 3, marginBottom: 12, width: "75%" }} />
                <div style={{ height: 16, background: "#2a2a2a", borderRadius: 3, marginBottom: 28, width: "82%" }} />
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ height: 110, flex: 1, background: "#222", borderRadius: 6 }} />
                  <div style={{ height: 110, flex: 1, background: "#222", borderRadius: 6 }} />
                  <div style={{ height: 110, flex: 1, background: "#222", borderRadius: 6 }} />
                </div>
              </div>
            </Browser>
          </div>
        </AbsoluteFill>
      </Camera>
      </Movimento>
      <Legenda texto="Seu site parece" destaque=" template?" delay={8} />
      <CornerBrackets delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 2 — MONEY SHOT: página REAL (Stellaris) fazendo scroll ═══
const Cena2: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxo} />
      <Movimento>
      <Camera zoomDe={1.06} zoomPara={1.0} origem="50% 45%" dur={115}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 50 }}>
          <Browser url="maresia.com.br" largura={780} altura={980}>
            <ScrollPagina src={paginaFull("restaurante")} delay={8} dur={95} maxScroll={32} />
          </Browser>
        </AbsoluteFill>
      </Camera>
      </Movimento>
      <Legenda texto="A ImpulsoX faz" destaque=" diferente." delay={4} />
      <LightLeakMarca delay={40} dur={55} />
      <CornerBrackets delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 3 — VARIEDADE: leque de 3 nichos reais ═══
const Cena3: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Particulas n={8} />
      <Movimento>
      <Camera zoomDe={1.0} zoomPara={1.05} origem="50% 45%" dur={110}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 110 }}>
          <LequePaginas
            tops={[paginaTop("restaurante"), paginaTop("tecnologia"), paginaTop("construtora")]}
            urls={["maresia.com.br", "stellarisdata.com", "atrio.com.br"]}
            delay={6}
          />
        </AbsoluteFill>
      </Camera>
      </Movimento>
      <Legenda texto="Qualquer negócio." destaque=" Nível agência." delay={8} />
    </AbsoluteFill>
  );
};

// ═══ CENA 4 — DIFERENCIAL: não é template ═══
const Cena4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const selos = ["design exclusivo", "feito pra converter", "confiança no 1º segundo"];
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Particulas n={8} />
      <Movimento>
      <Camera zoomDe={1.0} zoomPara={1.06} origem="50% 50%" dur={90}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22, paddingBottom: 140 }}>
          {selos.map((sel, i) => {
            const s = spring({ frame: frame - 8 - i * 12, fps, config: { damping: 14, stiffness: 150 } });
            return (
              <div key={sel} style={{
                fontFamily: GROTESK, fontWeight: 600, fontSize: 46, color: C.texto,
                opacity: interpolate(s, [0, 0.7], [0, 1], { extrapolateRight: "clamp" }),
                transform: makeTransform([scale(interpolate(s, [0, 1], [0.6, 1]))]),
                display: "flex", alignItems: "center", gap: 16,
              }}>
                <span style={{ color: C.dourado, fontSize: 30 }}>◆</span> {sel}
              </div>
            );
          })}
        </AbsoluteFill>
      </Camera>
      </Movimento>
      <Legenda texto="Não é template." destaque=" É a sua marca." delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 5 — ASSINATURA ═══
const Cena5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  const glow = interpolate(Math.sin(frame * 0.1), [-1, 1], [15, 38]);
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Particulas n={12} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 26 }}>
        <Kicker texto="Agência de IA pra PME" />
        <Bloom forca={0.6}>
          <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 92, color: C.texto, opacity: interpolate(s, [0, 1], [0, 1]) }}>
            Impulso<span style={{ color: C.dourado, textShadow: `0 0 ${glow}px ${C.dourado}` }}>X</span>
            <span style={{ color: C.roxoSuave }}> AI</span>
          </span>
        </Bloom>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.15em", color: C.textoSuave, opacity: interpolate(s, [0.4, 1], [0, 1], { extrapolateRight: "clamp" }) }}>
          impulsoxai.com.br
        </div>
      </AbsoluteFill>
      <CornerBrackets delay={4} />
      <LightLeakMarca delay={15} dur={60} />
    </AbsoluteFill>
  );
};

// Movimento — blur SÓ no conteúdo que se move (texto/mockup com a câmera), NÃO no fundo.
// O fundo (FundoTech/grade/glow) fica fora disto, sempre nítido — sem o rastro sujo.
const Movimento: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur shutterAngle={150} samples={6}>
    {children}
  </CameraMotionBlur>
);

export const ReelTeste: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#080510" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={100}>
          <Cena1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={wipe({ direction: "from-bottom" })} />
        <TransitionSeries.Sequence durationInFrames={115}>
          <Cena2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Cena3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={95}>
          <Cena4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={105}>
          <Cena5 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
