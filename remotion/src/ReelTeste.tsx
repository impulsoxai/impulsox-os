// ReelTeste.tsx — reel "Landing Pages Premium", REFEITO com a fórmula viral validada
// (memória reel-formula-viral): RESULTADO primeiro · hook empilhado no frame 1 · save/send ·
// CTA de negócio local · MARCA SÓ NO FIM (logo no começo = cara de anúncio, mata alcance).
// HERÓI = as páginas REAIS da ImpulsoX. Scroll mostra a página INTEIRA (ScrollPagina calcula
// o limite seguro por ratio — nunca sobra branco no fim). Oferta ATIVA, voz calibrada.
import React from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring,
} from "remotion";
import { TransitionSeries, springTiming, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { wipe } from "@remotion/transitions/wipe";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { makeTransform, scale } from "@remotion/animation-utils";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/SpaceMono";
import { C, FundoTech, Particulas, CornerBrackets } from "./premium";
import { Camera, Bloom, LightLeakMarca } from "./efeitos";
import { Browser, ScrollPagina, LequePaginas, paginaTop, paginaFull, RATIO_PAGINA } from "./produto";

const { fontFamily: GROTESK } = loadGrotesk();
const { fontFamily: MONO } = loadMono();

const Movimento: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CameraMotionBlur shutterAngle={150} samples={6}>{children}</CameraMotionBlur>
);

