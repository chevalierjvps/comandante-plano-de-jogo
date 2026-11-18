'use strict';

const fs = require('fs');
const path = require('path');
const SIM = require('../../playground/comandante/sim.js');
const { MISSOES } = require('../../playground/comandante/missoes.js');

const gabaritosPath = path.join(__dirname, 'gabaritos-comandante.json');
const gabaritos = JSON.parse(fs.readFileSync(gabaritosPath, 'utf8'));

function criaPlanoIngenuo(missao) {
  const mapa = SIM.parseMapa(missao.mapa);
  const numOps = missao.time.length;
  // Ponto reto no topo central ou no primeiro inimigo, correndo em linha reta sem ordens
  const chavesAdv = Object.keys(mapa.advPos).sort();
  const pAlvo = chavesAdv.length > 0
    ? mapa.advPos[chavesAdv[0]]
    : { x: Math.floor(mapa.L / 2), y: 2 };

  const plano = [];
  for (let i = 0; i < numOps; i++) {
    const p0 = mapa.opsPos[i + 1] || { x: 2 + i, y: mapa.A - 2 };
    // Se for missão de defesa, plano ingênuo corre pra fora na frente dos inimigos sem cobertura
    plano.push({
      pts: [
        { x: p0.x, y: p0.y },
        { x: pAlvo.x, y: pAlvo.y, ritmo: 'correr' }
      ]
    });
  }
  return plano;
}

function validaMapa(missao) {
  const linhas = missao.mapa;
  if (!Array.isArray(linhas) || linhas.length === 0) {
    return `Missão ${missao.id}: mapa vazio`;
  }
  const L = linhas[0].length;
  const A = linhas.length;
  const esperadoL = missao.id <= 18 ? 12 : 14;
  const esperadoA = missao.id <= 18 ? 16 : 20;
  if (L !== esperadoL || A !== esperadoA) {
    return `Missão ${missao.id}: tamanho ${L}x${A} diferente do esperado ${esperadoL}x${esperadoA}`;
  }
  for (let y = 0; y < A; y++) {
    if (linhas[y].length !== L) {
      return `Missão ${missao.id}: linha ${y} tem largura ${linhas[y].length}, esperado ${L}`;
    }
  }

  const parsed = SIM.parseMapa(linhas);
  const opsCount = Object.keys(parsed.opsPos).length;
  if (opsCount !== missao.time.length) {
    return `Missão ${missao.id}: operadores no mapa (${opsCount}) != time.length (${missao.time.length})`;
  }

  // Conectividade (tudo alcançável a partir do operador 1)
  const op1 = parsed.opsPos[1];
  if (!op1) return `Missão ${missao.id}: operador 1 ausente`;

  const visitado = Array.from({ length: A }, () => Array(L).fill(false));
  const fila = [{ x: op1.x, y: op1.y }];
  visitado[op1.y][op1.x] = true;
  while (fila.length > 0) {
    const p = fila.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = p.x + dx, ny = p.y + dy;
      if (nx >= 0 && nx < L && ny >= 0 && ny < A && !visitado[ny][nx]) {
        if (SIM.ehAndavel(parsed, nx, ny)) {
          visitado[ny][nx] = true;
          fila.push({ x: nx, y: ny });
        }
      }
    }
  }

  for (let y = 0; y < A; y++) {
    for (let x = 0; x < L; x++) {
      if (SIM.ehAndavel(parsed, x, y) && !visitado[y][x]) {
        return `Missão ${missao.id}: quadrado andável (${x},${y}) inalcançável`;
      }
    }
  }

  return null;
}

let falhas = 0;
let passadas = 0;

for (const missao of MISSOES) {
  const erroMapa = validaMapa(missao);
  if (erroMapa) {
    console.error(`[FALHA MAPA] ${erroMapa}`);
    falhas++;
    continue;
  }

  const gab = gabaritos[String(missao.id)];
  if (!gab) {
    console.error(`[FALHA] Missão ${missao.id} (${missao.nome}): sem gabarito`);
    falhas++;
    continue;
  }

  const numVar = (missao.inimigo && missao.inimigo.length) ? missao.inimigo.length : 1;
  let okMissao = true;

  for (let v = 0; v < numVar; v++) {
    const sem = (missao.semente || 100) + v;
    const resGab = SIM.roda(missao, gab, sem, { gravarFrames: false });
    if (!resGab.venceu || resGab.estrelas !== 3) {
      console.error(
        `[FALHA GABARITO] Missão ${missao.id} (${missao.nome}) var ${v}: ` +
        `venceu=${resGab.venceu}, estrelas=${resGab.estrelas}, motivo=${resGab.motivo}, ` +
        `semBaixaCritica=${resGab.semBaixaCritica}, tatica=${resGab.tatica} (${resGab.taticaDetalhe?.motivo})`
      );
      okMissao = false;
      falhas++;
    }

    const ingenuo = criaPlanoIngenuo(missao);
    const resIng = SIM.roda(missao, ingenuo, sem, { gravarFrames: false });
    if (resIng.venceu) {
      console.error(
        `[FALHA INGÊNUO] Missão ${missao.id} (${missao.nome}) var ${v}: plano ingênuo VENCEU indevidamente!`
      );
      okMissao = false;
      falhas++;
    }
  }

  // Determinismo: 20 execuções idênticas
  const ref = SIM.roda(missao, gab, missao.semente, { gravarFrames: false });
  const refStr = JSON.stringify({
    venceu: ref.venceu,
    tempo: ref.tempo,
    estrelas: ref.estrelas,
    eventos: ref.eventos
  });
  for (let r = 0; r < 20; r++) {
    const outra = SIM.roda(missao, gab, missao.semente, { gravarFrames: false });
    const outraStr = JSON.stringify({
      venceu: outra.venceu,
      tempo: outra.tempo,
      estrelas: outra.estrelas,
      eventos: outra.eventos
    });
    if (outraStr !== refStr) {
      console.error(`[FALHA DETERMINISMO] Missão ${missao.id} divergiu na execução ${r}`);
      okMissao = false;
      falhas++;
      break;
    }
  }

  if (okMissao) {
    passadas++;
  }
}

console.log(`Resultado: ${passadas}/${MISSOES.length} missões aprovadas em todos os critérios.`);
if (falhas > 0) {
  process.exit(1);
}
