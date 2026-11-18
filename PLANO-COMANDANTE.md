# Plano do jogo "Comandante: Plano de Jogo"

Faça tudo do jogo, imagens, mecanicas, menu e etc. Voce tem liberdade para implementar novas funçoes, mecanicas e objetivos para deixar o game mais divertido.
## 1. O jogo

Você comanda um time de airsoft visto de cima. **Não controla ninguém na hora**: desenha a rota de cada operador, dá ordens em pontos da rota, aperta EXECUTAR e assiste. Perdeu? Vê onde falhou, ajusta e roda de novo.

Três coisas seguram o jogador:
1. **Toda missão traz uma novidade** (operador a mais, equipamento, tipo de objetivo, regra de cenário). Nunca duas missões seguidas com a mesma cara.
2. **Toda missão ensina uma tática de verdade**, e a terceira estrela só sai se a tática foi aplicada (seção 8).
3. **Mini história** por operação: brief de 3 linhas e fichas com retrato de quem é quem.

## 2. Regras de construção

- Pasta `playground/comandante/`: `index.html`, `sim.js` (simulação pura, sem DOM), `jogo.js` (tela, toque, desenho), `missoes.js`, `retratos.js`.
- JS puro, sem build, sem dependência, sem API. Progresso em `localStorage` (`sz_comandante_v1`).
- `sim.js` roda igual no navegador e no Node, pra ser testado por script.
- Copiar de `playground/cqb/jogo.js` o que serve (`raio`, `linha`, `caminho`, som, cores, fontes). **Não alterar o CQB nem criar arquivo compartilhado.**
- **Retrato primeiro.** Celular em pé, 375x812.
- Nunca `Math.random()` na simulação: só gerador com semente. Nunca `innerHTML` com dado vindo do endereço.
- **Não fazer deploy, não commitar, não mexer em `api/`, `infra/`, menu ou sitemap** sem o Davi pedir.
- Cada mecânica nova entra **só na etapa da operação que a usa**. Não adiantar.

## 3. Mapa

Texto, uma linha por fileira. Tamanho por missão: **12x16** (até 4 operadores), **14x20** (5 a 8). Quadrado = 40 unidades.

```
#  parede            X  caixote (bloqueia; dá cobertura a quem está colado)
.  chão              D  porta (abertura de 1 quadrado; conta como chão; é o "funil")
1-8  seus operadores a-l  adversários
R  refém             V  alvo a capturar vivo        M  maleta / objeto
B  bomba ou ponto de ação                           O  zona de domínio
S  saída do seu time (extração)                     E  saída de fuga do adversário
```

O seu time começa embaixo. Em mapa 14x20 os quadrados ficam com ~26 px: ao arrastar, mostrar uma **lupa** acima do dedo com o quadrado-alvo ampliado.

Mapas das missões 1 e 2 (os demais o executor desenha pela descrição da seção 9 e valida com o teste):

```
############      ############
#..........#      #....b.....#
#....a.....#      #..XX......#
#..........#      #......a...#
#..XX..XX..#      #..........#
#..........#      ####D#######
####D#######      #..........#
#..........#      #..XX..XX..#
#..........#      #..........#
#.XX....XX.#      #....XX....#
#..........#      #..........#
#..........#      #.XX....XX.#
#....XX....#      #..........#
#..........#      #..........#
#...1..2...#      #...1..2...#
############      ############
```

## 4. O plano (formato de dados)

```js
plano = [ { pts: [
  { x: 4, y: 14 },                                         // ponto 0 = posição inicial
  { x: 4, y: 11, ritmo: 'andar' },                         // 'furtivo' | 'andar' | 'correr'
  { x: 4, y: 7, ritmo: 'furtivo', ordem: { t: 'segurar', ang: -90, s: 6 } }
], socorrer: true, seguir: null } ]
```

Entre dois pontos o operador anda pelo caminho mais curto. Limite: 12 pontos por operador. O adversário usa o mesmo formato.

**Ordens num ponto** (cada uma só aparece no menu depois da missão que a libera):

| Ordem | O que faz | Libera na missão |
|---|---|---|
| `esperar` s | Fica parado N segundos | 1 |
| `segurar` ang, s? | Parado olhando pra um ângulo (cobertura). Reage mais rápido a quem aparece ali | 2 |
| `fatiar` | Só em ponto a até 2 quadrados de uma porta ou quina: contorna a abertura em arco, em furtivo, olhando pra dentro; enfrenta um adversário por vez e conta como coberto pelo batente | 3 |
| `sinal` de, pt | Espera o operador `de` chegar no ponto `pt` dele | 4 |
| `luz` ang | Granada de luz, alcance 5 quadrados: atordoa 3,5 s quem tem linha de visão a até 4 quadrados (inclusive os seus) | 5 |
| `impacto` ang | Granada de impacto, alcance 5: **elimina** todos a até 1,5 quadrado com linha de visão, dos dois times. Proibida perto de refém e de alvo vivo | 15 |
| `taser` | Dispara o taser no alvo `V` se ele estiver a até 3 quadrados com linha de visão. 1 carga | 17 |
| `lanterna` liga/desliga | Só em missão no escuro | 25 |

