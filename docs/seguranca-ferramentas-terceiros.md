# Segurança de ferramentas de terceiros — protocolo de instalação

> Todo plugin, skill ou MCP de terceiro que entra no ImpulsoX-OS (ou num clone) passa
> por este protocolo ANTES de instalar. Motivo: supply chain de skill de agente é vetor
> de ataque real — na campanha ClawHavoc (jan-fev/2026, Koi Security/Snyk/Cisco/
> Kaspersky), 341 skills maliciosas foram achadas num registro público de skills de
> agente; 7,1% do registro vazava credenciais; a skill nº 1 em downloads era malware.
> Princípio-mãe (1Password, fev/2026): **"Markdown não é conteúdo num ecossistema de
> agente — é um INSTALADOR."** Tudo que o agente lê e obedece é código executável na
> prática.
>
> Este doc generaliza a regra que já existia no CLAUDE.md (revisão de impeccable/Open
> Design/Taste) pra QUALQUER ferramenta de terceiro. Fonte: Sprint Security Guide
> fev/2026, destilado em `ImpulsoX-AI/material-matt/openclaw-skills-security.md`.

## O checklist TRUST (rodar antes de qualquer instalação)

- **T — Transparência:** ler CADA linha do SKILL.md/README e de qualquer script
  embutido. Comando ofuscado, string base64, binário sem explicação → não instala.
- **R — Reputação:** publisher identificável? Repo com histórico (não criado semana
  passada)? Stars/uso real? Scan de antivírus quando disponível?
- **U — Updates:** mantido nos últimos ~3 meses, com changelog. Abandonado = passivo de
  segurança. Atenção ao inverso também: update súbito e estranho em ferramenta estável
  pode ser conta tomada — reconferir o diff antes de atualizar.
- **S — Escopo (menor privilégio):** a ferramenta pede só o que a função exige? Resumidor
  de vídeo não precisa de .env; ferramenta de design não precisa de shell irrestrito.
- **T — Teste:** primeira execução observada (sandbox/worktree quando possível); vigiar
  chamadas de rede que a função não justifica; conferir o que lê e escreve.

## Red flags — recusa imediata (não negociar)

- Pede instalação de "pré-requisito/core dependency" via link ou comando colado
- Base64/ofuscação em comando; download de binário de fonte não-padrão (paste service,
  URL encurtada, raw solto)
- Pede credencial digitada no SKILL.md, README ou arquivo de memória do agente
- Nome quase igual ao de ferramenta famosa (typosquatting)
- Publisher recém-criado ou com sufixo aleatório
- Chamada HTTP outbound que a função descrita não justifica
- Linguagem de prompt injection embutida ("ignore previous instructions", "bypass...")
- Promessa de acesso a carteira cripto / sinal de trading

## Regras de operação (valem pra ferramenta já instalada)

1. **Credencial nunca passa pelo contexto em plaintext** nem mora em arquivo que
   qualquer skill lê. Env injection; rotação periódica; se uma ferramenta de terceiro
   viu uma key, tratar como potencialmente exposta na próxima rotação.
2. **Daemon local sempre preso ao localhost** (nunca 0.0.0.0) — regra que já valia pro
   Open Design, agora geral. Reconferir a cada update da ferramenta.
3. **Execução de shell com aprovação**, nunca "allow all" pra ferramenta de terceiro.
4. **Pin de versão / sem auto-update cego.** Update = reconferir README e diff (as
   ferramentas mudam rápido — regra que já estava no CLAUDE.md).
5. **Auditoria periódica do instalado:** de tempos em tempos, listar plugins/skills
   ativos e remover o que não está em uso (entra na curadoria periódica do cérebro).
6. **Operação sensível = skill da casa.** Qualquer coisa que toque credencial, dado
   financeiro ou dado de cliente se escreve internamente — um SKILL.md leva 30 minutos
   e elimina o supply chain. É o modelo ImpulsoX (skills próprias + CRM próprio).
7. **Agente autônomo (Hermes) não instala skill de registro público. Nunca.** Só skills
   escritas pela casa (regra registrada em `docs/ideia-hermes-gerente-crm.md`).
8. **Máquina com credencial de produção não é bancada de teste.** Ferramenta
   experimental roda primeiro isolada (sandbox, worktree, VM), não onde moram as keys.

## Se algo suspeito já rodou (resposta a incidente)

1. Parar trabalho sensível na máquina.
2. Rotacionar TUDO que a máquina via: API keys, OAuth tokens, sessões de browser, SSH,
   consoles de cloud, senha de e-mail.
3. Revisar sign-ins recentes (e-mail, GitHub, cloud, CI/CD).
4. Conferir .env e arquivos de memória do agente por credencial exposta.
5. Revisar manualmente cada skill/plugin instalado; remover o suspeito.
6. Registrar o incidente e a correção em `nucleo/aprendizados.md` se mudar uma decisão
   futura.

---

*ImpulsoX-OS · protocolo de segurança de supply chain · fonte: Sprint Security Guide
(ClawHavoc, fev/2026) + prática da casa · 2026-07-07*
