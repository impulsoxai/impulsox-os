# Prompt: Site Builder (ImpulsoX)

> Uso: anexar o `design-system.md` final + briefing/copy do cliente. Enviar no Claude Code (ou ferramenta de construção). Output: site completo.

---

Você vai construir [TIPO: landing page / site institucional / dashboard] para [CLIENTE/PROJETO].

## Fonte da verdade

O arquivo `design-system.md` anexado é **lei absoluta**. Toda decisão de cor, tipografia, espaçamento, componente, animação e interação deve vir dele. Quando o design system não especificar algo, derive da seção "Regras de uso" — nunca do seu padrão default.

**Proibido** (anti-genérico):
- Layout de 3 cards lado a lado como solução padrão para "benefícios"
- Degradês roxo/azul genéricos
- Tipografia default (Inter/system-ui) se o DS especificar outra
- Seções excessivamente "limpas" sem os detalhes/texturas do DS
- Hero centralizado óbvio se o DS tiver padrões assimétricos

## Conteúdo

[colar briefing/copy aqui — ou referenciar fact-sheet.json no padrão impulsox-chatgpt-ads]

Estrutura de dobras sugerida: derive da seção "Padrões de layout" do DS, adaptada ao objetivo da página (conversão / institucional / produto).

## Stack e requisitos técnicos

- [Landing page]: HTML + CSS + JS vanilla, arquivos separados (`index.html`, `styles.css`, `main.js`). Sem frameworks.
- [Interface de produto]: React + CSS Modules, padrão ImpulsoX CRM v3.
- Animações: CSS puro sempre que possível; `IntersectionObserver` para scroll-reveal; `requestAnimationFrame` para efeitos de cursor/background. GSAP só se o DS exigir timeline complexa.
- Fontes: importar exatamente as especificadas no DS (Google Fonts/Fontshare), com `font-display: swap`.
- Responsivo: mobile-first, breakpoints do DS, testar 390/768/1440 (mesmas larguras da verificação do /pagina — uma régua só).
- Performance: imagens otimizadas (WebP, lazy), sem libs desnecessárias, Lighthouse ≥ 90.
- Acessibilidade: contraste AA, `prefers-reduced-motion` desativando animações decorativas, HTML semântico.
- SEO básico: title, meta description, OG tags, favicon.

## Processo

1. Liste as dobras planejadas com o padrão de layout do DS aplicado a cada uma — **aguarde aprovação antes de codar**.
2. Construa dobra por dobra, aplicando as animações do DS nos triggers corretos.
3. Ao final, faça auto-auditoria contra o DS: liste cada token/animação do DS e onde foi aplicado. Corrija desvios antes de entregar.