**Automático, sem ordem:**
- **Faca**: operador em `furtivo` que chega ao quadrado vizinho de um adversário que não o percebeu elimina em silêncio.
- **Pegar**: passar pela maleta `M` pega; passar ao lado do refém `R` faz ele seguir.
- **Render**: ver seção 5.
- **Socorrer** (só médico, chave `socorrer` no plano): ver seção 5.

**Seguir** (missão 19 em diante): `seguir: n` faz o operador repetir a rota do operador `n`, 1 quadrado atrás, com as próprias ordens só no final. É como se monta a fila ("stack") sem desenhar 8 rotas.

## 5. Simulação (`sim.js`)

`SIM.cria(missao, plano, semente)`, `SIM.passo(estado)` (1/30 s), `SIM.roda(missao, plano, semente)` → `{ venceu, motivo, tempo, eventos, baixas, tatica }`. Mesma entrada, mesmo resultado. Semente = `missao.semente + tentativa`; o plano do adversário é `missao.inimigo[semente % n]`.

### Constantes (objeto `C` no topo)

| Coisa | Valor |
|---|---|
| Duração máxima | `missao.tempo` (padrão 90 s) |
| Velocidade furtivo / andar / correr | 40 / 75 / 135 |
| Cone de visão | 100°, 12 quadrados; periférica 360° até 1,2 quadrado |
| Reação: andando / segurando o ângulo certo / correndo | 0,50 / 0,30 / 0,90 s |
| Alvo vem em furtivo | reação de quem vê +0,25 s |
| **Surpresa**: adversário ainda "tranquilo" | reação +0,40 s |
| Rajada | 3 disparos a cada 0,12 s, pausa 0,5 s |
| Chance por disparo | 0,55 até 3 quadrados, cai em linha reta até 0,12 a 12 |
| Alvo correndo / com cobertura | x0,6 / x0,45 |
| **Funil**: alvo parado ou andando em quadrado `D` | chance contra ele x1,5 |
| Atirador suprimido / andando | x0,4 e reação +0,4 s / x0,7 |
| Supressão | disparo que passa a menos de 1 quadrado: 2 s |
| **Linha de tiro bloqueada** | não dispara se há colega, refém ou alvo vivo a menos de 0,6 quadrado da linha até o adversário; o tempo perdido é registrado |
| Barulho: correr / tiro / granada | ouvido a 6 / 10 / 14 quadrados |
| Janela depois da granada de luz | atordoado 3,5 s (M 7.1: entrar nos primeiros 2 s) |

### Estados do adversário: tranquilo e alerta

Todo adversário começa **tranquilo** (segue patrulha `rota`, reação +0,40 s). Passa a **alerta** ao ver um operador, ouvir tiro ou granada, ver colega caído, ou ouvir o grito de outro em alerta (6 quadrados). Em alerta, troca pro plano `alerta` da missão (se houver) ou segura virado pro barulho. Faca e taser não fazem barulho. Missões com `alarme: n` falham n segundos depois do primeiro alerta (ex.: levam o refém embora).

### Ferido e baixa crítica (a partir da missão 16)

- Toque no seu operador = **ferido**: cai, não age, relógio de 25 s.
- **Baixa crítica** (fora da missão, sem socorro): toque dado a até 2 quadrados, faca, granada de impacto, segundo toque, ou os 25 s acabarem.
- **Médico** é um combatente normal com medkit (2 por missão). Com `socorrer` ligado: se alguém cai ferido a até 6 quadrados e o médico não tem adversário à vista, ele interrompe a rota, vai até o ferido, trata por 4 s parado e retoma. O tratado volta "enfaixado" (reação +0,2 s).
- Antes da missão 16 não há médico: todo toque tira o operador da missão.
- Adversário: sempre um toque elimina.

### Refém `R`

Parado até um operador encostar; aí segue esse operador, andando. Se o operador cair, fica parado até outro encostar. Vence levando ao `S`. Falha se o refém ficar no raio de uma granada de impacto. Ninguém atira com o refém na linha de tiro.

### Alvo vivo `V` (render)

