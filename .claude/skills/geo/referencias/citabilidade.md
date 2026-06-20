# referencias/citabilidade.md: Grounding da skill /geo

> Documento de referência da `/geo` do ImpulsoX-OS. Fonte de verdade do `validate-geo.mjs`
> e da geração de conteúdo citável. Cada afirmação carrega nível de confiança no padrão
> FATO / FATO-CONFIRMADO / VOZ, pra a skill saber o que declara como fato e o que exige
> ressalva. Mesma régua de persuasão honesta do `docs/persuasao.md`.

## 0. Como ler os níveis de confiança

- **FATO-CONFIRMADO**: fonte primária verificável (paper revisado por pares, anúncio
  oficial do fornecedor). Pode afirmar direto.
- **FATO**: dado de mercado de fornecedor confiável, método não auditado por nós. Afirmar
  com atribuição da fonte.
- **VOZ**: projeção, estimativa ou número que varia muito entre fontes. Usar com hedge
  explícito ("estimativas variam", "projeção"). Nunca apresentar como certeza.

Regra do validador: conteúdo que cite qualquer número desta lista carrega a atribuição da
fonte. Número sem fonte é reprovado.

## 1. Por que GEO importa (a tese)

- AI Mode do Google passou de 1 bilhão de usuários mensais, queries dobrando a cada
  trimestre desde o lançamento. Google I/O 2026 (oficial). FATO-CONFIRMADO
- AI Overviews aumentaram o uso da busca em mais de 10% nas queries onde aparecem;
  expandidas para 200+ países e 40+ idiomas. Google I/O 2025 (oficial). FATO-CONFIRMADO
- A sobreposição entre os top links do Google e as fontes citadas pela IA caiu de ~70% para
  menos de 20% em dois anos. Brandlight, via Search Engine Land. FATO
- Apenas ~10% do que o ChatGPT cita aparece no top 10 orgânico do Google (ou seja, ~90% das
  citações vêm de fora dos primeiros rankings). Discovered Labs. FATO
- AI Overviews aparecem em algo entre ~16% e até ~60% das buscas, conforme a fonte e o tipo
  de query (maior em comparação e alta intenção). Faixa ampla, tratar com cuidado. VOZ
- Gartner projeta queda de 25% no volume de busca tradicional até 2026. Projeção de
  fev/2024, não medição. VOZ

Conclusão operacional: estar em #1 no Google não garante ser citado pela IA. São dois
sistemas de recuperação diferentes.

## 2. Como a IA escolhe o que citar (mecânica)

- **Query fan-out**: o motor não roda uma busca só. Quebra a pergunta em sub-queries, roda
  em paralelo e sintetiza. Implicação: otimizar pro leque de sub-perguntas, não só pra query
  principal. FATO-CONFIRMADO (descrito pelo próprio Google)
- **RAG e a unidade de otimização**: o sistema indexa, faz embedding e recupera trechos
  (passages) semanticamente relevantes, depois sintetiza e cita. A unidade de otimização
  deixa de ser a página e passa a ser o trecho auto-contido. FATO
- O conteúdo precisa ser extraível e remontável: resposta clara, auto-contida, sem depender
  do contexto ao redor. FATO

## 3. Regras de citabilidade: base do validate-geo.mjs

Origem: estudo fundador de GEO (Princeton, Georgia Tech, Allen Institute for AI, IIT Delhi),
publicado no ACM SIGKDD 2024 (arXiv:2311.09735). Testado em ~10.000 queries, 25 domínios,
validado na Perplexity. A fonte mais sólida que temos. FATO-CONFIRMADO

Ganhos de visibilidade por técnica (relativos a conteúdo não otimizado):

| Técnica | Ganho | Regra determinística |
|---|---|---|
| Citações de fonte | +30 a +41% | >=1 referência a fonte reconhecível por bloco |
| Estatísticas | +32% | >=1 dado numérico com atribuição por bloco |
| Aspas / quotes atribuídas | +41% | quote com autor identificado quando aplicável |
| Otimização de fluência | +28% | texto claro, sem ruído; reprovar keyword stuffing |
| Terminologia técnica precisa | ~+28% | usar termos padrão do setor |

Regras adicionais (consenso de mercado, nível FATO):

- **Front-load**: a resposta direta na primeira sentença do bloco. RAG cita o trecho, não a
  página inteira.
- **Formato Q&A / headings claros**: cada seção responde uma pergunta; o heading sinaliza
  qual.
