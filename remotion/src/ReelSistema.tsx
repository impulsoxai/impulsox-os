// ReelSistema.tsx — reel do ImpulsoX-OS funcionando: 1 comando → identidade + posts + página.
// HERÓI = o sistema trabalhando (terminal digitando skills + Open Design + produto real).
// Vende o Pacote ImpulsoX-OS. Voz: "presença digital", nunca "marketing". Sem grito.
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
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";
import { C, FundoTech, Particulas, CornerBrackets } from "./premium";
import { Camera, Bloom, LightLeakMarca } from "./efeitos";
import { Phone, CarrosselReal, Browser, ScrollPagina, slidesDe, paginaFull } from "./produto";
import { Terminal, OpenDesignMock } from "./sistema";

const { fontFamily: GROTESK } = loadGrotesk();
const { fontFamily: MONO } = loadMono();

const CAPA_FUNC = slidesDe("funcionario", 7);

const Movimento: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur shutterAngle={150} samples={6}>{children}</CameraMotionBlur>
);

const Legenda: React.FC<{ texto: string; destaque?: string; delay?: number }> = ({
  texto, destaque, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div style={{
      position: "absolute", bottom: 140, left: 0, right: 0, textAlign: "center",
      padding: "0 70px", opacity: interpolate(s, [0, 1], [0, 1]),
      transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
    }}>
      <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 54, color: C.texto, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
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

// ═══ CENA 1 — HOOK: terminal vazio, a pergunta ═══
const Cena1: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Movimento>
        <Camera zoomDe={1.05} zoomPara={1.0} origem="50% 45%" dur={110}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 160 }}>
            <Terminal comando="" saida={[]} largura={820} altura={300} />
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="E se um comando cuidasse da sua" destaque=" presença digital?" delay={8} />
      <CornerBrackets delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 2 — /identidade: Open Design construindo a marca ═══
const Cena2: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxo} />
      <Movimento>
        <Camera zoomDe={1.04} zoomPara={1.0} origem="50% 42%" dur={165}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24, paddingBottom: 120 }}>
            <Terminal comando="/identidade" saida={["✓ marca criada"]} largura={520} altura={150} />
            <OpenDesignMock delay={28} cores={[C.fundo, C.roxo, C.dourado, C.douradoClaro, C.texto]} />
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="Sua" destaque=" identidade visual." delay={8} />
      <LightLeakMarca delay={50} dur={50} />
    </AbsoluteFill>
  );
};

// ═══ CENA 3 — /post: carrosséis reais ═══
const Cena3: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Movimento>
        <Camera zoomDe={1.06} zoomPara={1.0} origem="50% 42%" dur={155}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22, paddingBottom: 60 }}>
            <Terminal comando="/post" saida={["✓ carrossel pronto"]} largura={480} altura={140} />
            <Phone escala={0.92}>
              <CarrosselReal slides={CAPA_FUNC} framesPorSlide={34} delay={40} />
            </Phone>
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="Seus posts," destaque=" na sua voz." delay={6} />
      <CornerBrackets delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 4 — /pagina: landing real ═══
const Cena4: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxo} />
      <Movimento>
        <Camera zoomDe={1.04} zoomPara={1.0} origem="50% 42%" dur={165}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22, paddingBottom: 60 }}>
            <Terminal comando="/pagina" saida={["✓ landing no ar"]} largura={480} altura={140} />
            <Browser url="impulsoxai.com.br" largura={720} altura={760}>
              <ScrollPagina src={paginaFull("impulsox")} delay={40} dur={120} maxScroll={55} />
            </Browser>
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="Sua" destaque=" landing page." delay={6} />
      <LightLeakMarca delay={50} dur={50} />
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
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 22 }}>
        <Kicker texto="Um sistema, não uma tarefa" />
        <Bloom forca={0.6}>
          <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 88, opacity: interpolate(s, [0, 1], [0, 1]) }}>
            <span style={{ color: C.roxoSuave }}>Impulso</span>
            <span style={{ color: C.dourado, textShadow: `0 0 ${glow}px ${C.dourado}` }}>X</span>
            <span style={{ color: C.roxoSuave }}>-OS</span>
          </span>
        </Bloom>
        <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: "0.15em", color: C.textoSuave, opacity: interpolate(s, [0.4, 1], [0, 1], { extrapolateRight: "clamp" }) }}>
          impulsoxai.com.br
        </div>
      </AbsoluteFill>
      <CornerBrackets delay={4} />
      <LightLeakMarca delay={15} dur={60} />
    </AbsoluteFill>
  );
};

export const ReelSistema: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#080510" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <Cena1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={wipe({ direction: "from-bottom" })} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Cena2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={160}>
          <Cena3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={170}>
          <Cena4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={115}>
          <Cena5 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
