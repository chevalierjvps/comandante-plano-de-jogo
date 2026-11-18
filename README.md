# Comandante: Plano de Jogo

Jogo tático top-down de planejamento CQB em JavaScript puro (sem dependências externas), com 36 missões distribuídas em 6 operações.

## Estrutura

- `playground/comandante/index.html`: Interface retrato-primeiro (mobile e desktop).
- `playground/comandante/sim.js`: Motor de simulação determinística (1/30 s por passo, compatível com navegador e Node).
- `playground/comandante/jogo.js`: Controle de telas, gestos, lupa, linha do tempo, som sintetizado (Web Audio) e replay pós-ação.
- `playground/comandante/missoes.js`: 36 missões em 6 operações, briefings, fichas e classes.
- `playground/comandante/retratos.js`: Retratos procedurais em Canvas dos operadores e personagens.
- `não-upar/ferramentas/testa-comandante.js`: Suíte de testes automatizados das 36 missões.
- `não-upar/ferramentas/gabaritos-comandante.json`: Planos gabarito de 3 estrelas para todas as 36 missões.

## Como testar

```bash
node não-upar/ferramentas/testa-comandante.js
```