- O time **nunca atira nele** (mas atira perto: ele pode ficar suprimido). Ele está armado com pistola e atira.
- Ao entrar em alerta, **foge** pelo caminho mais curto até o `E` mais longe dos operadores que ele vê. Chegou no `E` = missão falha ("fugiu").
- É **rendido** quando um operador fica a até 1,5 quadrado dele por 1 s e vale uma destas: ele está atordoado (luz ou taser); o operador está fora do cone de visão dele; ele está suprimido e há dois operadores com linha de visão a até 4 quadrados (cercado).
- Taser: atordoa 5 s.
- Granada de impacto nele = missão falha ("o alvo tinha que sair vivo").
- Rendido, segue o operador como o refém, até o `S` quando a missão pedir.

### Classes (a partir da missão 20)

| Classe | Diferença |
|---|---|
| Fuzileiro | padrão |
| Batedor | furtivo a 55; faca vale também por um lado; chance cai mais rápido (0,08 a 12 quadrados) |
| Apoio | rajada de 6; suprime a 1,5 quadrado; reação +0,15 s; 15% mais lento |
| Atirador | chance 0,60 fixa até 12 quadrados; cone de 60°; a até 3 quadrados, reação +0,30 s |
| Escudo | disparo vindo de até 60° da frente dele não acerta; não corre; pistola (alcance 6); chance x0,6. Quem vai colado atrás fica coberto (M 7.3) |
| Médico | padrão + medkit |

### Escuro (a partir da missão 25)

`escuro: true`: todos enxergam só 4 quadrados. Lanterna ligada: o cone volta a 12, mas o dono é visto a 12 quadrados por qualquer um, de qualquer lado. Lanterna ligada atrás de um colega (até 3 quadrados, apontada pra ele) faz o colega da frente ser visto também (contraluz, M 7.2).

### Ordem dentro de cada passo

1. Movimento (quem tem adversário à vista para, exceto quem corre). 2. Percepção e barulho. 3. Escolha do alvo e contagem da reação. 4. Disparo, supressão, granadas, faca, taser, render. 5. Baixas e feridos (valem no passo seguinte). 6. Socorro. 7. Objetivo e fim.

Registro de eventos: `{ t, tipo, quem, alvo, x, y, causa }`, com tipos `viu, disparo, bloqueado, baixa, ferido, tratado, suprimido, luz, impacto, faca, taser, rendido, pegou, alerta, objetivo`.

### Causa de cada baixa do seu time (a primeira que valer)

`funil` (estava em quadrado `D`) · `aberto` (sem cobertura, parado há mais de 1 s) · `correndo` · `agrupado` (colega a menos de 1,5 quadrado, ou mesma granada) · `sozinho` (ninguém do time com visão pro atirador nem pra ele) · `costas` (fora do cone dele) · `propria` (granada do próprio time) · `duelo`.

### Objetivos (`missao.objetivo`, pode ser uma lista em cadeia)

`eliminar` · `maleta` (pegar `M` e levar ao `S`; quem carrega anda 15% mais devagar) · `resgate` · `captura` · `dominio` (N segundos na zona `O` sem adversário nela) · `defesa` (ter operador vivo na zona até o tempo acabar) · `bomba` (ficar 6 s parado no `B` antes do relógio) · `escolta` (o VIP anda sozinho por uma rota fixa até o `S`; não pode ser tocado).

## 6. Telas

**Menu:** as 6 operações em blocos, cada uma com suas 6 missões (nome, estrelas, cadeado), a novidade em destaque na próxima missão ("NOVO: granada de luz"), patente, som.

**Brief (tem que ser lido em 5 segundos):**
- Título e uma faixa "NOVO:" com a novidade da missão em 4 palavras.
- **História em no máximo 3 linhas curtas.**
- **Fichas** lado a lado: retrato 64x64 + nome + uma linha. Ex.: `[retrato] Sr. Almeida · gerente do banco · RESGATAR VIVO` / `[retrato] "Corvo" · operador da quadrilha · CAPTURAR, NÃO ELIMINAR`. Cor da moldura pelo papel: amarelo refém, vermelho alvo vivo, cinza hostil, verde seu time.
- Objetivo em uma linha com ícone. Botão PLANEJAR. Nada mais.

**Retratos (`retratos.js`):** desenhados por código, busto de frente. `desenha(ctx, { pele, cabelo, corCabelo, barba, oculos, roupa: 'terno'|'tatico'|'camiseta'|'jaleco', acessorio: 'balaclava'|'bone'|'boina'|'capacete'|'fone'|null, cicatriz })`. Cada personagem da seção 9 é uma dessas combinações, fixa. Operadores do time também têm retrato e codinome (aparecem na faixa de operadores e no resultado).

