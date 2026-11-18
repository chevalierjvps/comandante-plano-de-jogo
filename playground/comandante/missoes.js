(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MISSOES = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const OPERACOES = [
    {
      id: 1,
      nome: 'Operação 1: Dupla',
      subtitulo: 'Seleção do Grupo Tático · 2 Operadores',
      personagem: 'rocha',
      resumo: 'O Sargento Rocha avalia sua leitura de terreno e sincronia básica em dupla.'
    },
    {
      id: 2,
      nome: 'Operação 2: O Gerente',
      subtitulo: 'Resgate no Galpão · 3 Operadores',
      personagem: 'almeida',
      resumo: 'O Sr. Almeida foi levado para um galpão. Coruja entra na equipe para guardar flancos e linhas.'
    },
    {
      id: 3,
      nome: 'Operação 3: Corvo',
      subtitulo: 'Captura de Alto Valor · 4 Operadores',
      personagem: 'corvo',
      resumo: 'Corvo financiou o sequestro e sabe quem manda. Ele precisa ser capturado vivo. Urso assume como médico.'
    },
    {
      id: 4,
      nome: 'Operação 4: O Galpão',
      subtitulo: 'Especialistas em Ação · 5 e 6 Operadores',
      personagem: 'touro',
      resumo: 'A lista de compradores está trancada sob guarda pesada. Chegam Touro (Apoio), Gavião (Atirador) e Tatu (Escudo).'
    },
    {
      id: 5,
      nome: 'Operação 5: Apagão',
      subtitulo: 'Combate Noturno · 6 e 7 Operadores',
      personagem: 'helena',
      resumo: 'Cortaram a energia do prédio onde a Dra. Helena aguarda extração. Controle a disciplina de luz e o relógio.'
    },
    {
      id: 6,
      nome: 'Operação 6: O Coronel',
      subtitulo: 'Assalto ao Complexo · 8 Operadores',
      personagem: 'coronel',
      resumo: 'O ex-militar conhecido como Coronel comanda a rede inteira. Cerque as saídas e capture-o vivo.'
    }
  ];

  const MISSOES = [
    // =========================================================================
    // OPERAÇÃO 1: DUPLA (Missões 1 a 6) - Mapas 12x16, 2 operadores
    // =========================================================================
    {
      id: 1,
      op: 1,
      nome: 'Primeiro passo',
      novo: 'Desenhar rota e ritmo',
      historia: [
        'Bem-vindo à seleção do Grupo Tático.',
        'O instrutor lá dentro está de costas para a porta.',
        'Avance em furtivo para não alertá-lo no funil.'
      ],
      fichas: [
        { id: 'rocha', nome: 'Sgt. Rocha', desc: 'Instrutor avaliador · OBSERVADOR', cor: 'verde' },
        { id: 'instrutor', nome: 'Instrutor A', desc: 'Colete vermelho · DE COSTAS', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'surpresa' },
      licao: 'Quem vê primeiro, ganha.',
      par: 12,
      tempo: 60,
      semente: 103,
      dica: 'Coloque o operador 1 em ritmo FURTIVO passando pela porta D até encostar nas costas do adversário.',
      mapa: [
        '############',
        '#..........#',
        '#....a.....#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '####D#######',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#....XX....#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' }
      ],
      inimigo: [
        [{ id: 'a', ang: -90, alerta: false }],
        [{ id: 'a', ang: -90, alerta: false }]
      ]
    },
    {
      id: 2,
      op: 1,
      nome: 'Cobre e avança',
      novo: 'Ordem: segurar ângulo',
      historia: [
        'Agora são dois instrutores alertas dentro da sala.',
        'Um vigia a porta; o outro cobre o fundo.',
        'Ninguém avança sem um parceiro parado segurando o ângulo.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Lobo', desc: 'Operador 1 · COBERTURA', cor: 'verde' },
        { id: 'onca', nome: 'Onça', desc: 'Operador 2 · AVANÇO', cor: 'verde' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'dupla' },
      licao: 'Ninguém anda sem o parceiro parado, cobrindo.',
      par: 16,
      tempo: 60,
      semente: 202,
      dica: 'Um operador para atrás do caixote com SEGURAR olhando para a porta enquanto o outro entra em furtivo pelo flanco.',
      mapa: [
        '############',
        '#....b.....#',
        '#..XX......#',
        '#......a...#',
        '#..........#',
        '####D#######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#....XX....#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -45, alerta: false },
          { id: 'b', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: -45, alerta: false },
          { id: 'b', ang: -90, alerta: false }
        ]
      ]
    },
    {
      id: 3,
      op: 1,
      nome: 'A quina',
      novo: 'Ordem: fatiar porta/quina',
      historia: [
        'O corredor faz um L antes da sala principal.',
        'Dois instrutores guardam o acesso.',
        'Use FATIAR antes da porta para limpar um por vez com cobertura.'
      ],
      fichas: [
        { id: 'rocha', nome: 'Sgt. Rocha', desc: 'Avaliador · "Usem o batente!"', cor: 'verde' },
        { id: 'instrutor', nome: 'Dupla OpFor', desc: '2 Instrutores · VIGIANDO PORTA', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'fatiou' },
      licao: 'Longe da quina você vê o ombro dele antes de ele ver o seu.',
      par: 15,
      tempo: 65,
      semente: 303,
      dica: 'Marque um ponto logo antes da porta D com a ordem FATIAR antes de entrar na sala.',
      mapa: [
        '############',
        '#..b....a..#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '######D#####',
        '#..........#',
        '#..######..#',
        '#..#....#..#',
        '#..#....#..#',
        '#..........#',
        '#....XX....#',
        '#..........#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 110, alerta: false },
          { id: 'b', ang: 70, alerta: false }
        ],
        [
          { id: 'a', ang: 115, alerta: false },
          { id: 'b', ang: 75, alerta: false }
        ]
      ]
    },
    {
      id: 4,
      op: 1,
      nome: 'O funil',
      novo: 'Ordem: sinal e cantos cegos',
      historia: [
        'Um instrutor está no canto cego colado à parede da porta.',
        'De fora não dá para vê-lo.',
        'Sincronize a dupla com SINAL e entrem juntos, um para cada canto.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Lobo', desc: 'Canto Esquerdo · SINCRONIZAR', cor: 'verde' },
        { id: 'onca', nome: 'Onça', desc: 'Canto Direito · FATIAR E ENTRAR', cor: 'verde' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'cantos' },
      licao: 'Na porta não se para. Um pra cada canto.',
      par: 14,
      tempo: 65,
      semente: 406,
      dica: 'Fatie de fora para pegar quem está no centro; use SINAL antes da porta e mande um operador para a esquerda e outro para a direita.',
      mapa: [
        '############',
        '#.a........#',
        '#....b.....#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#....XX....#',
        '#..........#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 5,
      op: 1,
      nome: 'Luz!',
      novo: 'Granada de luz',
      historia: [
        'Três instrutores alertas atrás de caixotes miram direto na porta.',
        'Entrar no peito é derrota certa.',
        'Lance uma granada de LUZ pela porta e entre nos 2 segundos seguintes.'
      ],
      fichas: [
        { id: 'rocha', nome: 'Sgt. Rocha', desc: 'Instrutor · "Aproveitem os 2s!"', cor: 'verde' },
        { id: 'instrutor', nome: 'Trinca OpFor', desc: '3 Instrutores · ENTRINCHEIRADOS', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'janela' },
      licao: 'A granada abre 2 segundos. Entra neles.',
      par: 12,
      tempo: 60,
      semente: 505,
      dica: 'No ponto ao lado da porta D, dê a ordem LUZ apontando para dentro (-90°) e avance com os dois operadores logo em seguida.',
      mapa: [
        '############',
        '#..........#',
        '#..a.b.c...#',
        '#..XX.XX...#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#....XX....#',
        '#..........#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 80, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 100, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 6,
      op: 1,
      nome: 'Em silêncio (prova)',
      novo: 'Furtivo e faca silenciosa',
      historia: [
        'Prova final da seleção: um sentinela no pátio e um guarda na sala.',
        'Se atirar no pátio, o guarda da sala embosca você na porta.',
        'Elimine o sentinela na faca em furtivo antes de abrir fogo.'
      ],
      fichas: [
        { id: 'onca', nome: 'Onça', desc: 'Infiltração · FACA EM FURTIVO', cor: 'verde' },
        { id: 'instrutor', nome: 'Sentinela + Guarda', desc: '2 Instrutores · PROVA FINAL', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'silencio', ate: 'primeira_faca' },
      licao: 'Surpresa não faz barulho.',
      par: 16,
      tempo: 70,
      semente: 606,
      dica: 'Leve o operador 1 em FURTIVO até o sentinela "a" para eliminá-lo na faca; depois lance luz ou fatie a sala do guarda "b".',
      mapa: [
        '############',
        '#....b.....#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..........#',
        '#....a.....#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#...1..2...#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: 85, alerta: false }
        ]
      ]
    },

    // =========================================================================
    // OPERAÇÃO 2: O GERENTE (Missões 7 a 12) - Mapas 12x16, 3 operadores
    // =========================================================================
    {
      id: 7,
      op: 2,
      nome: 'A planta',
      novo: '3º operador e maleta M',
      historia: [
        'O Sr. Almeida está escondido num galpão da zona leste.',
        'Precisamos buscar a maleta com a planta do galpão e extrair em S.',
        'Atenção: um guarda dá a volta pelas costas. Deixe alguém cobrindo.'
      ],
      fichas: [
        { id: 'coruja', nome: 'Coruja', desc: '3ª Operadora · RETAGUARDA', cor: 'verde' },
        { id: 'hostil', nome: 'Ronda da Quadrilha', desc: '3 Guardas · FLANCO TRASEIRO', cor: 'cinza' }
      ],
      objetivo: 'maleta',
      tatica: { id: 'retaguarda' },
      licao: 'Quem entra precisa de alguém guardando a saída.',
      par: 22,
      tempo: 80,
      semente: 707,
      dica: 'Deixe um operador em SEGURAR cobrindo a retaguarda perto da saída S enquanto os outros dois pegam a maleta M e voltam para S.',
      mapa: [
        '############',
        '#....M.....#',
        '#..a....b..#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#.........c#',
        '#..........#',
        '#..........#',
        '#..1.2.3.S.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 180, chegaEm: 5, pts: [{ x: 10, y: 11 }, { x: 6, y: 12, ritmo: 'andar' }] }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 180, chegaEm: 5, pts: [{ x: 10, y: 11 }, { x: 5, y: 12, ritmo: 'andar' }] }
        ]
      ]
    },
    {
      id: 8,
      op: 2,
      nome: 'Corredor',
      novo: 'Linha de tiro bloqueada',
      historia: [
        'O corredor de acesso ao galpão tem três guardas no fundo.',
        'Se os operadores avançarem em fila indiana, um bloqueia o tiro do outro.',
        'Avance desencontrado pelas laterais para os três atirarem livremente.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Lobo · Onça · Coruja', desc: 'Esquadrão · ABRIR FRENTE', cor: 'verde' },
        { id: 'hostil', nome: 'Bloqueio do Corredor', desc: '3 Guardas · FUNDO DO CORREDOR', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'linha_limpa' },
      licao: 'Em fila, só o primeiro atira. Desencontrados, atiram todos.',
      par: 15,
      tempo: 65,
      semente: 808,
      dica: 'Abra os três operadores em colunas diferentes (ex: x=3, x=6, x=8) com cobertura de caixotes sem passar um na frente do outro.',
      mapa: [
        '############',
        '#..a.b.c...#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '####D##D####',
        '#.XX....XX.#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..........#',
        '#..1..2..3.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 9,
      op: 2,
      nome: 'O "T"',
      novo: 'Sincronia em cruzamento T',
      historia: [
        'O corredor principal termina num cruzamento em T.',
        'Há um guarda em cada braço lateral e um no fundo.',
        'Use SINAL para abrir os dois lados no mesmo segundo.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Lobo e Onça', desc: 'Braços do T · AÇÃO SIMULTÂNEA', cor: 'verde' },
        { id: 'coruja', nome: 'Coruja', desc: 'Centro · COBERTURA FRONTAL', cor: 'verde' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'simultaneo' },
      licao: 'No cruzamento, os dois lados ao mesmo tempo.',
      par: 16,
      tempo: 65,
      semente: 909,
      dica: 'Avance no corredor central e use SINAL antes do cruzamento para que os três abram ângulo juntos.',
      mapa: [
        '############',
        '#.....c....#',
        '#a........b#',
        '#.XX....XX.#',
        '#..........#',
        '####D##D####',
        '###......###',
        '###.XX.XX###',
        '###......###',
        '###......###',
        '###..XX..###',
        '###......###',
        '###......###',
        '###......###',
        '###.1.2.3###',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 0, alerta: false },
          { id: 'b', ang: 180, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 10, alerta: false },
          { id: 'b', ang: 170, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 10,
      op: 2,
      nome: 'Sentinelas',
      novo: 'Alarme (25 s) e patrulhas',
      historia: [
        'Três sentinelas vigiam a entrada externa do cativeiro.',
        'Um único tiro aciona o alarme e o gerente desaparece em 25 segundos.',
        'Elimine os três em furtivo na faca sem disparar um tiro.'
      ],
      fichas: [
        { id: 'onca', nome: 'Equipe em Furtivo', desc: 'Sem tiros · FACA SILENCIOSA', cor: 'verde' },
        { id: 'hostil', nome: '3 Sentinelas', desc: 'Alarme de 25s · VIGIANDO PÁTIO', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'silencio', ate: 'fim' },
      alarme: 1.2,
      licao: 'Um tiro cedo demais e o refém some.',
      par: 18,
      tempo: 70,
      semente: 1010,
      dica: 'Mova os três operadores exclusivamente em ritmo FURTIVO pelas costas de cada sentinela para eliminá-los na faca.',
      mapa: [
        '############',
        '#..........#',
        '#..a....b..#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#.....c....#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..........#',
        '#..1..2..3.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'batedor' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false }
        ]
      ]
    },
    {
      id: 11,
      op: 2,
      nome: 'O cativeiro',
      novo: 'Objetivo: resgate de refém R',
      historia: [
        'Encontramos o Sr. Almeida no centro da sala com dois captores.',
        'Atirar da porta coloca o refém na linha de tiro.',
        'Use granada de luz, abra para os cantos, limpe a sala e leve-o até S.'
      ],
      fichas: [
        { id: 'almeida', nome: 'Sr. Almeida', desc: 'Gerente do Banco · RESGATAR VIVO', cor: 'amarelo' },
        { id: 'hostil', nome: 'Captores', desc: '2 Guardas · AO LADO DO REFÉM', cor: 'cinza' }
      ],
      objetivo: 'resgate',
      tatica: { id: 'linha_limpa' },
      licao: 'Antes de atirar, veja o que está atrás e na frente do alvo.',
      par: 22,
      tempo: 85,
      semente: 1111,
      dica: 'Lance LUZ pela porta, mande 1 e 2 pros cantos laterais para atirar sem o refém R na frente, encoste em R e volte até S.',
      mapa: [
        '############',
        '#..........#',
        '#..a.R..b..#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.S.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 80, alerta: false },
          { id: 'b', ang: 100, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 12,
      op: 2,
      nome: 'Extração (prova)',
      novo: 'Reforços com hora marcada',
      historia: [
        'Estamos saindo com o Sr. Almeida, mas reforços cercam o caminho.',
        'Dois hostis bloqueiam a frente e reforços chegam pelas costas.',
        'Proteja a retaguarda enquanto conduz o gerente até a saída S.'
      ],
      fichas: [
        { id: 'almeida', nome: 'Sr. Almeida', desc: 'Refém · LEVAR ATÉ A SAÍDA S', cor: 'amarelo' },
        { id: 'coruja', nome: 'Coruja', desc: 'Segurança · COBRIR RETAGUARDA', cor: 'verde' }
      ],
      objetivo: 'resgate',
      tatica: { id: 'retaguarda' },
      licao: 'A missão só acaba na saída.',
      par: 24,
      tempo: 85,
      semente: 1212,
      dica: 'Deixe um operador segurando o ângulo contra os reforços e leve outro até o refém R e depois até S.',
      mapa: [
        '############',
        '#..a....b..#',
        '#..XX..XX..#',
        '#..........#',
        '#.....R....#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#.........c#',
        '#..........#',
        '#..........#',
        '#..1.2.3.S.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 180, chegaEm: 10, pts: [{ x: 10, y: 11 }, { x: 7, y: 11, ritmo: 'andar' }] }
        ],
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 180, chegaEm: 10, pts: [{ x: 10, y: 11 }, { x: 6, y: 11, ritmo: 'andar' }] }
        ]
      ]
    },

    // =========================================================================
    // OPERAÇÃO 3: CORVO (Missões 13 a 18) - Mapas 12x16, 4 operadores
    // =========================================================================
    {
      id: 13,
      op: 3,
      nome: 'A fila',
      novo: '4º operador e domínio de sala',
      historia: [
        'Urso integra a equipe como quarto homem.',
        'Ao entrar na sala principal, cada operador tem seu setor:',
        '1 e 2 nos cantos, 3 no centro, 4 guarda a porta sem parar no funil.'
      ],
      fichas: [
        { id: 'urso', nome: 'Urso', desc: '4º Operador · MÉDICO TÁTICO', cor: 'verde' },
        { id: 'hostil', nome: 'Guarnição de Corvo', desc: '3 Guardas · SALA CENTRAL', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'dominio' },
      licao: '1 e 2 nos cantos, 3 no centro, 4 guarda a porta.',
      par: 18,
      tempo: 75,
      semente: 1313,
      dica: 'Use LUZ na porta e distribua os 4 operadores dentro da sala sem deixar ninguém parado em cima do quadrado D.',
      mapa: [
        '############',
        '#..a....b..#',
        '#..........#',
        '#..XX..XX..#',
        '#.....c....#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 80, alerta: false },
          { id: 'b', ang: 100, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 14,
      op: 3,
      nome: 'Duas portas',
      novo: 'Brecha por duas entradas',
      historia: [
        'A sala de segurança tem duas portas: uma frontal e uma lateral.',
        'Os guardas miram na entrada de baixo.',
        'Divida em duas duplas e entre pelas duas portas ao mesmo tempo.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Dupla Alfa (1 e 2)', desc: 'Porta Frontal · SINCRONIZAR', cor: 'verde' },
        { id: 'coruja', nome: 'Dupla Bravo (3 e 4)', desc: 'Porta Lateral · FLANCO', cor: 'verde' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'simultaneo' },
      licao: 'Entrar por onde ele não espera.',
      par: 18,
      tempo: 75,
      semente: 1414,
      dica: 'Posicione uma dupla em cada porta D, use SINAL para sincronizar e entrem juntos.',
      mapa: [
        '############',
        '#..a....b..#',
        '#..........#',
        '#..XX..XX..#',
        '#....c...D.#',
        '#........#.#',
        '####D#####.#',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 15,
      op: 3,
      nome: 'Impacto',
      novo: 'Granada de impacto',
      historia: [
        'Três mercenários estão entrincheirados atrás de caixotes no depósito.',
        'Sem reféns no local, o uso de granada de IMPACTO está autorizado.',
        'Lance por cima dos caixotes mantendo o time fora do raio de explosão.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Lobo', desc: 'Granadeiro · IMPACTO LIBERADO', cor: 'verde' },
        { id: 'hostil', nome: 'Trincheira Hostil', desc: '3 Guardas · AGRUPADOS', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'sem_propria' },
      licao: 'Granada pra dentro: avisa, espera estourar, entra.',
      par: 14,
      tempo: 65,
      semente: 1515,
      dica: 'Pare antes da porta D e use a ordem IMPACTO mirando no centro dos inimigos (x=5, y=3).',
      mapa: [
        '############',
        '#..........#',
        '#....b.....#',
        '#...a.c....#',
        '#..XXXXXX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 16,
      op: 3,
      nome: 'Homem ferido',
      novo: 'Ferido, baixa crítica e médico',
      historia: [
        'A partir de agora, disparos à distância deixam o operador FERIDO por 25s.',
        'O médico Urso tem 2 medkits e socorre colegas automaticamente.',
        'Regra de ouro: elimine a ameaça primeiro para o médico tratar em segurança.'
      ],
      fichas: [
        { id: 'urso', nome: 'Urso (Médico)', desc: '2 Medkits · SOCORRO AUTOMÁTICO', cor: 'verde' },
        { id: 'hostil', nome: 'Atirador Entrincheirado', desc: 'Vigília · PÁTIO CENTRAL', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'socorro_seguro' },
      permiteFerido: true,
      licao: 'Primeiro tira o perigo, depois socorre.',
      par: 18,
      tempo: 75,
      semente: 1616,
      dica: 'Use cobertura e flanqueie os inimigos rapidamente para que ninguém fique sob fogo enquanto Urso avança.',
      mapa: [
        '############',
        '#....a.....#',
        '#...XX.....#',
        '#......b...#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'fuzileiro' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 100, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 17,
      op: 3,
      nome: 'Vivo',
      novo: 'Objetivo: captura de V e taser',
      historia: [
        'Localizamos "Corvo"! Ele não pode ser eliminado.',
        'Ao entrar em alerta, ele corre para as saídas de fuga E.',
        'Cerque as saídas E primeiro, use LUZ ou TASER e encoste por 1s para rendê-lo.'
      ],
      fichas: [
        { id: 'corvo', nome: '"Corvo"', desc: 'Alvo Vivo V · CAPTURAR, NÃO MATAR', cor: 'vermelho' },
        { id: 'lobo', nome: 'Grupo Tático', desc: 'Taser e Luz · FECHAR SAÍDAS E', cor: 'verde' }
      ],
      objetivo: 'captura',
      tatica: { id: 'cerco' },
      licao: 'Feche as saídas antes de bater na porta.',
      par: 22,
      tempo: 85,
      semente: 1717,
      dica: 'Mande dois operadores fecharem as saídas E nas laterais e entre com os outros usando LUZ/TASER até encostar em V.',
      mapa: [
        '############',
        '#E........E#',
        '#....V.....#',
        '#..a....b..#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..XX..XX..#',
        '#..........#',
        '#..........#',
        '#.XX....XX.#',
        '#..........#',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 18,
      op: 3,
      nome: 'Sala a sala (prova)',
      novo: 'Progressão em 3 salas',
      historia: [
        'A casa segura da quadrilha tem três salas em sequência.',
        'Pular uma sala deixa um inimigo vivo nas suas costas.',
        'Limpe sala por sala com método antes do tempo acabar.'
      ],
      fichas: [
        { id: 'rocha', nome: 'Sgt. Rocha', desc: 'Comando · "Nenhuma sala fica pra trás"', cor: 'verde' },
        { id: 'hostil', nome: 'Segurança da Casa', desc: '4 Guardas · 3 SALAS', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'sala_a_sala' },
      licao: 'Sala que ficou pra trás sem limpar atira nas suas costas.',
      par: 25,
      tempo: 85,
      semente: 1818,
      dica: 'Limpe a sala de baixo, depois a do meio e por fim a do topo usando luz e cobertura.',
      mapa: [
        '############',
        '#..c....d..#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#....b.....#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#....a.....#',
        '#..XX..XX..#',
        '#..........#',
        '#####D######',
        '#..........#',
        '#..1.2.3.4.#',
        '############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 85, alerta: false },
          { id: 'd', ang: 95, alerta: false }
        ],
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 80, alerta: false },
          { id: 'd', ang: 100, alerta: false }
        ]
      ]
    },

    // =========================================================================
    // OPERAÇÃO 4: O GALPÃO (Missões 19 a 24) - Mapas 14x20, 5 e 6 operadores
    // =========================================================================
    {
      id: 19,
      op: 4,
      nome: 'Alfa e Bravo',
      novo: '5 operadores, equipes e seguir',
      historia: [
        'O mapa agora é 14x20 com lupa de precisão ao arrastar.',
        'Dividimos o time em Alfa e Bravo, e você pode usar SEGUIR para formar fila.',
        'Avance em saltos: enquanto Alfa anda, Bravo segura cobrindo.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Equipe Alfa', desc: 'Operadores 1 a 3 · BASE DE FOGO', cor: 'verde' },
        { id: 'touro', nome: 'Equipe Bravo', desc: 'Operadores 4 e 5 · MANOBRA', cor: 'verde' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'salto' },
      licao: 'Uma equipe anda, a outra cobre. Depois troca.',
      par: 22,
      tempo: 85,
      semente: 1919,
      dica: 'Deixe a equipe Alfa parada em SEGURAR enquanto a equipe Bravo avança em furtivo/andar; nunca mova as duas ao mesmo tempo sob visão inimiga.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#............#',
        '#..XX.XX.XX..#',
        '#.....d......#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#............#',
        '#............#',
        '#..1.2.3.4.5.#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor', equipe: 'alfa' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Urso', retr: 'urso', classe: 'medico', equipe: 'bravo' },
        { nome: 'Touro', retr: 'touro', classe: 'fuzileiro', equipe: 'bravo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 20,
      op: 4,
      nome: 'Apoio',
      novo: 'Classe: Apoio (rajada de 6)',
      historia: [
        'Touro estreia sua metralhadora leve de APOIO: rajadas de 6 disparos.',
        'Disparos de Apoio suprimem inimigos a até 1,5 quadrado da linha de tiro.',
        'Fixe Touro suprimindo de trás de um caixote enquanto o time flanqueia.'
      ],
      fichas: [
        { id: 'touro', nome: 'Touro (Apoio)', desc: 'Rajada de 6 · SUPRESSÃO PESADA', cor: 'verde' },
        { id: 'hostil', nome: 'Defesa do Galpão', desc: '4 Guardas · ATRÁS DE CAIXOTES', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'dupla' },
      licao: 'Cabeça baixa não atira. Quem suprime abre caminho.',
      par: 22,
      tempo: 85,
      semente: 2020,
      dica: 'Coloque Touro em SEGURAR atrás de um caixote central e avance com os demais pelos flancos.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#.....d......#',
        '#....XXXX....#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#..1.2.3.4.5.#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 21,
      op: 4,
      nome: 'Olho longo',
      novo: 'Classe: Atirador (precisão 0,60)',
      historia: [
        'Gavião chega com rifle de precisão: 60% de acerto fixo até 12 quadrados.',
        'O pátio longo expõe quem tenta correr.',
        'Abra com Gavião de longe para abater o primeiro sentinela de surpresa.'
      ],
      fichas: [
        { id: 'gaviao', nome: 'Gavião (Atirador)', desc: 'Cone 60° · PRECISÃO LONGA 0,60', cor: 'verde' },
        { id: 'hostil', nome: 'Vigias do Pátio', desc: '4 Guardas · LONGA DISTÂNCIA', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'surpresa' },
      licao: 'Um bom ângulo de longe vale por três de perto.',
      par: 20,
      tempo: 85,
      semente: 2121,
      dica: 'Posicione Gavião em furtivo com linha de visão longa para abater o primeiro inimigo ainda tranquilo.',
      mapa: [
        '##############',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '######D#######',
        '#............#',
        '#....c..d....#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#............#',
        '#............#',
        '#..1.2.3.4.5.#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ]
      ]
    },
    {
      id: 22,
      op: 4,
      nome: 'Escudo',
      novo: '6 operadores e classe Escudo',
      historia: [
        'Tatu entra na equipe com o escudo balístico frontal.',
        'Disparos vindos até 60° da frente dele não acertam e protegem quem vai colado atrás.',
        'Use Tatu na ponta para cruzar o corredor sem cobertura.'
      ],
      fichas: [
        { id: 'tatu', nome: 'Tatu (Escudo)', desc: '6º Operador · BLINDAGEM FRONTAL', cor: 'verde' },
        { id: 'hostil', nome: 'Ninho de Fuzis', desc: '4 Guardas · CORREDOR SECO', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'sem_funil' },
      licao: 'O escudo anda, quem vai atrás atira.',
      par: 22,
      tempo: 85,
      semente: 2222,
      dica: 'Mande Tatu (operador 6, Escudo) na frente pelo centro e coloque os demais logo atrás com SEGUIR ou andando juntos sem parar em D.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#.....d......#',
        '#............#',
        '######D#######',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 23,
      op: 4,
      nome: 'A maleta',
      novo: 'Extração sob reforço pesado',
      historia: [
        'A maleta com a lista de compradores está no cofre central.',
        'Quem carrega a maleta anda 15% mais devagar e reforços chegam pela retaguarda.',
        'Mantenha cobertura na saída S enquanto a equipe de assalto extrai a maleta.'
      ],
      fichas: [
        { id: 'touro', nome: 'Touro e Gavião', desc: 'Base de Fogo · GUARDAR SAÍDA S', cor: 'verde' },
        { id: 'hostil', nome: 'Guarnição + Reforço', desc: '5 Guardas · COFRE CENTRAL', cor: 'cinza' }
      ],
      objetivo: 'maleta',
      tatica: { id: 'retaguarda' },
      licao: 'Pegar é metade. A outra metade é sair.',
      par: 26,
      tempo: 90,
      semente: 2323,
      dica: 'Deixe dois operadores em SEGURAR cobrindo a retaguarda perto de S e avance com o escudo e assalto para buscar M e voltar a S.',
      mapa: [
        '##############',
        '#..a..M..b...#',
        '#..XX....XX..#',
        '#....c..d....#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#...........e#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5S6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false },
          { id: 'e', ang: 180, chegaEm: 5, pts: [{ x: 12, y: 12 }, { x: 8, y: 13, ritmo: 'andar' }] }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false },
          { id: 'e', ang: 180, chegaEm: 5, pts: [{ x: 12, y: 12 }, { x: 7, y: 13, ritmo: 'andar' }] }
        ]
      ]
    },
    {
      id: 24,
      op: 4,
      nome: 'Monte o time (prova)',
      novo: 'Escolha de classes e zona O',
      historia: [
        'Prova da Operação 4: escale a classe de cada um dos 6 operadores.',
        'Domine a zona central O por 10 segundos limpando os acessos.',
        'Não existe time certo: existe time certo para o terreno.'
      ],
      fichas: [
        { id: 'rocha', nome: 'Sgt. Rocha', desc: 'Avaliador · ESCALE AS CLASSES', cor: 'verde' },
        { id: 'hostil', nome: 'Contra-ataque', desc: '5 Hostis · ZONA CENTRAL O', cor: 'cinza' }
      ],
      objetivo: 'dominio',
      tempoDominio: 10,
      escolherTime: true,
      tatica: { id: 'dominio' },
      licao: 'Não existe time certo, existe time certo pro terreno.',
      par: 25,
      tempo: 90,
      semente: 2424,
      dica: 'Avance até a zona O central sem parar nas portas D e segure os ângulos até eliminar os hostis e dominar a zona.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#............#',
        '#....d..e....#',
        '######D#######',
        '#............#',
        '#..XX.OO.XX..#',
        '#.....OO.....#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false },
          { id: 'e', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 90, alerta: false },
          { id: 'e', ang: 90, alerta: false }
        ]
      ]
    },

    // =========================================================================
    // OPERAÇÃO 5: APAGÃO (Missões 25 a 30) - Mapas 14x20, 6 e 7 operadores
    // =========================================================================
    {
      id: 25,
      op: 5,
      nome: 'No escuro',
      novo: 'Escuro (visão 4) e lanterna',
      historia: [
        'Cortaram a força do andar de escritórios: visão reduzida a 4 quadrados.',
        'A LANTERNA devolve visão de 12 quadrados, mas revela sua posição a todos.',
        'Use pulsos curtos em movimento; nunca fique parado de lanterna acesa.'
      ],
      fichas: [
        { id: 'onca', nome: 'Onça', desc: 'Combate Noturno · DISCIPLINA DE LUZ', cor: 'verde' },
        { id: 'hostil', nome: 'Vigias no Escuro', desc: '4 Guardas · ANDAR APAGADO', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      escuro: true,
      tatica: { id: 'luz_curta' },
      licao: 'Lanterna acesa mostra o caminho pra você e você pra eles.',
      par: 20,
      tempo: 85,
      semente: 2525,
      dica: 'Avance em furtivo ou desligue a lanterna antes de parar para não ficar mais de 1,5s parado com ela ligada.',
      mapa: [
        '##############',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '#....c..d....#',
        '#..XX....XX..#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ]
      ]
    },
    {
      id: 26,
      op: 5,
      nome: 'Contraluz',
      novo: 'Perigo de contraluz na fila',
      historia: [
        'Nos corredores estreitos, acender a lanterna atrás de um colega ilumina a silhueta dele.',
        'Isso entrega a posição do colega da frente para todo o corredor.',
        'Mantenha as lanternas de trás apagadas e abra frentes separadas.'
      ],
      fichas: [
        { id: 'tatu', nome: 'Tatu (Ponta)', desc: 'Homem de Frente · SEM CONTRALUZ', cor: 'verde' },
        { id: 'hostil', nome: 'Emboscada Noturna', desc: '4 Guardas · CORREDOR ESCURO', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      escuro: true,
      tatica: { id: 'luz_curta' },
      licao: 'Nunca acenda a luz nas costas do colega da frente.',
      par: 20,
      tempo: 85,
      semente: 2626,
      dica: 'Nunca ligue lanterna nas costas de um aliado; avance com Tatu na frente e granada de luz na sala.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#.....d......#',
        '#............#',
        '######D#######',
        '#...#....#...#',
        '#...#....#...#',
        '#...#....#...#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 27,
      op: 5,
      nome: 'Segura a posição',
      novo: 'Objetivo: defesa contra ondas',
      historia: [
        'Os mercenários tentam retomar o salão central em ondas.',
        'Monte uma defesa coberta com ângulos cruzados.',
        'Quem fica parado atrás de cobertura reage em 0,30s; quem vem correndo perde.'
      ],
      fichas: [
        { id: 'touro', nome: 'Defesa Tática', desc: '6 Operadores · ÂNGULOS CRUZADOS', cor: 'verde' },
        { id: 'hostil', nome: 'Ondas de Assalto', desc: '5 Hostis · ATACANDO SALÃO', cor: 'cinza' }
      ],
      objetivo: 'defesa',
      tatica: { id: 'dupla' },
      licao: 'Parado, coberto e com ângulo cruzado, quem chega perde.',
      par: 20,
      tempo: 35,
      semente: 2727,
      dica: 'Posicione os operadores atrás dos caixotes com ordem SEGURAR cobrindo as portas de cima.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#............#',
        '#....d..e....#',
        '#............#',
        '###D######D###',
        '#............#',
        '#..XX....XX..#',
        '#....OOOO....#',
        '#..XX.OO.XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false, pts: [{ x: 3, y: 1 }, { x: 3, y: 8, ritmo: 'andar' }] },
          { id: 'b', ang: 90, alerta: false, pts: [{ x: 6, y: 1 }, { x: 4, y: 8, ritmo: 'andar' }] },
          { id: 'c', ang: 90, alerta: false, pts: [{ x: 9, y: 1 }, { x: 10, y: 8, ritmo: 'andar' }] },
          { id: 'd', ang: 90, alerta: false, chegaEm: 4, pts: [{ x: 5, y: 3 }, { x: 3, y: 9, ritmo: 'andar' }] },
          { id: 'e', ang: 90, alerta: false, chegaEm: 4, pts: [{ x: 8, y: 3 }, { x: 10, y: 9, ritmo: 'andar' }] }
        ],
        [
          { id: 'a', ang: 90, alerta: false, pts: [{ x: 3, y: 1 }, { x: 3, y: 8, ritmo: 'andar' }] },
          { id: 'b', ang: 90, alerta: false, pts: [{ x: 6, y: 1 }, { x: 10, y: 8, ritmo: 'andar' }] },
          { id: 'c', ang: 90, alerta: false, pts: [{ x: 9, y: 1 }, { x: 10, y: 8, ritmo: 'andar' }] },
          { id: 'd', ang: 90, alerta: false, chegaEm: 4, pts: [{ x: 5, y: 3 }, { x: 3, y: 9, ritmo: 'andar' }] },
          { id: 'e', ang: 90, alerta: false, chegaEm: 4, pts: [{ x: 8, y: 3 }, { x: 10, y: 9, ritmo: 'andar' }] }
        ]
      ]
    },
    {
      id: 28,
      op: 5,
      nome: 'Relógio',
      novo: 'Objetivo: bomba B (75 s)',
      historia: [
        'Plantaram um artefato B no último cômodo para destruir as provas.',
        'Um operador precisa ficar 6 segundos parado no ponto B para desarmar.',
        'Limpe o caminho direto sem desperdiçar movimento.'
      ],
      fichas: [
        { id: 'lobo', nome: 'Esquadrão Antibomba', desc: '6s parado em B · DESARMAR', cor: 'verde' },
        { id: 'hostil', nome: 'Guarda da Bomba', desc: '4 Guardas · RELÓGIO DE 75s', cor: 'cinza' }
      ],
      objetivo: 'bomba',
      tatica: { id: 'sala_a_sala' },
      licao: 'Pressa não é correr: é não desperdiçar movimento.',
      par: 24,
      tempo: 75,
      semente: 2828,
      dica: 'Elimine todos os guardas com impacto/luz e deixe um operador parado em cima de B por 6 segundos.',
      mapa: [
        '##############',
        '#.....B......#',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#....c..d....#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.1.2.3.4.5.6#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 29,
      op: 5,
      nome: 'Dois alvos',
      novo: '7 operadores e dois objetivos',
      historia: [
        'Na ala esquerda está a Dra. Helena (R); na direita, o tenente (V).',
        'Se um lado abrir fogo cedo demais, o outro lado entra em alerta.',
        'Sincronize as duas equipes para entrar nas duas alas no mesmo segundo.'
      ],
      fichas: [
        { id: 'helena', nome: 'Dra. Helena', desc: 'Ala Esquerda · RESGATAR ATÉ S', cor: 'amarelo' },
        { id: 'capanga', nome: 'Tenente da Ala', desc: 'Ala Direita · CAPTURAR VIVO', cor: 'vermelho' }
      ],
      objetivo: ['resgate', 'captura'],
      tatica: { id: 'simultaneo' },
      licao: 'Se um lado bate antes, o outro lado já sabe.',
      par: 26,
      tempo: 90,
      semente: 2929,
      dica: 'Divida o time entre as portas da esquerda e da direita, lance LUZ simultânea, capture V e traga R até S.',
      mapa: [
        '##############',
        '#..R..##..V..#',
        '#.a.b.##.c.d.#',
        '#.XX..##..XX.#',
        '#.....##.....#',
        '###D######D###',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#1.2.3S4.5.67#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 85, alerta: false },
          { id: 'd', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 30,
      op: 5,
      nome: 'Resgate no escuro (prova)',
      novo: 'Infiltração noturna completa',
      historia: [
        'Prova da Operação 5: resgate a Dra. Helena no último andar às escuras.',
        'Qualquer alerta antes de tocar na refém coloca a missão em risco.',
        'Avance em silêncio absoluto na faca até alcançar a Dra. Helena.'
      ],
      fichas: [
        { id: 'helena', nome: 'Dra. Helena', desc: 'Testemunha · SILÊNCIO ATÉ O RESGATE', cor: 'amarelo' },
        { id: 'raposa', nome: 'Esquadrão Noturno', desc: '7 Operadores · FURTIVO E FACA', cor: 'verde' }
      ],
      objetivo: 'resgate',
      escuro: true,
      tatica: { id: 'silencio', ate: 'refem' },
      licao: 'No escuro, o barulho entrega antes da sombra.',
      par: 26,
      tempo: 90,
      semente: 3030,
      dica: 'Vá em FURTIVO eliminando os guardas de costas na faca sem atirar até encostar na refém R e traga-a para S.',
      mapa: [
        '##############',
        '#.....R......#',
        '#..c......d..#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#............#',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#1.2.3S4.5.67#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'batedor' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ]
      ]
    },

    // =========================================================================
    // OPERAÇÃO 6: O CORONEL (Missões 31 a 36) - Mapas 14x20, 8 operadores
    // =========================================================================
    {
      id: 31,
      op: 6,
      nome: 'Oito',
      novo: '8 operadores (duas filas de 4)',
      historia: [
        'Raposa completa o efetivo máximo de 8 operadores.',
        'O complexo do Coronel começa com duas alas gêmeas.',
        'Monte duas colunas de 4 e invada as duas portas simultaneamente.'
      ],
      fichas: [
        { id: 'raposa', nome: 'Raposa', desc: '8ª Operadora · ESQUADRÃO COMPLETO', cor: 'verde' },
        { id: 'hostil', nome: 'Guarda de Elite', desc: '6 Hostis · DUAS ALAS GÊMEAS', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'simultaneo' },
      licao: 'Oito sozinhos perdem pra quatro juntos.',
      par: 24,
      tempo: 90,
      semente: 3131,
      dica: 'Divida Alfa na porta esquerda e Bravo na porta direita com LUZ/IMPACTO entrando ao mesmo tempo.',
      mapa: [
        '##############',
        '#.a.b.##.d.e.#',
        '#..c..##..f..#',
        '#.XX..##..XX.#',
        '#.....##.....#',
        '###D######D###',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#1234....5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor', equipe: 'alfa' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Urso', retr: 'urso', classe: 'medico', equipe: 'alfa' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio', equipe: 'bravo' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador', equipe: 'bravo' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo', equipe: 'bravo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor', equipe: 'bravo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false },
          { id: 'e', ang: 90, alerta: false },
          { id: 'f', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 85, alerta: false },
          { id: 'e', ang: 95, alerta: false },
          { id: 'f', ang: 90, alerta: false }
        ]
      ]
    },
    {
      id: 32,
      op: 6,
      nome: 'Contra-ataque',
      novo: 'Inimigo que manobra pelas costas',
      historia: [
        'Os homens do Coronel não ficam só esperando: uma dupla contorna por fora.',
        'Enquanto o grupo de assalto limpa o prédio, proteja a retaguarda.',
        'Deixe segurança externa em SEGURAR cobrindo a aproximação traseira.'
      ],
      fichas: [
        { id: 'gaviao', nome: 'Gavião e Touro', desc: 'Segurança Externa · COBRIR COSTAS', cor: 'verde' },
        { id: 'hostil', nome: 'Flanqueadores', desc: '5 Hostis · CONTRA-ATAQUE', cor: 'cinza' }
      ],
      objetivo: 'eliminar',
      tatica: { id: 'retaguarda' },
      licao: 'Enquanto você entra, alguém pode estar entrando atrás.',
      par: 25,
      tempo: 90,
      semente: 3232,
      dica: 'Deixe dois operadores em SEGURAR vigiando a parte inferior direita enquanto o restante limpa a sala superior.',
      mapa: [
        '##############',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#............#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#..........de#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#1234....5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 180, chegaEm: 4, pts: [{ x: 11, y: 12 }, { x: 6, y: 13, ritmo: 'andar' }] },
          { id: 'e', ang: 180, chegaEm: 5, pts: [{ x: 12, y: 12 }, { x: 7, y: 13, ritmo: 'andar' }] }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 95, alerta: false },
          { id: 'd', ang: 180, chegaEm: 4, pts: [{ x: 11, y: 12 }, { x: 5, y: 13, ritmo: 'andar' }] },
          { id: 'e', ang: 180, chegaEm: 5, pts: [{ x: 12, y: 12 }, { x: 6, y: 13, ritmo: 'andar' }] }
        ]
      ]
    },
    {
      id: 33,
      op: 6,
      nome: 'Testemunha',
      novo: 'Objetivo: escolta de VIP',
      historia: [
        'A Dra. Helena caminha por uma rota fixa até o veículo de extração S.',
        'Mercenários emboscam a rua pelo caminho.',
        'Avance limpando cada trecho antes que ela chegue perto do perigo.'
      ],
      fichas: [
        { id: 'helena', nome: 'Dra. Helena (VIP)', desc: 'Rota Fixa · NÃO PODE SER ATINGIDA', cor: 'amarelo' },
        { id: 'tatu', nome: 'Escolta Tática', desc: '8 Operadores · LIMPAR A FRENTE', cor: 'verde' }
      ],
      objetivo: 'escolta',
      escoltaPts: [
        { x: 6, y: 16 },
        { x: 6, y: 11 },
        { x: 6, y: 6 },
        { x: 6, y: 2 }
      ],
      tatica: { id: 'salto' },
      licao: 'Quem protege vai na frente e fica atrás, nunca só do lado.',
      par: 25,
      tempo: 90,
      semente: 3333,
      dica: 'Mantenha uma equipe em SEGURAR cobrindo enquanto a outra avança na frente da VIP para limpar os hostis antes dela passar.',
      mapa: [
        '##############',
        '#.....S......#',
        '#..c......d..#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#.....R......#',
        '#............#',
        '#1234....5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor', equipe: 'alfa' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro', equipe: 'alfa' },
        { nome: 'Urso', retr: 'urso', classe: 'medico', equipe: 'alfa' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio', equipe: 'bravo' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador', equipe: 'bravo' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo', equipe: 'bravo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor', equipe: 'bravo' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 85, alerta: false },
          { id: 'd', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 34,
      op: 6,
      nome: 'Tudo ou nada',
      novo: 'Objetivos em cadeia num relógio',
      historia: [
        'A maleta está na ala oeste, o refém na ala leste e todos os guardas precisam cair.',
        'Divida as duas equipes para cumprir tudo num relógio único de 120s.',
        'Junte todos na zona de extração S ao final.'
      ],
      fichas: [
        { id: 'almeida', nome: 'Refém + Maleta M', desc: 'Duas Alas · EXTRAIR AMBOS EM S', cor: 'amarelo' },
        { id: 'lobo', nome: 'Alfa e Bravo', desc: '8 Operadores · LIMPEZA TOTAL', cor: 'verde' }
      ],
      objetivo: ['eliminar', 'maleta', 'resgate'],
      tatica: { id: 'sala_a_sala' },
      licao: 'Dividir para alcançar, juntar para extrair.',
      par: 30,
      tempo: 120,
      semente: 3434,
      dica: 'Mande Alfa buscar a maleta M na esquerda e Bravo resgatar R na direita, eliminando todos os guardas e voltando até S.',
      mapa: [
        '##############',
        '#..M..##..R..#',
        '#.a.b.##.c.d.#',
        '#.XX..##..XX.#',
        '#.....##.....#',
        '###D######D###',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.....SS.....#',
        '#1234.SS.5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false },
          { id: 'c', ang: 90, alerta: false },
          { id: 'd', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 95, alerta: false },
          { id: 'c', ang: 85, alerta: false },
          { id: 'd', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 35,
      op: 6,
      nome: 'Cerco',
      novo: '3 saídas E e guarda de escudo',
      historia: [
        'A casa do Coronel tem 3 rotas de fuga E e um guarda-costas de escudo.',
        'Escudo se vence pelo flanco ou com luz.',
        'Bloqueie todas as 3 saídas E antes de render o alvo V.'
      ],
      fichas: [
        { id: 'coronel', nome: 'Subcomandante V', desc: '3 Saídas E · CAPTURAR VIVO', cor: 'vermelho' },
        { id: 'hostil', nome: 'Guarda de Escudo', desc: 'Blindado · FLANQUEAR', cor: 'cinza' }
      ],
      objetivo: 'captura',
      tatica: { id: 'cerco' },
      licao: 'Escudo se vence pelo lado.',
      par: 26,
      tempo: 95,
      semente: 3535,
      dica: 'Posicione operadores nas 3 saídas E (esquerda, topo, direita) e entre com LUZ/TASER para render V.',
      mapa: [
        '##############',
        '#E....E.....E#',
        '#.....V......#',
        '#..a..b..c...#',
        '#..XX.XX.XX..#',
        '#............#',
        '###D######D###',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#....XXXX....#',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#1234....5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'fuzileiro' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: 90, alerta: false },
          { id: 'b', ang: 90, alerta: false, classe: 'escudo' },
          { id: 'c', ang: 90, alerta: false }
        ],
        [
          { id: 'a', ang: 85, alerta: false },
          { id: 'b', ang: 90, alerta: false, classe: 'escudo' },
          { id: 'c', ang: 95, alerta: false }
        ]
      ]
    },
    {
      id: 36,
      op: 6,
      nome: 'Operação completa (final)',
      novo: '3 fases: faca, resgate e captura',
      historia: [
        'Missão final: sentinelas no pátio, refém no meio e o Coronel no bunker.',
        'Mantenha silêncio até alcançar o refém, feche as saídas E e capture o Coronel vivo.',
        'Mostre por que você merece a patente de Comandante.'
      ],
      fichas: [
        { id: 'coronel', nome: '"O Coronel"', desc: 'Chefe da Rede · CAPTURAR VIVO', cor: 'vermelho' },
        { id: 'helena', nome: 'Refém Central', desc: 'Silêncio até aqui · EXTRAIR EM S', cor: 'amarelo' }
      ],
      objetivo: ['resgate', 'captura'],
      tatica: { id: 'silencio', ate: 'refem' },
      licao: 'Planejamento frio, execução cirúrgica.',
      par: 32,
      tempo: 120,
      semente: 3636,
      dica: 'Elimine os sentinelas em FURTIVO na faca, pegue o refém R sem alerta antes disso, leve R até S e prenda o Coronel V com luz/taser.',
      mapa: [
        '##############',
        '#E....V.....E#',
        '#..c......d..#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#.....R......#',
        '#..a......b..#',
        '#..XX....XX..#',
        '#............#',
        '######D#######',
        '#............#',
        '#..XX....XX..#',
        '#............#',
        '#............#',
        '#............#',
        '#............#',
        '#.....SS.....#',
        '#1234.SS.5678#',
        '##############'
      ],
      time: [
        { nome: 'Lobo', retr: 'lobo', classe: 'batedor' },
        { nome: 'Onça', retr: 'onca', classe: 'batedor' },
        { nome: 'Coruja', retr: 'coruja', classe: 'fuzileiro' },
        { nome: 'Urso', retr: 'urso', classe: 'medico' },
        { nome: 'Touro', retr: 'touro', classe: 'apoio' },
        { nome: 'Gavião', retr: 'gaviao', classe: 'atirador' },
        { nome: 'Tatu', retr: 'tatu', classe: 'escudo' },
        { nome: 'Raposa', retr: 'raposa', classe: 'batedor' }
      ],
      inimigo: [
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ],
        [
          { id: 'a', ang: -90, alerta: false },
          { id: 'b', ang: -90, alerta: false },
          { id: 'c', ang: -90, alerta: false },
          { id: 'd', ang: -90, alerta: false }
        ]
      ]
    }
  ];

  // Ordens liberadas até determinada missão (seção 4)
  function ordensLiberadas(idMissao) {
    const m = Number(idMissao) || 1;
    const lista = ['esperar'];
    if (m >= 2) lista.push('segurar');
    if (m >= 3) lista.push('fatiar');
    if (m >= 4) lista.push('sinal');
    if (m >= 5) lista.push('luz');
    if (m >= 15) lista.push('impacto');
    if (m >= 17) lista.push('taser');
    if (m >= 25) lista.push('lanterna');
    return lista;
  }

  const GABARITOS = {"1":[{"pts":[{"x":4,"y":14},{"x":4,"y":6,"ritmo":"furtivo"},{"x":5,"y":3,"ritmo":"furtivo"}]},{"pts":[{"x":7,"y":14},{"x":7,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]}],"2":[{"pts":[{"x":4,"y":14},{"x":6,"y":3,"ritmo":"furtivo"},{"x":5,"y":2,"ritmo":"furtivo"}]},{"pts":[{"x":7,"y":14,"ordem":{"t":"segurar","ang":-90}}]}],"3":[{"pts":[{"x":4,"y":14},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"fatiar","ang":-90}},{"x":4,"y":4,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":7,"y":14},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"fatiar","ang":-100}},{"x":8,"y":4,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-110}}]}],"4":[{"pts":[{"x":4,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"fatiar","ang":-90}},{"x":3,"y":4,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-120}}]},{"pts":[{"x":7,"y":14},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":7,"y":4,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-140}}]}],"5":[{"pts":[{"x":4,"y":14},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":2.5}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-60}}]},{"pts":[{"x":7,"y":14},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-120}}]}],"6":[{"pts":[{"x":4,"y":14},{"x":5,"y":8,"ritmo":"furtivo"},{"x":5,"y":5,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":2.5}},{"x":3,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-60}}]},{"pts":[{"x":7,"y":14},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":7,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]}],"7":[{"pts":[{"x":3,"y":14},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":5,"y":2}},{"x":3,"y":2,"ritmo":"furtivo"},{"x":5,"y":1,"ritmo":"andar"},{"x":9,"y":14,"ritmo":"andar"}]},{"pts":[{"x":5,"y":14},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":8,"y":2,"ritmo":"furtivo"},{"x":9,"y":14,"ritmo":"andar"}]},{"pts":[{"x":7,"y":14},{"x":4,"y":11,"ritmo":"furtivo","ordem":{"t":"segurar","ang":0}}]}],"8":[{"pts":[{"x":3,"y":14},{"x":4,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":4,"y":2}},{"x":2,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":6,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":5,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":14},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":7,"y":2}},{"x":9,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]}],"9":[{"pts":[{"x":4,"y":14},{"x":4,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-110,"dist":3.5}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-135}}]},{"pts":[{"x":6,"y":14},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":5,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":14},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-70,"dist":3.5}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-45}}]}],"10":[{"pts":[{"x":3,"y":14},{"x":3,"y":3,"ritmo":"furtivo"}]},{"pts":[{"x":6,"y":14},{"x":6,"y":7,"ritmo":"furtivo"}]},{"pts":[{"x":9,"y":14},{"x":8,"y":3,"ritmo":"furtivo"}]}],"11":[{"pts":[{"x":3,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":4}},{"x":2,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-70,"s":3.5}},{"x":5,"y":2,"ritmo":"andar"},{"x":9,"y":14,"ritmo":"andar"}]},{"pts":[{"x":5,"y":14},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":9,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":7,"y":14,"ordem":{"t":"segurar","ang":90}}]}],"12":[{"pts":[{"x":3,"y":14},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":5,"y":2}},{"x":2,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-70,"s":3}},{"x":6,"y":4,"ritmo":"andar"},{"x":9,"y":14,"ritmo":"andar"}]},{"pts":[{"x":5,"y":14},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":7,"y":2}},{"x":9,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":7,"y":14},{"x":8,"y":9,"ritmo":"furtivo","ordem":{"t":"segurar","ang":45}}]}],"13":[{"pts":[{"x":3,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":2,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":5,"y":14},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":9,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":7,"y":14},{"x":5,"y":8,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":5,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":14},{"x":6,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":90}}]}],"14":[{"pts":[{"x":3,"y":14},{"x":4,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":3,"pt":1}},{"x":4,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":4}},{"x":2,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":5,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":7,"y":14},{"x":10,"y":5,"ritmo":"furtivo","ordem":{"t":"luz","ang":180,"dist":4}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-130}}]},{"pts":[{"x":9,"y":14},{"x":10,"y":6,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-120}}]}],"15":[{"pts":[{"x":3,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"impacto","x":5,"y":3}},{"x":3,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":5,"y":14},{"x":6,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":7,"y":14},{"x":7,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":14},{"x":8,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]}],"16":[{"pts":[{"x":3,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":2.5}},{"x":3,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":5,"y":14},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":8,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":7,"y":14},{"x":5,"y":5,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":14},{"x":6,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}],"socorrer":true}],"17":[{"pts":[{"x":3,"y":14},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3.5}},{"x":2,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":5,"y":14},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":9,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":180}}]},{"pts":[{"x":7,"y":14},{"x":5,"y":8,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":5,"y":3,"ritmo":"andar","ordem":{"t":"taser"}},{"x":5,"y":2,"ritmo":"andar"}]},{"pts":[{"x":9,"y":14},{"x":6,"y":8,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":6,"y":3,"ritmo":"andar"}]}],"18":[{"pts":[{"x":3,"y":14},{"x":5,"y":13,"ritmo":"furtivo","ordem":{"t":"impacto","x":5,"y":9}},{"x":5,"y":9,"ritmo":"andar","ordem":{"t":"impacto","x":5,"y":5}},{"x":5,"y":5,"ritmo":"andar","ordem":{"t":"luz","ang":-90,"dist":4}},{"x":2,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":5,"y":14},{"x":6,"y":5,"ritmo":"andar","ordem":{"t":"sinal","de":1,"pt":3}},{"x":9,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":7,"y":14},{"x":4,"y":5,"ritmo":"andar","ordem":{"t":"sinal","de":1,"pt":3}},{"x":5,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":14,"ordem":{"t":"segurar","ang":-90}}]}],"19":[{"pts":[{"x":3,"y":18},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"impacto","x":5,"y":4}},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":4}},{"x":3,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":5,"y":18},{"x":7,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":7,"y":18},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"20":[{"pts":[{"x":3,"y":18},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":3}},{"x":6,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":4}},{"x":3,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":5,"y":18},{"x":7,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":7,"y":18},{"x":5,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":5,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"21":[{"pts":[{"x":3,"y":18},{"x":5,"y":8,"ritmo":"furtivo"},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":3,"y":1}},{"x":3,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":5,"y":18},{"x":8,"y":8,"ritmo":"furtivo"},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":10,"y":1}},{"x":10,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":7,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18},{"x":6,"y":14,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]}],"22":[{"pts":[{"x":2,"y":18},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":3}},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3.5}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":4,"y":18},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":6,"y":18},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18},{"x":6,"y":7,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]}],"23":[{"pts":[{"x":2,"y":18},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":3}},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3.5}},{"x":6,"y":1,"ritmo":"andar"},{"x":11,"y":18,"ritmo":"andar"}]},{"pts":[{"x":4,"y":18},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-75,"s":5}},{"x":11,"y":18,"ritmo":"andar"}]},{"pts":[{"x":6,"y":18},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-105,"s":5}},{"x":11,"y":18,"ritmo":"andar"}]},{"pts":[{"x":8,"y":18},{"x":5,"y":12,"ritmo":"furtivo","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":10,"y":18},{"x":5,"y":13,"ritmo":"furtivo","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":12,"y":18},{"x":6,"y":13,"ritmo":"andar","ordem":{"t":"segurar","ang":0}}]}],"24":[{"pts":[{"x":2,"y":18},{"x":5,"y":8,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18},{"x":6,"y":8,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":6,"y":18},{"x":7,"y":8,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":18},{"x":8,"y":8,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18},{"x":6,"y":9,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18},{"x":7,"y":9,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]}],"25":[{"pts":[{"x":2,"y":18},{"x":5,"y":5,"ritmo":"furtivo","ordem":{"t":"lanterna","liga":true}},{"x":3,"y":2,"ritmo":"furtivo","ordem":{"t":"lanterna","liga":false}}]},{"pts":[{"x":4,"y":18},{"x":8,"y":5,"ritmo":"furtivo"},{"x":10,"y":2,"ritmo":"furtivo"}]},{"pts":[{"x":6,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"26":[{"pts":[{"x":2,"y":18},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":3}},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":3,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":4,"y":18},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":6,"y":18},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":3,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"27":[{"pts":[{"x":2,"y":18},{"x":3,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18},{"x":4,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-85}}]},{"pts":[{"x":6,"y":18},{"x":5,"y":10,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":8,"y":18},{"x":8,"y":10,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":10,"y":18},{"x":9,"y":8,"ritmo":"furtivo","ordem":{"t":"segurar","ang":-95}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"28":[{"pts":[{"x":2,"y":18},{"x":6,"y":10,"ritmo":"furtivo","ordem":{"t":"impacto","x":5,"y":6}},{"x":6,"y":6,"ritmo":"andar","ordem":{"t":"impacto","x":3,"y":2}},{"x":6,"y":1,"ritmo":"andar","ordem":{"t":"segurar","ang":90,"s":8}}]},{"pts":[{"x":4,"y":18},{"x":7,"y":10,"ritmo":"furtivo","ordem":{"t":"impacto","x":8,"y":6}},{"x":7,"y":6,"ritmo":"andar","ordem":{"t":"impacto","x":10,"y":2}},{"x":7,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":6,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":8,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"29":[{"pts":[{"x":1,"y":18},{"x":3,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":1,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-70,"s":3}},{"x":3,"y":1,"ritmo":"andar"},{"x":6,"y":18,"ritmo":"andar"}]},{"pts":[{"x":3,"y":18},{"x":4,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":5,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":5,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":7,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18},{"x":10,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":11,"y":18},{"x":9,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":5,"pt":1}},{"x":10,"y":2,"ritmo":"andar","ordem":{"t":"taser"}},{"x":10,"y":1,"ritmo":"andar"}]},{"pts":[{"x":12,"y":18},{"x":11,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":5,"pt":1}},{"x":12,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]}],"30":[{"pts":[{"x":1,"y":18},{"x":3,"y":7,"ritmo":"furtivo"},{"x":3,"y":2,"ritmo":"furtivo"},{"x":6,"y":1,"ritmo":"furtivo"},{"x":6,"y":18,"ritmo":"andar"}]},{"pts":[{"x":3,"y":18},{"x":10,"y":7,"ritmo":"furtivo"},{"x":10,"y":2,"ritmo":"furtivo"}]},{"pts":[{"x":5,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":7,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"31":[{"pts":[{"x":1,"y":18},{"x":3,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":3,"y":2}},{"x":3,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":2,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-80}}]},{"pts":[{"x":2,"y":18},{"x":4,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":5,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-100}}]},{"pts":[{"x":3,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18},{"x":10,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":10,"y":2}},{"x":10,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-80}}]},{"pts":[{"x":10,"y":18},{"x":11,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":5,"pt":2}},{"x":12,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-100}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"32":[{"pts":[{"x":1,"y":18},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":6,"y":1.5}},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3.5}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-75}}]},{"pts":[{"x":2,"y":18},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":9,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-105}}]},{"pts":[{"x":3,"y":18},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":2}},{"x":6,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18},{"x":4,"y":12,"ritmo":"furtivo","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":10,"y":18},{"x":4,"y":13,"ritmo":"furtivo","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":11,"y":18},{"x":5,"y":13,"ritmo":"andar","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"33":[{"pts":[{"x":1,"y":18},{"x":2,"y":8,"ritmo":"furtivo","ordem":{"t":"impacto","x":3,"y":6}},{"x":2,"y":4,"ritmo":"furtivo","ordem":{"t":"impacto","x":3,"y":2}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-80}}]},{"pts":[{"x":2,"y":18},{"x":11,"y":8,"ritmo":"furtivo","ordem":{"t":"impacto","x":10,"y":6}},{"x":11,"y":4,"ritmo":"furtivo","ordem":{"t":"impacto","x":10,"y":2}},{"x":10,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-100}}]},{"pts":[{"x":3,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"34":[{"pts":[{"x":1,"y":18},{"x":3,"y":6,"ritmo":"furtivo","ordem":{"t":"impacto","x":3,"y":2.5}},{"x":3,"y":1,"ritmo":"andar"},{"x":6,"y":18,"ritmo":"andar"}]},{"pts":[{"x":2,"y":18},{"x":4,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3}},{"x":4,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-90,"s":4}},{"x":6,"y":18,"ritmo":"andar"}]},{"pts":[{"x":3,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":4,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18},{"x":10,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","ang":-90,"dist":3.5}},{"x":8,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-70,"s":3}},{"x":10,"y":1,"ritmo":"andar"},{"x":7,"y":18,"ritmo":"andar"}]},{"pts":[{"x":10,"y":18},{"x":11,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":5,"pt":1}},{"x":12,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"35":[{"pts":[{"x":1,"y":18},{"x":3,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","x":6,"y":2.5}},{"x":2,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":2,"y":18},{"x":4,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":6,"y":2,"ritmo":"andar","ordem":{"t":"taser"}}]},{"pts":[{"x":3,"y":18},{"x":2,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":1,"pt":1}},{"x":3,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-70}}]},{"pts":[{"x":4,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":9,"y":18},{"x":10,"y":7,"ritmo":"furtivo","ordem":{"t":"luz","x":7,"y":2.5}},{"x":11,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":180}}]},{"pts":[{"x":10,"y":18},{"x":11,"y":7,"ritmo":"furtivo","ordem":{"t":"sinal","de":5,"pt":1}},{"x":9,"y":4,"ritmo":"andar","ordem":{"t":"segurar","ang":-110}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}],"36":[{"pts":[{"x":1,"y":18},{"x":3,"y":7,"ritmo":"furtivo"},{"x":6,"y":6,"ritmo":"furtivo"},{"x":6,"y":18,"ritmo":"andar"}]},{"pts":[{"x":2,"y":18},{"x":10,"y":7,"ritmo":"furtivo"},{"x":6,"y":6,"ritmo":"furtivo","ordem":{"t":"luz","x":6,"y":2}},{"x":6,"y":2,"ritmo":"andar","ordem":{"t":"taser"}},{"x":6,"y":1,"ritmo":"andar"}]},{"pts":[{"x":3,"y":18},{"x":5,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":2,"pt":2}},{"x":5,"y":4,"ritmo":"andar","ordem":{"t":"impacto","x":3,"y":2}},{"x":2,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":0}}]},{"pts":[{"x":4,"y":18},{"x":7,"y":6,"ritmo":"furtivo","ordem":{"t":"sinal","de":2,"pt":2}},{"x":7,"y":4,"ritmo":"andar","ordem":{"t":"impacto","x":10,"y":2}},{"x":11,"y":2,"ritmo":"andar","ordem":{"t":"segurar","ang":180}}]},{"pts":[{"x":9,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":10,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":11,"y":18,"ordem":{"t":"segurar","ang":-90}}]},{"pts":[{"x":12,"y":18,"ordem":{"t":"segurar","ang":-90}}]}]};

  return {
    OPERACOES,
    MISSOES,
    GABARITOS,
    ordensLiberadas
  };
});
