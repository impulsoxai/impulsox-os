# Edição — saídas e templates do canal

> Cada vídeo editado vive em `edicao/<slug>/` (final.mp4, legenda.srt, thumb-frame.png,
> thumb-fal.png). Gerado por `/editar-video` (scripts editar-video.mjs + gerar-thumbnail.mjs).

`templates/` guarda os bumpers de marca usados em todo vídeo:
- `intro.mp4` — abertura curta (~2-3s, logo+título). Opcional: sem ele, o vídeo sai sem intro.
- `outro.mp4` — fecho (~3-5s, CTA/inscreva-se). Opcional.

Dependências: **ffmpeg** (render) e **whisper** local (legenda). Faltando, o
`/editar-video` guia a instalação. WHISPER_BIN/WHISPER_MODEL/WHISPER_IDIOMA no `.env` (opcionais).