**Planejar:**
- Barra de cima: voltar · missão · tempo previsto. Mapa na largura toda. Faixa dos operadores (botões com retrato, número e ícone da classe; até 4 por linha, 2 linhas com 5 a 8). Barra de baixo: DESFAZER · LIMPAR · **EXECUTAR**.
- Tocar em chão: ponto novo no fim da rota do selecionado, com o caminho real desenhado (contínuo = andar, tracejado = furtivo, duplo = correr). Arrastar: prévia do caminho seguindo o dedo.
- Tocar num ponto: folha de ordens (só as liberadas) + ritmo até ali + remover. Segurar e arrastar: move o ponto.
- Ajudas: cone de visão em cada `segurar`; escudo onde há cobertura; quadrados `D` marcados como funil; linha pontilhada ligando um `sinal` ao ponto que o libera; raio da granada ao apontar; patrulha conhecida do adversário (`rota`) em vermelho apagado; posição inicial do adversário visível.
- **Linha do tempo** (puxar a barra de baixo): uma faixa por operador, em segundos. É onde se confere sincronia.
- Com 5 ou mais: botão EQUIPE alterna Alfa / Bravo / todos; "Seguir" na folha do operador.
- Plano salvo sozinho. Desktop: clique, botão direito abre ordens, teclas `1-8`, `Ctrl+Z`, `Enter`.

**Executar:** bonecos andando, traço de disparo, tremor em quem está suprimido, "!" em quem entrou em alerta, clarão e anel das granadas, ferido deitado com relógio. Pausar · 1x 2x 4x · PARAR.

**Resultado (formato de análise pós-ação, M 9.3):**
- Estrelas: ★ cumpriu · ★ sem baixa crítica · ★ **tática da missão aplicada** (seção 8, com ✔ ou ✘ e o motivo).
- "O que aconteceu": linha do replay com marca em cada evento importante; tocar leva o mapa àquele instante.
- "Por quê": a lição da primeira baixa (seção 7). "Da próxima vez": uma frase de ação.
- AJUSTAR O PLANO · PRÓXIMA · COMPARTILHAR.

## 7. Lições por causa de baixa

- `funil`: "O {n} parou na porta. Porta é funil: ou se fatia de fora, ou se atravessa sem parar até o canto."
- `aberto`: "O {n} esperou em campo aberto. Ponto de espera tem que ter caixote ou quina do lado de onde vem o tiro."
- `correndo`: "O {n} chegou correndo em cima de quem estava parado esperando. Devagar é suave, suave é rápido."
- `agrupado`: "Dois colados viram um alvo só. Abra dois quadrados entre eles."
- `sozinho`: "O {n} avançou sem ninguém cobrindo. Ninguém anda em área não limpa sem o parceiro parado, olhando o perigo."
- `costas`: "O {n} levou pelas costas. Faltou alguém segurando a retaguarda ou a sala deixada pra trás."
- `propria`: "Granada do próprio time. Quem lança avisa, e ninguém entra antes de estourar."
- `duelo`: "Troca de frente é cara ou coroa. Chegue de lado, com cobertura, ou dois contra um."
- Tempo: "Plano seguro demais. Quem cobre segura; os outros avançam."
- Refém ou alvo perdido: "Com refém ou alvo vivo na sala, nada de granada de impacto e nada de tiro com ele na linha."

## 8. Verificadores de tática (a 3ª estrela)

Cada missão aponta um verificador em `missao.tatica`. Todos são funções puras sobre o registro de eventos e as posições gravadas.

| id | Passa quando |
|---|---|
| `surpresa` | O primeiro adversário caiu ainda tranquilo |
| `dupla` | Em todo instante em que um operador andou com adversário vivo a até 8 quadrados, havia outro parado em `segurar` com linha de visão pra área à frente dele |
| `fatiou` | Toda sala com adversário teve um `fatiar` concluído na porta antes do primeiro operador entrar |
| `sem_funil` | Nenhum operador ficou mais de 0,5 s num quadrado `D` com adversário vivo na sala |
| `cantos` | Os dois primeiros a entrar na sala foram pra lados opostos, com até 1 s de diferença |
| `janela` | Um operador entrou na sala até 2 s depois da granada de luz estourar nela |
| `silencio` | Nenhum alerta antes do evento pedido (`ate: 'primeira_faca'`, `'refem'` ou `'fim'`) |
| `linha_limpa` | Nenhum evento `bloqueado` com mais de 0,5 s |
| `simultaneo` | Dois grupos indicados abriram contato ou cruzaram portas com até 1 s de diferença |
| `retaguarda` | Nenhuma baixa por `costas` e sempre um operador com o cone voltado pro caminho de volta enquanto houve adversário vivo |
| `dominio` | Ao limpar a sala: dois em cantos opostos, um no centro, um na porta olhando pra fora, nenhum parado em frente a porta ou abertura |
| `sem_propria` | Nenhum operador seu, refém ou alvo no raio de granada sua |
| `socorro_seguro` | Todo tratamento começou sem adversário com linha de visão pro médico |
| `cerco` | Todo `E` tinha um operador a até 2 quadrados antes do primeiro alerta |
| `salto` | Entre duas equipes, nunca as duas andando ao mesmo tempo com adversário vivo à vista |
| `luz_curta` | No escuro, nenhum operador com lanterna ligada parado por mais de 1,5 s, e nenhuma contraluz |
| `sala_a_sala` | Nenhuma sala com adversário vivo ficou pra trás da linha de avanço |

