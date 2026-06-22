import React from "react";
import { Composition } from "remotion";
import { ReelTeste } from "./ReelTeste";
import { ReelSistema } from "./ReelSistema";
import { ReelConteudo } from "./ReelConteudo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
        durationInFrames={449}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ReelSistema"
        component={ReelSistema}
        durationInFrames={649}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
