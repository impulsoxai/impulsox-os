# Skills prontas — o que já existe antes de criar do zero

> Consultado pela skill `/automatizar` e por qualquer sessão antes de criar skill nova.
> Regra: pedido que uma ferramenta desta lista resolve não vira skill duplicada —
> vira indicação do caminho certo.

A disponibilidade varia por instalação do Claude Code. Pra conferir o que existe na
sua: digite `/` na sessão e veja a lista, ou pergunte "quais skills tenho instaladas?".

## Documentos e arquivos (nativas do Claude Code)

| Skill | Resolve | Exemplo de uso no marketing |
|---|---|---|
| `docx` | Criar e editar documentos Word | Proposta comercial pro cliente que pediu .doc |
| `pptx` | Criar e editar apresentações | Deck de resultados da agência, apresentação de plano |
| `xlsx` | Criar e editar planilhas com fórmulas | Controle de campanhas, relatório financeiro de ads |
| `pdf` | Extrair, juntar, criar e preencher PDFs | Ler contrato do cliente, extrair dados de relatório |

## Design e web (nativas do Claude Code)

| Skill | Resolve | Relação com o ImpulsoX-OS |
|---|---|---|
| `frontend-design` | Interfaces web de alta qualidade | A `/pagina` já usa esse padrão por dentro |
| `canvas-design` | Arte visual em PNG/PDF | Capa de e-book, banner avulso fora do padrão `/post` |

## Coleta de dados da web

| Skill | Resolve | Relação com o ImpulsoX-OS |
|---|---|---|
| `firecrawl` (e variações) | Ler, buscar e extrair conteúdo de sites | O `/plugar`, `/raio-x` e `/identidade` dependem dela pra extração |

## Quando criar skill própria mesmo assim

- A tarefa combina **várias** ferramentas acima num fluxo fixo do negócio → skill
  própria que orquestra (via `/automatizar`).
- A tarefa exige a voz, a marca ou os dados do núcleo → skill própria, porque as
  nativas não leem `nucleo/` sozinhas.

## Registrar descobertas

Testou uma skill externa que funcionou bem? Adicionar a linha na tabela certa com:
nome, o que resolve, exemplo real de uso. Manter este arquivo enxuto — catálogo é
mapa, não inventário.