## 9. Campanha: 36 missões em 6 operações

Formato em `missoes.js`: `{ op, nome, novo, historia[], fichas[], objetivo, tatica, licao, par, tempo, semente, mapa[], time[], inimigo[], itens, alarme, escuro, dica }`.
Em cada missão abaixo: **Novo** = o que aparece pela primeira vez · **Lição** = a frase da tela de resultado · **Mapa/Adv.** = o que desenhar · **Sai assim** = solução esperada (vira a `dica` e o gabarito do teste).

### Operação 1 — "Dupla" (2 operadores)

História: seleção pro Grupo Tático. O instrutor, **Sargento Rocha** (retrato: boina, bigode), avalia você. Adversários são instrutores com colete vermelho. Seus operadores: **Lobo** e **Onça**.

| # | Nome | Novo | Tática · Lição (ref.) | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 1 | Primeiro passo | Desenhar rota, ritmo | `surpresa` · "Quem vê primeiro, ganha." (M 1.3) | Mapa 1 da seção 3. 1 adversário parado, de costas pra porta | Um entra em furtivo pela porta e pega pelas costas |
| 2 | Cobre e avança | Ordem **segurar** | `dupla` · "Ninguém anda sem o parceiro parado, cobrindo." (M 8.3) | Mapa 2 da seção 3. 2 adversários; um vigia a porta, outro o fundo | Um segura a porta de trás do caixote, o outro avança de caixote em caixote; trocam |
| 3 | A quina | Ordem **fatiar** | `fatiou` · "Longe da quina você vê o ombro dele antes de ele ver o seu." (M 4.1) | Corredor em L que dá numa sala; 2 adversários olhando a porta | Fatiar a quina e depois a porta; o outro cobre o corredor |
| 4 | O funil | Ordem **sinal**; cantos cegos | `cantos` + `sem_funil` · "Na porta não se para. Um pra cada canto." (M 1.4, 4.3, 5.2) | Sala 8x6 com porta no meio da parede de baixo; 1 adversário no canto fundo esquerdo colado à parede da porta (não se vê de fora), 1 no centro | Fatiar pega o do centro; entrar os dois juntos, um pra cada lado, pega o do canto |
| 5 | Luz! | **Granada de luz** | `janela` · "A granada abre 2 segundos. Entra neles." (M 7.1) | Sala com 3 adversários alertas atrás de caixotes, cobrindo a porta | Luz pela porta, entrada dos dois nos 2 s seguintes |
| 6 | Em silêncio (prova) | **Furtivo e faca** | `silencio` até a primeira faca · "Surpresa não faz barulho." (M 1.3) | Pátio com 1 sentinela em patrulha (rota visível) e uma sala com 1 guarda atento | Um pega o sentinela na faca quando ele vira; depois os dois resolvem a sala a tiro |

### Operação 2 — "O gerente" (3 operadores)

História: o gerente do banco, **Sr. Almeida** (retrato: terno, gravata, óculos, cabelo grisalho), foi sequestrado e está num galpão. Entra a **Coruja**, terceira operadora.

