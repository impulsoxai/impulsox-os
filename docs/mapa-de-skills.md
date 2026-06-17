# Mapa de skills — como tudo se conecta

> O ImpulsoX-OS não é um monte de comandos soltos: as skills se chamam umas às outras em
> cadeias. Este mapa mostra QUEM chama QUEM, pra ninguém se perder. Cada seta é uma conexão
> real codificada nas skills. Produto da ImpulsoX AI.

---

## A esteira de VENDA (do prospect ao contrato)

```
/raio-x ──→ /proposta ──→ /cliente ──→ (produção)
diagnóstico   fecha o      pluga o
da URL        negócio      cliente
   │             │
   │             └─→ /email (follow-up da proposta)
   └─→ /copy (mini-redesign da abertura, no raio-x)
```

- **/raio-x** diagnostica a URL → vira a matéria-prima da **/proposta**
- **/proposta** lê o raio-x + `nucleo/provas.md` → proposta fechável → **/email** faz follow-up
- **/cliente** cria a pasta do cliente → tudo passa a rodar lá dentro

---

## A esteira de IDENTIDADE VISUAL (a base de tudo que é visual)

```
/identidade ──→ DESTILA ──→ marca/design-guide.md + tokens.css ──→ (todas as skills visuais leem)
   │                              [a marca vira LEI]
   ├─ Open Design (cria a base ao vivo; liga sozinho na porta 7456)
   ├─ mood board de escolha (cliente leigo escolhe a cor/clima vendo)
   └─ já tem marca? extrai + propõe evolução lado a lado
```

- **/identidade** é o gerente da marca: cria (Open Design + mood board) ou extrai+eleva →
  **DESTILA** nos 2 arquivos → **toda skill visual** (post, página, anúncio, e-mail) lê deles
- O refino premium NÃO acontece aqui — vem depois, no **/pagina**

---

## A esteira de PÁGINA premium (o produto de R$ 10k+)

```
/pagina ──┬─ etapa COPY ──→ /copy ──→ /escritor-br
          ├─ etapa CONSTRUÇÃO (lê marca/tokens.css)
          ├─ etapa 3.5 PREMIUM ──→ /premium-design (Uso 3)
          │                          │
          │                          ├─ 3 melhores sites do NICHO (cliente escolhe o estilo)
          │                          └─ re-estiliza no nível deles + marca CRAVADA
          ├─ etapa VERIFICAÇÃO (Playwright 390/768/1440)
          └─ depois: /seo (Schema/GEO) antes de publicar
```

- **/pagina** orquestra: copy (**/copy**+**/escritor-br**) → constrói na marca → **/premium-design**
  põe o nível agência → verifica visual → **/seo** fecha a achabilidade
- **/premium-design** Uso 3 = padrão premium (3 sites do nicho, marca cravada, posicionamento 10k+)

---

## A esteira de CONTEÚDO orgânico (o ciclo que se fecha)

```
/radar ──→ /calendario ──→ /post · /linkedin · /conteudo ──→ /revisar ──→ /publicar ──→ /desempenho
ideias     decide o quê     produzem as peças                crivo        ao ar          mede
embasadas  e quando         (leem marca + voz + provas)       sênior                        │
   ↑                                                                                        │
   └──────────────── nucleo/aprendizados.md ←─── o que funcionou volta pro próximo ciclo ───┘
```

- **/radar** pesquisa → **/calendario** decide → skills de produção executam (cada uma lê
  `marca/`, `nucleo/voz.md`, `nucleo/provas.md`) → **/revisar** (olhos frios) → **/publicar**
- **/desempenho** mede → destila em `aprendizados.md` → alimenta o próximo **/calendario**
- Todo texto passa pelo **/escritor-br** (humaniza); toda peça de venda pelo **/revisar**

---

## A esteira de YOUTUBE (o canal, ciclo completo)

```
/tema-yt ──→ /roteiro-yt ──→ (gravar) ──→ /editar-video ──→ /shorts ──→ /publicar ──→ /desempenho-yt
escolhe     escreve com      tela          corta+áudio       longo→      YouTube       mede retenção
tema real   a fórmula        narrada       +karaokê          N shorts    (privado)     valida fórmula
(4 fontes)  (Sabrina/Chase/                                                                │
            Jonathan)                                                                      │
   ↑                                                                                       │
   └───────────────── formulas-video.md ←─── fórmula validada ganha prioridade ───────────┘
```

