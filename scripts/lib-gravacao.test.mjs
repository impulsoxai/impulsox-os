import { test } from "node:test";
import assert from "node:assert/strict";
import { parseDispositivosDshow, argsCapturaTela, argsCapturaWebcam, resolverDispositivos, acharLoopback, argsCapturaSistema } from "./lib-gravacao.mjs";

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

test("argsCapturaTela monta gdigrab desktop -> mp4", () => {
  const a = argsCapturaTela({ fps: 30, saida: "out/tela.mp4" });
  assert.deepEqual(a, [
    "-y", "-f", "gdigrab", "-framerate", "30", "-i", "desktop",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart", "out/tela.mp4",
  ]);
});

test("argsCapturaTela usa fps default 30 quando não informado", () => {
  const a = argsCapturaTela({ saida: "x.mp4" });
  assert.ok(a.includes("30"));
});

test("argsCapturaWebcam monta dshow webcam+mic -> mp4", () => {
  const a = argsCapturaWebcam({
    webcam: "HD User Facing", mic: "Grupo de microfones (Realtek(R) Audio)",
    fps: 30, saida: "out/webcam.mp4",
  });
  assert.deepEqual(a, [
    "-y", "-f", "dshow", "-framerate", "30",
    "-i", "video=HD User Facing:audio=Grupo de microfones (Realtek(R) Audio)",
    "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-movflags", "+faststart", "out/webcam.mp4",
  ]);
});

const DISP = {
  video: [{ nome: "HD User Facing", alt: null }],
  audio: [{ nome: "Mic Realtek", alt: null }, { nome: "Mic USB", alt: null }],
};

test("resolverDispositivos: env válido e conectado -> usa, sem perguntar", () => {
  const r = resolverDispositivos({ webcam: "HD User Facing", mic: "Mic USB" }, DISP);
  assert.deepEqual(r, { precisaEscolher: false, webcam: "HD User Facing", mic: "Mic USB" });
});

test("resolverDispositivos: env vazio -> precisa escolher", () => {
  const r = resolverDispositivos({}, DISP);
  assert.equal(r.precisaEscolher, true);
});

test("resolverDispositivos: mic salvo desconectado -> precisa escolher + motivo", () => {
  const r = resolverDispositivos({ webcam: "HD User Facing", mic: "Mic USB Sumido" }, DISP);
  assert.equal(r.precisaEscolher, true);
  assert.match(r.motivo, /Mic USB Sumido|não.*conect/i);
});

test("acharLoopback acha o device de loopback do Windows por nome", () => {
  const disp = { video: [], audio: [{ nome: "Microfone (Realtek)" }, { nome: "Mixagem estéreo (Realtek)" }] };
  assert.equal(acharLoopback(disp), "Mixagem estéreo (Realtek)");
});

test("acharLoopback acha 'Stereo Mix' em inglês", () => {
  const disp = { video: [], audio: [{ nome: "Stereo Mix (Realtek)" }] };
  assert.equal(acharLoopback(disp), "Stereo Mix (Realtek)");
});

test("acharLoopback devolve null quando não há loopback", () => {
  const disp = { video: [], audio: [{ nome: "Microfone (Realtek)" }] };
  assert.equal(acharLoopback(disp), null);
});

test("argsCapturaSistema monta dshow do loopback -> arquivo de áudio", () => {
  const a = argsCapturaSistema({ device: "Stereo Mix (Realtek)", saida: "out/sistema.m4a" });
  assert.deepEqual(a, [
    "-y", "-f", "dshow", "-i", "audio=Stereo Mix (Realtek)",
    "-c:a", "aac", "-movflags", "+faststart", "out/sistema.m4a",
  ]);
});