| # | Nome | Novo | Tática · Lição | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 7 | A planta | 3º operador; objetivo **maleta** | `retaguarda` · "Quem entra precisa de alguém guardando a saída." (M 5.1, homem 4) | Escritório com a maleta `M` no fundo e 2 caminhos; 3 adversários em ronda, um deles dá a volta por trás aos 20 s | Um fica na entrada segurando o caminho de volta; dois buscam |
| 8 | Corredor | **Linha de tiro bloqueada** | `linha_limpa` · "Em fila, só o primeiro atira. Desencontrados, atiram todos." (M 6.1) | Corredor largo (3 quadrados) e comprido com 2 portas laterais; 3 adversários no fundo | Dois avançam em paredes opostas, desencontrados; o terceiro atrás, no meio |
| 9 | O "T" | Sincronia pra lados opostos | `simultaneo` · "No cruzamento, os dois lados ao mesmo tempo." (M 6.2) | Corredor que termina em T; 1 adversário em cada braço, 1 no fundo | Dois viram juntos, um pra cada braço (com `sinal`); o terceiro cobre a frente |
| 10 | Sentinelas | **Alarme** (25 s) e patrulhas | `silencio` até o fim · "Um tiro cedo demais e o refém some." | Entrada do galpão: 2 sentinelas em ronda cruzada e 1 parado de costas | Três facas em sequência, lendo as rotas na linha do tempo |
| 11 | O cativeiro | **Refém** | `linha_limpa` · "Antes de atirar, veja o que está atrás e na frente do alvo." (M 5.2.2) | Sala com `R` no centro, 1 captor de cada lado dele, 1 na porta | Luz, entrada pros dois cantos pra atirar de lado, sem o refém na linha; o terceiro pega o refém |
| 12 | Extração (prova) | **Reforços** que chegam com hora marcada | `retaguarda` · "A missão só acaba na saída." | Volta com o refém por 3 salas; 4 adversários chegam aos 15 s por rotas que mudam a cada tentativa | Um na frente, um com o refém, um fechando atrás e segurando cada cruzamento |

### Operação 3 — "Corvo" (4 operadores)

História: quem organizou o sequestro foi **"Corvo"** (retrato: boné, barba, cicatriz), o homem do dinheiro da quadrilha. Ele sabe quem manda. **Tem que sair vivo.** Entra o **Urso**, médico do time.

| # | Nome | Novo | Tática · Lição | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 13 | A fila | 4º operador; papéis 1 a 4 | `dominio` · "1 e 2 nos cantos, 3 no centro, 4 guarda a porta." (M 5.1) | Sala grande com porta central, móveis no meio, 3 adversários; 1 adversário aparece no corredor de trás aos 12 s | Entrada em sequência pros pontos de domínio; o 4 fica na porta olhando o corredor |
| 14 | Duas portas | Entradas por pontos diferentes | `simultaneo` · "Entrar por onde ele não espera." (M 1.3) | Sala com porta embaixo e porta lateral; 3 adversários, dois vigiando a de baixo | Duas duplas, uma em cada porta, com `sinal` |
| 15 | Impacto | **Granada de impacto** | `sem_propria` · "Granada pra dentro: avisa, espera estourar, entra." (M 7.1) | Depósito com 3 adversários entrincheirados atrás de caixotes (cobertura de todos os lados da porta) | Impacto por cima da trincheira; ninguém a menos de 2 quadrados; entra depois |
| 16 | Homem ferido | **Ferido, baixa crítica e médico** | `socorro_seguro` · "Primeiro tira o perigo, depois socorre." | Pátio que precisa ser cruzado; 1 adversário longe, bem coberto, vigiando | Supressão no adversário, flanco pra tirar ele, e só então o Urso trata quem caiu |
| 17 | Vivo | Objetivo **captura**; **taser** | `cerco` · "Feche as saídas antes de bater na porta." | Casa com `V` no quarto do meio, 2 guarda-costas, 2 saídas `E` | Um operador em cada saída primeiro; os outros dois entram com luz e rendem |
| 18 | Sala a sala (prova) | 3 salas em sequência contra o relógio | `sala_a_sala` · "Sala que ficou pra trás sem limpar atira nas suas costas." (TTP, corredores) | Corredor com 3 salas, 5 adversários; um deles espera numa sala fácil de pular | Limpar na ordem, usando tudo da operação |

### Operação 4 — "O galpão" (5 e 6 operadores, classes)

História: a quadrilha guarda num galpão a **maleta com a lista de compradores**. Chegam especialistas: **Touro** (apoio), **Gavião** (atirador), depois **Tatu** (escudo).

