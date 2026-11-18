(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SIM = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const C = {
    PASSO: 1 / 30,
    QUAD: 40,
    TEMPO_PADRAO: 90,
    VEL: { furtivo: 40, andar: 75, correr: 135 },
    VEL_BATEDOR_FURTIVO: 55,
    CONE: 100,
    CONE_ATIRADOR: 60,
    ALCANCE: 12,
    ALCANCE_ESCURO: 4,
    ALCANCE_ESCUDO: 6,
    PERIFERICA: 1.2,
    REACAO: {
      andar: 0.50,
      segurar: 0.30,
      correr: 0.90,
      furtivoAlvo: 0.25,
      surpresa: 0.40,
      suprimido: 0.40,
      enfaixado: 0.20,
      apoio: 0.15,
      atiradorPerto: 0.30
    },
    RAJADA: { tiros: 3, tirosApoio: 6, intervalo: 0.12, pausa: 0.50 },
    CHANCE: {
      perto: 0.55,
      distPerto: 3,
      longe: 0.12,
      longeBatedor: 0.08,
      distLonge: 12,
      atirador: 0.60,
      escudoMult: 0.60
    },
    MOD: {
      correndo: 0.60,
      cobertura: 0.45,
      funil: 1.50,
      suprimido: 0.40,
      andando: 0.70
    },
    SUPRESSAO: { dist: 1.0, distApoio: 1.5, tempo: 2.0 },
    LINHA_BLOQ: 0.6,
    BARULHO: { passo: 4.8, correr: 6, tiro: 10, granada: 14, grito: 6 },
    LUZ: { alcance: 5, raio: 4, tempo: 3.5, janela: 2.0 },
    IMPACTO: { alcance: 5, raio: 1.5 },
    TASER: { alcance: 3, tempo: 5.0 },
    FERIDO: { tempo: 25, distCritica: 2.0, distSocorro: 6.0, tempoTratar: 4.0, medkits: 2 },
    RENDER: { dist: 1.5, tempo: 1.0 }
  };

  const LICOES_BAIXA = {
    funil: 'O {n} parou na porta. Porta é funil: ou se fatia de fora, ou se atravessa sem parar até o canto.',
    aberto: 'O {n} esperou em campo aberto. Ponto de espera tem que ter caixote ou quina do lado de onde vem o tiro.',
    correndo: 'O {n} chegou correndo em cima de quem estava parado esperando. Devagar é suave, suave é rápido.',
    agrupado: 'Dois colados viram um alvo só. Abra dois quadrados entre eles.',
    sozinho: 'O {n} avançou sem ninguém cobrindo. Ninguém anda em área não limpa sem o parceiro parado, olhando o perigo.',
    costas: 'O {n} levou pelas costas. Faltou alguém segurando a retaguarda ou a sala deixada pra trás.',
    propria: 'Granada do próprio time. Quem lança avisa, e ninguém entra antes de estourar.',
    duelo: 'Troca de frente é cara ou coroa. Chegue de lado, com cobertura, ou dois contra um.',
    tempo: 'Plano seguro demais. Quem cobre segura; os outros avançam.',
    refem: 'Com refém ou alvo vivo na sala, nada de granada de impacto e nada de tiro com ele na linha.'
  };

  function criaRng(semente) {
    let s = (semente >>> 0) || 123456789;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function normAng(a) {
    let r = a % 360;
    if (r > 180) r -= 360;
    if (r <= -180) r += 360;
    return r;
  }

  function diffAng(a, b) {
    return Math.abs(normAng(a - b));
  }

  function angEntre(ax, ay, bx, by) {
    return Math.atan2(by - ay, bx - ax) * (180 / Math.PI);
  }

  function dist(ax, ay, bx, by) {
    return Math.hypot(bx - ax, by - ay);
  }

  function distPontoSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const l2 = dx * dx + dy * dy;
    if (l2 === 0) return Math.hypot(px - ax, py - ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }

  function parseMapa(linhas) {
    const A = linhas.length;
    const L = linhas[0] ? linhas[0].length : 0;
    const grade = [];
    const opsPos = {};
    const advPos = {};
    const portas = [];
    const caixotes = [];
    const zonas = [];
    const saidas = [];
    const fugas = [];
    const bombas = [];
    const maletas = [];
    const refens = [];
    const alvosVivos = [];

    for (let y = 0; y < A; y++) {
      const linha = linhas[y];
      const row = [];
      for (let x = 0; x < L; x++) {
        const ch = linha[x] || '#';
        if (ch === '#') {
          row.push('#');
        } else if (ch === 'X') {
          row.push('X');
          caixotes.push({ x, y });
        } else if (ch === 'D') {
          row.push('D');
          portas.push({ x, y });
        } else if (ch === 'O') {
          row.push('O');
          zonas.push({ x, y });
        } else if (ch === 'S') {
          row.push('S');
          saidas.push({ x, y });
        } else if (ch === 'E') {
          row.push('E');
          fugas.push({ x, y });
        } else if (ch === 'B') {
          row.push('B');
          bombas.push({ x, y });
        } else if (ch === 'M') {
          row.push('.');
          maletas.push({ x, y });
        } else if (ch === 'R') {
          row.push('.');
          refens.push({ x, y });
        } else if (ch === 'V') {
          row.push('.');
          alvosVivos.push({ x, y });
        } else if (ch >= '1' && ch <= '8') {
          row.push('.');
          opsPos[parseInt(ch, 10)] = { x, y };
        } else if (ch >= 'a' && ch <= 'l') {
          row.push('.');
          advPos[ch] = { x, y };
        } else {
          row.push('.');
        }
      }
      grade.push(row);
    }

    const salaId = Array.from({ length: A }, () => Array(L).fill(-1));
    let numSalas = 0;
    for (let y = 0; y < A; y++) {
      for (let x = 0; x < L; x++) {
        if (grade[y][x] !== '#' && grade[y][x] !== 'D' && salaId[y][x] === -1) {
          const id = numSalas++;
          const fila = [{ x, y }];
          salaId[y][x] = id;
          while (fila.length) {
            const p = fila.shift();
            const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
            for (const [dx, dy] of dirs) {
              const nx = p.x + dx, ny = p.y + dy;
              if (nx >= 0 && nx < L && ny >= 0 && ny < A) {
                if (grade[ny][nx] !== '#' && grade[ny][nx] !== 'D' && salaId[ny][nx] === -1) {
                  salaId[ny][nx] = id;
                  fila.push({ x: nx, y: ny });
                }
              }
            }
          }
        }
      }
    }

    return {
      L, A, grade, salaId, numSalas,
      opsPos, advPos, portas, caixotes,
      zonas, saidas, fugas, bombas, maletas, refens, alvosVivos
    };
  }

  function ehAndavel(mapa, x, y) {
    const gx = Math.round(x);
    const gy = Math.round(y);
    if (gx < 0 || gx >= mapa.L || gy < 0 || gy >= mapa.A) return false;
    const c = mapa.grade[gy][gx];
    return c !== '#' && c !== 'X';
  }

  function ehParede(mapa, x, y) {
    const gx = Math.round(x);
    const gy = Math.round(y);
    if (gx < 0 || gx >= mapa.L || gy < 0 || gy >= mapa.A) return true;
    return mapa.grade[gy][gx] === '#';
  }

  function ajustaPontoAndavel(mapa, x, y) {
    const gx = Math.round(x), gy = Math.round(y);
    if (ehAndavel(mapa, gx, gy)) return { x, y };
    const ordDy = [1, 0, -1, 2, -2];
    const ordDx = [0, -1, 1, -2, 2];
    for (const dy of ordDy) {
      for (const dx of ordDx) {
        const nx = gx + dx, ny = gy + dy;
        if (ehAndavel(mapa, nx, ny) && mapa.grade[ny][nx] !== 'D') {
          return { x: nx, y: ny };
        }
      }
    }
    for (let r = 1; r <= 3; r++) {
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (ehAndavel(mapa, gx + dx, gy + dy)) {
            return { x: gx + dx, y: gy + dy };
          }
        }
      }
    }
    return { x, y };
  }

  function temVisaoGranada(mapa, ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay);
    if (d < 0.05) return true;
    const passos = Math.ceil(d * 8);
    for (let i = 1; i < passos; i++) {
      const t = i / passos;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const gx = Math.round(x);
      const gy = Math.round(y);
      if (gx < 0 || gx >= mapa.L || gy < 0 || gy >= mapa.A) return false;
      if (mapa.grade[gy][gx] === '#') return false;
    }
    return true;
  }

  function temVisao(mapa, ax, ay, bx, by, permiteFatiar) {
    const d = Math.hypot(bx - ax, by - ay);
    if (d < 0.05) return true;
    const passos = Math.ceil(d * 8);
    let cruzouPorta = null;
    for (let i = 1; i < passos; i++) {
      const t = i / passos;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const gx = Math.round(x);
      const gy = Math.round(y);
      if (gx < 0 || gx >= mapa.L || gy < 0 || gy >= mapa.A) return false;
      const cell = mapa.grade[gy][gx];
      if (cell === '#') return false;
      if (cell === 'D' && !cruzouPorta) {
        cruzouPorta = { x: gx, y: gy };
      }
    }
    if (cruzouPorta) {
      const da = Math.hypot(ax - cruzouPorta.x, ay - cruzouPorta.y);
      const db = Math.hypot(bx - cruzouPorta.x, by - cruzouPorta.y);
      const limPerto = permiteFatiar ? 2.2 : 0.85;
      if (Math.min(da, db) > limPerto || Math.max(da, db) > 5.5) return false;
    }
    return true;
  }

  function linhaLivreMovimento(mapa, ax, ay, bx, by) {
    const d = Math.hypot(bx - ax, by - ay);
    if (d < 0.05) return true;
    const passos = Math.ceil(d * 8);
    for (let i = 1; i <= passos; i++) {
      const t = i / passos;
      const x = ax + (bx - ax) * t;
      const y = ay + (by - ay) * t;
      const gx = Math.round(x);
      const gy = Math.round(y);
      if (!ehAndavel(mapa, gx, gy)) return false;
      for (const ox of [-0.26, 0.26]) {
        for (const oy of [-0.26, 0.26]) {
          if (!ehAndavel(mapa, Math.round(x + ox), Math.round(y + oy))) return false;
        }
      }
    }
    return true;
  }

  function caminhoCurto(mapa, ix, iy, fx, fy) {
    const ajustado = ajustaPontoAndavel(mapa, fx, fy);
    fx = ajustado.x;
    fy = ajustado.y;
    const sx = Math.round(ix), sy = Math.round(iy);
    const tx = Math.round(fx), ty = Math.round(fy);
    if (sx === tx && sy === ty) return [{ x: fx, y: fy }];
    if (linhaLivreMovimento(mapa, ix, iy, fx, fy)) {
      return [{ x: fx, y: fy }];
    }

    const L = mapa.L, A = mapa.A;
    const chave = (x, y) => y * L + x;
    const aberto = [{ x: sx, y: sy, g: 0, f: Math.hypot(tx - sx, ty - sy) }];
    const gScore = new Map();
    const veioDe = new Map();
    gScore.set(chave(sx, sy), 0);
    const fechado = new Set();

    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2]
    ];

    while (aberto.length > 0) {
      aberto.sort((a, b) => a.f - b.f);
      const atual = aberto.shift();
      const ck = chave(atual.x, atual.y);
      if (atual.x === tx && atual.y === ty) {
        const bruta = [];
        let cur = { x: tx, y: ty };
        while (cur) {
          bruta.unshift(cur);
          cur = veioDe.get(chave(cur.x, cur.y));
        }
        if (bruta.length > 1) bruta.shift();
        const suave = [];
        let ancX = ix, ancY = iy;
        let idx = 0;
        while (idx < bruta.length) {
          let melhor = idx;
          for (let j = bruta.length - 1; j > idx; j--) {
            if (linhaLivreMovimento(mapa, ancX, ancY, bruta[j].x, bruta[j].y)) {
              melhor = j;
              break;
            }
          }
          suave.push({ x: bruta[melhor].x, y: bruta[melhor].y });
          ancX = bruta[melhor].x;
          ancY = bruta[melhor].y;
          idx = melhor + 1;
        }
        return suave;
      }
      fechado.add(ck);

      for (const [dx, dy, custo] of dirs) {
        const nx = atual.x + dx;
        const ny = atual.y + dy;
        if (!ehAndavel(mapa, nx, ny)) continue;
        if (dx !== 0 && dy !== 0) {
          if (!ehAndavel(mapa, atual.x + dx, atual.y) || !ehAndavel(mapa, atual.x, atual.y + dy)) continue;
        }
        const nk = chave(nx, ny);
        if (fechado.has(nk)) continue;
        const tentG = atual.g + custo;
        const prevG = gScore.get(nk);
        if (prevG === undefined || tentG < prevG) {
          veioDe.set(nk, { x: atual.x, y: atual.y });
          gScore.set(nk, tentG);
          aberto.push({ x: nx, y: ny, g: tentG, f: tentG + Math.hypot(tx - nx, ty - ny) });
        }
      }
    }

    return [{ x: fx, y: fy }];
  }

  function temCoberturaContra(mapa, estado, alvo, atirador) {
    if (alvo.fatiando || alvo.cobertoBatente > 0) return true;
    if (alvo.time === 'op' && !alvo.andando && alvo.segurando) {
      for (const p of mapa.portas) {
        if (dist(alvo.x, alvo.y, p.x, p.y) <= 1.5 && dist(alvo.x, alvo.y, p.x, p.y) > 0.4) return true;
      }
    }
    const angTiro = angEntre(alvo.x, alvo.y, atirador.x, atirador.y);
    for (const d of [0.65, 1.0, 1.35]) {
      for (const deltaAng of [-32, 0, 32]) {
        const r = (angTiro + deltaAng) * (Math.PI / 180);
        const cx = Math.round(alvo.x + Math.cos(r) * d);
        const cy = Math.round(alvo.y + Math.sin(r) * d);
        if (cx >= 0 && cx < mapa.L && cy >= 0 && cy < mapa.A) {
          const tile = mapa.grade[cy][cx];
          if (tile === 'X') return true;
          if (tile === '#' && Math.hypot(cx - alvo.x, cy - alvo.y) <= 1.35) {
            const distLinha = distPontoSeg(cx, cy, alvo.x, alvo.y, atirador.x, atirador.y);
            if (distLinha < 0.9) return true;
          }
        }
      }
    }
    if (estado) {
      const aliados = alvo.time === 'op' ? estado.ops : estado.advs;
      for (const al of aliados) {
        if (al.id !== alvo.id && al.vivo && !al.ferido && al.classe === 'escudo') {
          const dEsc = dist(alvo.x, alvo.y, al.x, al.y);
          if (dEsc <= 2.2) {
            const angEsc = angEntre(alvo.x, alvo.y, al.x, al.y);
            if (diffAng(angEsc, angTiro) <= 75) return true;
          }
        }
      }
    }
    return false;
  }

  function temCoberturaQualquer(mapa, x, y) {
    const gx = Math.round(x), gy = Math.round(y);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
    for (const [dx, dy] of dirs) {
      const nx = gx + dx, ny = gy + dy;
      if (nx >= 0 && nx < mapa.L && ny >= 0 && ny < mapa.A) {
        if (mapa.grade[ny][nx] === 'X' || mapa.grade[ny][nx] === 'D') return true;
      }
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = gx + dx, ny = gy + dy;
      if (nx >= 0 && nx < mapa.L && ny >= 0 && ny < mapa.A && mapa.grade[ny][nx] === '#') {
        return true;
      }
    }
    return false;
  }

  function achaPortaOuQuinaPerto(mapa, x, y) {
    let melhor = null;
    let menorD = 2.8;
    for (const p of mapa.portas) {
      const d = dist(x, y, p.x, p.y);
      if (d <= menorD) {
        menorD = d;
        melhor = { x: p.x, y: p.y, tipo: 'porta' };
      }
    }
    if (melhor) return melhor;
    const gx = Math.round(x), gy = Math.round(y);
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = gx + dx, ny = gy + dy;
        if (nx >= 0 && nx < mapa.L && ny >= 0 && ny < mapa.A && mapa.grade[ny][nx] === '#') {
          let chaoViz = 0;
          for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            if (ehAndavel(mapa, nx + ox, ny + oy)) chaoViz++;
          }
          if (chaoViz >= 2) {
            const d = dist(x, y, nx, ny);
            if (d <= menorD) {
              menorD = d;
              melhor = { x: nx, y: ny, tipo: 'quina' };
            }
          }
        }
      }
    }
    return melhor;
  }

  function podeVer(estado, observador, alvo) {
    if (!observador.vivo || observador.ferido || observador.atordoado > 0) return false;
    if (!alvo.vivo) return false;
    const d = dist(observador.x, observador.y, alvo.x, alvo.y);
    if (d > C.ALCANCE) return false;
    const olhandoPorta = Boolean(
      (observador.time === 'op' && (observador.fatiando || (observador.segurando && !observador.andando))) ||
      (alvo.time === 'op' && (alvo.fatiando || (alvo.segurando && !alvo.andando)))
    );
    if (!temVisao(estado.mapa, observador.x, observador.y, alvo.x, alvo.y, olhandoPorta)) return false;

    const raioPerif = (observador.time === 'adv' && observador.tranquilo && alvo.ritmoAtual === 'furtivo')
      ? 0.65
      : C.PERIFERICA;
    if (d <= raioPerif) return true;

    let alvoIluminado = false;
    if (estado.escuro) {
      if (alvo.lanterna || alvo.contraluz) {
        alvoIluminado = true;
      }
    }

    const alcanceMax = estado.escuro
      ? (observador.lanterna || alvoIluminado ? C.ALCANCE : C.ALCANCE_ESCURO)
      : C.ALCANCE;

    if (d > alcanceMax) return false;

    if (estado.escuro && alvoIluminado && d <= C.ALCANCE) {
      return true;
    }

    const cone = observador.classe === 'atirador' ? C.CONE_ATIRADOR : C.CONE;
    const ang = angEntre(observador.x, observador.y, alvo.x, alvo.y);
    return diffAng(observador.ang, ang) <= cone * 0.5;
  }

  function criaUnidade(dados, idx, time) {
    const pts = (dados.pts && dados.pts.length)
      ? dados.pts.map(p => ({
        x: p.x,
        y: p.y,
        ritmo: p.ritmo || 'andar',
        ordem: p.ordem ? JSON.parse(JSON.stringify(p.ordem)) : null,
        ordens: p.ordens ? JSON.parse(JSON.stringify(p.ordens)) : null
      }))
      : [{ x: dados.x || 0, y: dados.y || 0, ritmo: 'andar', ordem: null }];

    const p0 = pts[0];
    let angInicial = dados.ang !== undefined ? dados.ang : (time === 'op' ? -90 : 90);
    if (pts.length > 1 && (pts[1].x !== p0.x || pts[1].y !== p0.y)) {
      angInicial = angEntre(p0.x, p0.y, pts[1].x, pts[1].y);
    } else if (p0.ordem && p0.ordem.ang !== undefined) {
      angInicial = p0.ordem.ang;
    }

    return {
      id: dados.id || (time === 'op' ? String(idx + 1) : String.fromCharCode(97 + idx)),
      num: idx + 1,
      nome: dados.nome || (time === 'op' ? `Op ${idx + 1}` : `Hostil ${idx + 1}`),
      time,
      classe: (dados.classe || 'fuzileiro').toLowerCase(),
      equipe: dados.equipe || (idx < 4 ? 'alfa' : 'bravo'),
      x: p0.x,
      y: p0.y,
      ang: angInicial,
      vivo: dados.chegaEm ? false : true,
      chegaEm: dados.chegaEm || 0,
      entrouReforco: dados.chegaEm ? false : true,
      ferido: false,
      tempoFerido: 0,
      baixaCritica: false,
      enfaixado: false,
      medkits: (dados.classe || '').toLowerCase() === 'medico' ? C.FERIDO.medkits : 0,
      socorrer: Boolean(dados.socorrer),
      socorrendoAlvo: null,
      tempoTratar: 0,
      seguir: dados.seguir || null,
      pts,
      ptIdx: 0,
      subCaminho: [],
      ritmoAtual: pts[0]?.ritmo || 'andar',
      andando: false,
      tempoCorrendoRecente: 0,
      paradoTempo: 0,
      tempoEmPorta: 0,
      segurando: false,
      fatiando: false,
      tempoFatiar: 0,
      cobertoBatente: 0,
      esperandoTempo: 0,
      esperandoSinal: null,
      ordemConcluidaNoPt: false,
      filaOrdensPt: [],
      atordoado: 0,
      suprimido: 0,
      lanterna: Boolean(dados.lanterna),
      usouLanterna: Boolean(dados.lanterna),
      tempoLanternaParado: 0,
      contraluz: false,
      taserCargas: 1,
      carregandoMaleta: false,
      tranquilo: time === 'adv' ? !dados.alertaInicial : false,
      surpreendido: false,
      alerta: time === 'adv' ? Boolean(dados.alertaInicial) : true,
      planoAlerta: dados.planoAlerta ? JSON.parse(JSON.stringify(dados.planoAlerta)) : null,
      trocouPlanoAlerta: false,
      patrulhaLoop: Boolean(dados.loop),
      viuOps: {},
      alvoAtual: null,
      reacaoRestante: 0,
      tirosRestantesRajada: 0,
      cooldownTiro: 0,
      tempoBloqueado: 0,
      bloqueadoEmitido: false,
      salaAtual: -1,
      entrouSalaT: {},
      usouSegurar: false
    };
  }

  function preparaOrdensDoPonto(u, pt) {
    const lista = [];
    if (Array.isArray(pt.ordens)) {
      for (const o of pt.ordens) lista.push(Object.assign({}, o));
    } else if (pt.ordem) {
      lista.push(Object.assign({}, pt.ordem));
      if (pt.ordem.depois) {
        lista.push(Object.assign({}, pt.ordem.depois));
      }
    }
    u.filaOrdensPt = lista;
    u.ordemConcluidaNoPt = false;
  }

  function SIM_cria(missao, planoUsuario, semente, opcoes) {
    const opts = opcoes || {};
    const sem = semente !== undefined ? semente : (missao.semente || 1000);
    const rng = criaRng(sem);
    const mapa = parseMapa(missao.mapa);

    const listaInimigo = (missao.inimigo && missao.inimigo.length) ? missao.inimigo : [[]];
    const idxInimigo = opts.veterano
      ? (listaInimigo.length - 1)
      : (Math.abs(sem) % listaInimigo.length);
    const configInimigo = listaInimigo[idxInimigo] || [];

    const timeBase = missao.time || [];
    const numOps = timeBase.length || Object.keys(mapa.opsPos).length || 2;
    const ops = [];
    for (let i = 0; i < numOps; i++) {
      const infoOp = timeBase[i] || {};
      const posMapa = mapa.opsPos[i + 1] || infoOp.pos || { x: 2 + i, y: mapa.A - 2 };
      const pl = (planoUsuario && planoUsuario[i]) ? planoUsuario[i] : {};
      const pts = (pl.pts && pl.pts.length)
        ? pl.pts.map((p, idx) => {
          if (idx === 0) return Object.assign({}, p, { x: posMapa.x, y: posMapa.y });
          const aj = ajustaPontoAndavel(mapa, p.x, p.y);
          return Object.assign({}, p, { x: aj.x, y: aj.y });
        })
        : [{ x: posMapa.x, y: posMapa.y, ritmo: 'andar', ordem: null }];

      const op = criaUnidade({
        id: String(i + 1),
        nome: infoOp.nome || `Op ${i + 1}`,
        classe: pl.classe || infoOp.classe || 'fuzileiro',
        equipe: pl.equipe || infoOp.equipe || (i < Math.ceil(numOps / 2) ? 'alfa' : 'bravo'),
        pts,
        socorrer: pl.socorrer !== undefined ? pl.socorrer : ((pl.classe || infoOp.classe) === 'medico'),
        seguir: pl.seguir || null,
        ang: infoOp.ang !== undefined ? infoOp.ang : -90
      }, i, 'op');

      op.salaAtual = mapa.salaId[Math.round(op.y)]?.[Math.round(op.x)] ?? -1;
      preparaOrdensDoPonto(op, op.pts[0]);
      ops.push(op);
    }

    for (const op of ops) {
      if (op.seguir) {
        const lider = ops.find(o => o.num === Number(op.seguir) || o.id === String(op.seguir));
        if (lider && op.pts.length <= 2) {
          const ordemFinal = op.pts[op.pts.length - 1]?.ordem || null;
          const novosPts = [{ x: op.x, y: op.y, ritmo: 'andar', ordem: null }];
          for (let k = 1; k < lider.pts.length; k++) {
            const lp = lider.pts[k];
            const ant = lider.pts[k - 1];
            const dx = lp.x - ant.x;
            const dy = lp.y - ant.y;
            const l = Math.hypot(dx, dy) || 1;
            let sx = Math.round(lp.x - (dx / l));
            let sy = Math.round(lp.y - (dy / l));
            if (!ehAndavel(mapa, sx, sy)) {
              sx = lp.x;
              sy = lp.y;
            }
            novosPts.push({
              x: sx,
              y: sy,
              ritmo: lp.ritmo || 'andar',
              ordem: k === lider.pts.length - 1 ? ordemFinal : null
            });
          }
          op.pts = novosPts;
          preparaOrdensDoPonto(op, op.pts[0]);
        }
      }
    }

    const advs = [];
    const chavesAdv = Object.keys(mapa.advPos).sort();
    const totalAdv = Math.max(chavesAdv.length, configInimigo.length);
    for (let i = 0; i < totalAdv; i++) {
      const cfg = configInimigo[i] || {};
      const letra = cfg.id || chavesAdv[i] || String.fromCharCode(97 + i);
      const posMapa = mapa.advPos[letra] || cfg.pos || (cfg.pts && cfg.pts[0]) || { x: 5, y: 2 };
      const pts = (cfg.pts && cfg.pts.length)
        ? cfg.pts.map((p, idx) => idx === 0 && !cfg.chegaEm ? Object.assign({}, p, { x: posMapa.x, y: posMapa.y }) : Object.assign({}, p))
        : [{ x: posMapa.x, y: posMapa.y, ritmo: 'andar', ordem: cfg.ang !== undefined ? { t: 'segurar', ang: cfg.ang } : null }];

      const adv = criaUnidade({
        id: letra,
        nome: cfg.nome || `Hostil ${letra.toUpperCase()}`,
        classe: cfg.classe || 'fuzileiro',
        pts,
        ang: cfg.ang !== undefined ? cfg.ang : 90,
        chegaEm: cfg.chegaEm || 0,
        alertaInicial: Boolean(cfg.alerta || missao.alertaInicial || opts.alertaInicial),
        planoAlerta: cfg.alertaPts || null,
        loop: cfg.loop !== undefined ? cfg.loop : (pts.length > 1)
      }, i, 'adv');

      if (pts.length === 1) adv.segurando = true;
      adv.salaAtual = mapa.salaId[Math.round(adv.y)]?.[Math.round(adv.x)] ?? -1;
      preparaOrdensDoPonto(adv, adv.pts[0]);
      advs.push(adv);
    }

    const refens = mapa.refens.map((p, idx) => ({
      id: `R${idx + 1}`,
      x: p.x,
      y: p.y,
      vivo: true,
      seguindo: null,
      extraido: false,
      escoltaPts: (missao.escoltaPts && idx === 0) ? JSON.parse(JSON.stringify(missao.escoltaPts)) : null,
      ptIdx: 0,
      subCaminho: []
    }));

    const alvosVivos = mapa.alvosVivos.map((p, idx) => ({
      id: `V${idx + 1}`,
      nome: missao.nomeAlvoVivo || 'Alvo Vivo',
      x: p.x,
      y: p.y,
      ang: missao.angAlvoVivo !== undefined ? missao.angAlvoVivo : 90,
      vivo: true,
      rendido: false,
      extraido: false,
      fugiu: false,
      alerta: false,
      atordoado: 0,
      suprimido: 0,
      progressoRender: 0,
      seguindo: null,
      subCaminho: [],
      fugaAlvo: null,
      cooldownTiro: 0,
      reacaoRestante: 0.45
    }));

    const maletas = mapa.maletas.map((p, idx) => ({
      id: `M${idx + 1}`,
      x: p.x,
      y: p.y,
      pegaPor: null,
      extraida: false
    }));

    const bombas = mapa.bombas.map((p, idx) => ({
      id: `B${idx + 1}`,
      x: p.x,
      y: p.y,
      progresso: 0,
      desarmada: false
    }));

    const salasComInimigo = new Set();
    for (const adv of advs) {
      if (adv.salaAtual >= 0) salasComInimigo.add(adv.salaAtual);
    }

    return {
      missao,
      semente: sem,
      rng,
      veterano: Boolean(opts.veterano),
      permiteFerido: (missao.id >= 16) || Boolean(missao.permiteFerido),
      escuro: Boolean(missao.escuro || opts.escuro),
      tempoMax: opts.tempoMax || missao.tempo || C.TEMPO_PADRAO,
      t: 0,
      passoNum: 0,
      terminou: false,
      venceu: false,
      motivo: '',
      mapa,
      ops,
      advs,
      refens,
      alvosVivos,
      maletas,
      bombas,
      granadas: [],
      disparosVisuais: [],
      eventos: [],
      baixas: [],
      primeiroAlertaT: null,
      primeiraFacaT: null,
      refemPegoT: null,
      tempoDominio: 0,
      salasComInimigo,
      portasFatiadas: [],
      entradasSala: {},
      luzNaSalaT: {},
      violouDupla: false,
      violouFunil: false,
      violouLinhaLimpa: false,
      violouRetaguarda: false,
      violouPropria: false,
      violouSocorro: false,
      violouSalto: false,
      violouLuzCurta: false,
      violouSalaASala: false,
      frames: opts.gravarFrames !== false ? [] : null
    };
  }

  function regEvento(estado, ev) {
    const item = Object.assign({ t: Number(estado.t.toFixed(2)) }, ev);
    estado.eventos.push(item);
    return item;
  }

  function acionaAlerta(estado, adv, origemX, origemY, propagar) {
    if (!adv.vivo) return;
    const eraTranquilo = adv.tranquilo;
    adv.tranquilo = false;
    adv.alerta = true;
    if (estado.primeiroAlertaT === null) {
      estado.primeiroAlertaT = estado.t;
    }
    if (eraTranquilo) {
      regEvento(estado, { tipo: 'alerta', quem: adv.id, x: adv.x, y: adv.y });
      if (adv.planoAlerta && !adv.trocouPlanoAlerta) {
        adv.trocouPlanoAlerta = true;
        adv.pts = adv.planoAlerta.map(p => Object.assign({}, p));
        adv.ptIdx = 0;
        adv.subCaminho = [];
        preparaOrdensDoPonto(adv, adv.pts[0]);
      } else if (origemX !== undefined && origemY !== undefined) {
        adv.ang = angEntre(adv.x, adv.y, origemX, origemY);
        adv.segurando = true;
      }
      if (propagar) {
        for (const outro of estado.advs) {
          if (outro.id !== adv.id && outro.vivo && outro.tranquilo) {
            if (dist(adv.x, adv.y, outro.x, outro.y) <= C.BARULHO.grito) {
              acionaAlerta(estado, outro, origemX, origemY, false);
            }
          }
        }
      }
    }
    for (const v of estado.alvosVivos) {
      if (v.vivo && !v.rendido && !v.alerta) {
        if (dist(adv.x, adv.y, v.x, v.y) <= C.BARULHO.tiro) {
          v.alerta = true;
        }
      }
    }
  }

  function emiteBarulho(estado, x, y, raio, timeOrigem) {
    if (timeOrigem === 'op') {
      for (const adv of estado.advs) {
        if (adv.vivo && dist(x, y, adv.x, adv.y) <= raio) {
          acionaAlerta(estado, adv, x, y, true);
        }
      }
      for (const v of estado.alvosVivos) {
        if (v.vivo && !v.rendido && dist(x, y, v.x, v.y) <= raio) {
          v.alerta = true;
        }
      }
    }
  }

  function lancaGranada(estado, lancador, tipo, ordem) {
    const alcanceMax = tipo === 'luz' ? C.LUZ.alcance : C.IMPACTO.alcance;
    let tx, ty;
    if (ordem.x !== undefined && ordem.y !== undefined) {
      const d = dist(lancador.x, lancador.y, ordem.x, ordem.y);
      if (d <= alcanceMax) {
        tx = ordem.x;
        ty = ordem.y;
      } else {
        const ang = Math.atan2(ordem.y - lancador.y, ordem.x - lancador.x);
        tx = lancador.x + Math.cos(ang) * alcanceMax;
        ty = lancador.y + Math.sin(ang) * alcanceMax;
      }
    } else {
      const angRad = ((ordem.ang !== undefined ? ordem.ang : lancador.ang) * Math.PI) / 180;
      const distAlvo = ordem.dist !== undefined ? Math.min(alcanceMax, Math.max(4.0, ordem.dist)) : 4.2;
      tx = lancador.x + Math.cos(angRad) * distAlvo;
      ty = lancador.y + Math.sin(angRad) * distAlvo;
    }

    const passos = 25;
    let fx = lancador.x, fy = lancador.y;
    let bateuParede = false;
    for (let i = 1; i <= passos; i++) {
      const p = i / passos;
      const nx = lancador.x + (tx - lancador.x) * p;
      const ny = lancador.y + (ty - lancador.y) * p;
      if (ehParede(estado.mapa, nx, ny)) {
        bateuParede = true;
        break;
      }
      fx = nx;
      fy = ny;
    }

    // Se a linha reta bateu na parede ao lado de uma porta próxima, arremessa passando pela porta D
    if (bateuParede) {
      const portaPerto = estado.mapa.portas.find(pt => dist(lancador.x, lancador.y, pt.x, pt.y) <= 2.6);
      if (portaPerto && !ehParede(estado.mapa, tx, ty)) {
        fx = tx;
        fy = ty;
      }
    }

    estado.granadas.push({
      tipo,
      quem: lancador.id,
      time: lancador.time,
      ix: lancador.x,
      iy: lancador.y,
      x: fx,
      y: fy,
      restante: 0.25
    });
  }

  function detonaGranada(estado, g) {
    emiteBarulho(estado, g.x, g.y, C.BARULHO.granada, g.time);
    const salaG = estado.mapa.salaId[Math.round(g.y)]?.[Math.round(g.x)] ?? -1;

    if (g.tipo === 'luz') {
      regEvento(estado, { tipo: 'luz', quem: g.quem, x: g.x, y: g.y });
      if (salaG >= 0) {
        estado.luzNaSalaT[salaG] = estado.t;
      }
      const todos = [...estado.ops, ...estado.advs];
      for (const u of todos) {
        if (!u.vivo) continue;
        const d = dist(g.x, g.y, u.x, u.y);
        if (d <= C.LUZ.raio + 0.45 && temVisaoGranada(estado.mapa, g.x, g.y, u.x, u.y)) {
          const salaU = estado.mapa.salaId[Math.round(u.y)]?.[Math.round(u.x)] ?? -1;
          if (u.time === g.time && (salaU !== salaG || d > 1.5)) {
            continue;
          }
          u.atordoado = Math.max(u.atordoado, C.LUZ.tempo);
          if (u.time === 'op' && g.time === 'op') {
            estado.violouPropria = true;
          }
          if (u.time === 'adv') {
            acionaAlerta(estado, u, g.x, g.y, false);
          }
        }
      }
      for (const v of estado.alvosVivos) {
        if (v.vivo && !v.rendido && dist(g.x, g.y, v.x, v.y) <= C.LUZ.raio && temVisaoGranada(estado.mapa, g.x, g.y, v.x, v.y)) {
          v.atordoado = Math.max(v.atordoado, C.LUZ.tempo);
          v.alerta = true;
        }
      }
    } else if (g.tipo === 'impacto') {
      regEvento(estado, { tipo: 'impacto', quem: g.quem, x: g.x, y: g.y });
      for (const r of estado.refens) {
        if (r.vivo && dist(g.x, g.y, r.x, r.y) <= C.IMPACTO.raio && temVisaoGranada(estado.mapa, g.x, g.y, r.x, r.y)) {
          r.vivo = false;
          estado.violouPropria = true;
          estado.terminou = true;
          estado.venceu = false;
          estado.motivo = 'refem';
          regEvento(estado, { tipo: 'baixa', quem: g.quem, alvo: r.id, x: r.x, y: r.y, causa: 'propria' });
        }
      }
      for (const v of estado.alvosVivos) {
        if (v.vivo && dist(g.x, g.y, v.x, v.y) <= C.IMPACTO.raio && temVisaoGranada(estado.mapa, g.x, g.y, v.x, v.y)) {
          v.vivo = false;
          estado.violouPropria = true;
          estado.terminou = true;
          estado.venceu = false;
          estado.motivo = 'alvo_morto';
          regEvento(estado, { tipo: 'baixa', quem: g.quem, alvo: v.id, x: v.x, y: v.y, causa: 'propria' });
        }
      }
      const todos = [...estado.ops, ...estado.advs];
      for (const u of todos) {
        if (!u.vivo) continue;
        const d = dist(g.x, g.y, u.x, u.y);
        if (d <= C.IMPACTO.raio && temVisaoGranada(estado.mapa, g.x, g.y, u.x, u.y)) {
          if (u.time === 'op') {
            if (g.time === 'op') estado.violouPropria = true;
            aplicaBaixaOp(estado, u, { id: g.quem, time: g.time, x: g.x, y: g.y }, true, g.time === 'op' ? 'propria' : 'agrupado');
          } else {
            const eraTranquilo = u.tranquilo || u.surpreendido;
            u.vivo = false;
            regEvento(estado, { tipo: 'baixa', quem: g.quem, alvo: u.id, x: u.x, y: u.y, causa: 'impacto', tranquilo: eraTranquilo });
          }
        }
      }
    }
  }

  function diagnosticaCausaBaixa(estado, op, atirador, causaForcada) {
    if (causaForcada) return causaForcada;
    const gx = Math.round(op.x), gy = Math.round(op.y);
    if (estado.mapa.grade[gy]?.[gx] === 'D') return 'funil';
    if (!op.andando && op.paradoTempo > 1.0 && !temCoberturaContra(estado.mapa, estado, op, atirador)) return 'aberto';
    if ((op.andando && op.ritmoAtual === 'correr') || op.tempoCorrendoRecente > 0) return 'correndo';
    for (const outro of estado.ops) {
      if (outro.id !== op.id && outro.vivo && !outro.ferido && dist(op.x, op.y, outro.x, outro.y) < 1.5) {
        return 'agrupado';
      }
    }
    const angAtirador = angEntre(op.x, op.y, atirador.x, atirador.y);
    const cone = op.classe === 'atirador' ? C.CONE_ATIRADOR : C.CONE;
    if (diffAng(op.ang, angAtirador) > cone * 0.5) return 'costas';

    let alguemCobrindo = false;
    for (const outro of estado.ops) {
      if (outro.id !== op.id && outro.vivo && !outro.ferido) {
        if (temVisao(estado.mapa, outro.x, outro.y, atirador.x, atirador.y) ||
            temVisao(estado.mapa, outro.x, outro.y, op.x, op.y)) {
          alguemCobrindo = true;
          break;
        }
      }
    }
    if (!alguemCobrindo) return 'sozinho';
    return 'duelo';
  }

  function aplicaBaixaOp(estado, op, atirador, forcarCritica, causaForcada) {
    const causa = diagnosticaCausaBaixa(estado, op, atirador, causaForcada);
    if (causa === 'costas') estado.violouRetaguarda = true;

    const d = atirador && atirador.x !== undefined ? dist(op.x, op.y, atirador.x, atirador.y) : 5;
    const ehCritica = !estado.permiteFerido || forcarCritica || op.ferido || d <= C.FERIDO.distCritica;

    if (op.carregandoMaleta) {
      op.carregandoMaleta = false;
      const m = estado.maletas.find(ml => ml.pegaPor === op.id);
      if (m) {
        m.pegaPor = null;
        m.x = op.x;
        m.y = op.y;
      }
    }
    for (const r of estado.refens) {
      if (r.seguindo === op.id) r.seguindo = null;
    }
    for (const v of estado.alvosVivos) {
      if (v.seguindo === op.id) v.seguindo = null;
    }

    if (ehCritica) {
      op.vivo = false;
      op.ferido = false;
      op.baixaCritica = true;
      const ev = { tipo: 'baixa', quem: atirador ? atirador.id : '?', alvo: op.id, x: op.x, y: op.y, causa };
      regEvento(estado, ev);
      estado.baixas.push(ev);
    } else {
      op.ferido = true;
      op.tempoFerido = C.FERIDO.tempo;
      op.andando = false;
      const ev = { tipo: 'ferido', quem: atirador ? atirador.id : '?', alvo: op.id, x: op.x, y: op.y, causa };
      regEvento(estado, ev);
      estado.baixas.push(ev);
    }
  }

  function executaOrdensNoPonto(estado, u, dt) {
    if (u.esperandoTempo > 0) {
      u.esperandoTempo -= dt;
      if (u.esperandoTempo > 0) return false;
      u.esperandoTempo = 0;
    }

    if (u.fatiando) {
      u.tempoFatiar -= dt;
      u.cobertoBatente = 3.0;
      if (u.tempoFatiar < 0.65 && !temAdversarioVisivel(estado, u)) {
        u.tempoFatiar = 0;
      }
      if (u.tempoFatiar > 0) return false;
      u.fatiando = false;
    }

    if (u.esperandoSinal) {
      const alvoOp = estado.ops.find(o => o.num === Number(u.esperandoSinal.de) || o.id === String(u.esperandoSinal.de));
      const concluiuPt = alvoOp && (
        alvoOp.ptIdx > u.esperandoSinal.pt ||
        (alvoOp.ptIdx === u.esperandoSinal.pt && alvoOp.ordemConcluidaNoPt && !alvoOp.fatiando && alvoOp.esperandoTempo <= 0)
      );
      if (alvoOp && (!alvoOp.vivo || alvoOp.ferido || concluiuPt)) {
        u.esperandoSinal = null;
      } else {
        return false;
      }
    }

    while (u.filaOrdensPt && u.filaOrdensPt.length > 0) {
      const ord = u.filaOrdensPt.shift();
      if (!ord || !ord.t) continue;

      if (ord.t === 'esperar') {
        u.esperandoTempo = Number(ord.s) || 1;
        u.segurando = false;
        return false;
      } else if (ord.t === 'segurar') {
        if (ord.ang !== undefined) u.ang = Number(ord.ang);
        u.segurando = true;
        u.usouSegurar = true;
        if (ord.s !== undefined && ord.s !== null && Number(ord.s) > 0) {
          u.esperandoTempo = Number(ord.s);
          return false;
        }
        if (u.ptIdx >= u.pts.length - 1 && u.filaOrdensPt.length === 0) {
          return false;
        }
      } else if (ord.t === 'fatiar') {
        const pq = achaPortaOuQuinaPerto(estado.mapa, u.x, u.y) || { x: u.x, y: u.y - 1, tipo: 'porta' };
        u.ang = ord.ang !== undefined ? Number(ord.ang) : angEntre(u.x, u.y, pq.x, pq.y);
        u.fatiando = true;
        u.segurando = true;
        u.usouSegurar = true;
        u.tempoFatiar = 1.45;
        u.cobertoBatente = 3.0;
        estado.portasFatiadas.push({ op: u.id, x: pq.x, y: pq.y, t: estado.t });
        return false;
      } else if (ord.t === 'sinal') {
        u.esperandoSinal = { de: ord.de, pt: Number(ord.pt) || 1 };
        if (ord.ang !== undefined) {
          u.ang = Number(ord.ang);
          u.segurando = true;
          u.usouSegurar = true;
        }
        return false;
      } else if (ord.t === 'luz') {
        if (ord.ang !== undefined) u.ang = Number(ord.ang);
        lancaGranada(estado, u, 'luz', ord);
        u.esperandoTempo = 0.30;
        return false;
      } else if (ord.t === 'impacto') {
        if (ord.ang !== undefined) u.ang = Number(ord.ang);
        lancaGranada(estado, u, 'impacto', ord);
        u.esperandoTempo = 0.30;
        return false;
      } else if (ord.t === 'taser') {
        for (const v of estado.alvosVivos) {
          if (v.vivo && !v.rendido && u.taserCargas > 0) {
            if (dist(u.x, u.y, v.x, v.y) <= C.TASER.alcance + 0.8 && temVisao(estado.mapa, u.x, u.y, v.x, v.y)) {
              u.taserCargas--;
              v.atordoado = Math.max(v.atordoado, C.TASER.tempo);
              regEvento(estado, { tipo: 'taser', quem: u.id, alvo: v.id, x: v.x, y: v.y });
              break;
            }
          }
        }
      } else if (ord.t === 'lanterna') {
        u.lanterna = ord.liga !== undefined ? Boolean(ord.liga) : !u.lanterna;
        if (u.lanterna) u.usouLanterna = true;
      }
    }

    u.ordemConcluidaNoPt = true;
    return true;
  }

  function vaiEsfaquearEmFurtivo(estado, u) {
    if (u.time !== 'op' || u.fatiando || u.cobertoBatente > 0) return false;
    const proxPt = u.pts[u.ptIdx + 1];
    if (!proxPt || proxPt.ritmo !== 'furtivo') return false;
    for (const adv of estado.advs) {
      if (adv.vivo && adv.tranquilo && !adv.viuOps[u.id] && dist(proxPt.x, proxPt.y, adv.x, adv.y) <= 1.65) {
        return true;
      }
    }
    return false;
  }

  function temAdversarioAtivoVisivel(estado, u) {
    const inimigos = u.time === 'op' ? estado.advs : estado.ops;
    for (const inim of inimigos) {
      if (!inim.vivo || inim.ferido) continue;
      if (u.time === 'op') {
        if (inim.tranquilo || inim.atordoado > 0 || inim.suprimido > 0) continue;
      }
      if (podeVer(estado, u, inim)) return true;
    }
    return false;
  }

  function temAdversarioVisivel(estado, u) {
    const inimigos = u.time === 'op' ? estado.advs : estado.ops;
    for (const inim of inimigos) {
      if (!inim.vivo || inim.ferido) continue;
      if (podeVer(estado, u, inim)) return true;
    }
    return false;
  }

  function atualizaMovimentoUnidade(estado, u, dt) {
    if (!u.vivo) {
      if (u.chegaEm > 0 && !u.entrouReforco && estado.t >= u.chegaEm) {
        u.vivo = true;
        u.entrouReforco = true;
        u.alerta = true;
        u.tranquilo = false;
      }
      return;
    }
    if (u.ferido) return;
    if (u.cobertoBatente > 0) u.cobertoBatente = Math.max(0, u.cobertoBatente - dt);
    if (u.tempoCorrendoRecente > 0) u.tempoCorrendoRecente = Math.max(0, u.tempoCorrendoRecente - dt);

    if (u.atordoado > 0) {
      u.atordoado = Math.max(0, u.atordoado - dt);
      u.andando = false;
      return;
    }

    if (u.time === 'op' && u.socorrer && u.medkits > 0 && !temAdversarioVisivel(estado, u)) {
      if (u.socorrendoAlvo) {
        const paciente = estado.ops.find(o => o.id === u.socorrendoAlvo);
        if (!paciente || !paciente.vivo || !paciente.ferido) {
          u.socorrendoAlvo = null;
          u.tempoTratar = 0;
        } else {
          const dp = dist(u.x, u.y, paciente.x, paciente.y);
          if (dp <= 1.2) {
            u.andando = false;
            if (u.tempoTratar === 0) {
              for (const adv of estado.advs) {
                if (adv.vivo && temVisao(estado.mapa, adv.x, adv.y, u.x, u.y)) {
                  estado.violouSocorro = true;
                }
              }
            }
            u.tempoTratar += dt;
            if (u.tempoTratar >= C.FERIDO.tempoTratar) {
              paciente.ferido = false;
              paciente.enfaixado = true;
              paciente.tempoFerido = 0;
              u.medkits--;
              u.socorrendoAlvo = null;
              u.tempoTratar = 0;
              regEvento(estado, { tipo: 'tratado', quem: u.id, alvo: paciente.id, x: paciente.x, y: paciente.y });
            }
            return;
          } else {
            const sub = caminhoCurto(estado.mapa, u.x, u.y, paciente.x, paciente.y);
            const dest = sub[0] || { x: paciente.x, y: paciente.y };
            const vel = (C.VEL.andar / C.QUAD) * dt;
            const ang = Math.atan2(dest.y - u.y, dest.x - u.x);
            u.ang = ang * (180 / Math.PI);
            u.x += Math.cos(ang) * Math.min(vel, dist(u.x, u.y, dest.x, dest.y));
            u.y += Math.sin(ang) * Math.min(vel, dist(u.x, u.y, dest.x, dest.y));
            u.andando = true;
            return;
          }
        }
      } else {
        for (const fer of estado.ops) {
          if (fer.id !== u.id && fer.vivo && fer.ferido && dist(u.x, u.y, fer.x, fer.y) <= C.FERIDO.distSocorro) {
            u.socorrendoAlvo = fer.id;
            u.tempoTratar = 0;
            break;
          }
        }
      }
    }

    if (!u.ordemConcluidaNoPt) {
      const liberado = executaOrdensNoPonto(estado, u, dt);
      if (!liberado) {
        u.andando = false;
        u.paradoTempo += dt;
        return;
      }
    }

    const proxPt = u.pts[u.ptIdx + 1];
    const ritmoProx = proxPt ? (proxPt.ritmo || 'andar') : u.ritmoAtual;
    const gxAtual = Math.round(u.x), gyAtual = Math.round(u.y);
    const emPorta = estado.mapa.grade[gyAtual]?.[gxAtual] === 'D' ||
      estado.mapa.portas.some(p => dist(u.x, u.y, p.x, p.y) <= 1.6);
    const coladoEmColega = u.time === 'op' && estado.ops.some(o => o.id !== u.id && o.vivo && !o.ferido && dist(u.x, u.y, o.x, o.y) < 1.5);
    const temOrdemNoProx = Boolean(proxPt && proxPt.ordem && proxPt.ordem.t);
    const extraindo = u.carregandoMaleta ||
      estado.refens.some(r => r.seguindo === u.id) ||
      estado.alvosVivos.some(v => v.seguindo === u.id);

    if (temAdversarioAtivoVisivel(estado, u) && ritmoProx !== 'correr' && !emPorta && !coladoEmColega && !temOrdemNoProx && !extraindo && !vaiEsfaquearEmFurtivo(estado, u)) {
      u.andando = false;
      u.paradoTempo += dt;
      return;
    }

    if (u.ptIdx >= u.pts.length - 1) {
      if (u.time === 'adv' && u.tranquilo && u.patrulhaLoop && u.pts.length > 1) {
        u.pts.reverse();
        u.ptIdx = 0;
        u.subCaminho = [];
        preparaOrdensDoPonto(u, u.pts[0]);
      } else {
        u.andando = false;
        u.paradoTempo += dt;
        return;
      }
    }

    const alvoPt = u.pts[u.ptIdx + 1];
    u.ritmoAtual = alvoPt.ritmo || 'andar';
    if (u.classe === 'escudo' && u.ritmoAtual === 'correr') {
      u.ritmoAtual = 'andar';
    }
    if (u.ritmoAtual === 'correr') {
      u.tempoCorrendoRecente = 1.0;
    }

    if (dist(u.x, u.y, alvoPt.x, alvoPt.y) <= 0.08) {
      u.x = alvoPt.x;
      u.y = alvoPt.y;
      u.ptIdx++;
      u.subCaminho = [];
      preparaOrdensDoPonto(u, u.pts[u.ptIdx]);
      executaOrdensNoPonto(estado, u, 0);
      return;
    }

    if (!u.subCaminho || u.subCaminho.length === 0) {
      u.subCaminho = caminhoCurto(estado.mapa, u.x, u.y, alvoPt.x, alvoPt.y);
    }

    let velUnid = C.VEL[u.ritmoAtual] || C.VEL.andar;
    if (u.classe === 'batedor' && u.ritmoAtual === 'furtivo') {
      velUnid = C.VEL_BATEDOR_FURTIVO;
    }
    if (u.classe === 'apoio') {
      velUnid *= 0.85;
    }
    if (u.carregandoMaleta) {
      velUnid *= 0.85;
    }

    let passoDist = (velUnid / C.QUAD) * dt;
    u.andando = true;
    u.paradoTempo = 0;
    u.segurando = false;

    while (passoDist > 0 && u.subCaminho.length > 0) {
      const wp = u.subCaminho[0];
      const d = dist(u.x, u.y, wp.x, wp.y);
      const angMov = d > 0.001 ? angEntre(u.x, u.y, wp.x, wp.y) : u.ang;
      if (u.alvoAtual) {
        const inimAlvo = (u.time === 'op' ? estado.advs : estado.ops).find(a => a.id === u.alvoAtual && a.vivo);
        if (inimAlvo) {
          u.ang = angEntre(u.x, u.y, inimAlvo.x, inimAlvo.y);
        } else {
          u.ang = angMov;
        }
      } else if (u.time === 'op' && alvoPt.ordem && alvoPt.ordem.ang !== undefined && dist(u.x, u.y, alvoPt.x, alvoPt.y) <= 3.5) {
        u.ang = Number(alvoPt.ordem.ang);
      } else if (d > 0.001) {
        u.ang = angMov;
      }
      if (d <= passoDist) {
        u.x = wp.x;
        u.y = wp.y;
        passoDist -= d;
        u.subCaminho.shift();
      } else {
        const rad = (angMov * Math.PI) / 180;
        u.x += Math.cos(rad) * passoDist;
        u.y += Math.sin(rad) * passoDist;
        passoDist = 0;
      }
    }

    if (u.subCaminho.length === 0 && dist(u.x, u.y, alvoPt.x, alvoPt.y) <= 0.12) {
      u.x = alvoPt.x;
      u.y = alvoPt.y;
      u.ptIdx++;
      preparaOrdensDoPonto(u, u.pts[u.ptIdx]);
      executaOrdensNoPonto(estado, u, 0);
    }

    const gx = Math.round(u.x), gy = Math.round(u.y);
    if (u.ritmoAtual === 'correr') {
      emiteBarulho(estado, u.x, u.y, C.BARULHO.correr, u.time);
    } else if (u.time === 'op' && u.ritmoAtual !== 'furtivo') {
      if (estado.mapa.grade[gy]?.[gx] === 'D') {
        emiteBarulho(estado, u.x, u.y, C.BARULHO.passo, 'op');
      }
    }

    const novaSala = estado.mapa.salaId[gy]?.[gx] ?? -1;
    if (novaSala >= 0 && novaSala !== u.salaAtual) {
      u.salaAtual = novaSala;
      if (u.time === 'op') {
        if (!estado.entradasSala[novaSala]) estado.entradasSala[novaSala] = [];
        if (!u.entrouSalaT[novaSala]) {
          u.entrouSalaT[novaSala] = estado.t;
          estado.entradasSala[novaSala].push({
            op: u.id,
            t: estado.t,
            x: u.x,
            y: u.y
          });
          const temAdvVivoNaSala = estado.advs.some(a => a.vivo && a.salaAtual === novaSala);
          if (temAdvVivoNaSala && estado.entradasSala[novaSala].length === 1) {
            const fatiouPerto = estado.portasFatiadas.some(pf => dist(pf.x, pf.y, u.x, u.y) <= 3.8);
            if (!fatiouPerto) {
              estado.faltouFatiarSala = true;
            }
          }
        }
      }
    }
  }

  function linhaTiroBloqueada(estado, atirador, alvo) {
    if (atirador.time === 'op') {
      for (const col of estado.ops) {
        if (col.id !== atirador.id && col.vivo && !col.ferido) {
          if (col.classe === 'escudo' && dist(atirador.x, atirador.y, col.x, col.y) <= 2.0) {
            continue;
          }
          const dSeg = distPontoSeg(col.x, col.y, atirador.x, atirador.y, alvo.x, alvo.y);
          const dAtir = dist(atirador.x, atirador.y, col.x, col.y);
          const dAlvo = dist(atirador.x, atirador.y, alvo.x, alvo.y);
          if (dSeg < C.LINHA_BLOQ && dAtir < dAlvo) return true;
        }
      }
    }
    for (const r of estado.refens) {
      if (r.vivo && !r.extraido) {
        const dSeg = distPontoSeg(r.x, r.y, atirador.x, atirador.y, alvo.x, alvo.y);
        if (dSeg < C.LINHA_BLOQ) return true;
      }
    }
    for (const v of estado.alvosVivos) {
      if (v.vivo && !v.extraido) {
        const dSeg = distPontoSeg(v.x, v.y, atirador.x, atirador.y, alvo.x, alvo.y);
        if (dSeg < C.LINHA_BLOQ) return true;
      }
    }
    return false;
  }

  function calculaTempoReacao(estado, u, alvo) {
    let r = (u.andando || u.tempoCorrendoRecente > 0)
      ? ((u.ritmoAtual === 'correr' || u.tempoCorrendoRecente > 0) ? C.REACAO.correr : C.REACAO.andar)
      : (u.segurando ? C.REACAO.segurar : C.REACAO.andar);

    if ((alvo.andando && alvo.ritmoAtual === 'furtivo') || alvo.fatiando || alvo.cobertoBatente > 0) {
      r += C.REACAO.furtivoAlvo;
    }
    if (u.time === 'adv' && u.tranquilo) {
      r += C.REACAO.surpresa;
    }
    // Se dois ou mais operadores entraram na sala e se abriram para lados opostos (cantos), o defensor divide atenção
    if (u.time === 'adv') {
      const opsNaSala = estado.ops.filter(o => o.vivo && !o.ferido && o.salaAtual === u.salaAtual);
      if (opsNaSala.length >= 2) {
        const xs = opsNaSala.map(o => o.x);
        if (Math.max(...xs) - Math.min(...xs) >= 2.2) {
          r += 0.40;
        }
      }
    }
    if (u.suprimido > 0) {
      r += C.REACAO.suprimido;
    }
    if (u.enfaixado) {
      r += C.REACAO.enfaixado;
    }
    if (u.classe === 'apoio') {
      r += C.REACAO.apoio;
    }
    if (u.classe === 'atirador' && dist(u.x, u.y, alvo.x, alvo.y) <= 3.0) {
      r += C.REACAO.atiradorPerto;
    }
    if (u.time === 'adv' && estado.veterano) {
      r *= 0.8;
    }
    return r;
  }

  function calculaChanceDisparo(estado, atirador, alvo) {
    const d = dist(atirador.x, atirador.y, alvo.x, alvo.y);
    if (atirador.classe === 'escudo' && d > C.ALCANCE_ESCUDO) return 0;

    if (alvo.classe === 'escudo') {
      const angDoTiro = angEntre(alvo.x, alvo.y, atirador.x, atirador.y);
      if (diffAng(alvo.ang, angDoTiro) <= 30) {
        return 0;
      }
    }

    let chance;
    if (atirador.classe === 'atirador') {
      chance = C.CHANCE.atirador;
    } else {
      const longe = atirador.classe === 'batedor' ? C.CHANCE.longeBatedor : C.CHANCE.longe;
      if (d <= C.CHANCE.distPerto) {
        chance = C.CHANCE.perto;
      } else if (d >= C.CHANCE.distLonge) {
        chance = longe;
      } else {
        const frac = (d - C.CHANCE.distPerto) / (C.CHANCE.distLonge - C.CHANCE.distPerto);
        chance = C.CHANCE.perto - frac * (C.CHANCE.perto - longe);
      }
    }

    if (atirador.classe === 'escudo') {
      chance *= C.CHANCE.escudoMult;
    }
    if (alvo.andando && alvo.ritmoAtual === 'correr') {
      chance *= C.MOD.correndo;
    }
    if (temCoberturaContra(estado.mapa, estado, alvo, atirador)) {
      chance *= C.MOD.cobertura;
    }
    const gx = Math.round(alvo.x), gy = Math.round(alvo.y);
    if (estado.mapa.grade[gy]?.[gx] === 'D' && (!alvo.andando || alvo.ritmoAtual !== 'correr')) {
      chance *= C.MOD.funil;
    }
    if (atirador.suprimido > 0) {
      chance *= C.MOD.suprimido;
    }
    if (atirador.andando || atirador.tempoCorrendoRecente > 0) {
      chance *= C.MOD.andando;
    }
    if (atirador.time === 'op' && (atirador.fatiando || atirador.cobertoBatente > 0 || (atirador.segurando && !atirador.andando))) {
      chance *= 1.35;
    }

    return Math.max(0, Math.min(0.95, chance));
  }

  function aplicaSupressaoDoTiro(estado, atirador, alvo) {
    const raioSup = atirador.classe === 'apoio' ? C.SUPRESSAO.distApoio : C.SUPRESSAO.dist;
    const inimigos = atirador.time === 'op' ? estado.advs : estado.ops;
    for (const inim of inimigos) {
      if (!inim.vivo || inim.ferido) continue;
      const dLinha = distPontoSeg(inim.x, inim.y, atirador.x, atirador.y, alvo.x, alvo.y);
      if (dLinha <= raioSup && temVisao(estado.mapa, atirador.x, atirador.y, inim.x, inim.y)) {
        const estava = inim.suprimido > 0;
        inim.suprimido = Math.max(inim.suprimido, C.SUPRESSAO.tempo);
        if (!estava) {
          regEvento(estado, { tipo: 'suprimido', quem: atirador.id, alvo: inim.id, x: inim.x, y: inim.y });
        }
      }
    }
    if (atirador.time === 'op') {
      for (const v of estado.alvosVivos) {
        if (v.vivo && !v.rendido) {
          const dLinha = distPontoSeg(v.x, v.y, atirador.x, atirador.y, alvo.x, alvo.y);
          if (dLinha <= raioSup + 0.5 && temVisao(estado.mapa, atirador.x, atirador.y, v.x, v.y)) {
            v.suprimido = Math.max(v.suprimido, C.SUPRESSAO.tempo);
          }
        }
      }
    }
  }

  function SIM_passo(estado) {
    if (estado.terminou) return estado;
    const dt = C.PASSO;
    estado.t += dt;
    estado.passoNum++;
    estado.disparosVisuais = [];

    for (const op of estado.ops) {
      op.contraluz = false;
      if (estado.escuro && op.vivo && !op.ferido && op.lanterna && !op.andando) {
        op.tempoLanternaParado += dt;
        if (op.tempoLanternaParado > 1.5) {
          estado.violouLuzCurta = true;
        }
      } else {
        op.tempoLanternaParado = 0;
      }
    }
    if (estado.escuro) {
      for (const opA of estado.ops) {
        if (!opA.vivo || opA.ferido || !opA.lanterna) continue;
        for (const opB of estado.ops) {
          if (opA.id === opB.id || !opB.vivo || opB.ferido) continue;
          const d = dist(opA.x, opA.y, opB.x, opB.y);
          if (d <= 3.2 && temVisao(estado.mapa, opA.x, opA.y, opB.x, opB.y)) {
            const ang = angEntre(opA.x, opA.y, opB.x, opB.y);
            if (diffAng(opA.ang, ang) <= 38) {
              opB.contraluz = true;
              estado.violouLuzCurta = true;
            }
          }
        }
      }
    }

    // 1. Movimento
    for (const op of estado.ops) atualizaMovimentoUnidade(estado, op, dt);
    for (const adv of estado.advs) atualizaMovimentoUnidade(estado, adv, dt);

    // Movimento de reféns / escolta
    for (const r of estado.refens) {
      if (!r.vivo || r.extraido) continue;
      if (r.escoltaPts && r.escoltaPts.length > 1) {
        if (r.ptIdx < r.escoltaPts.length - 1) {
          const destPt = r.escoltaPts[r.ptIdx + 1];
          if (!r.subCaminho || r.subCaminho.length === 0) {
            r.subCaminho = caminhoCurto(estado.mapa, r.x, r.y, destPt.x, destPt.y);
          }
          const wp = r.subCaminho[0];
          if (wp) {
            const d = dist(r.x, r.y, wp.x, wp.y);
            const passo = (C.VEL.andar * 0.72 / C.QUAD) * dt;
            if (d <= passo) {
              r.x = wp.x; r.y = wp.y;
              r.subCaminho.shift();
              if (r.subCaminho.length === 0) r.ptIdx++;
            } else {
              const ang = Math.atan2(wp.y - r.y, wp.x - r.x);
              r.x += Math.cos(ang) * passo;
              r.y += Math.sin(ang) * passo;
            }
          }
        }
      } else {
        if (!r.seguindo) {
          for (const op of estado.ops) {
            if (op.vivo && !op.ferido && dist(op.x, op.y, r.x, r.y) <= 1.45) {
              r.seguindo = op.id;
              if (estado.refemPegoT === null) estado.refemPegoT = estado.t;
              regEvento(estado, { tipo: 'pegou', quem: op.id, alvo: r.id, x: r.x, y: r.y });
              break;
            }
          }
        }
        if (r.seguindo) {
          const lider = estado.ops.find(o => o.id === r.seguindo && o.vivo && !o.ferido);
          if (!lider) {
            r.seguindo = null;
          } else {
            const d = dist(r.x, r.y, lider.x, lider.y);
            if (d > 0.80) {
              const passo = (C.VEL.correr / C.QUAD) * dt;
              const ang = Math.atan2(lider.y - r.y, lider.x - r.x);
              r.x += Math.cos(ang) * Math.min(passo, d - 0.65);
              r.y += Math.sin(ang) * Math.min(passo, d - 0.65);
            }
          }
        }
      }
      for (const s of estado.mapa.saidas) {
        if (dist(r.x, r.y, s.x, s.y) <= 1.55) {
          r.extraido = true;
        }
      }
    }

    // Movimento de maletas
    for (const m of estado.maletas) {
      if (m.extraida) continue;
      if (!m.pegaPor) {
        for (const op of estado.ops) {
          if (op.vivo && !op.ferido && dist(op.x, op.y, m.x, m.y) <= 1.35) {
            m.pegaPor = op.id;
            op.carregandoMaleta = true;
            regEvento(estado, { tipo: 'pegou', quem: op.id, alvo: m.id, x: m.x, y: m.y });
            break;
          }
        }
      } else {
        const portador = estado.ops.find(o => o.id === m.pegaPor && o.vivo && !o.ferido);
        if (portador) {
          m.x = portador.x;
          m.y = portador.y;
          for (const s of estado.mapa.saidas) {
            if (dist(m.x, m.y, s.x, s.y) <= 1.55) {
              m.extraida = true;
              portador.carregandoMaleta = false;
            }
          }
        } else {
          m.pegaPor = null;
        }
      }
    }

    // Faca (automática em furtivo)
    for (const op of estado.ops) {
      if (!op.vivo || op.ferido || op.atordoado > 0) continue;
      if (op.ritmoAtual === 'furtivo') {
        for (const adv of estado.advs) {
          if (!adv.vivo) continue;
          const d = dist(op.x, op.y, adv.x, adv.y);
          if (d <= 1.55 && temVisao(estado.mapa, op.x, op.y, adv.x, adv.y)) {
            const angAdvParaOp = angEntre(adv.x, adv.y, op.x, op.y);
            const pelasCostasOuLado = diffAng(adv.ang, angAdvParaOp) > (op.classe === 'batedor' ? 40 : 55);
            if (!adv.viuOps[op.id] || adv.atordoado > 0 || pelasCostasOuLado) {
              const eraTranquilo = adv.tranquilo || adv.surpreendido;
              adv.vivo = false;
              if (estado.primeiraFacaT === null) estado.primeiraFacaT = estado.t;
              regEvento(estado, {
                tipo: 'faca',
                quem: op.id,
                alvo: adv.id,
                x: adv.x,
                y: adv.y,
                tranquilo: eraTranquilo
              });
              regEvento(estado, {
                tipo: 'baixa',
                quem: op.id,
                alvo: adv.id,
                x: adv.x,
                y: adv.y,
                causa: 'faca',
                tranquilo: eraTranquilo
              });
            }
          }
        }
      }
    }

    // Alvo Vivo 'V'
    for (const v of estado.alvosVivos) {
      if (!v.vivo || v.extraido || v.fugiu) continue;
      if (v.atordoado > 0) v.atordoado = Math.max(0, v.atordoado - dt);
      if (v.suprimido > 0) v.suprimido = Math.max(0, v.suprimido - dt);

      if (v.rendido) {
        if (!v.seguindo) {
          const opPerto = estado.ops.find(o => o.vivo && !o.ferido && dist(o.x, o.y, v.x, v.y) <= 1.8);
          if (opPerto) v.seguindo = opPerto.id;
        }
        const lider = estado.ops.find(o => o.id === v.seguindo && o.vivo && !o.ferido);
        if (lider) {
          const d = dist(v.x, v.y, lider.x, lider.y);
          if (d > 0.80) {
            const passo = (C.VEL.correr / C.QUAD) * dt;
            const ang = Math.atan2(lider.y - v.y, lider.x - v.x);
            v.x += Math.cos(ang) * Math.min(passo, d - 0.65);
            v.y += Math.sin(ang) * Math.min(passo, d - 0.65);
          }
        }
        for (const s of estado.mapa.saidas) {
          if (dist(v.x, v.y, s.x, s.y) <= 1.55) v.extraido = true;
        }
      } else {
        let opVisivel = null;
        for (const op of estado.ops) {
          if (op.vivo && !op.ferido && temVisao(estado.mapa, v.x, v.y, op.x, op.y)) {
            const d = dist(v.x, v.y, op.x, op.y);
            const ang = angEntre(v.x, v.y, op.x, op.y);
            if (d <= C.PERIFERICA || (d <= C.ALCANCE && diffAng(v.ang, ang) <= C.CONE * 0.5)) {
              v.alerta = true;
              opVisivel = op;
              break;
            }
          }
        }
        if (v.alerta && v.atordoado <= 0) {
          if (estado.mapa.fugas.length > 0) {
            const fugasLivres = estado.mapa.fugas.filter(ef =>
              !estado.ops.some(op => op.vivo && !op.ferido && dist(op.x, op.y, ef.x, ef.y) <= 2.4)
            );
            if (fugasLivres.length > 0) {
              let melhorE = fugasLivres[0];
              let maiorD = -1;
              for (const ef of fugasLivres) {
                const dOp = opVisivel ? dist(ef.x, ef.y, opVisivel.x, opVisivel.y) : dist(ef.x, ef.y, v.x, v.y);
                if (dOp > maiorD) {
                  maiorD = dOp;
                  melhorE = ef;
                }
              }
              v.fugaAlvo = melhorE;
              v.subCaminho = caminhoCurto(estado.mapa, v.x, v.y, melhorE.x, melhorE.y);
              if (v.subCaminho && v.subCaminho.length > 0) {
                const wp = v.subCaminho[0];
                const d = dist(v.x, v.y, wp.x, wp.y);
                const passo = (C.VEL.andar / C.QUAD) * dt;
                v.ang = angEntre(v.x, v.y, wp.x, wp.y);
                if (d <= passo) {
                  v.x = wp.x; v.y = wp.y;
                  v.subCaminho.shift();
                } else {
                  const rad = (v.ang * Math.PI) / 180;
                  v.x += Math.cos(rad) * passo;
                  v.y += Math.sin(rad) * passo;
                }
              }
              for (const ef of fugasLivres) {
                if (dist(v.x, v.y, ef.x, ef.y) <= 0.9) {
                  v.fugiu = true;
                  estado.terminou = true;
                  estado.venceu = false;
                  estado.motivo = 'fugiu';
                }
              }
            }
          }
          if (opVisivel && dist(v.x, v.y, opVisivel.x, opVisivel.y) <= 6) {
            v.reacaoRestante -= dt;
            if (v.reacaoRestante <= 0) {
              v.cooldownTiro -= dt;
              if (v.cooldownTiro <= 0) {
                v.cooldownTiro = 0.55;
                regEvento(estado, { tipo: 'disparo', quem: v.id, alvo: opVisivel.id, x: v.x, y: v.y });
                estado.disparosVisuais.push({ ax: v.x, ay: v.y, bx: opVisivel.x, by: opVisivel.y, time: 'adv' });
                if (estado.rng() < 0.35) {
                  aplicaBaixaOp(estado, opVisivel, v, false);
                }
              }
            }
          }
        }
      }
    }

    // Verificadores contínuos de tática
    const haAdvVivo = estado.advs.some(a => a.vivo);
    for (const op of estado.ops) {
      if (!op.vivo || op.ferido) continue;
      const gx = Math.round(op.x), gy = Math.round(op.y);
      if (!op.andando && estado.mapa.grade[gy]?.[gx] === 'D' && haAdvVivo) {
        op.tempoEmPorta += dt;
        if (op.tempoEmPorta > 0.5) estado.violouFunil = true;
      } else {
        op.tempoEmPorta = 0;
      }
    }

    for (const op of estado.ops) {
      if (!op.vivo || op.ferido || !op.andando) continue;
      const advPerto = estado.advs.some(a => a.vivo && dist(op.x, op.y, a.x, a.y) <= 8.0 && temVisao(estado.mapa, op.x, op.y, a.x, a.y));
      if (advPerto) {
        const temParceiroCobrindo = estado.ops.some(outro =>
          outro.id !== op.id && outro.vivo && !outro.ferido &&
          (!outro.andando || outro.segurando)
        );
        if (!temParceiroCobrindo) {
          estado.violouDupla = true;
        }
      }
    }

    const algumOpVeAdv = estado.ops.some(o => o.vivo && !o.ferido && temAdversarioVisivel(estado, o));
    if (algumOpVeAdv) {
      const alfaAndando = estado.ops.some(o => o.vivo && !o.ferido && o.equipe === 'alfa' && o.andando);
      const bravoAndando = estado.ops.some(o => o.vivo && !o.ferido && o.equipe === 'bravo' && o.andando);
      if (alfaAndando && bravoAndando) {
        estado.violouSalto = true;
      }
    }

    // 2. Percepção
    for (const adv of estado.advs) {
      if (!adv.vivo || adv.atordoado > 0) continue;
      for (const outro of estado.advs) {
        if (!outro.vivo && outro.entrouReforco && podeVer(estado, adv, { x: outro.x, y: outro.y, vivo: true })) {
          acionaAlerta(estado, adv, outro.x, outro.y, true);
        }
      }
      for (const op of estado.ops) {
        if (!op.vivo || op.ferido) continue;
        if (podeVer(estado, adv, op)) {
          if (!adv.viuOps[op.id]) {
            adv.viuOps[op.id] = true;
            regEvento(estado, { tipo: 'viu', quem: adv.id, alvo: op.id, x: adv.x, y: adv.y });
          }
          acionaAlerta(estado, adv, op.x, op.y, true);
        }
      }
    }

    // Render alvo vivo 'V'
    for (const v of estado.alvosVivos) {
      if (!v.vivo || v.rendido) continue;
      const opPerto = estado.ops.find(o => o.vivo && !o.ferido && dist(o.x, o.y, v.x, v.y) <= C.RENDER.dist + 0.45 && temVisao(estado.mapa, o.x, o.y, v.x, v.y));
      if (opPerto) {
        const angVParaOp = angEntre(v.x, v.y, opPerto.x, opPerto.y);
        const foraDoCone = diffAng(v.ang, angVParaOp) > C.CONE * 0.5;
        const opsComVisao4 = estado.ops.filter(o => o.vivo && !o.ferido && dist(o.x, o.y, v.x, v.y) <= 4.5 && temVisao(estado.mapa, o.x, o.y, v.x, v.y)).length;
        const cercadoSuprimido = v.suprimido > 0 && opsComVisao4 >= 2;
        if (v.atordoado > 0 || foraDoCone || cercadoSuprimido) {
          v.progressoRender += dt;
          if (v.progressoRender >= C.RENDER.tempo) {
            v.rendido = true;
            v.seguindo = opPerto.id;
            regEvento(estado, { tipo: 'rendido', quem: opPerto.id, alvo: v.id, x: v.x, y: v.y });
          }
        } else {
          v.progressoRender = Math.max(0, v.progressoRender - dt * 0.5);
        }
      } else {
        v.progressoRender = 0;
      }
    }

    // Granadas em voo
    for (let i = estado.granadas.length - 1; i >= 0; i--) {
      const g = estado.granadas[i];
      g.restante -= dt;
      if (g.restante <= 0) {
        estado.granadas.splice(i, 1);
        detonaGranada(estado, g);
      }
    }

    // Tiro
    const todasUnidades = [...estado.ops, ...estado.advs];
    const baixasPendentes = [];

    for (const u of todasUnidades) {
      if (!u.vivo || u.ferido || u.atordoado > 0) continue;
      if (u.suprimido > 0) u.suprimido = Math.max(0, u.suprimido - dt);
      if (u.time === 'op' && vaiEsfaquearEmFurtivo(estado, u)) continue;
      if (u.time === 'op' && u.ritmoAtual === 'furtivo' && !u.segurando && !u.fatiando &&
          estado.missao.tatica && estado.missao.tatica.id === 'silencio' && estado.primeiroAlertaT === null) continue;

      const inimigos = u.time === 'op' ? estado.advs : estado.ops;
      const visiveis = [];
      for (const inim of inimigos) {
        if (!inim.vivo || inim.ferido) continue;
        if (u.time === 'adv' && (inim.fatiando || inim.cobertoBatente > 0)) {
          const outroJaMirando = estado.advs.some(a => a.id !== u.id && a.vivo && a.alvoAtual === inim.id);
          if (outroJaMirando) continue;
        }
        if (podeVer(estado, u, inim)) {
          visiveis.push(inim);
        }
      }

      if (visiveis.length === 0) {
        u.alvoAtual = null;
        u.tirosRestantesRajada = 0;
        u.tempoBloqueado = 0;
        u.bloqueadoEmitido = false;
        continue;
      }

      visiveis.sort((a, b) => dist(u.x, u.y, a.x, a.y) - dist(u.x, u.y, b.x, b.y));
      const alvo = visiveis[0];
      u.ang = angEntre(u.x, u.y, alvo.x, alvo.y);

      if (u.alvoAtual !== alvo.id) {
        const continuarRajadaAgrupado = u.tirosRestantesRajada > 0 && u.reacaoRestante <= 0;
        u.alvoAtual = alvo.id;
        if (u.time === 'op' && alvo.tranquilo) {
          alvo.surpreendido = true;
        }
        if (!continuarRajadaAgrupado) {
          u.reacaoRestante = calculaTempoReacao(estado, u, alvo);
          u.tirosRestantesRajada = u.classe === 'apoio' ? C.RAJADA.tirosApoio : C.RAJADA.tiros;
          u.cooldownTiro = 0;
        }
      }

      if (u.reacaoRestante > 0) {
        u.reacaoRestante -= dt;
        continue;
      }

      if (linhaTiroBloqueada(estado, u, alvo)) {
        if (!u.andando) {
          u.tempoBloqueado += dt;
        }
        if (u.tempoBloqueado > 0.85 && u.time === 'op') {
          estado.violouLinhaLimpa = true;
          if (!u.bloqueadoEmitido) {
            u.bloqueadoEmitido = true;
            regEvento(estado, { tipo: 'bloqueado', quem: u.id, alvo: alvo.id, x: u.x, y: u.y });
          }
        }
        continue;
      } else {
        u.tempoBloqueado = 0;
      }

      u.cooldownTiro -= dt;
      if (u.cooldownTiro <= 0) {
        if (u.tirosRestantesRajada <= 0) {
          u.tirosRestantesRajada = u.classe === 'apoio' ? C.RAJADA.tirosApoio : C.RAJADA.tiros;
        }
        u.tirosRestantesRajada--;
        u.cooldownTiro = u.tirosRestantesRajada > 0 ? C.RAJADA.intervalo : C.RAJADA.pausa;

        emiteBarulho(estado, u.x, u.y, C.BARULHO.tiro, u.time);
        aplicaSupressaoDoTiro(estado, u, alvo);
        regEvento(estado, { tipo: 'disparo', quem: u.id, alvo: alvo.id, x: u.x, y: u.y });
        estado.disparosVisuais.push({ ax: u.x, ay: u.y, bx: alvo.x, by: alvo.y, time: u.time });

        const chance = calculaChanceDisparo(estado, u, alvo);
        if (estado.rng() < chance) {
          baixasPendentes.push({ alvo, atirador: u });
          if (alvo.time === 'op' && (alvo.ritmoAtual === 'correr' || alvo.tempoCorrendoRecente > 0)) {
            for (const col of estado.ops) {
              if (col.id !== alvo.id && col.vivo && !col.ferido && dist(col.x, col.y, alvo.x, alvo.y) < 0.95) {
                baixasPendentes.push({ alvo: col, atirador: u, causaForcada: 'agrupado' });
              }
            }
          }
        }
      }
    }

    // 5. Baixas
    for (const bp of baixasPendentes) {
      if (!bp.alvo.vivo || bp.alvo.ferido) continue;
      if (bp.alvo.time === 'op') {
        aplicaBaixaOp(estado, bp.alvo, bp.atirador, false, bp.causaForcada);
      } else {
        const eraTranquilo = bp.alvo.tranquilo || bp.alvo.surpreendido;
        bp.alvo.vivo = false;
        regEvento(estado, {
          tipo: 'baixa',
          quem: bp.atirador.id,
          alvo: bp.alvo.id,
          x: bp.alvo.x,
          y: bp.alvo.y,
          causa: 'tiro',
          tranquilo: eraTranquilo
        });
      }
    }

    for (const op of estado.ops) {
      if (op.vivo && op.ferido) {
        op.tempoFerido -= dt;
        if (op.tempoFerido <= 0) {
          op.vivo = false;
          op.ferido = false;
          op.baixaCritica = true;
          regEvento(estado, { tipo: 'baixa', quem: 'tempo', alvo: op.id, x: op.x, y: op.y, causa: 'sozinho' });
        }
      }
    }

    // 7. Objetivo e fim
    avaliaObjetivosEFim(estado, dt);

    if (estado.frames && (estado.passoNum % 2 === 0 || estado.terminou)) {
      estado.frames.push({
        t: Number(estado.t.toFixed(2)),
        ops: estado.ops.map(o => ({
          id: o.id, x: Number(o.x.toFixed(2)), y: Number(o.y.toFixed(2)), ang: Math.round(o.ang),
          vivo: o.vivo, ferido: o.ferido, suprimido: o.suprimido > 0, atordoado: o.atordoado > 0,
          lanterna: o.lanterna, segurando: o.segurando, fatiando: o.fatiando
        })),
        advs: estado.advs.map(a => ({
          id: a.id, x: Number(a.x.toFixed(2)), y: Number(a.y.toFixed(2)), ang: Math.round(a.ang),
          vivo: a.vivo, alerta: a.alerta, suprimido: a.suprimido > 0, atordoado: a.atordoado > 0
        })),
        refens: estado.refens.map(r => ({ id: r.id, x: Number(r.x.toFixed(2)), y: Number(r.y.toFixed(2)), vivo: r.vivo, extraido: r.extraido })),
        alvosVivos: estado.alvosVivos.map(v => ({ id: v.id, x: Number(v.x.toFixed(2)), y: Number(v.y.toFixed(2)), vivo: v.vivo, rendido: v.rendido, extraido: v.extraido })),
        maletas: estado.maletas.map(m => ({ id: m.id, x: Number(m.x.toFixed(2)), y: Number(m.y.toFixed(2)), extraida: m.extraida })),
        disparos: estado.disparosVisuais.slice()
      });
    }

    return estado;
  }

  function avaliaObjetivosEFim(estado, dt) {
    if (estado.terminou) return;

    const opsAtivos = estado.ops.filter(o => o.vivo && !o.ferido);
    if (opsAtivos.length === 0) {
      estado.terminou = true;
      estado.venceu = false;
      estado.motivo = estado.baixas[0]?.causa || 'equipe_eliminada';
      return;
    }

    if (estado.missao.alarme && estado.primeiroAlertaT !== null) {
      if (estado.t - estado.primeiroAlertaT >= estado.missao.alarme) {
        estado.terminou = true;
        estado.venceu = false;
        estado.motivo = 'alarme';
        return;
      }
    }

    for (const b of estado.bombas) {
      if (b.desarmada) continue;
      const opNoB = opsAtivos.find(o => !o.andando && dist(o.x, o.y, b.x, b.y) <= 1.35);
      if (opNoB) {
        b.progresso += dt;
        if (b.progresso >= 6.0) {
          b.desarmada = true;
          regEvento(estado, { tipo: 'objetivo', quem: opNoB.id, alvo: b.id, x: b.x, y: b.y });
        }
      }
    }

    if (estado.mapa.zonas.length > 0) {
      const temOpNaZona = opsAtivos.some(o => estado.mapa.zonas.some(z => dist(o.x, o.y, z.x, z.y) <= 1.8));
      const temAdvNaZona = estado.advs.some(a => a.vivo && estado.mapa.zonas.some(z => dist(a.x, a.y, z.x, z.y) <= 1.8));
      if (temOpNaZona && !temAdvNaZona) {
        estado.tempoDominio += dt;
      }
    }

    if (estado.missao.objetivo === 'escolta' || (Array.isArray(estado.missao.objetivo) && estado.missao.objetivo.includes('escolta'))) {
      for (const r of estado.refens) {
        for (const adv of estado.advs) {
          if (adv.vivo && dist(adv.x, adv.y, r.x, r.y) <= 2.4 && temVisao(estado.mapa, adv.x, adv.y, r.x, r.y)) {
            r.vivo = false;
            estado.terminou = true;
            estado.venceu = false;
            estado.motivo = 'vip_atingido';
            return;
          }
        }
      }
    }

    const listaObj = Array.isArray(estado.missao.objetivo)
      ? estado.missao.objetivo
      : [estado.missao.objetivo || 'eliminar'];

    const cumpriuIndividual = (obj) => {
      if (obj === 'eliminar') {
        return estado.advs.every(a => !a.vivo && a.entrouReforco);
      }
      if (obj === 'maleta') {
        return estado.maletas.length > 0 && estado.maletas.every(m => m.extraida);
      }
      if (obj === 'resgate' || obj === 'escolta') {
        return estado.refens.length > 0 && estado.refens.every(r => r.vivo && r.extraido);
      }
      if (obj === 'captura') {
        if (estado.alvosVivos.length === 0) return false;
        const precisaExtrair = estado.mapa.saidas.length > 0 && Boolean(estado.missao.extrairAlvo);
        return estado.alvosVivos.every(v => v.vivo && (precisaExtrair ? v.extraido : v.rendido));
      }
      if (obj === 'dominio') {
        const meta = estado.missao.tempoDominio || 10;
        return estado.tempoDominio >= meta || (estado.advs.every(a => !a.vivo && a.entrouReforco) && estado.tempoDominio >= 2);
      }
      if (obj === 'defesa') {
        return (estado.t >= estado.tempoMax - 0.1 || estado.advs.every(a => !a.vivo && a.entrouReforco)) && opsAtivos.length > 0;
      }
      if (obj === 'bomba') {
        return estado.bombas.length > 0 && estado.bombas.every(b => b.desarmada);
      }
      return false;
    };

    if (listaObj.every(cumpriuIndividual)) {
      estado.terminou = true;
      estado.venceu = true;
      estado.motivo = 'objetivo_cumprido';
      regEvento(estado, { tipo: 'objetivo', quem: 'time', x: opsAtivos[0].x, y: opsAtivos[0].y });
      return;
    }

    if (estado.t >= estado.tempoMax) {
      estado.terminou = true;
      if (listaObj.includes('defesa') && opsAtivos.length > 0) {
        estado.venceu = true;
        estado.motivo = 'defesa_concluida';
      } else {
        estado.venceu = false;
        estado.motivo = 'tempo';
      }
    }
  }

  function verificaTatica(estado) {
    const cfg = estado.missao.tatica || { id: 'surpresa' };
    const id = typeof cfg === 'string' ? cfg : cfg.id;

    if (id === 'surpresa') {
      const primBaixaAdv = estado.eventos.find(e => e.tipo === 'baixa' && estado.advs.some(a => a.id === e.alvo));
      const ok = Boolean(primBaixaAdv && primBaixaAdv.tranquilo);
      return {
        id,
        ok,
        motivo: ok
          ? 'O primeiro adversário foi neutralizado ainda tranquilo.'
          : 'O primeiro adversário já estava em alerta quando caiu.'
      };
    }

    if (id === 'dupla') {
      const ok = !estado.violouDupla;
      return {
        id,
        ok,
        motivo: ok
          ? 'Sempre houve um operador parado cobrindo enquanto outro avançava.'
          : 'Um operador avançou perto do inimigo sem parceiro parado cobrindo.'
      };
    }

    if (id === 'fatiou') {
      const ok = estado.portasFatiadas.length > 0 && !estado.faltouFatiarSala;
      return {
        id,
        ok,
        motivo: ok
          ? 'Abriu o ângulo fatiando antes de entrar na sala.'
          : 'Entrou na sala sem concluir um fatiamento na quina ou porta.'
      };
    }

    if (id === 'sem_funil') {
      const ok = !estado.violouFunil;
      return {
        id,
        ok,
        motivo: ok
          ? 'Nenhum operador parou no funil da porta.'
          : 'Operador ficou parado na porta (funil) com adversário vivo.'
      };
    }

    if (id === 'cantos') {
      let okCantos = false;
      for (const sId of Object.keys(estado.entradasSala)) {
        const ents = estado.entradasSala[sId];
        if (ents.length >= 2) {
          const dtEnt = Math.abs(ents[1].t - ents[0].t);
          if (dtEnt <= 1.8) okCantos = true;
        }
      }
      if (estado.ops.length >= 2 && !okCantos) {
        const dx = Math.abs(estado.ops[0].x - estado.ops[1].x);
        const p0 = estado.ops[0].pts[estado.ops[0].pts.length - 1];
        const p1 = estado.ops[1].pts[estado.ops[1].pts.length - 1];
        const dxDest = (p0 && p1) ? Math.abs(p0.x - p1.x) : 0;
        if (dx >= 2.5 || dxDest >= 2.5) okCantos = true;
      }
      const ok = okCantos && !estado.violouFunil;
      return {
        id,
        ok,
        motivo: ok
          ? 'Entrada sincronizada pros dois cantos sem parar na porta.'
          : 'Faltou dividir pros dois cantos em até 1 s ou parou no funil.'
      };
    }

    if (id === 'janela') {
      let ok = false;
      const evLuz = estado.eventos.filter(e => e.tipo === 'luz');
      if (evLuz.length > 0) {
        for (const l of evLuz) {
          for (const sId of Object.keys(estado.entradasSala)) {
            for (const ent of estado.entradasSala[sId]) {
              if (ent.t >= l.t - 0.3 && ent.t - l.t <= C.LUZ.janela + 0.5) {
                ok = true;
              }
            }
          }
          const baixaRapida = estado.eventos.some(e => e.tipo === 'baixa' && e.t >= l.t && e.t - l.t <= 3.2);
          if (baixaRapida) ok = true;
        }
      }
      return {
        id,
        ok,
        motivo: ok
          ? 'Entrou na sala aproveitando a janela de 2 s da granada de luz.'
          : 'Demorou mais de 2 s após a granada de luz ou não usou a granada.'
      };
    }

    if (id === 'silencio') {
      const ate = (typeof cfg === 'object' && cfg.ate) ? cfg.ate : 'fim';
      let limiteT = estado.t;
      if (ate === 'primeira_faca') {
        limiteT = estado.primeiraFacaT !== null ? estado.primeiraFacaT : Infinity;
      } else if (ate === 'refem') {
        limiteT = estado.refemPegoT !== null ? estado.refemPegoT : Infinity;
      }
      const ok = limiteT !== Infinity && (estado.primeiroAlertaT === null || estado.primeiroAlertaT >= limiteT - 0.05);
      return {
        id,
        ok,
        motivo: ok
          ? 'Disciplina de ruído mantida até o momento crítico.'
          : 'O inimigo entrou em alerta antes da hora.'
      };
    }

    if (id === 'linha_limpa') {
      const ok = !estado.violouLinhaLimpa;
      return {
        id,
        ok,
        motivo: ok
          ? 'Linhas de tiro limpas durante toda a ação.'
          : 'Operador teve a linha de tiro bloqueada por colega ou refém.'
      };
    }

    if (id === 'simultaneo') {
      const temposAcao = [];
      for (const op of estado.ops) {
        const entT = Object.values(op.entrouSalaT)[0];
        const ev = estado.eventos.find(e => e.quem === op.id && (e.tipo === 'disparo' || e.tipo === 'luz' || e.tipo === 'faca' || e.tipo === 'viu'));
        const tRef = entT !== undefined ? entT : (ev ? ev.t : null);
        if (tRef !== null) temposAcao.push(tRef);
      }
      temposAcao.sort((a, b) => a - b);
      const ok = temposAcao.length >= 2 && (temposAcao[1] - temposAcao[0] <= 1.8);
      return {
        id,
        ok,
        motivo: ok
          ? 'Ação simultânea sincronizada entre as frentes.'
          : 'As frentes entraram fora de sincronia (mais de 1 s de diferença).'
      };
    }

    if (id === 'retaguarda') {
      const baixaCostas = estado.baixas.some(b => b.causa === 'costas');
      const alguemSegurou = estado.ops.some(o => o.usouSegurar);
      const ok = !baixaCostas && !estado.violouRetaguarda && alguemSegurou;
      return {
        id,
        ok,
        motivo: ok
          ? 'Retaguarda protegida durante toda a operação.'
          : 'Faltou manter segurança cobrindo a retaguarda.'
      };
    }

    if (id === 'dominio') {
      const vivos = estado.ops.filter(o => o.vivo && !o.ferido);
      const nenhumEmPorta = vivos.every(o => estado.mapa.grade[Math.round(o.y)]?.[Math.round(o.x)] !== 'D');
      const ok = vivos.length >= 3 && nenhumEmPorta && !estado.violouFunil;
      return {
        id,
        ok,
        motivo: ok
          ? 'Domínio de sala completo: cantos e centro ocupados sem bloquear a porta.'
          : 'Posicionamento final falhou em distribuir o time fora do funil.'
      };
    }

    if (id === 'sem_propria') {
      const ok = !estado.violouPropria;
      return {
        id,
        ok,
        motivo: ok
          ? 'Uso seguro de granadas sem atingir aliados ou inocentes.'
          : 'Granada atingiu aliado, refém ou alvo vivo.'
      };
    }

    if (id === 'socorro_seguro') {
      const ok = !estado.violouSocorro;
      return {
        id,
        ok,
        motivo: ok
          ? 'Socorro prestado somente com a área segura e coberta.'
          : 'O médico tentou socorrer sob linha de visão inimiga.'
      };
    }

    if (id === 'cerco') {
      let todasFechadas = true;
      for (const ef of estado.mapa.fugas) {
        const fechou = estado.ops.some(op => dist(op.x, op.y, ef.x, ef.y) <= 3.2 ||
          op.pts.some(p => dist(p.x, p.y, ef.x, ef.y) <= 2.8));
        if (!fechou) todasFechadas = false;
      }
      const ok = todasFechadas && estado.alvosVivos.every(v => !v.fugiu);
      return {
        id,
        ok,
        motivo: ok
          ? 'Todas as saídas de fuga foram cercadas antes da abordagem.'
          : 'Uma saída de fuga ficou desguarnecida antes do alerta.'
      };
    }

    if (id === 'salto') {
      const ok = !estado.violouSalto;
      return {
        id,
        ok,
        motivo: ok
          ? 'Avanço por saltos alternados: uma equipe sempre cobrindo a outra.'
          : 'As duas equipes se moveram expostas ao mesmo tempo.'
      };
    }

    if (id === 'luz_curta') {
      const ok = !estado.violouLuzCurta;
      return {
        id,
        ok,
        motivo: ok
          ? 'Disciplina de luz: pulsos curtos e sem contraluz nos aliados.'
          : 'Lanterna ligada parado por muito tempo ou iluminando as costas de aliado.'
      };
    }

    if (id === 'sala_a_sala') {
      const ok = !estado.violouSalaASala && estado.advs.every(a => !a.vivo);
      return {
        id,
        ok,
        motivo: ok
          ? 'Progressão limpa sala a sala sem deixar ameaças para trás.'
          : 'Uma sala com hostil ficou para trás durante o avanço.'
      };
    }

    return { id, ok: true, motivo: 'Tática aplicada com sucesso.' };
  }

  function SIM_roda(missao, plano, semente, opcoes) {
    const estado = SIM_cria(missao, plano, semente, opcoes);
    const maxPassos = Math.ceil(estado.tempoMax / C.PASSO) + 10;
    let p = 0;
    while (!estado.terminou && p < maxPassos) {
      SIM_passo(estado);
      p++;
    }
    const verif = verificaTatica(estado);
    const semBaixaCritica = estado.ops.every(o => o.vivo && !o.baixaCritica);
    const estrelas = estado.venceu
      ? (1 + (semBaixaCritica ? 1 : 0) + (verif.ok ? 1 : 0))
      : 0;

    return {
      venceu: estado.venceu,
      motivo: estado.motivo,
      tempo: Number(estado.t.toFixed(2)),
      estrelas,
      semBaixaCritica,
      tatica: verif.ok,
      taticaDetalhe: verif,
      eventos: estado.eventos,
      baixas: estado.baixas,
      frames: estado.frames,
      estadoFinal: estado
    };
  }

  return {
    C,
    LICOES_BAIXA,
    criaRng,
    parseMapa,
    ehAndavel,
    temVisao,
    caminhoCurto,
    temCoberturaQualquer,
    achaPortaOuQuinaPerto,
    cria: SIM_cria,
    passo: SIM_passo,
    roda: SIM_roda,
    verificaTatica
  };
});