// legenda no TERÇO SUPERIOR (fórmula: overlay 5-8 palavras no frame 1, 60% assiste sem som)
const HookTopo: React.FC<{ texto: string; destaque?: string; delay?: number }> = ({
  texto, destaque, delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
  return (
    <div style={{
      position: "absolute", top: 170, left: 0, right: 0, textAlign: "center", padding: "0 70px",
      opacity: interpolate(s, [0, 0.6], [0, 1], { extrapolateRight: "clamp" }),
      transform: makeTransform([scale(interpolate(s, [0, 1], [0.7, 1]))]),
    }}>
      <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 64, color: C.texto, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
        {texto}{destaque && <span style={{ color: C.dourado }}>{destaque}</span>}
      </span>
    </div>
  );
};

const Legenda: React.FC<{ texto: string; destaque?: string; delay?: number }> = ({ texto, destaque, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 18 } });
  return (
    <div style={{
      position: "absolute", bottom: 280, left: 0, right: 0, textAlign: "center", padding: "0 70px",
      opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px)`,
    }}>
      <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 52, color: C.texto, lineHeight: 1.15 }}>
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
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: "0.2em", textTransform: "uppercase", color: C.dourado, opacity: interpolate(s, [0.4, 1], [0, 1], { extrapolateRight: "clamp" }) }}>{texto}</span>
      <div style={{ width: w, height: 1, background: `linear-gradient(90deg, ${C.dourado}, transparent)` }} />
    </div>
  );
};

// ═══ CENA 1 — HOOK EMPILHADO + RESULTADO PRIMEIRO: página REAL já no ar, scroll INTEIRO ═══
const Cena1: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxo} />
      <Movimento>
        <Camera zoomDe={1.08} zoomPara={1.0} origem="50% 45%" dur={120}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
            <Browser url="maresia.com.br" largura={780} altura={980}>
              {/* scroll CURTO: para no hero cheio, antes da seção creme (restaurante é tema claro) */}
              <ScrollPagina src={paginaFull("restaurante")} delay={10} dur={108} ratio={RATIO_PAGINA.restaurante} viewport={980 - 52} largura={780} tetoPct={19} />
            </Browser>
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <HookTopo texto="Esta página foi feita" destaque=" em horas." delay={4} />
      <CornerBrackets delay={6} />
      <LightLeakMarca delay={24} dur={45} />
    </AbsoluteFill>
  );
};

// ═══ CENA 2 — VARIEDADE (prova): leque das 3 páginas reais ═══
const Cena2: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Particulas n={8} />
      <Movimento>
        <Camera zoomDe={1.0} zoomPara={1.05} origem="50% 45%" dur={150}>
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
      <CornerBrackets delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 3 — DIFERENCIAL: outra página REAL (Stellaris) rolando inteira ═══
const Cena3: React.FC = () => {
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxo} />
      <Movimento>
        <Camera zoomDe={1.06} zoomPara={1.0} origem="50% 45%" dur={135}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingBottom: 60 }}>
            <Browser url="atrio.com.br" largura={780} altura={980}>
              {/* scroll CURTO: para no hero cheio, antes da seção creme (construtora é tema claro) */}
              <ScrollPagina src={paginaFull("construtora")} delay={8} dur={120} ratio={RATIO_PAGINA.construtora} viewport={980 - 52} largura={780} tetoPct={14} />
            </Browser>
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="Não é template." destaque=" É a sua marca." delay={6} />
    </AbsoluteFill>
  );
};

// ═══ CENA 4 — SAVE/SEND: frame-resumo guardável + gancho de envio ═══
const Cena4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const itens = ["Design exclusivo, do zero", "Feito pra converter", "Confiança no 1º segundo", "Pronta em dias, não meses"];
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Movimento>
        <Camera zoomDe={1.0} zoomPara={1.04} origem="50% 45%" dur={195}>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28, paddingBottom: 130 }}>
            <Kicker texto="Salva pra quando for refazer seu site" />
            <div style={{ display: "flex", flexDirection: "column", gap: 22, width: 800 }}>
              {itens.map((t, i) => {
                const s = spring({ frame: frame - 14 - i * 22, fps, config: { damping: 16 } });
                return (
                  <div key={i} style={{
                    fontFamily: GROTESK, fontWeight: 600, fontSize: 40, color: C.texto,
                    opacity: interpolate(s, [0, 0.7], [0, 1], { extrapolateRight: "clamp" }),
                    transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
                    display: "flex", alignItems: "center", gap: 16,
                  }}>
                    <span style={{ color: C.dourado, fontSize: 28 }}>◆</span> {t}
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
        </Camera>
      </Movimento>
      <Legenda texto="Manda pra quem tem um" destaque=" site fraco." delay={10} />
    </AbsoluteFill>
  );
};

// ═══ CENA 5 — ASSINATURA + CTA LOCAL (marca SÓ no fim) ═══
const Cena5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 18 } });
  const glow = interpolate(Math.sin(frame * 0.1), [-1, 1], [15, 38]);
  return (
    <AbsoluteFill>
      <FundoTech cor={C.roxoProf} />
      <Particulas n={12} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
        <Kicker texto="Páginas premium pra PME" />
        <Bloom forca={0.6}>
          {/* cores EXATAS do logo_impulsox_premium: Impulso=roxo (#a974ff→#6d28d9), X e AI=dourado (#e9cd6a→#c89e30) */}
          <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 88, opacity: interpolate(s, [0, 1], [0, 1]) }}>
            <span style={{ background: "linear-gradient(180deg,#a974ff,#6d28d9)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Impulso</span>
            <span style={{ background: "linear-gradient(180deg,#e9cd6a,#c89e30)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: `0 0 ${glow}px #e9cd6a66` }}>X</span>
            <span style={{ background: "linear-gradient(180deg,#e9cd6a,#c89e30)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}> AI</span>
          </span>
        </Bloom>
        {/* CTA de negócio local (ação direta) */}
        <div style={{
          marginTop: 10, padding: "16px 36px", borderRadius: 999,
          background: C.dourado, opacity: interpolate(s, [0.4, 1], [0, 1], { extrapolateRight: "clamp" }),
          transform: `scale(${interpolate(s, [0.4, 1], [0.85, 1], { extrapolateRight: "clamp" })})`,
        }}>
          <span style={{ fontFamily: GROTESK, fontWeight: 700, fontSize: 34, color: "#1a1206" }}>Quero minha página</span>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 26, letterSpacing: "0.12em", color: C.textoSuave, opacity: interpolate(s, [0.6, 1], [0, 1], { extrapolateRight: "clamp" }) }}>impulsoxai.com.br</div>
      </AbsoluteFill>
      <CornerBrackets delay={4} />
      <LightLeakMarca delay={15} dur={60} />
    </AbsoluteFill>
  );
};

export const ReelTeste: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#080510" }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <Cena1 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={wipe({ direction: "from-bottom" })} />
        <TransitionSeries.Sequence durationInFrames={150}>
          <Cena2 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={135}>
          <Cena3 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={linearTiming({ durationInFrames: 18 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={195}>
          <Cena4 />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} presentation={fade()} />
        <TransitionSeries.Sequence durationInFrames={130}>
          <Cena5 />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
