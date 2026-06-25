import React from "react";
import { Composition } from "remotion";
import { ReelTeste } from "./ReelTeste";
import { ReelSistema } from "./ReelSistema";
import { ReelConteudo } from "./ReelConteudo";
import { DemoNotebook, DEMO_DUR } from "./DemoNotebook";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DemoNotebook"
        component={DemoNotebook}
        durationInFrames={DEMO_DUR}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="ReelConteudo"
        component={ReelConteudo}
        durationInFrames={659}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReelTeste"
        component={ReelTeste}
        durationInFrames={654}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReelSistema"
        component={ReelSistema}
        durationInFrames={671}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