- **/tema-yt** (demanda real) → **/roteiro-yt** (copia fórmula de quem performa) → editar →
  shorts → publicar → **/desempenho-yt** (retenção valida a fórmula) → realimenta

---

## A esteira de ADS (cria → mede → corrige)

```
/ads-google · /ads-meta ──→ (cliente/agência sobe, guia visual) ──→ /analisar-ads
cria a campanha pronta        anúncio nunca sobe sozinho             mede o que converteu
   ↑                          (viola termos)                              │
   └────────────── nucleo/aprendizados.md (Tráfego pago) ←───────────────┘
```

- **/ads-*** monta a campanha + guia visual de leigo → humano sobe → **/analisar-ads** mede
  (cálculo só por script) → padrão volta pro próximo **/ads-***

---

## Skills que TODAS as outras usam (a infraestrutura invisível)

| Skill | Papel | Quem chama |
|---|---|---|
| **/escritor-br** | humaniza todo texto | post, linkedin, email, copy, ads, conteudo |
| **/revisar** | crivo sênior antes do ar | obrigatório em venda/ads pago |
| **/provas** | banco de prova real | copy, post, pagina, proposta, ads, relatorio |
| **/formulas** | moldes de post que funcionam | post, linkedin |
| **/premium-design** | DNA visual + nível agência | identidade, pagina |

## Skills de SISTEMA (operam o motor, não produzem peça)

- **/abrir** (começa a sessão) · **/salvar** (backup GitHub) · **/painel** (dashboard ao vivo)
- **/plugar** (1º setup) · **/atualizar** (revisa o núcleo) · **/atualizar-motor** (puxa
  melhorias do template pros clones) · **/automatizar** (rotina repetida → skill nova)
- **/voz** (entrevista de voz → nucleo/voz.md)

---

## Tabela de fluxo guiado (o sistema usa pra apontar o próximo passo)

> Cada skill, ao terminar, sugere o **próximo** daqui e pergunta se quer seguir (regra no
> CLAUDE.md). O **pré-requisito** é o que ela precisa; se faltar, o sistema se acha e
> reorienta. Não é trilho fixo — o dono pode pular, e o sistema se reposiciona.

| Terminou | Próximo passo natural | Pré-requisito (se falta, reorienta) |
|---|---|---|
| /raio-x | /proposta | — (só a URL) |
| /proposta | /cliente (se fechou) ou /email (follow-up) | nucleo/provas, ofertas |
| /cliente | /identidade | — |
| /identidade | /voz (se voz rasa) → depois /calendario ou /pagina | núcleo lido |
| /voz | /calendario ou produção | — |
| /calendario | /post · /linkedin · /conteudo (peça a peça) | radar do mês, núcleo |
| /radar | /calendario | núcleo |
| /post · /linkedin · /conteudo | /revisar | marca/, voz, provas |
| /revisar | /publicar (se aprovada) | a peça pronta |
| /publicar | /desempenho (no fim do mês) | publicacoes.md |
| /desempenho | /calendario (próximo ciclo) | métricas |
| /pagina | /seo → /publicar | **marca/ (senão: rodar /identidade antes)** |
| /copy | /escritor-br → volta pro /pagina | voz |
| /seo | /publicar | a página pronta |
| /tema-yt | /roteiro-yt | criadores-monitorados, pilares |
| /roteiro-yt | (gravar) → /editar-video | **voz-canal.md, fórmula** |
| /editar-video | /shorts → /publicar | final.mp4, whisper |
| /shorts | /publicar | palavras.json |
| /desempenho-yt | /tema-yt (próximo vídeo) | métricas/publicação |
| /ads-google · /ads-meta | (humano sobe) → /analisar-ads em 30d | **marca/, página de destino** |
| /analisar-ads | /ads-* (nova campanha) | exports CSV |
| /criar-ebook | /email (sequência) ou /pagina (captura) | núcleo, marca |
| /lancar-produto | /pagina · /email · /ads-* (orquestra) | oferta, marca |

Pré-requisito em **negrito** = o que mais trava na prática; quando falta, o sistema oferece
fazer o que falta primeiro OU seguir com defaults marcados "a confirmar".

## A regra que amarra tudo

Cada skill **lê o núcleo + a marca antes de produzir**, e marca **fato vs suposição**
(Escada de Contexto). A marca é sempre a do cliente; a fonte de verdade são os arquivos
(`nucleo/`, `marca/`), nunca a memória de uma sessão. Melhoria de motor nasce no template e
desce pros clones via **/atualizar-motor** — trabalho de marketing fica no clone.