| # | Nome | Novo | Tática · Lição | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 19 | Alfa e Bravo | 5 operadores; **seguir**; equipes | `salto` · "Uma equipe anda, a outra cobre. Depois troca." (TTP, saltos com cobertura) | Pátio longo com 3 linhas de caixotes; 4 adversários no fundo | Alfa segura, Bravo avança uma linha; alternam |
| 20 | Apoio | Classe **Apoio** | `dupla` · "Cabeça baixa não atira. Quem suprime abre caminho." | Corredor de caixotes sem flanco; 4 adversários bem cobertos | Touro fixo suprimindo; os outros avançam por dentro da supressão |
| 21 | Olho longo | Classe **Atirador** | `surpresa` · "Um bom ângulo de longe vale por três de perto." | Pátio de 18 quadrados de comprimento, 2 sentinelas em torre baixa e 3 no chão | Gavião segurando o ângulo longo abre; o resto avança coberto por ele |
| 22 | Escudo | 6 operadores; classe **Escudo** | `sem_funil` · "O escudo anda, quem vai atrás atira." (M 7.3) | Corredor comprido, sem cobertura nenhuma, 3 adversários no fundo | Tatu na frente, um atirador colado atrás com `seguir`, os outros depois |
| 23 | A maleta | Maleta com defesa pesada e reforço | `retaguarda` · "Pegar é metade. A outra metade é sair." | Galpão com `M` no centro, 6 adversários em volta, 2 de reforço aos 25 s pela sua retaguarda | Equipe de cobertura segura a saída; equipe de assalto pega e volta |
| 24 | Monte o time (prova) | **Escolher 6 entre as classes** | `dominio` na zona · "Não existe time certo, existe time certo pro terreno." | Zona `O` central com 4 acessos; 6 adversários chegam em 3 tempos diferentes | Livre: domínio por 20 s |

### Operação 5 — "Apagão" (6 e 7 operadores)

História: cortaram a luz do prédio. Lá dentro está a **Dra. Helena** (retrato: jaleco/blazer, cabelo preso), contadora que vai testemunhar. E uma bomba-relógio de treino.

| # | Nome | Novo | Tática · Lição | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 25 | No escuro | **Escuro e lanterna** | `luz_curta` · "Lanterna acesa mostra o caminho pra você e você pra eles." (M 7.2) | Andar de escritórios, 4 adversários parados no escuro | Lanterna só em pulsos curtos: liga, vê, desliga, muda de lugar |
| 26 | Contraluz | Contraluz | `luz_curta` · "Nunca acenda a luz nas costas do colega da frente." (M 7.2) | Corredores estreitos; fila obrigatória | Só o primeiro da fila usa lanterna |
| 27 | Segura a posição | Objetivo **defesa**; 3 ondas | `dupla` · "Parado, coberto e com ângulo cruzado, quem chega perde." | Sala com 3 entradas; ondas de 3, 3 e 4 adversários, cada tentativa por entradas diferentes | Ângulos cruzados cobrindo as 3 entradas; ninguém avança |
| 28 | Relógio | Objetivo **bomba** (75 s) | `sala_a_sala` · "Pressa não é correr: é não desperdiçar movimento." (M 9) | `B` no fundo de 4 salas, 6 adversários | Limpeza direta, sem parar pra recuperar feridos antes do `B` |
| 29 | Dois alvos | 7 operadores; **dois objetivos ao mesmo tempo** | `simultaneo` · "Se um lado bate antes, o outro lado já sabe." | Ala esquerda: Dra. Helena com 2 captores. Ala direita: um capanga pra capturar vivo. Alarme comum | Duas equipes entrando no mesmo segundo |
| 30 | Resgate no escuro (prova) | Tudo junto, no escuro | `silencio` até o refém | Prédio 14x20, 8 adversários, refém no último cômodo | Facas na entrada, luz e entrada na sala final, extração coberta |

### Operação 6 — "O Coronel" (8 operadores)

História: o chefe é **"Coronel"** (retrato: cabelo raspado, óculos escuros, boina), ex-militar. O complexo dele é o maior mapa do jogo. **Capturar vivo.**

| # | Nome | Novo | Tática · Lição | Mapa / Adv. | Sai assim |
|---|---|---|---|---|---|
| 31 | Oito | 8 operadores, duas filas de 4 | `simultaneo` · "Oito sozinhos perdem pra quatro juntos." | Complexo com duas alas simétricas, 8 adversários | Uma fila por ala, entradas sincronizadas |
| 32 | Contra-ataque | Adversário que **ataca** e usa granada | `retaguarda` · "Enquanto você entra, alguém pode estar entrando atrás." | Você limpa um prédio enquanto 4 adversários contornam por fora | Uma dupla fica de segurança externa |
| 33 | Testemunha | Objetivo **escolta** | `salto` · "Quem protege vai na frente e fica atrás, nunca só do lado." | A Dra. Helena anda sozinha por uma rua até o carro (`S`); 6 adversários em 3 emboscadas | Uma equipe limpa cada trecho antes dela chegar; outra fecha atrás |
| 34 | Tudo ou nada | Objetivos **em cadeia** com um relógio só | `sala_a_sala` | Maleta numa ala, refém na outra, 120 s | Dividir o time e juntar na extração |
| 35 | Cerco | Alvo com 3 saídas e guarda-costas de escudo | `cerco` · "Escudo se vence pelo lado." | Casa do Coronel, 3 `E`, 5 guarda-costas (1 com escudo) | Três fecham saídas, cinco entram por duas portas; escudo flanqueado |
| 36 | Operação completa (final) | As três fases numa missão | `silencio` até o refém | 14x20: sentinelas fora, refém no meio, Coronel no fundo com 2 saídas | Faca nas sentinelas, resgate, cerco e captura |

