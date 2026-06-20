import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDispositivosDshow } from "./lib-gravacao.mjs";

const SAIDA = `[in#0 @ 0x1] "HD User Facing" (video)
[in#0 @ 0x1]   Alternative name "@device_pnp_\\\\?\\usb#vid_0408&pid_a061"
[in#0 @ 0x1] "OBS Virtual Camera" (none)
[in#0 @ 0x1] "Grupo de microfones (Realtek(R) Audio)" (audio)
[in#0 @ 0x1]   Alternative name "@device_cm_{33D9}\\wave_{F7F7}"
Error opening input file dummy.`;

test("parseDispositivosDshow separa vídeo e áudio com alt-name", () => {
  const d = parseDispositivosDshow(SAIDA);
  assert.deepEqual(d.video, [
    { nome: "HD User Facing", alt: "@device_pnp_\\\\?\\usb#vid_0408&pid_a061" },
  ]);
  assert.deepEqual(d.audio, [
    { nome: "Grupo de microfones (Realtek(R) Audio)", alt: "@device_cm_{33D9}\\wave_{F7F7}" },
  ]);
});

test("parseDispositivosDshow ignora (none) e a linha de erro do dummy", () => {
  const d = parseDispositivosDshow(SAIDA);
  assert.equal(d.video.find((v) => v.nome === "OBS Virtual Camera"), undefined);
});

test("parseDispositivosDshow lida com device sem alt-name", () => {
  const d = parseDispositivosDshow(`[in] "Mic Solto" (audio)`);
  assert.deepEqual(d.audio, [{ nome: "Mic Solto", alt: null }]);
});