- **Schema estruturado**: JSON-LD `FAQPage` e `Article` (schema.org). FATO

> Nota anti-hype: keyword stuffing reduz visibilidade no estudo. O validador reprova
> densidade artificial de palavra-chave, não premia.

## 4. Sinais off-site (a página inicial perde soberania)

- Menções de marca pesam ~3:1 sobre backlinks pra visibilidade em IA. Ahrefs, via
  TruPerformance. FATO
- Menções não linkadas ainda carregam peso: a IA registra a marca mesmo sem link. LLMrefs.
  FATO
- Há viés sistemático por earned media sobre conteúdo próprio da marca. Chen et al., arXiv
  set/2025. FATO
- Para perguntas factuais, a Wikipedia domina as citações do ChatGPT (~47,9% das top
  fontes). FATO

Implicação pro plano (Fase 3): reviews, Reddit, imprensa, podcasts e diretórios precisam de
tanta ou mais atenção que o conteúdo on-site.

## 5. Decaimento e recência (por que é recorrente, não conserto único)

A justificativa do retainer e o contraponto honesto ao "conserte em 90 dias e domine por 10
anos".

- ~50% do conteúdo citado em respostas de IA tem menos de 13 semanas. Frase.io. FATO
- Citações a conteúdo com mais de 3 meses caem fortemente. LLMrefs. FATO
- Conteúdo atualizado recentemente aparece ~4,3x mais; ~85% das citações de AI Overview são
  de material dos últimos 2 anos. Seer Interactive. FATO
- Entre 40% e 60% das fontes citadas mudam de um mês pro outro. Search Engine Land. FATO

Conclusão operacional: GEO é manutenção contínua. O Share of Model se remede todo mês porque
a base é volátil por natureza.

## 6. Crawlabilidade técnica (checklist da Fase 3)

- **JavaScript**: muitos crawlers de IA não executam JS. Páginas que devem ser citadas
  precisam de SSR/SSG (cuidado com apps React/Next client-side que entregam casca vazia).
  FATO
- **robots.txt**: muitos sites bloqueiam crawlers de IA sem saber. Verificar logs por
  user-agents tipo `ChatGPT-User`, `GPTBot`, `CCBot`. FATO
- **`llms.txt`**: publicar o arquivo pra orientar motores de IA. FATO
- **Índice Bing**: o ChatGPT usa o índice do Bing. Submeter o sitemap ao Bing Webmaster
  Tools, não só ao Google. FATO
- **E-E-A-T**: Experiência, Expertise, Autoridade, Confiança. Autor nomeado com bio, datas
  visíveis, referências inline. FATO

## 7. Medição: Share of Model

- **Share of Model (SoM)**: % de respostas (num conjunto fixo de prompts) em que a marca
  aparece, comparado aos concorrentes. A métrica central do relatório recorrente. FATO
- Não existe ainda equivalente do Search Console pra GEO. A medição é por auditoria manual +
  ferramenta própria. FATO
- Tráfego referido por IA é rastreável no GA4. FATO
- Lag entre publicar e aparecer: motores RAG ao vivo (AI Overviews, Perplexity) reagem em
  semanas; modelos que dependem de treino reagem em ciclos mais longos. FATO

> Hedge obrigatório no relatório: SoM é uma amostra de um conjunto de prompts, em motores que
> personalizam respostas. Não é "a verdade absoluta sobre o que a IA diz da marca". A skill
> declara isso explicitamente.

## 8. Terminologia

GEO (Generative Engine Optimization) é o mesmo campo às vezes chamado de AEO (Answer Engine
Optimization), LLMO, GSO ou AIO. O mercado ainda não fixou um termo. Padronizar em GEO nos
nossos materiais. FATO

## 9. Fontes

- Google: anúncios oficiais de Search no I/O 2025 e I/O 2026 (blog.google).
- GEO: Generative Engine Optimization (Aggarwal et al., ACM SIGKDD 2024, arXiv:2311.09735).
- Chen et al.: Generative Engine Optimization, viés por earned media (arXiv, set/2025).
- Brandlight; Ahrefs; Seer Interactive; Conductor; Frase.io; LLMrefs; Discovered Labs;
  Search Engine Land: dados de mercado de GEO (2026).
- Gartner: projeção de queda de busca tradicional (fev/2024).

> Política de atualização: os números das seções 1, 5 e 7 são voláteis. Revisar este
> documento a cada trimestre (mesmo intervalo do decaimento de citações). Tudo VOZ deve ser
> reverificado antes de virar afirmação em material de cliente.
