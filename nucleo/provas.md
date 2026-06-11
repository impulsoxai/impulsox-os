# Banco de Provas

> Mantido pela skill `/provas`. Consumido por `/post`, `/linkedin`, `/ads-meta`,
> `/pagina`, `/lancar-produto`, `/proposta` e `/relatorio`.
> Regra de uso: peça pública só consome prova com status **autorizada**; status
> "uso interno" vale só pra proposta um-a-um; "pendente" não vale pra nada.

_(vazio — rode `/provas` para garimpar o que já existe e montar o fluxo de pedido)_

## Formato de cada prova

```markdown
### [identificador curto]
- **Tipo:** caso com número | depoimento | avaliação pública | print | volume
- **Material:** [o texto/número/descrição do print]
- **Origem:** [cliente/contexto, data; arquivo em dados/provas/ se houver]
- **Autorização:** autorizada com nome | autorizada anônima | uso interno | pendente
- **Já usada em:** [peças, pra não repetir a mesma prova em tudo]
```
