---
name: pesquisa-web
description: >
  Skill de APOIO — camada de execução pra pesquisa em fonte pública/gratuita já usada por
  `/radar`, `/pulso` e `/concorrente`. Não é porta de entrada do dono; ativa quando uma
  dessas skills precisa ler Reddit, YouTube, RSS, GitHub, V2EX, Bilibili (busca) ou fazer
  busca semântica na web, e a ferramenta `agent-reach` está instalada na máquina. Se não
  estiver, as skills seguem com WebSearch/WebFetch normalmente — isto é upgrade opcional,
  nunca dependência.
---

# /pesquisa-web — Roteador de fontes públicas (apoio)

Ferramenta de terceiro (`agent-reach`, github.com/Panniantong/Agent-Reach, MIT, 49k+ stars)
que centraliza o acesso a fontes gratuitas e sem login: leitor de web (Jina Reader), YouTube
(legendas via yt-dlp), GitHub, RSS/Atom, V2EX, Bilibili (busca) e busca semântica (Exa via
mcporter). Verificada e instalada em venv dedicada (`~/.agent-reach-venv/`), fora do
workspace do projeto.

**Não expande as regras da casa.** `/radar`, `/pulso` e `/concorrente` já proíbem raspar
rede social logada (Twitter, Reddit completo, Instagram, Facebook, 小红书) pra conta de
cliente — risco real de banimento, vetado pelo CLAUDE.md. Esta skill só troca a forma de
buscar nas fontes que **já eram permitidas** (Reddit JSON público, YouTube, RSS, busca web),
por um roteador mais confiável que já resolve autenticação zero-config e dá fallback quando
uma fonte cai.

## Uso exclusivo autorizado

- **Pesquisa interna da agência**: `/radar`, `/pulso`, `/concorrente`, `/geo` — monitoramento
  de mercado, nicho, concorrência, notícia.
- **Nunca em conta de cliente.** Canais que exigem cookie/sessão de navegador (Twitter,
  Reddit completo, Instagram, Facebook, 小红书) ficam DESLIGADOS — não instalar, não
  configurar, mesmo se o dono pedir "mais alcance". Só os 6 canais zero-config valem.

## Canais ativos nesta máquina (zero-config, sem login)

Rodar `agent-reach doctor --json` (via `~/.agent-reach-venv/Scripts/agent-reach.exe doctor`)
pra conferir o status atual. Ativos na última checagem:

- ✅ GitHub (repo, busca, issues públicas)
- ✅ RSS/Atom
- ✅ V2EX (tópicos, nós)
- ✅ Web genérica via Jina Reader (`curl https://r.jina.ai/URL`)
- ✅ Bilibili (busca, sem login)
- [!] YouTube — instalado, falta configurar JS runtime (ver `agent-reach doctor` pro comando)
- ❌ Busca semântica (Exa) — precisa `npm install -g mcporter` + configurar Exa MCP

## Comandos úteis

```bash
# ativar a venv (Windows)
~/.agent-reach-venv/Scripts/agent-reach.exe doctor --json

# leitura de página qualquer
curl -s "https://r.jina.ai/<URL>"

# GitHub
gh search repos "<query>" --sort stars --limit 10

# YouTube (legendas)
yt-dlp --write-sub --skip-download -o "/tmp/%(id)s" "<URL>"

# Reddit público (sem cookie — já era o padrão do /radar e /pulso)
curl -s "https://www.reddit.com/r/<sub>/top.json?t=month&limit=25"
```

## Quando NÃO usar

- Qualquer coisa que exija login/cookie de Twitter, Reddit completo, Instagram, Facebook ou
  小红书 — mesmo que o `agent-reach` ofereça o canal. Regra do CLAUDE.md sobre risco de conta
  do cliente prevalece sobre qualquer capability nova instalada.
- Produção de conteúdo, análise ou tradução — isso é `/pulso`, `/radar`, `/escritor-br`, não
  esta skill. Aqui só busca/leitura crua.
- Se `agent-reach` não estiver instalado na máquina que roda a sessão — as skills consumidoras
  caem de volta pra WebSearch/WebFetch/yt-dlp direto, sem travar.

## Manutenção

Ferramenta de terceiro — atualiza por fora do ciclo do ImpulsoX-OS. Pra atualizar:
```
帮我更新 Agent Reach：https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/update.md
```
Reconferir este SKILL.md se a política de canais do repo mudar (ex.: novo canal zero-config
vira elegível; canal que hoje exige cookie passar a ter API oficial libera pra uso em cliente
— só depois de nova revisão de segurança).

---

**✓ Pronto:** infraestrutura de pesquisa em fonte pública instalada e documentada · **↩ esta é
uma skill de apoio:** chamada por `/radar`, `/pulso`, `/concorrente` — nunca é ponto de entrada
direto do dono.