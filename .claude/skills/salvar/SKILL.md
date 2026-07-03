---
name: salvar
description: >
  Use quando o trabalho precisa de backup no GitHub — "/salvar", "salva meu trabalho",
  "faz backup", "commit", "sobe pro github", ou ao fim de uma sessão que produziu coisa
  que doeria perder (núcleo preenchido, calendário, peças aprovadas). Cuida de todo o
  git por baixo dos panos: o usuário não precisa saber o que é commit.
---

# /salvar — Backup do trabalho no GitHub

O dono do negócio não sabe git e não deveria precisar saber. Esta skill garante que
tudo que o sistema produziu — núcleo, marca, calendários, peças — exista também fora
desta máquina. Uma chamada, zero jargão.

Autoria: ImpulsoX AI. Conteúdo original.

## Situação especial: o remote ainda é o repositório do produto

O ImpulsoX-OS chega por clone, então `origin` provavelmente ainda aponta para
`impulsoxai/impulsox-os` — um repositório que **não é do usuário** e onde ele não
consegue (nem deve) dar push. Na primeira execução, conferir:

```bash
git remote get-url origin
```

Se a URL contiver `impulsox-os` ou outro nome genérico do produto, explicar em uma
frase ("este endereço é o do produto, não o seu — vou criar o seu cofre particular")
e seguir o fluxo de primeira vez abaixo, trocando o remote com
`git remote set-url origin <nova-url>`. Nunca tentar push para o repositório do produto.

## Primeira vez (sem repositório próprio configurado)

1. Perguntar se o usuário já tem um repositório no GitHub para este trabalho:
   - **Tem** → pedir a URL e configurar: `git remote set-url origin <url>` (ou
     `git remote add origin <url>` se não existir remote), depois commit e
     `git push -u origin main`.
   - **Não tem** → verificar `gh --version`:
     - `gh` disponível → propor nome (slug do negócio, ex. `marketing-<negocio>`),
       criar **privado**: `gh repo create <nome> --private --source=. --push`.
     - sem `gh` → orientar: criar em github.com/new (marcar **Private**), voltar com
       a URL. Oferecer também instalar o `gh` (https://cli.github.com/) pra próxima
       vez ser automática.
2. Se `git config user.name` / `user.email` estiverem vazios, perguntar nome e e-mail
   e configurar com `git config --global` antes do primeiro commit.
3. Explicar o resultado em linguagem de gente: "seu trabalho agora tem uma cópia
   privada na nuvem; rode /salvar sempre que terminar algo importante."

## Salvamentos seguintes

1. `git status` — sem mudança? Responder "tudo já está salvo" e parar.
2. Mostrar em uma linha o que mudou (em português: "3 peças novas, calendário de
   julho, núcleo atualizado"), não o diff cru.
3. Mensagem do commit: gerar automaticamente a partir do que mudou, em português,
   uma linha ("Adiciona calendário de julho e 3 carrosséis aprovados"). Se o usuário
   quiser descrever com as palavras dele, usar as palavras dele.
4. **Varredura de segredo no CONTEÚDO** (o `.gitignore` protege arquivos, não texto
   colado): antes do add, procurar padrões de credencial nos arquivos que vão subir —

   ```bash
   git diff --cached --diff-filter=d --name-only 2>/dev/null; \
   git ls-files -mo --exclude-standard | xargs -r grep -lE 'ixk_live_|ixs_pub_|sk-[A-Za-z0-9]{20}|Bearer [A-Za-z0-9._-]{20}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}' 2>/dev/null
   ```

   Achou algo → **mostrar o arquivo e a linha ao usuário e PERGUNTAR** ("isso parece uma
   chave/token — apago antes de salvar, ou movo pro .env?"). **Nunca subir com achado
   pendente.** Cenário real: o dono cola um token do CRM numa nota de `producao/` — o
   .gitignore não vê isso; o grep vê.
5. `git add -A` → `git commit` → `git push`.
6. Confirmar com o link do repositório (`git remote get-url origin`).

## Proteções

- **Segredos:** antes de `git add`, conferir que `.env` e variações seguem fora do
  versionamento (o `.gitignore` da raiz já cobre; se o usuário criou `.env` em
  subpasta de cliente, conferir que também está ignorado). Token nunca sobe — e a
  varredura de CONTEÚDO do passo 4 pega token colado em arquivo versionado, que o
  `.gitignore` não protege.
- Push recusado por divergência → explicar sem jargão ("a nuvem tem coisa que esta
  máquina não tem"), rodar `git pull --rebase` e tentar de novo; conflito que não se
  resolve sozinho → mostrar os arquivos em conflito e perguntar qual versão vale.
- Nunca `--force`, nunca `git reset --hard`, nunca apagar histórico — sob nenhum
  pretexto automático. Só com pedido explícito e confirmação.
- Repositório novo é sempre **privado** por padrão. Tornar público só se o usuário
  pedir com todas as letras (o repositório carrega o núcleo do negócio dele).

## Regras

- Zero jargão de git na conversa. "Salvar" e "nuvem" bastam; o comando técnico roda
  por baixo.
- Erro de git: mostrar a mensagem literal junto da tradução em português simples.
- Ao fim de sessões que mexeram no núcleo ou aprovaram peças, lembrar uma vez:
  "quer que eu salve isso na nuvem? (/salvar)". Não insistir.

---

**✓ Pronto:** trabalho salvo na nuvem (GitHub) com backup íntegro · **→ próximo passo:** seguir de onde parou — o `/salvar` é só o backup, não muda o rumo do que você estava fazendo.