### Depois da campanha (sempre ter o que jogar)

- **Missão do dia**: sorteada pela data entre os 36 mapas, com um modificador sorteado (escuro, sem granada, um operador a menos, relógio menor, adversário em alerta desde o início). Igual pra todo mundo; compartilhar resultado.
- **Modo Veterano** por missão (libera com 3 estrelas): adversário reage 20% mais rápido e usa sempre o plano mais difícil. Estrela dourada.
- **Patentes** pelo total de estrelas: Recruta, Soldado, Cabo, Sargento, Tenente, Capitão, Comandante.
- **Selos**: "Sem um tiro", "Ninguém ferido na operação", "Primeira tentativa".

## 10. Compartilhar plano

Plano em texto compacto e base64 no `#` do endereço (`#m=17&p=…`). Validar tudo ao ler (missão existe; número de operadores da missão; até 12 pontos; coordenadas inteiras em chão; ritmo e ordens da lista conhecida e já liberadas; até 3.000 caracteres). Fora disso, ignorar em silêncio. Tela "Plano de um amigo": EXECUTAR ou EDITAR. `navigator.share` com reserva em `https://wa.me/?text=`.

## 11. O que salvar

`sz_comandante_v1`: `{ estrelas: [], veterano: [], melhor: [], tentativas: [], ultimoPlano: [], selos: {}, dia: {}, som: true }`.

## 12. Etapas de execução

Cada etapa termina com `node não-upar/ferramentas/testa-comandante.js` passando. O teste, pra cada missão já feita e **pra cada plano do adversário**: o gabarito (guardado em `não-upar/ferramentas/gabaritos-comandante.json`) vence com 3 estrelas; o plano ingênuo (todos reto pro objetivo) perde; o mesmo plano dá resultado idêntico em 20 execuções; o mapa é válido (largura igual em todas as linhas, operadores na quantidade certa, tudo alcançável).

| Etapa | Entrega | Pronto quando |
|---|---|---|
| **C-1** | `sim.js` básico: mapa, movimento, visão, reação, disparo, cobertura, funil, tranquilo/alerta, faca, ordens `esperar`, `segurar`, `fatiar`, `sinal`, `luz`; objetivo `eliminar`; verificadores da Operação 1; teste em Node | Teste passa com as missões 1 e 2 |
| **C-2** | `index.html`, `jogo.js`: menu, brief com fichas, `retratos.js`, tela de planejar completa (gestos, folha de ordens, cones, escudos, linha do tempo, salvar) | Dá pra montar no celular um plano de 2 operadores com todas as ordens da Operação 1 sem errar toque |
| **C-3** | Execução animada, sons, resultado com estrelas, tática ✔/✘, lição, replay | Missões 1 e 2 jogáveis do começo ao fim |
| **C-4** | **Operação 1** completa (missões 3 a 6) | Teste passa nas 6; cada uma jogada à mão |
| **C-5** | **Operação 2**: 3 operadores, maleta, linha de tiro bloqueada, alarme, refém, reforços; missões 7 a 12 | Idem |
| **C-6** | **Operação 3**: 4 operadores, granada de impacto, ferido/crítico/médico, captura e taser; missões 13 a 18 | Idem |
| **C-7** | **Operação 4**: mapa 14x20 com lupa, `seguir`, equipes, classes, escolha de time; missões 19 a 24 | Idem |
| **C-8** | **Operação 5**: escuro, lanterna, contraluz, defesa, bomba, objetivos simultâneos; missões 25 a 30 | Idem |
| **C-9** | **Operação 6**: 8 operadores, adversário atacante, escolta, objetivos em cadeia; missões 31 a 36 | Idem |
| **C-10** | Compartilhar plano, missão do dia, Veterano, patentes, selos, botão "Dica" (depois de 2 derrotas), card em `playground/index.html`, conferência final | Link abre o mesmo plano em outro navegador; link adulterado abre a missão vazia sem erro |

Se uma missão ficar impossível ou trivial, ajustar primeiro o mapa e o plano do adversário; mexer nas constantes da seção 5 só em último caso, rodando o teste de todas as missões anteriores e anotando aqui o que mudou.

## 13. Decisões do Davi (não fazer sem ele pedir)

- Publicar, commitar, pôr no menu ou no sitemap.
- Uma missão com o mapa do campo real da StrikeZone (precisa de planta ou foto aérea).
- Ranking no servidor.
