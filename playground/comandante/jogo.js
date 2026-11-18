(function () {
  'use strict';

  const CHAVE_STORAGE = 'sz_comandante_v1';
  const PATENTES = [
    { min: 0, nome: 'Recruta' },
    { min: 8, nome: 'Soldado' },
    { min: 20, nome: 'Cabo' },
    { min: 38, nome: 'Sargento' },
    { min: 60, nome: 'Tenente' },
    { min: 84, nome: 'Capitão' },
    { min: 100, nome: 'Comandante' }
  ];

  const CORES_OP = [
    '#10b981', '#38bdf8', '#f59e0b', '#a855f7',
    '#ec4899', '#eab308', '#14b8a6', '#f97316'
  ];

  const NOMES_ORDEM = {
    esperar: 'Esperar (s)',
    segurar: 'Segurar ângulo',
    fatiar: 'Fatiar quina/porta',
    sinal: 'Esperar sinal',
    luz: 'Granada de Luz',
    impacto: 'Granada de Impacto',
    taser: 'Disparar Taser',
    lanterna: 'Alternar Lanterna'
  };

  // Estado persistido
  let prog = carregaProgresso();

  // Estado da sessão
  let missaoAtual = null;
  let modDiaAtivo = null;
  let veteranoAtivo = false;
  let planoAtual = [];
  let historicoPlanos = [];
  let opSelecionado = 0;
  let filtroEquipe = 'todos';
  let editandoPtIdx = -1;
  let ordemTemp = null;
  let ritmoTemp = 'andar';
  let arrastando = false;
  let arrastandoPtIdx = -1;
  let posDedo = null;
  let modoApontarMapa = null; // 'segurar' | 'luz' | 'impacto' | null

  // Estado de execução / replay
  let executando = false;
  let pausado = false;
  let velocidadeExec = 1;
  let estadoSim = null;
  let resultadoSim = null;
  let animFrameId = null;
  let acumuladorTempo = 0;
  let ultimoTimestamp = 0;
  let frameReplayAtual = null;

  // Web Audio sintetizador tático
  let audioCtx = null;
  function tocaSom(tipo) {
    if (!prog.som) return;
    try {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t0 = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tipo === 'tiro') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, t0);
        osc.frequency.exponentialRampToValueAtTime(55, t0 + 0.06);
        gain.gain.setValueAtTime(0.12, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.065);
        osc.start(t0);
        osc.stop(t0 + 0.07);
      } else if (tipo === 'luz') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, t0);
        osc.frequency.exponentialRampToValueAtTime(420, t0 + 0.22);
        gain.gain.setValueAtTime(0.18, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.24);
        osc.start(t0);
        osc.stop(t0 + 0.25);
      } else if (tipo === 'impacto') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(110, t0);
        osc.frequency.exponentialRampToValueAtTime(28, t0 + 0.28);
        gain.gain.setValueAtTime(0.22, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.30);
        osc.start(t0);
        osc.stop(t0 + 0.31);
      } else if (tipo === 'faca' || tipo === 'taser') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, t0);
        osc.frequency.exponentialRampToValueAtTime(180, t0 + 0.08);
        gain.gain.setValueAtTime(0.12, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
        osc.start(t0);
        osc.stop(t0 + 0.095);
      } else if (tipo === 'vitoria') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, t0);
        osc.frequency.setValueAtTime(554, t0 + 0.10);
        osc.frequency.setValueAtTime(659, t0 + 0.20);
        gain.gain.setValueAtTime(0.15, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.42);
        osc.start(t0);
        osc.stop(t0 + 0.44);
      } else if (tipo === 'derrota') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t0);
        osc.frequency.linearRampToValueAtTime(110, t0 + 0.30);
        gain.gain.setValueAtTime(0.14, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.34);
        osc.start(t0);
        osc.stop(t0 + 0.35);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t0);
        gain.gain.setValueAtTime(0.06, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.04);
        osc.start(t0);
        osc.stop(t0 + 0.045);
      }
    } catch (_) {
      // Ignora restrições de autoplay de áudio
    }
  }

  function carregaProgresso() {
    const padrao = {
      estrelas: Array(37).fill(0),
      veterano: Array(37).fill(false),
      melhor: Array(37).fill(null),
      tentativas: Array(37).fill(0),
      ultimoPlano: {},
      selos: {},
      dia: {},
      som: true,
      tema: 'escuro'
    };
    try {
      const bruto = localStorage.getItem(CHAVE_STORAGE);
      if (!bruto) return padrao;
      const lido = JSON.parse(bruto);
      return Object.assign(padrao, lido);
    } catch (_) {
      return padrao;
    }
  }

  function salvaProgresso() {
    try {
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify(prog));
    } catch (_) {}
  }

  function mostraToast(msg) {
    const el = document.getElementById('toast-aviso');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.display = 'none';
    }, 2600);
  }

  function calculaPatente(totalEstrelas) {
    let atual = PATENTES[0].nome;
    for (const p of PATENTES) {
      if (totalEstrelas >= p.min) atual = p.nome;
    }
    return atual;
  }

  function missaoLiberada(id) {
    if (id <= 1) return true;
    return (prog.estrelas[id - 1] || 0) >= 1;
  }

  function trocaTela(idTela) {
    document.querySelectorAll('.tela').forEach(s => s.classList.remove('ativa'));
    const alvo = document.getElementById(idTela);
    if (alvo) alvo.classList.add('ativa');
  }

  // Renderiza Menu Principal
  function renderizaMenu() {
    let totalEst = 0;
    let totalVet = 0;
    for (let i = 1; i <= 36; i++) {
      totalEst += (prog.estrelas[i] || 0);
      if (prog.veterano[i]) totalVet++;
    }

    document.getElementById('txt-patente').textContent = calculaPatente(totalEst);
    document.getElementById('txt-total-estrelas').textContent = `★ ${totalEst}/108`;
    document.getElementById('txt-total-veterano').textContent = `✪ ${totalVet}`;
    document.getElementById('btn-som').textContent = `Som: ${prog.som ? 'ON' : 'OFF'}`;

    // Próxima missão liberada ainda sem 3 estrelas (ou última liberada)
    let proxMissao = MISSOES.MISSOES[0];
    for (const m of MISSOES.MISSOES) {
      if (missaoLiberada(m.id)) {
        proxMissao = m;
        if ((prog.estrelas[m.id] || 0) === 0) break;
      }
    }

    document.getElementById('prox-tag-novo').textContent = `NOVO: ${proxMissao.novo}`;
    document.getElementById('prox-num').textContent = `Operação ${proxMissao.op} · Missão ${proxMissao.id}`;
    document.getElementById('prox-titulo').textContent = `${proxMissao.id}. ${proxMissao.nome}`;
    document.getElementById('btn-jogar-proxima').onclick = () => abreBrief(proxMissao, null);

    const container = document.getElementById('lista-operacoes');
    container.textContent = '';

    for (const op of MISSOES.OPERACOES) {
      const bloco = document.createElement('div');
      bloco.className = 'bloco-op';

      const cab = document.createElement('div');
      cab.className = 'cabecalho-op';

      const cv = document.createElement('canvas');
      cv.width = 44;
      cv.height = 44;
      cv.className = 'retrato-mini';
      RETRATOS.desenha(cv.getContext('2d'), op.personagem, 44);

      const txtWrap = document.createElement('div');
      const tOp = document.createElement('div');
      tOp.className = 'titulo-op';
      tOp.textContent = op.nome;
      const sOp = document.createElement('div');
      sOp.className = 'sub-op';
      sOp.textContent = op.subtitulo;
      txtWrap.appendChild(tOp);
      txtWrap.appendChild(sOp);

      cab.appendChild(cv);
      cab.appendChild(txtWrap);
      bloco.appendChild(cab);

      const grade = document.createElement('div');
      grade.className = 'grade-missoes';

      const missoesOp = MISSOES.MISSOES.filter(m => m.op === op.id);
      for (const m of missoesOp) {
        const lib = missaoLiberada(m.id);
        const est = prog.estrelas[m.id] || 0;
        const vet = prog.veterano[m.id];

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'card-missao';
        btn.disabled = !lib;

        const topo = document.createElement('div');
        topo.className = 'card-missao-topo';
        const spanNum = document.createElement('span');
        spanNum.textContent = `M${m.id}`;
        const spanEst = document.createElement('span');
        spanEst.className = 'estrelas-txt';
        if (!lib) {
          spanEst.textContent = 'BLOQ';
        } else {
          spanEst.textContent = '★'.repeat(est) + '☆'.repeat(3 - est) + (vet ? ' ✪' : '');
        }
        topo.appendChild(spanNum);
        topo.appendChild(spanEst);

        const nome = document.createElement('div');
        nome.className = 'card-missao-nome';
        nome.textContent = m.nome;

        const detNovo = document.createElement('div');
        detNovo.style.fontSize = '0.7rem';
        detNovo.style.color = 'var(--texto-suave)';
        detNovo.textContent = m.novo;

        btn.appendChild(topo);
        btn.appendChild(nome);
        btn.appendChild(detNovo);

        if (lib) {
          btn.addEventListener('click', () => {
            tocaSom('ui');
            abreBrief(m, null);
          });
        }
        grade.appendChild(btn);
      }

      bloco.appendChild(grade);
      container.appendChild(bloco);
    }
  }

  function descricaoObjetivo(missao) {
    const map = {
      eliminar: 'Eliminar todos os hostis',
      maleta: 'Pegar a maleta M e levar até a saída S',
      resgate: 'Resgatar o refém R e extrair na saída S',
      captura: 'Render o alvo V vivo (luz/taser + aproximar)',
      dominio: 'Dominar a zona O sem hostis nela',
      defesa: 'Segurar a posição até o fim do tempo ou eliminar as ondas',
      bomba: 'Desarmar a bomba B (6s parado sobre B)',
      escolta: 'Proteger a VIP em deslocamento até a saída S'
    };
    if (Array.isArray(missao.objetivo)) {
      return 'Objetivos: ' + missao.objetivo.map(o => map[o] || o).join(' + ');
    }
    return 'Objetivo: ' + (map[missao.objetivo] || 'Eliminar todos os hostis');
  }

  function descricaoTatica(missao) {
    const id = typeof missao.tatica === 'string' ? missao.tatica : missao.tatica?.id;
    const map = {
      surpresa: 'Neutralizar o 1º hostil ainda tranquilo',
      dupla: 'Sempre manter um parceiro parado em segurar enquanto outro avança',
      fatiou: 'Concluir fatiar na porta antes de entrar na sala',
      sem_funil: 'Não parar mais de 0,5s em quadrado D com hostil vivo',
      cantos: 'Entrar na sala indo para cantos opostos sem parar no funil',
      janela: 'Entrar na sala em até 2s após a granada de luz detonar',
      silencio: 'Manter silêncio sem alerta até o momento exigido',
      linha_limpa: 'Não bloquear a linha de tiro de colegas ou com refém',
      simultaneo: 'Sincronizar entrada ou contato das duas frentes em até 1s',
      retaguarda: 'Manter segurança cobrindo a retaguarda e sem baixa pelas costas',
      dominio: 'Ocupar cantos e centro sem deixar operador parado em D',
      sem_propria: 'Não atingir aliado, refém ou alvo vivo com granada',
      socorro_seguro: 'Prestar socorro médico apenas fora da visão inimiga',
      cerco: 'Bloquear todas as saídas E antes de alertar o alvo',
      salto: 'Avançar por saltos: nunca mover Alfa e Bravo juntos sob visão',
      luz_curta: 'No escuro, não ficar parado de lanterna acesa nem gerar contraluz',
      sala_a_sala: 'Limpar todas as salas sem deixar hostis para trás'
    };
    return '3ª Estrela (Tática): ' + (map[id] || 'Aplicar a tática da missão');
  }

  function abreBrief(missao, modDia) {
    missaoAtual = JSON.parse(JSON.stringify(missao));
    modDiaAtivo = modDia || null;

    if (modDiaAtivo) {
      if (modDiaAtivo.tipo === 'escuro') missaoAtual.escuro = true;
      if (modDiaAtivo.tipo === 'relogio') missaoAtual.tempo = Math.max(35, Math.round((missaoAtual.tempo || 80) * 0.75));
      if (modDiaAtivo.tipo === 'alerta') missaoAtual.alertaInicial = true;
    }

    document.getElementById('brief-op-nome').textContent = modDiaAtivo
      ? `MISSÃO DO DIA · ${modDiaAtivo.rotulo}`
      : `OPERAÇÃO ${missaoAtual.op}`;
    document.getElementById('brief-titulo').textContent = `${missaoAtual.id}. ${missaoAtual.nome}`;
    document.getElementById('brief-faixa-novo').textContent = modDiaAtivo
      ? `MODIFICADOR: ${modDiaAtivo.rotulo}`
      : `NOVO: ${missaoAtual.novo}`;

    const histBox = document.getElementById('brief-historia');
    histBox.textContent = '';
    for (const linha of (missaoAtual.historia || [])) {
      const p = document.createElement('p');
      p.textContent = linha;
      histBox.appendChild(p);
    }

    const fichasBox = document.getElementById('brief-fichas');
    fichasBox.textContent = '';
    for (const f of (missaoAtual.fichas || [])) {
      const card = document.createElement('div');
      card.className = `ficha-card cor-${f.cor || 'verde'}`;

      const cv = document.createElement('canvas');
      cv.width = 64;
      cv.height = 64;
      cv.className = 'ficha-canvas';
      RETRATOS.desenha(cv.getContext('2d'), f.id, 64);

      const info = document.createElement('div');
      const nm = document.createElement('div');
      nm.className = 'ficha-nome';
      nm.textContent = f.nome;
      const ds = document.createElement('div');
      ds.className = 'ficha-desc';
      ds.textContent = f.desc;
      info.appendChild(nm);
      info.appendChild(ds);

      card.appendChild(cv);
      card.appendChild(info);
      fichasBox.appendChild(card);
    }

    document.getElementById('brief-objetivo-txt').textContent = descricaoObjetivo(missaoAtual);
    document.getElementById('brief-tempo-txt').textContent = `${missaoAtual.tempo || 90}s`;
    document.getElementById('brief-tatica-txt').textContent = descricaoTatica(missaoAtual);

    const boxVet = document.getElementById('brief-box-veterano');
    const chkVet = document.getElementById('chk-veterano');
    if ((prog.estrelas[missaoAtual.id] || 0) >= 3) {
      boxVet.style.display = 'flex';
      chkVet.checked = veteranoAtivo;
    } else {
      boxVet.style.display = 'none';
      chkVet.checked = false;
      veteranoAtivo = false;
    }

    // Seletor de classes para Missão 24 (escolherTime)
    const boxClasses = document.getElementById('brief-seletor-classes');
    boxClasses.textContent = '';
    if (missaoAtual.escolherTime) {
      boxClasses.style.display = 'flex';
      const tit = document.createElement('div');
      tit.className = 'rotulo-secao';
      tit.textContent = 'Escale a classe de cada operador:';
      boxClasses.appendChild(tit);

      const classesDisp = ['fuzileiro', 'batedor', 'apoio', 'atirador', 'escudo', 'medico'];
      missaoAtual.time.forEach((op, idx) => {
        const row = document.createElement('div');
        row.className = 'linha-classe-op';
        const lbl = document.createElement('span');
        lbl.textContent = `${idx + 1}. ${op.nome}`;
        const sel = document.createElement('select');
        for (const cl of classesDisp) {
          const opt = document.createElement('option');
          opt.value = cl;
          opt.textContent = cl.toUpperCase();
          if (op.classe === cl) opt.selected = true;
          sel.appendChild(opt);
        }
        sel.addEventListener('change', () => {
          op.classe = sel.value;
        });
        row.appendChild(lbl);
        row.appendChild(sel);
        boxClasses.appendChild(row);
      });
    } else {
      boxClasses.style.display = 'none';
    }

    trocaTela('tela-brief');
  }

  function criaPlanoVazio(missao) {
    const mapa = SIM.parseMapa(missao.mapa);
    return missao.time.map((op, idx) => {
      const p0 = mapa.opsPos[idx + 1] || { x: 2 + idx, y: mapa.A - 2 };
      return {
        pts: [{ x: p0.x, y: p0.y, ritmo: 'andar', ordem: null }],
        classe: op.classe || 'fuzileiro',
        equipe: op.equipe || (idx < Math.ceil(missao.time.length / 2) ? 'alfa' : 'bravo'),
        socorrer: op.classe === 'medico',
        seguir: null
      };
    });
  }

  function salvaPlanoLocal() {
    if (!missaoAtual) return;
    prog.ultimoPlano[missaoAtual.id] = JSON.parse(JSON.stringify(planoAtual));
    salvaProgresso();
  }

  function empilhaHistoricoPlano() {
    historicoPlanos.push(JSON.stringify(planoAtual));
    if (historicoPlanos.length > 30) historicoPlanos.shift();
  }

  function iniciaMesaPlanejamento(planoForcado) {
    pararExecucao();
    veteranoAtivo = document.getElementById('chk-veterano')?.checked || false;
    const mapa = SIM.parseMapa(missaoAtual.mapa);

    if (planoForcado) {
      planoAtual = JSON.parse(JSON.stringify(planoForcado));
    } else if (prog.ultimoPlano[missaoAtual.id] && prog.ultimoPlano[missaoAtual.id].length === missaoAtual.time.length) {
      planoAtual = JSON.parse(JSON.stringify(prog.ultimoPlano[missaoAtual.id]));
    } else {
      planoAtual = criaPlanoVazio(missaoAtual);
    }

    // Garante posição inicial exata no ponto 0 e sincroniza classes escolhidas
    planoAtual.forEach((pl, i) => {
      const p0 = mapa.opsPos[i + 1] || { x: 2 + i, y: mapa.A - 2 };
      if (!pl.pts || pl.pts.length === 0) {
        pl.pts = [{ x: p0.x, y: p0.y, ritmo: 'andar', ordem: null }];
      } else {
        pl.pts[0].x = p0.x;
        pl.pts[0].y = p0.y;
      }
      pl.classe = missaoAtual.time[i]?.classe || pl.classe || 'fuzileiro';
      pl.equipe = missaoAtual.time[i]?.equipe || pl.equipe || (i < Math.ceil(missaoAtual.time.length / 2) ? 'alfa' : 'bravo');
    });

    historicoPlanos = [];
    opSelecionado = 0;
    filtroEquipe = 'todos';
    modoApontarMapa = null;

    const cv = document.getElementById('canvas-mapa');
    cv.width = mapa.L * 32;
    cv.height = mapa.A * 32;

    document.getElementById('jogo-titulo').textContent = `${missaoAtual.id}. ${missaoAtual.nome}`;
    document.getElementById('barra-planejar').style.display = 'flex';
    document.getElementById('barra-executar').style.display = 'none';
    document.getElementById('painel-operadores').style.display = 'flex';

    renderizaFaixaOperadores();
    atualizaEstimativaETimeline();
    desenhaCena();
    trocaTela('tela-jogo');
  }

  function renderizaFaixaOperadores() {
    const grade = document.getElementById('grade-operadores');
    grade.textContent = '';
    const numOps = missaoAtual.time.length;

    const barraExtra = document.getElementById('barra-equipe-extra');
    if (numOps >= 5 || missaoAtual.id >= 16) {
      barraExtra.style.display = 'flex';
    } else {
      barraExtra.style.display = 'none';
    }

    const btnEq = document.getElementById('btn-filtro-equipe');
    btnEq.style.display = numOps >= 5 ? 'inline-flex' : 'none';
    btnEq.textContent = `EQUIPE: ${filtroEquipe.toUpperCase()}`;

    const opSelPlan = planoAtual[opSelecionado];
    const lblSoc = document.getElementById('lbl-socorrer');
    const chkSoc = document.getElementById('chk-socorrer');
    if (opSelPlan && opSelPlan.classe === 'medico' && missaoAtual.id >= 16) {
      lblSoc.style.display = 'inline-flex';
      chkSoc.checked = Boolean(opSelPlan.socorrer);
    } else {
      lblSoc.style.display = 'none';
    }

    const lblSeg = document.getElementById('lbl-seguir');
    const selSeg = document.getElementById('sel-seguir');
    if (missaoAtual.id >= 19 && opSelPlan) {
      lblSeg.style.display = 'inline-flex';
      selSeg.textContent = '';
      const optNenhum = document.createElement('option');
      optNenhum.value = '';
      optNenhum.textContent = 'Ninguém';
      selSeg.appendChild(optNenhum);
      missaoAtual.time.forEach((o, idx) => {
        if (idx !== opSelecionado) {
          const opt = document.createElement('option');
          opt.value = String(idx + 1);
          opt.textContent = `${idx + 1}. ${o.nome}`;
          if (Number(opSelPlan.seguir) === idx + 1) opt.selected = true;
          selSeg.appendChild(opt);
        }
      });
    } else {
      lblSeg.style.display = 'none';
    }

    missaoAtual.time.forEach((op, idx) => {
      const pl = planoAtual[idx];
      if (filtroEquipe !== 'todos' && pl.equipe !== filtroEquipe) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-op' + (idx === opSelecionado ? ' selecionado' : '');
      btn.style.borderLeftColor = CORES_OP[idx % CORES_OP.length];
      btn.style.borderLeftWidth = '4px';

      const cv = document.createElement('canvas');
      cv.width = 32;
      cv.height = 32;
      cv.className = 'btn-op-retr';
      RETRATOS.desenha(cv.getContext('2d'), op.retr || 'lobo', 32);

      const txt = document.createElement('div');
      txt.className = 'btn-op-txt';
      const nm = document.createElement('div');
      nm.className = 'btn-op-nome';
      nm.textContent = `${idx + 1}.${op.nome}`;
      const cl = document.createElement('div');
      cl.className = 'btn-op-classe';
      cl.textContent = (pl.classe || op.classe || 'fuz').slice(0, 6);
      txt.appendChild(nm);
      txt.appendChild(cl);

      btn.appendChild(cv);
      btn.appendChild(txt);
      btn.addEventListener('click', () => {
        opSelecionado = idx;
        modoApontarMapa = null;
        tocaSom('ui');
        renderizaFaixaOperadores();
        desenhaCena();
      });
      grade.appendChild(btn);
    });
  }

  function calculaTemposOperador(mapa, pl) {
    const tempos = [0];
    let tAcum = 0;
    const pts = pl.pts || [];
    for (let i = 1; i < pts.length; i++) {
      const ant = pts[i - 1];
      const cur = pts[i];
      const sub = SIM.caminhoCurto(mapa, ant.x, ant.y, cur.x, cur.y);
      let dTotal = 0;
      let ax = ant.x, ay = ant.y;
      for (const s of sub) {
        dTotal += Math.hypot(s.x - ax, s.y - ay);
        ax = s.x;
        ay = s.y;
      }
      const ritmo = cur.ritmo || 'andar';
      const vel = (SIM.C.VEL[ritmo] || 75) / SIM.C.QUAD;
      tAcum += dTotal / vel;
      if (cur.ordem) {
        if (cur.ordem.t === 'esperar' || (cur.ordem.t === 'segurar' && cur.ordem.s)) {
          tAcum += Number(cur.ordem.s) || 0;
        } else if (cur.ordem.t === 'fatiar') {
          tAcum += 1.0;
        } else if (cur.ordem.t === 'luz' || cur.ordem.t === 'impacto') {
          tAcum += 0.35;
        }
      }
      tempos.push(Number(tAcum.toFixed(1)));
    }
    return tempos;
  }

  function atualizaEstimativaETimeline() {
    if (!missaoAtual) return;
    const mapa = SIM.parseMapa(missaoAtual.mapa);
    let maiorT = 0;
    const gaveta = document.getElementById('gaveta-timeline');
    gaveta.textContent = '';

    const todosTempos = planoAtual.map(pl => {
      const ts = calculaTemposOperador(mapa, pl);
      const fim = ts[ts.length - 1] || 0;
      if (fim > maiorT) maiorT = fim;
      return ts;
    });

    const escalaMax = Math.max(15, Math.ceil(maiorT + 3));
    planoAtual.forEach((pl, idx) => {
      const row = document.createElement('div');
      row.className = 'linha-tl';
      const rot = document.createElement('div');
      rot.className = 'linha-tl-rotulo';
      rot.style.color = CORES_OP[idx % CORES_OP.length];
      rot.textContent = `${idx + 1}.${missaoAtual.time[idx]?.nome.slice(0, 5) || 'Op'}`;

      const barra = document.createElement('div');
      barra.className = 'linha-tl-barra';

      const ts = todosTempos[idx];
      ts.forEach((tVal, pIdx) => {
        if (pIdx === 0) return;
        const m = document.createElement('div');
        m.className = 'tl-ponto';
        m.style.left = `${Math.min(96, (tVal / escalaMax) * 100)}%`;
        m.style.backgroundColor = CORES_OP[idx % CORES_OP.length];
        const ord = pl.pts[pIdx]?.ordem?.t;
        m.textContent = ord ? ord[0].toUpperCase() : String(pIdx);
        m.title = `Ponto ${pIdx}: ${tVal}s` + (ord ? ` (${ord})` : '');
        barra.appendChild(m);
      });

      const txtFim = document.createElement('span');
      txtFim.textContent = `${(ts[ts.length - 1] || 0).toFixed(1)}s`;
      txtFim.style.width = '36px';
      txtFim.style.textAlign = 'right';

      row.appendChild(rot);
      row.appendChild(barra);
      row.appendChild(txtFim);
      gaveta.appendChild(row);
    });

    const sub = document.getElementById('jogo-subtitulo');
    if (modoApontarMapa) {
      sub.textContent = `Toque no mapa para apontar: ${modoApontarMapa.toUpperCase()}`;
    } else if (!executando) {
      sub.textContent = `Previsto: ${maiorT.toFixed(1)}s (Par: ${missaoAtual.par || 20}s) · Op ${opSelecionado + 1} (${planoAtual[opSelecionado]?.pts.length || 1}/12 pts)`;
    }
  }

  // Desenho do Mapa e Entidades no Canvas
  function desenhaCena(contextoCustom, escalaCustom, centroLupa) {
    if (!missaoAtual) return;
    const cv = document.getElementById('canvas-mapa');
    const ctx = contextoCustom || cv.getContext('2d');
    const mapa = SIM.parseMapa(missaoAtual.mapa);
    const Q = escalaCustom || (cv.width / mapa.L);

    ctx.save();
    if (centroLupa) {
      ctx.beginPath();
      ctx.arc(48, 48, 46, 0, Math.PI * 2);
      ctx.clip();
      ctx.translate(48 - (centroLupa.x + 0.5) * Q, 48 - (centroLupa.y + 0.5) * Q);
    }

    // Chão e Paredes
    for (let y = 0; y < mapa.A; y++) {
      for (let x = 0; x < mapa.L; x++) {
        const c = mapa.grade[y][x];
        const px = x * Q, py = y * Q;
        if (c === '#') {
          ctx.fillStyle = '#090d11';
          ctx.fillRect(px, py, Q, Q);
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, Q - 1, Q - 1);
        } else {
          ctx.fillStyle = missaoAtual.escuro ? '#0f161e' : '#1b242e';
          ctx.fillRect(px, py, Q, Q);
          ctx.strokeStyle = 'rgba(255,255,255,0.04)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, Q, Q);

          if (c === 'X') {
            ctx.fillStyle = '#5c4028';
            ctx.fillRect(px + 2, py + 2, Q - 4, Q - 4);
            ctx.strokeStyle = '#855d3b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(px + 3, py + 3, Q - 6, Q - 6);
          } else if (c === 'D') {
            // Porta marcada como funil
            ctx.fillStyle = 'rgba(239, 68, 68, 0.20)';
            ctx.fillRect(px, py, Q, Q);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.65)';
            ctx.setLineDash([3, 3]);
            ctx.strokeRect(px + 2, py + 2, Q - 4, Q - 4);
            ctx.setLineDash([]);
          } else if (c === 'O') {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
            ctx.fillRect(px, py, Q, Q);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(px + 1, py + 1, Q - 2, Q - 2);
          } else if (c === 'S') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
            ctx.fillRect(px, py, Q, Q);
            ctx.fillStyle = '#10b981';
            ctx.font = `bold ${Math.round(Q * 0.45)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('S', px + Q / 2, py + Q / 2);
          } else if (c === 'E') {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
            ctx.fillRect(px, py, Q, Q);
            ctx.fillStyle = '#f87171';
            ctx.font = `bold ${Math.round(Q * 0.45)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('E', px + Q / 2, py + Q / 2);
          } else if (c === 'B') {
            ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';
            ctx.fillRect(px, py, Q, Q);
            ctx.fillStyle = '#fbbf24';
            ctx.font = `bold ${Math.round(Q * 0.45)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('B', px + Q / 2, py + Q / 2);
          }
        }
      }
    }

    if (!executando && !frameReplayAtual) {
      // MODO PLANEJAMENTO: Ajudas visuais, patrulhas inimigas e rotas dos operadores
      const cfgInim = (missaoAtual.inimigo && missaoAtual.inimigo[0]) || [];
      const chavesAdv = Object.keys(mapa.advPos).sort();
      const totalAdv = Math.max(chavesAdv.length, cfgInim.length);

      for (let i = 0; i < totalAdv; i++) {
        const cfg = cfgInim[i] || {};
        const letra = cfg.id || chavesAdv[i] || String.fromCharCode(97 + i);
        const pos = mapa.advPos[letra] || cfg.pos || (cfg.pts && cfg.pts[0]);
        if (!pos) continue;

        // Rota de patrulha conhecida em vermelho apagado
        if (cfg.pts && cfg.pts.length > 1) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo((cfg.pts[0].x + 0.5) * Q, (cfg.pts[0].y + 0.5) * Q);
          for (let k = 1; k < cfg.pts.length; k++) {
            ctx.lineTo((cfg.pts[k].x + 0.5) * Q, (cfg.pts[k].y + 0.5) * Q);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Cone de visão inicial do inimigo
        const angRad = ((cfg.ang !== undefined ? cfg.ang : 90) * Math.PI) / 180;
        const raioVis = (missaoAtual.escuro ? 3.5 : 4.5) * Q;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.10)';
        ctx.beginPath();
        ctx.moveTo((pos.x + 0.5) * Q, (pos.y + 0.5) * Q);
        ctx.arc((pos.x + 0.5) * Q, (pos.y + 0.5) * Q, raioVis, angRad - 0.87, angRad + 0.87);
        ctx.closePath();
        ctx.fill();

        desenhaBoneco(ctx, pos.x, pos.y, cfg.ang !== undefined ? cfg.ang : 90, '#ef4444', letra.toUpperCase(), Q, false, false);
      }

      // Objetos iniciais (M, R, V)
      for (const m of mapa.maletas) desenhaObjeto(ctx, m.x, m.y, 'M', '#38bdf8', Q);
      for (const r of mapa.refens) desenhaObjeto(ctx, r.x, r.y, 'R', '#eab308', Q);
      for (const v of mapa.alvosVivos) desenhaObjeto(ctx, v.x, v.y, 'V', '#f43f5e', Q);

      // Rotas e ordens de cada operador
      planoAtual.forEach((pl, idx) => {
        const cor = CORES_OP[idx % CORES_OP.length];
        const pts = pl.pts || [];
        const opAtivo = idx === opSelecionado;

        for (let k = 1; k < pts.length; k++) {
          const ant = pts[k - 1];
          const cur = pts[k];
          const sub = SIM.caminhoCurto(mapa, ant.x, ant.y, cur.x, cur.y);

          ctx.save();
          ctx.strokeStyle = cor;
          ctx.globalAlpha = opAtivo ? 0.95 : 0.48;
          const ritmo = cur.ritmo || 'andar';
          if (ritmo === 'furtivo') {
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2.2;
          } else if (ritmo === 'correr') {
            ctx.lineWidth = 4.2;
          } else {
            ctx.lineWidth = 2.6;
          }

          ctx.beginPath();
          ctx.moveTo((ant.x + 0.5) * Q, (ant.y + 0.5) * Q);
          for (const s of sub) {
            ctx.lineTo((s.x + 0.5) * Q, (s.y + 0.5) * Q);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Prévia de arraste do operador selecionado
        if (opAtivo && arrastando && posDedo && arrastandoPtIdx === -1 && pts.length > 0) {
          const ult = pts[pts.length - 1];
          const subPrev = SIM.caminhoCurto(mapa, ult.x, ult.y, posDedo.x, posDedo.y);
          ctx.save();
          ctx.strokeStyle = '#ffffff';
          ctx.setLineDash([3, 3]);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo((ult.x + 0.5) * Q, (ult.y + 0.5) * Q);
          for (const s of subPrev) {
            ctx.lineTo((s.x + 0.5) * Q, (s.y + 0.5) * Q);
          }
          ctx.stroke();
          ctx.restore();
        }

        // Desenha os pontos e ajudas das ordens
        pts.forEach((p, pIdx) => {
          const cx = (p.x + 0.5) * Q;
          const cy = (p.y + 0.5) * Q;

          if (p.ordem) {
            if (p.ordem.t === 'segurar' || p.ordem.t === 'fatiar') {
              const ang = ((p.ordem.ang !== undefined ? p.ordem.ang : -90) * Math.PI) / 180;
              ctx.fillStyle = cor + '28';
              ctx.beginPath();
              ctx.moveTo(cx, cy);
              ctx.arc(cx, cy, 3.8 * Q, ang - 0.85, ang + 0.85);
              ctx.closePath();
              ctx.fill();
            } else if (p.ordem.t === 'sinal') {
              const opAlvo = planoAtual[(Number(p.ordem.de) || 1) - 1];
              const ptAlvo = opAlvo?.pts?.[Number(p.ordem.pt) || 1];
              if (ptAlvo) {
                ctx.save();
                ctx.strokeStyle = '#fbbf24';
                ctx.setLineDash([2, 3]);
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.lineTo((ptAlvo.x + 0.5) * Q, (ptAlvo.y + 0.5) * Q);
                ctx.stroke();
                ctx.restore();
              }
            } else if (p.ordem.t === 'luz' || p.ordem.t === 'impacto') {
              let gx = p.ordem.x, gy = p.ordem.y;
              if (gx === undefined || gy === undefined) {
                const rad = ((p.ordem.ang !== undefined ? p.ordem.ang : -90) * Math.PI) / 180;
                gx = p.x + Math.cos(rad) * 3.5;
                gy = p.y + Math.sin(rad) * 3.5;
              }
              const raioG = (p.ordem.t === 'luz' ? SIM.C.LUZ.raio : SIM.C.IMPACTO.raio) * Q;
              ctx.save();
              ctx.strokeStyle = p.ordem.t === 'luz' ? '#38bdf8' : '#f97316';
              ctx.fillStyle = p.ordem.t === 'luz' ? 'rgba(56,189,248,0.12)' : 'rgba(249,115,22,0.16)';
              ctx.beginPath();
              ctx.arc((gx + 0.5) * Q, (gy + 0.5) * Q, raioG, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
              ctx.restore();
            }
          }

          if (pIdx > 0) {
            ctx.fillStyle = cor;
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(5, Q * 0.22), 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#090d11';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // Escudo de cobertura se o ponto tem cobertura
            if (SIM.temCoberturaQualquer(mapa, p.x, p.y)) {
              ctx.fillStyle = '#38bdf8';
              ctx.font = `bold ${Math.round(Q * 0.32)}px sans-serif`;
              ctx.fillText('⛨', cx + Q * 0.26, cy - Q * 0.22);
            }

            if (p.ordem && p.ordem.t) {
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.round(Q * 0.30)}px monospace`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(p.ordem.t[0].toUpperCase(), cx, cy);
            }
          }
        });

        if (pts[0]) {
          desenhaBoneco(ctx, pts[0].x, pts[0].y, -90, cor, String(idx + 1), Q, opAtivo, false);
        }
      });
    } else {
      // MODO EXECUÇÃO OU REPLAY
      const fonte = frameReplayAtual || estadoSim;
      if (fonte) {
        const maletas = fonte.maletas || [];
        const refens = fonte.refens || [];
        const alvosVivos = fonte.alvosVivos || [];
        const advs = fonte.advs || [];
        const ops = fonte.ops || [];
        const disparos = fonte.disparos || fonte.disparosVisuais || [];

        for (const m of maletas) {
          if (!m.extraida) desenhaObjeto(ctx, m.x, m.y, 'M', '#38bdf8', Q);
        }
        for (const r of refens) {
          if (r.vivo && !r.extraido) desenhaObjeto(ctx, r.x, r.y, 'R', '#eab308', Q);
        }
        for (const v of alvosVivos) {
          if (v.vivo && !v.extraido) desenhaObjeto(ctx, v.x, v.y, v.rendido ? 'V✓' : 'V', '#f43f5e', Q);
        }

        // Traços de disparo
        for (const d of disparos) {
          ctx.save();
          ctx.strokeStyle = d.time === 'op' ? '#fde047' : '#f87171';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo((d.ax + 0.5) * Q, (d.ay + 0.5) * Q);
          ctx.lineTo((d.bx + 0.5) * Q, (d.by + 0.5) * Q);
          ctx.stroke();
          ctx.restore();
        }

        for (const a of advs) {
          if (!a.vivo) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.30)';
            ctx.beginPath();
            ctx.arc((a.x + 0.5) * Q, (a.y + 0.5) * Q, Q * 0.28, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }
          desenhaBoneco(ctx, a.x, a.y, a.ang, '#ef4444', a.id.toUpperCase(), Q, false, a.suprimido, a.atordoado, a.alerta);
        }

        ops.forEach((o, idx) => {
          const cor = CORES_OP[idx % CORES_OP.length];
          if (!o.vivo) {
            ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.beginPath();
            ctx.arc((o.x + 0.5) * Q, (o.y + 0.5) * Q, Q * 0.30, 0, Math.PI * 2);
            ctx.fill();
            return;
          }
          if (o.lanterna) {
            const rad = (o.ang * Math.PI) / 180;
            ctx.fillStyle = 'rgba(254, 240, 138, 0.16)';
            ctx.beginPath();
            ctx.moveTo((o.x + 0.5) * Q, (o.y + 0.5) * Q);
            ctx.arc((o.x + 0.5) * Q, (o.y + 0.5) * Q, 6 * Q, rad - 0.65, rad + 0.65);
            ctx.closePath();
            ctx.fill();
          }
          desenhaBoneco(ctx, o.x, o.y, o.ang, cor, o.id, Q, false, o.suprimido, o.atordoado, false, o.ferido);
        });
      }
    }

    ctx.restore();
  }

  function desenhaBoneco(ctx, x, y, ang, cor, rotulo, Q, selecionado, suprimido, atordoado, alerta, ferido) {
    const tremorX = suprimido ? (Math.sin(Date.now() * 0.08) * 2) : 0;
    const cx = (x + 0.5) * Q + tremorX;
    const cy = (y + 0.5) * Q;
    const r = Math.max(7, Q * 0.34);

    ctx.save();
    if (selecionado) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Direção do olhar / arma
    const rad = ((ang || 0) * Math.PI) / 180;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(rad) * (r + 5), cy + Math.sin(rad) * (r + 5));
    ctx.stroke();

    ctx.fillStyle = ferido ? '#f59e0b' : cor;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#090d11';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#090d11';
    ctx.font = `bold ${Math.round(r * 1.05)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ferido ? '+' : rotulo, cx, cy + 0.5);

    if (atordoado) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = `bold ${Math.round(Q * 0.35)}px sans-serif`;
      ctx.fillText('★', cx, cy - r - 5);
    } else if (alerta) {
      ctx.fillStyle = '#fde047';
      ctx.font = `bold ${Math.round(Q * 0.38)}px sans-serif`;
      ctx.fillText('!', cx + r, cy - r);
    }
    ctx.restore();
  }

  function desenhaObjeto(ctx, x, y, letra, cor, Q) {
    const cx = (x + 0.5) * Q;
    const cy = (y + 0.5) * Q;
    const r = Math.max(6, Q * 0.32);
    ctx.save();
    ctx.fillStyle = cor;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.strokeStyle = '#090d11';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - r, cy - r, r * 2, r * 2);
    ctx.fillStyle = '#090d11';
    ctx.font = `bold ${Math.round(r * 1.1)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letra, cx, cy);
    ctx.restore();
  }

  // Conversão de evento de toque/mouse em coordenadas do mapa
  function coordsDoEvento(ev) {
    const cv = document.getElementById('canvas-mapa');
    const rect = cv.getBoundingClientRect();
    const mapa = SIM.parseMapa(missaoAtual.mapa);
    const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
    const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
    const gx = Math.floor(((clientX - rect.left) / rect.width) * mapa.L);
    const gy = Math.floor(((clientY - rect.top) / rect.height) * mapa.A);
    return {
      x: Math.max(0, Math.min(mapa.L - 1, gx)),
      y: Math.max(0, Math.min(mapa.A - 1, gy)),
      px: clientX - rect.left,
      py: clientY - rect.top
    };
  }

  function atualizaLupa(c) {
    const lupa = document.getElementById('canvas-lupa');
    const mapa = SIM.parseMapa(missaoAtual.mapa);
    if (!arrastando || mapa.L < 14 || executando) {
      lupa.style.display = 'none';
      return;
    }
    lupa.style.display = 'block';
    lupa.style.left = `${Math.max(8, Math.min(260, c.px - 48))}px`;
    lupa.style.top = `${Math.max(8, c.py - 110)}px`;
    const lCtx = lupa.getContext('2d');
    lCtx.clearRect(0, 0, 96, 96);
    desenhaCena(lCtx, 28, { x: c.x, y: c.y });
  }

  // Abre a Folha de Ordens de um ponto da rota
  function abreModalOrdem(ptIdx) {
    const pl = planoAtual[opSelecionado];
    if (!pl || !pl.pts[ptIdx]) return;
    editandoPtIdx = ptIdx;
    const pt = pl.pts[ptIdx];
    ritmoTemp = pt.ritmo || 'andar';
    ordemTemp = pt.ordem ? JSON.parse(JSON.stringify(pt.ordem)) : null;

    document.getElementById('titulo-modal-ordem').textContent =
      `Operador ${opSelecionado + 1} · Ponto ${ptIdx} (${pt.x}, ${pt.y})`;

    const blocoRitmo = document.getElementById('bloco-ritmo-ponto');
    blocoRitmo.style.display = ptIdx === 0 ? 'none' : 'flex';
    document.querySelectorAll('#bloco-ritmo-ponto [data-ritmo]').forEach(btn => {
      btn.classList.toggle('ativo', btn.getAttribute('data-ritmo') === ritmoTemp);
      btn.onclick = () => {
        ritmoTemp = btn.getAttribute('data-ritmo');
        document.querySelectorAll('#bloco-ritmo-ponto [data-ritmo]').forEach(b =>
          b.classList.toggle('ativo', b.getAttribute('data-ritmo') === ritmoTemp)
        );
      };
    });

    const btnRem = document.getElementById('btn-remover-ponto');
    btnRem.style.display = ptIdx === 0 ? 'none' : 'inline-flex';

    renderizaBotoesOrdemModal();
    document.getElementById('modal-ordem').classList.add('ativo');
  }

  function renderizaBotoesOrdemModal() {
    const cont = document.getElementById('lista-ordens-ponto');
    cont.textContent = '';
    const liberadas = MISSOES.ordensLiberadas(missaoAtual.id).filter(o => {
      if (modDiaAtivo && modDiaAtivo.tipo === 'sem_granada' && (o === 'luz' || o === 'impacto')) return false;
      if (o === 'lanterna' && !missaoAtual.escuro) return false;
      return true;
    });

    const btnNenhuma = document.createElement('button');
    btnNenhuma.type = 'button';
    btnNenhuma.className = 'btn btn-opcao' + (!ordemTemp ? ' ativo' : '');
    btnNenhuma.textContent = 'Nenhuma ordem';
    btnNenhuma.onclick = () => {
      ordemTemp = null;
      renderizaBotoesOrdemModal();
    };
    cont.appendChild(btnNenhuma);

    for (const tipo of liberadas) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-opcao' + (ordemTemp && ordemTemp.t === tipo ? ' ativo' : '');
      btn.textContent = NOMES_ORDEM[tipo] || tipo;
      btn.onclick = () => {
        if (tipo === 'esperar') ordemTemp = { t: 'esperar', s: 3 };
        else if (tipo === 'segurar') ordemTemp = { t: 'segurar', ang: -90, s: 0 };
        else if (tipo === 'fatiar') ordemTemp = { t: 'fatiar', ang: -90 };
        else if (tipo === 'sinal') ordemTemp = { t: 'sinal', de: opSelecionado === 0 ? 2 : 1, pt: 1 };
        else if (tipo === 'luz') ordemTemp = { t: 'luz', ang: -90, dist: 4 };
        else if (tipo === 'impacto') ordemTemp = { t: 'impacto', ang: -90, dist: 3.5 };
        else if (tipo === 'taser') ordemTemp = { t: 'taser' };
        else if (tipo === 'lanterna') ordemTemp = { t: 'lanterna', liga: true };
        renderizaBotoesOrdemModal();
      };
      cont.appendChild(btn);
    }

    const extra = document.getElementById('config-extra-ordem');
    extra.textContent = '';
    if (!ordemTemp) {
      extra.style.display = 'none';
      return;
    }
    extra.style.display = 'flex';

    if (ordemTemp.t === 'esperar' || ordemTemp.t === 'segurar') {
      const lbl = document.createElement('label');
      lbl.className = 'rotulo-secao';
      lbl.textContent = ordemTemp.t === 'segurar' ? 'Segundos (0 = até o fim):' : 'Segundos parado:';
      const inp = document.createElement('input');
      inp.type = 'number';
      inp.min = '0';
      inp.max = '30';
      inp.step = '0.5';
      inp.value = String(ordemTemp.s || 0);
      inp.style.minHeight = '40px';
      inp.style.padding = '6px';
      inp.style.background = 'var(--bg-card)';
      inp.style.border = '1px solid var(--borda)';
      inp.onchange = () => { ordemTemp.s = Number(inp.value) || 0; };
      extra.appendChild(lbl);
      extra.appendChild(inp);
    }

    if (ordemTemp.t === 'segurar' || ordemTemp.t === 'fatiar' || ordemTemp.t === 'luz' || ordemTemp.t === 'impacto') {
      const lblA = document.createElement('div');
      lblA.className = 'rotulo-secao';
      lblA.textContent = 'Direção / Ângulo:';
      const gradeDir = document.createElement('div');
      gradeDir.className = 'grade-botoes-3';
      const dirs = [
        { n: 'Norte (-90°)', a: -90 },
        { n: 'Sul (90°)', a: 90 },
        { n: 'Oeste (180°)', a: 180 },
        { n: 'Leste (0°)', a: 0 },
        { n: 'NO (-135°)', a: -135 },
        { n: 'NE (-45°)', a: -45 }
      ];
      for (const d of dirs) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'btn btn-opcao' + (ordemTemp.ang === d.a ? ' ativo' : '');
        b.textContent = d.n;
        b.onclick = () => {
          ordemTemp.ang = d.a;
          delete ordemTemp.x;
          delete ordemTemp.y;
          renderizaBotoesOrdemModal();
        };
        gradeDir.appendChild(b);
      }
      const btnApontar = document.createElement('button');
      btnApontar.type = 'button';
      btnApontar.className = 'btn';
      btnApontar.textContent = 'Apontar alvo tocando no mapa';
      btnApontar.onclick = () => {
        salvaOrdemDoModal();
        modoApontarMapa = ordemTemp.t;
        atualizaEstimativaETimeline();
      };
      extra.appendChild(lblA);
      extra.appendChild(gradeDir);
      extra.appendChild(btnApontar);
    }

    if (ordemTemp.t === 'sinal') {
      const lblOp = document.createElement('label');
      lblOp.className = 'rotulo-secao';
      lblOp.textContent = 'Esperar pelo Operador:';
      const selOp = document.createElement('select');
      selOp.style.minHeight = '40px';
      selOp.style.padding = '6px';
      selOp.style.background = 'var(--bg-card)';
      missaoAtual.time.forEach((o, idx) => {
        if (idx !== opSelecionado) {
          const opt = document.createElement('option');
          opt.value = String(idx + 1);
          opt.textContent = `Operador ${idx + 1} (${o.nome})`;
          if (Number(ordemTemp.de) === idx + 1) opt.selected = true;
          selOp.appendChild(opt);
        }
      });
      selOp.onchange = () => { ordemTemp.de = Number(selOp.value); };

      const lblPt = document.createElement('label');
      lblPt.className = 'rotulo-secao';
      lblPt.textContent = 'Quando ele concluir o ponto nº:';
      const inpPt = document.createElement('input');
      inpPt.type = 'number';
      inpPt.min = '1';
      inpPt.max = '11';
      inpPt.value = String(ordemTemp.pt || 1);
      inpPt.style.minHeight = '40px';
      inpPt.style.padding = '6px';
      inpPt.style.background = 'var(--bg-card)';
      inpPt.onchange = () => { ordemTemp.pt = Math.max(1, Number(inpPt.value) || 1); };

      extra.appendChild(lblOp);
      extra.appendChild(selOp);
      extra.appendChild(lblPt);
      extra.appendChild(inpPt);
    }
  }

  function salvaOrdemDoModal() {
    const pl = planoAtual[opSelecionado];
    if (pl && pl.pts[editandoPtIdx]) {
      empilhaHistoricoPlano();
      if (editandoPtIdx > 0) pl.pts[editandoPtIdx].ritmo = ritmoTemp;
      pl.pts[editandoPtIdx].ordem = ordemTemp ? JSON.parse(JSON.stringify(ordemTemp)) : null;
      salvaPlanoLocal();
      atualizaEstimativaETimeline();
      desenhaCena();
    }
    document.getElementById('modal-ordem').classList.remove('ativo');
  }

  // Execução animada da simulação
  function iniciaExecucao() {
    if (!missaoAtual) return;
    tocaSom('ui');
    salvaPlanoLocal();
    frameReplayAtual = null;
    executando = true;
    pausado = false;

    const tent = prog.tentativas[missaoAtual.id] || 0;
    prog.tentativas[missaoAtual.id] = tent + 1;
    salvaProgresso();

    const semente = (missaoAtual.semente || 100) + tent;
    const opcoes = {
      veterano: veteranoAtivo,
      escuro: Boolean(missaoAtual.escuro),
      alertaInicial: Boolean(missaoAtual.alertaInicial),
      gravarFrames: true
    };

    resultadoSim = SIM.roda(missaoAtual, planoAtual, semente, opcoes);
    estadoSim = SIM.cria(missaoAtual, planoAtual, semente, opcoes);

    document.getElementById('barra-planejar').style.display = 'none';
    document.getElementById('barra-executar').style.display = 'flex';
    document.getElementById('painel-operadores').style.display = 'none';
    document.getElementById('gaveta-timeline').classList.remove('aberta');
    document.getElementById('btn-pausar').textContent = 'PAUSAR';

    ultimoTimestamp = performance.now();
    acumuladorTempo = 0;
    loopExecucao(ultimoTimestamp);
  }

  function loopExecucao(agora) {
    if (!executando) return;
    const dtReal = Math.min(0.1, (agora - ultimoTimestamp) / 1000);
    ultimoTimestamp = agora;

    if (!pausado && estadoSim && !estadoSim.terminou) {
      acumuladorTempo += dtReal * velocidadeExec;
      const numEventosAntes = estadoSim.eventos.length;
      while (acumuladorTempo >= SIM.C.PASSO && !estadoSim.terminou) {
        SIM.passo(estadoSim);
        acumuladorTempo -= SIM.C.PASSO;
      }
      for (let i = numEventosAntes; i < estadoSim.eventos.length; i++) {
        const ev = estadoSim.eventos[i];
        if (ev.tipo === 'disparo') tocaSom('tiro');
        else if (ev.tipo === 'luz') tocaSom('luz');
        else if (ev.tipo === 'impacto') tocaSom('impacto');
        else if (ev.tipo === 'faca' || ev.tipo === 'taser') tocaSom('faca');
      }
      document.getElementById('jogo-subtitulo').textContent =
        `Execução: ${estadoSim.t.toFixed(1)}s / ${estadoSim.tempoMax}s`;
    }

    desenhaCena();

    if (estadoSim && estadoSim.terminou) {
      executando = false;
      finalizaPartida();
      return;
    }

    animFrameId = requestAnimationFrame(loopExecucao);
  }

  function pararExecucao() {
    executando = false;
    pausado = false;
    frameReplayAtual = null;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    document.getElementById('barra-planejar').style.display = 'flex';
    document.getElementById('barra-executar').style.display = 'none';
    document.getElementById('painel-operadores').style.display = 'flex';
    atualizaEstimativaETimeline();
    desenhaCena();
  }

  function finalizaPartida() {
    if (!resultadoSim) return;
    tocaSom(resultadoSim.venceu ? 'vitoria' : 'derrota');

    if (resultadoSim.venceu) {
      const id = missaoAtual.id;
      if (resultadoSim.estrelas > (prog.estrelas[id] || 0)) {
        prog.estrelas[id] = resultadoSim.estrelas;
      }
      if (veteranoAtivo && resultadoSim.estrelas === 3) {
        prog.veterano[id] = true;
      }
      if (!prog.melhor[id] || resultadoSim.tempo < prog.melhor[id]) {
        prog.melhor[id] = resultadoSim.tempo;
      }
      // Selos
      const teveTiroOp = resultadoSim.eventos.some(e => e.tipo === 'disparo' && Number(e.quem) >= 1);
      if (!teveTiroOp) prog.selos.sem_tiro = true;
      if ((prog.tentativas[id] || 1) === 1) prog.selos.primeira_tentativa = true;
      const missoesDaOp = MISSOES.MISSOES.filter(m => m.op === missaoAtual.op);
      if (missoesDaOp.every(m => (prog.estrelas[m.id] || 0) === 3)) {
        prog.selos[`op_${missaoAtual.op}`] = true;
      }
      if (modDiaAtivo) {
        prog.dia[modDiaAtivo.chave] = resultadoSim.estrelas;
      }
      salvaProgresso();
    }

    abreModalResultado();
  }

  function abreModalResultado() {
    const r = resultadoSim;
    document.getElementById('titulo-modal-res').textContent =
      r.venceu ? `VITÓRIA (${r.estrelas}★)` : 'MISSÃO FALHOU';
    document.getElementById('res-tempo').textContent = `${r.tempo.toFixed(1)}s`;

    const listaEst = document.getElementById('res-estrelas-lista');
    listaEst.textContent = '';

    const itens = [
      { ok: r.venceu, txt: '★ Cumpriu o objetivo principal' },
      { ok: r.venceu && r.semBaixaCritica, txt: '★ Sem baixa crítica no esquadrão' },
      {
        ok: r.venceu && r.tatica,
        txt: `${r.venceu && r.tatica ? '✔' : '✘'} Tática: ${r.taticaDetalhe?.motivo || ''}`
      }
    ];
    for (const it of itens) {
      const div = document.createElement('div');
      div.className = 'item-estrela-res' + (it.ok ? ' ganhou' : '');
      div.textContent = it.txt;
      listaEst.appendChild(div);
    }

    // Diagnóstico da primeira baixa ou motivo
    const elPorQue = document.getElementById('res-por-que');
    if (r.baixas && r.baixas.length > 0) {
      const b0 = r.baixas[0];
      const opNome = missaoAtual.time[(Number(b0.alvo) || 1) - 1]?.nome || `Op ${b0.alvo}`;
      const molde = SIM.LICOES_BAIXA[b0.causa] || SIM.LICOES_BAIXA.duelo;
      elPorQue.textContent = molde.replace('{n}', opNome);
    } else if (!r.venceu && r.motivo === 'tempo') {
      elPorQue.textContent = SIM.LICOES_BAIXA.tempo;
    } else if (!r.venceu && (r.motivo === 'refem' || r.motivo === 'alvo_morto' || r.motivo === 'fugiu')) {
      elPorQue.textContent = SIM.LICOES_BAIXA.refem;
    } else if (r.venceu && !r.tatica) {
      elPorQue.textContent = r.taticaDetalhe?.motivo || 'Faltou aplicar a tática exigida pela missão.';
    } else {
      elPorQue.textContent = 'Execução limpa sem baixas críticas na equipe.';
    }

    document.getElementById('res-licao').textContent = missaoAtual.licao || 'Quem planeja antes, vence.';

    // Replay interativo
    const slider = document.getElementById('slider-replay');
    const frames = r.frames || [];
    slider.max = String(Math.max(0, frames.length - 1));
    slider.value = String(Math.max(0, frames.length - 1));
    slider.oninput = () => {
      const idx = Number(slider.value) || 0;
      if (frames[idx]) {
        frameReplayAtual = frames[idx];
        desenhaCena();
      }
    };

    const chips = document.getElementById('res-chips-eventos');
    chips.textContent = '';
    const importantes = r.eventos.filter(e =>
      ['baixa', 'ferido', 'luz', 'impacto', 'faca', 'taser', 'rendido', 'pegou', 'alerta', 'objetivo'].includes(e.tipo)
    ).slice(0, 10);

    for (const ev of importantes) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip-evento';
      btn.textContent = `${ev.t.toFixed(1)}s: ${ev.tipo.toUpperCase()}`;
      btn.onclick = () => {
        let melhorIdx = 0;
        for (let i = 0; i < frames.length; i++) {
          if (frames[i].t <= ev.t) melhorIdx = i;
        }
        slider.value = String(melhorIdx);
        frameReplayAtual = frames[melhorIdx] || null;
        desenhaCena();
      };
      chips.appendChild(btn);
    }

    const btnProx = document.getElementById('btn-res-proxima');
    const proxM = MISSOES.MISSOES.find(m => m.id === missaoAtual.id + 1);
    btnProx.style.display = (r.venceu && proxM) ? 'inline-flex' : 'none';
    btnProx.onclick = () => {
      document.getElementById('modal-resultado').classList.remove('ativo');
      if (proxM) abreBrief(proxM, null);
    };

    document.getElementById('modal-resultado').classList.add('ativo');
  }

  // Compartilhamento seguro por hash (#m=17&p=...)
  function codificaPlanoUrl(idMissao, plano) {
    const compacto = plano.map(pl => ({
      pts: (pl.pts || []).slice(0, 12).map(p => {
        const item = { x: Math.round(p.x), y: Math.round(p.y) };
        if (p.ritmo && p.ritmo !== 'andar') item.r = p.ritmo;
        if (p.ordem && p.ordem.t) item.o = p.ordem;
        return item;
      }),
      s: pl.seguir || undefined
    }));
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(compacto))));
    return `#m=${idMissao}&p=${b64}`;
  }

  function tentaLerPlanoDaUrl() {
    try {
      const hash = window.location.hash || '';
      if (!hash.startsWith('#m=') || hash.length > 3000) return false;
      const params = new URLSearchParams(hash.slice(1));
      const mId = parseInt(params.get('m') || '', 10);
      const pB64 = params.get('p') || '';
      const missao = MISSOES.MISSOES.find(m => m.id === mId);
      if (!missao || !pB64) return false;

      const jsonStr = decodeURIComponent(escape(atob(pB64)));
      const dados = JSON.parse(jsonStr);
      if (!Array.isArray(dados) || dados.length !== missao.time.length) return false;

      const mapa = SIM.parseMapa(missao.mapa);
      const ordensLib = MISSOES.ordensLiberadas(missao.id);
      const ritmosValidos = ['furtivo', 'andar', 'correr'];

      const planoLido = [];
      for (let i = 0; i < dados.length; i++) {
        const d = dados[i];
        if (!d || !Array.isArray(d.pts) || d.pts.length === 0 || d.pts.length > 12) return false;
        const ptsValidados = [];
        for (let k = 0; k < d.pts.length; k++) {
          const pt = d.pts[k];
          const x = Number(pt.x), y = Number(pt.y);
          if (!Number.isInteger(x) || !Number.isInteger(y) || !SIM.ehAndavel(mapa, x, y)) return false;
          const ritmo = pt.r || pt.ritmo || 'andar';
          if (!ritmosValidos.includes(ritmo)) return false;
          let ordem = null;
          const ordOrig = pt.o || pt.ordem;
          if (ordOrig && ordOrig.t) {
            if (!ordensLib.includes(ordOrig.t)) return false;
            ordem = {
              t: String(ordOrig.t),
              ang: ordOrig.ang !== undefined ? Number(ordOrig.ang) : undefined,
              s: ordOrig.s !== undefined ? Number(ordOrig.s) : undefined,
              de: ordOrig.de !== undefined ? Number(ordOrig.de) : undefined,
              pt: ordOrig.pt !== undefined ? Number(ordOrig.pt) : undefined,
              x: ordOrig.x !== undefined ? Number(ordOrig.x) : undefined,
              y: ordOrig.y !== undefined ? Number(ordOrig.y) : undefined,
              liga: ordOrig.liga !== undefined ? Boolean(ordOrig.liga) : undefined
            };
          }
          ptsValidados.push({ x, y, ritmo, ordem });
        }
        planoLido.push({
          pts: ptsValidados,
          classe: missao.time[i].classe || 'fuzileiro',
          socorrer: missao.time[i].classe === 'medico',
          seguir: d.s ? Number(d.s) : null
        });
      }

      missaoAtual = JSON.parse(JSON.stringify(missao));
      document.getElementById('amigo-titulo').textContent = `${missao.id}. ${missao.nome}`;
      document.getElementById('btn-amigo-executar').onclick = () => {
        iniciaMesaPlanejamento(planoLido);
        iniciaExecucao();
      };
      document.getElementById('btn-amigo-editar').onclick = () => {
        iniciaMesaPlanejamento(planoLido);
      };
      trocaTela('tela-amigo');
      return true;
    } catch (_) {
      return false;
    }
  }

  function compartilhaPlanoAtual() {
    if (!missaoAtual) return;
    const hash = codificaPlanoUrl(missaoAtual.id, planoAtual);
    const url = window.location.origin + window.location.pathname + hash;
    const texto = `Comandante · Meu plano tático na Missão ${missaoAtual.id} (${missaoAtual.nome}): ${url}`;

    if (navigator.share) {
      navigator.share({ title: 'Comandante: Plano de Jogo', text: texto, url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        mostraToast('Link do plano copiado para a área de transferência!');
      }).catch(() => {
        window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
      });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
    }
  }

  function abreMissaoDoDia() {
    const hoje = new Date().toISOString().slice(0, 10);
    let hashDia = 0;
    for (let i = 0; i < hoje.length; i++) {
      hashDia = ((hashDia << 5) - hashDia + hoje.charCodeAt(i)) | 0;
    }
    hashDia = Math.abs(hashDia);
    const missaoSorteada = MISSOES.MISSOES[hashDia % MISSOES.MISSOES.length];
    const mods = [
      { tipo: 'escuro', rotulo: 'Combate no Escuro' },
      { tipo: 'relogio', rotulo: 'Relógio Reduzido (-25%)' },
      { tipo: 'alerta', rotulo: 'Inimigos em Alerta Inicial' },
      { tipo: 'sem_granada', rotulo: 'Sem Granadas' }
    ];
    const mod = mods[(hashDia >> 3) % mods.length];
    abreBrief(missaoSorteada, { tipo: mod.tipo, rotulo: `${hoje} · ${mod.rotulo}`, chave: hoje });
  }

  function abreModalSelos() {
    const cont = document.getElementById('lista-selos-modal');
    cont.textContent = '';
    const lista = [
      { id: 'sem_tiro', nome: 'Fantasma: Sem um Tiro', desc: 'Vencer uma missão sem disparar armas de fogo.' },
      { id: 'primeira_tentativa', nome: 'Leitura Perfeita', desc: 'Vencer uma missão na primeira tentativa.' },
      { id: 'op_1', nome: 'Operação 1 Impecável', desc: '3 estrelas em todas as missões da Operação 1.' },
      { id: 'op_2', nome: 'Operação 2 Impecável', desc: '3 estrelas em todas as missões da Operação 2.' },
      { id: 'op_3', nome: 'Operação 3 Impecável', desc: '3 estrelas em todas as missões da Operação 3.' },
      { id: 'op_4', nome: 'Operação 4 Impecável', desc: '3 estrelas em todas as missões da Operação 4.' },
      { id: 'op_5', nome: 'Operação 5 Impecável', desc: '3 estrelas em todas as missões da Operação 5.' },
      { id: 'op_6', nome: 'Comandante Supremo (Op 6)', desc: '3 estrelas em todas as missões da Operação 6.' }
    ];

    for (const s of lista) {
      const ganho = Boolean(prog.selos[s.id]);
      const card = document.createElement('div');
      card.className = 'caixa-estrelas-res';
      card.style.borderColor = ganho ? 'var(--acento)' : 'var(--borda)';
      const t = document.createElement('div');
      t.style.fontWeight = '800';
      t.style.color = ganho ? 'var(--acento)' : 'var(--texto-suave)';
      t.textContent = `${ganho ? '🏅' : '🔒'} ${s.nome}`;
      const d = document.createElement('div');
      d.style.fontSize = '0.8rem';
      d.textContent = s.desc;
      card.appendChild(t);
      card.appendChild(d);
      cont.appendChild(card);
    }

    document.getElementById('modal-selos').classList.add('ativo');
  }

  // Eventos de UI e Gestos no Mapa
  function configuraEventos() {
    document.documentElement.setAttribute('data-tema', prog.tema || 'escuro');

    document.getElementById('btn-som').onclick = () => {
      prog.som = !prog.som;
      salvaProgresso();
      renderizaMenu();
    };

    document.getElementById('btn-tema').onclick = () => {
      prog.tema = prog.tema === 'claro' ? 'escuro' : 'claro';
      document.documentElement.setAttribute('data-tema', prog.tema);
      salvaProgresso();
    };

    document.getElementById('btn-missao-dia').onclick = () => {
      tocaSom('ui');
      abreMissaoDoDia();
    };

    document.getElementById('btn-ver-selos').onclick = () => {
      tocaSom('ui');
      abreModalSelos();
    };

    document.getElementById('btn-fechar-selos').onclick = () => {
      document.getElementById('modal-selos').classList.remove('ativo');
    };

    document.getElementById('btn-brief-voltar').onclick = () => {
      renderizaMenu();
      trocaTela('tela-menu');
    };

    document.getElementById('btn-amigo-voltar').onclick = () => {
      window.location.hash = '';
      renderizaMenu();
      trocaTela('tela-menu');
    };

    document.getElementById('btn-ir-planejar').onclick = () => {
      tocaSom('ui');
      iniciaMesaPlanejamento(null);
    };

    document.getElementById('btn-jogo-voltar').onclick = () => {
      pararExecucao();
      abreBrief(missaoAtual, modDiaAtivo);
    };

    document.getElementById('btn-jogo-dica').onclick = () => {
      if (!missaoAtual) return;
      document.getElementById('dica-texto').textContent = missaoAtual.dica || 'Observe os ângulos e sincronize a entrada.';
      document.getElementById('modal-dica').classList.add('ativo');
    };

    document.getElementById('btn-fechar-dica').onclick = () => {
      document.getElementById('modal-dica').classList.remove('ativo');
    };

    document.getElementById('btn-aplicar-gabarito').onclick = () => {
      if (!missaoAtual || !MISSOES.GABARITOS) return;
      const gab = MISSOES.GABARITOS[String(missaoAtual.id)];
      if (gab) {
        empilhaHistoricoPlano();
        iniciaMesaPlanejamento(gab);
        salvaPlanoLocal();
        mostraToast('Plano tático de demonstração carregado!');
      }
      document.getElementById('modal-dica').classList.remove('ativo');
    };

    document.getElementById('btn-filtro-equipe').onclick = () => {
      if (filtroEquipe === 'todos') filtroEquipe = 'alfa';
      else if (filtroEquipe === 'alfa') filtroEquipe = 'bravo';
      else filtroEquipe = 'todos';
      renderizaFaixaOperadores();
    };

    document.getElementById('chk-socorrer').onchange = (e) => {
      if (planoAtual[opSelecionado]) {
        planoAtual[opSelecionado].socorrer = e.target.checked;
        salvaPlanoLocal();
      }
    };

    document.getElementById('sel-seguir').onchange = (e) => {
      if (planoAtual[opSelecionado]) {
        planoAtual[opSelecionado].seguir = e.target.value ? Number(e.target.value) : null;
        salvaPlanoLocal();
        desenhaCena();
      }
    };

    document.getElementById('btn-desfazer').onclick = () => {
      if (historicoPlanos.length > 0) {
        planoAtual = JSON.parse(historicoPlanos.pop());
        salvaPlanoLocal();
        atualizaEstimativaETimeline();
        desenhaCena();
      } else {
        const pts = planoAtual[opSelecionado]?.pts;
        if (pts && pts.length > 1) {
          pts.pop();
          salvaPlanoLocal();
          atualizaEstimativaETimeline();
          desenhaCena();
        }
      }
    };

    document.getElementById('btn-limpar').onclick = () => {
      empilhaHistoricoPlano();
      planoAtual = criaPlanoVazio(missaoAtual);
      salvaPlanoLocal();
      atualizaEstimativaETimeline();
      desenhaCena();
    };

    document.getElementById('btn-timeline').onclick = () => {
      document.getElementById('gaveta-timeline').classList.toggle('aberta');
    };

    document.getElementById('btn-executar').onclick = () => {
      iniciaExecucao();
    };

    document.getElementById('btn-pausar').onclick = () => {
      pausado = !pausado;
      document.getElementById('btn-pausar').textContent = pausado ? 'RETOMAR' : 'PAUSAR';
    };

    const setVel = (v) => {
      velocidadeExec = v;
      document.getElementById('btn-vel-1x').classList.toggle('ativo', v === 1);
      document.getElementById('btn-vel-2x').classList.toggle('ativo', v === 2);
      document.getElementById('btn-vel-4x').classList.toggle('ativo', v === 4);
    };
    document.getElementById('btn-vel-1x').onclick = () => setVel(1);
    document.getElementById('btn-vel-2x').onclick = () => setVel(2);
    document.getElementById('btn-vel-4x').onclick = () => setVel(4);
    document.getElementById('btn-parar').onclick = () => pararExecucao();

    document.getElementById('btn-fechar-ordem').onclick = () => {
      document.getElementById('modal-ordem').classList.remove('ativo');
    };
    document.getElementById('btn-salvar-ordem').onclick = () => salvaOrdemDoModal();
    document.getElementById('btn-remover-ponto').onclick = () => {
      const pl = planoAtual[opSelecionado];
      if (pl && editandoPtIdx > 0 && pl.pts[editandoPtIdx]) {
        empilhaHistoricoPlano();
        pl.pts.splice(editandoPtIdx, 1);
        salvaPlanoLocal();
        atualizaEstimativaETimeline();
        desenhaCena();
      }
      document.getElementById('modal-ordem').classList.remove('ativo');
    };

    document.getElementById('btn-res-ajustar').onclick = () => {
      document.getElementById('modal-resultado').classList.remove('ativo');
      pararExecucao();
    };
    document.getElementById('btn-res-compartilhar').onclick = () => compartilhaPlanoAtual();

    // Interação no Canvas do Mapa
    const cv = document.getElementById('canvas-mapa');

    const aoIniciarToque = (ev) => {
      if (executando || !missaoAtual) return;
      ev.preventDefault();
      frameReplayAtual = null;
      const c = coordsDoEvento(ev);
      const mapa = SIM.parseMapa(missaoAtual.mapa);
      const pl = planoAtual[opSelecionado];
      if (!pl) return;

      if (modoApontarMapa && editandoPtIdx >= 0 && pl.pts[editandoPtIdx]?.ordem) {
        const ptRef = pl.pts[editandoPtIdx];
        const ang = Math.round(Math.atan2(c.y - ptRef.y, c.x - ptRef.x) * (180 / Math.PI));
        ptRef.ordem.ang = ang;
        if (modoApontarMapa === 'luz' || modoApontarMapa === 'impacto') {
          ptRef.ordem.x = c.x;
          ptRef.ordem.y = c.y;
        }
        modoApontarMapa = null;
        salvaPlanoLocal();
        atualizaEstimativaETimeline();
        desenhaCena();
        mostraToast('Alvo da ordem atualizado!');
        return;
      }

      // Verifica se tocou em cima de um ponto existente do operador selecionado
      for (let i = pl.pts.length - 1; i >= 0; i--) {
        if (pl.pts[i].x === c.x && pl.pts[i].y === c.y) {
          arrastando = true;
          arrastandoPtIdx = i;
          posDedo = c;
          return;
        }
      }

      // Verifica se tocou na posição inicial de outro operador para selecioná-lo
      for (let opIdx = 0; opIdx < planoAtual.length; opIdx++) {
        const p0 = planoAtual[opIdx].pts[0];
        if (p0 && p0.x === c.x && p0.y === c.y) {
          opSelecionado = opIdx;
          renderizaFaixaOperadores();
          atualizaEstimativaETimeline();
          desenhaCena();
          return;
        }
      }

      if (SIM.ehAndavel(mapa, c.x, c.y)) {
        arrastando = true;
        arrastandoPtIdx = -1;
        posDedo = c;
        atualizaLupa(c);
        desenhaCena();
      }
    };

    const aoMoverToque = (ev) => {
      if (!arrastando || executando || !missaoAtual) return;
      ev.preventDefault();
      const c = coordsDoEvento(ev);
      posDedo = c;
      const mapa = SIM.parseMapa(missaoAtual.mapa);
      const pl = planoAtual[opSelecionado];
      if (arrastandoPtIdx > 0 && pl && pl.pts[arrastandoPtIdx] && SIM.ehAndavel(mapa, c.x, c.y)) {
        pl.pts[arrastandoPtIdx].x = c.x;
        pl.pts[arrastandoPtIdx].y = c.y;
      }
      atualizaLupa(c);
      desenhaCena();
    };

    const aoFinalizarToque = (ev) => {
      if (!arrastando || executando || !missaoAtual) return;
      ev.preventDefault();
      const mapa = SIM.parseMapa(missaoAtual.mapa);
      const pl = planoAtual[opSelecionado];

      if (arrastandoPtIdx >= 0) {
        const p = pl.pts[arrastandoPtIdx];
        if (p && posDedo && p.x === posDedo.x && p.y === posDedo.y) {
          abreModalOrdem(arrastandoPtIdx);
        } else {
          salvaPlanoLocal();
          atualizaEstimativaETimeline();
        }
      } else if (posDedo && SIM.ehAndavel(mapa, posDedo.x, posDedo.y)) {
        if (pl.pts.length >= 12) {
          mostraToast('Limite de 12 pontos por operador atingido.');
        } else {
          empilhaHistoricoPlano();
          const ultRitmo = pl.pts[pl.pts.length - 1]?.ritmo || 'andar';
          pl.pts.push({ x: posDedo.x, y: posDedo.y, ritmo: ultRitmo, ordem: null });
          tocaSom('ui');
          salvaPlanoLocal();
          atualizaEstimativaETimeline();
        }
      }

      arrastando = false;
      arrastandoPtIdx = -1;
      posDedo = null;
      atualizaLupa({ x: 0, y: 0 });
      desenhaCena();
    };

    cv.addEventListener('mousedown', aoIniciarToque);
    window.addEventListener('mousemove', aoMoverToque);
    window.addEventListener('mouseup', aoFinalizarToque);
    cv.addEventListener('touchstart', aoIniciarToque, { passive: false });
    cv.addEventListener('touchmove', aoMoverToque, { passive: false });
    cv.addEventListener('touchend', aoFinalizarToque, { passive: false });

    cv.addEventListener('contextmenu', (ev) => {
      ev.preventDefault();
      if (executando || !missaoAtual) return;
      const c = coordsDoEvento(ev);
      const pl = planoAtual[opSelecionado];
      if (!pl) return;
      for (let i = pl.pts.length - 1; i >= 0; i--) {
        if (pl.pts[i].x === c.x && pl.pts[i].y === c.y) {
          abreModalOrdem(i);
          return;
        }
      }
    });

    // Atalhos de teclado desktop (1-8, Ctrl+Z, Enter, Escape)
    window.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.ativo').forEach(m => m.classList.remove('ativo'));
        modoApontarMapa = null;
        return;
      }
      const telaJogoAtiva = document.getElementById('tela-jogo').classList.contains('ativa');
      const algumModalAtivo = document.querySelector('.modal-backdrop.ativo');
      if (!telaJogoAtiva || algumModalAtivo) return;

      if (ev.key >= '1' && ev.key <= '8') {
        const idx = parseInt(ev.key, 10) - 1;
        if (missaoAtual && idx < missaoAtual.time.length) {
          opSelecionado = idx;
          renderizaFaixaOperadores();
          desenhaCena();
        }
      } else if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') {
        ev.preventDefault();
        document.getElementById('btn-desfazer').click();
      } else if (ev.key === 'Enter' && !executando) {
        ev.preventDefault();
        iniciaExecucao();
      }
    });
  }

  // Inicialização
  configuraEventos();
  renderizaMenu();
  tentaLerPlanoDaUrl();
})();
