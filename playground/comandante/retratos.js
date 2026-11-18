(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.RETRATOS = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PERSONAGENS = {
    // Operadores do seu time (1 a 8)
    lobo: {
      nome: 'Lobo',
      papel: 'Líder de Assalto · Fuzileiro',
      pele: '#d8a47f',
      cabelo: 'curto',
      corCabelo: '#221e1d',
      barba: 'curta',
      oculos: 'tatico',
      roupa: 'tatico',
      acessorio: 'capacete',
      cicatriz: false
    },
    onca: {
      nome: 'Onça',
      papel: 'Ponta / Batedora',
      pele: '#c48c64',
      cabelo: 'preso',
      corCabelo: '#1a1412',
      barba: null,
      oculos: null,
      roupa: 'tatico',
      acessorio: 'fone',
      cicatriz: false
    },
    coruja: {
      nome: 'Coruja',
      papel: 'Segurança e Flanco · Fuzileira',
      pele: '#e5b895',
      cabelo: 'preso',
      corCabelo: '#4a2c18',
      barba: null,
      oculos: 'tatico',
      roupa: 'tatico',
      acessorio: 'bone',
      cicatriz: false
    },
    urso: {
      nome: 'Urso',
      papel: 'Socorrista Tático · Médico',
      pele: '#b87d56',
      cabelo: 'raspado',
      corCabelo: '#1f1b18',
      barba: 'cheia',
      oculos: null,
      roupa: 'tatico',
      acessorio: 'capacete',
      cicatriz: true
    },
    touro: {
      nome: 'Touro',
      papel: 'Fogo de Supressão · Apoio',
      pele: '#9c6644',
      cabelo: 'raspado',
      corCabelo: '#181514',
      barba: 'bigode',
      oculos: 'escuro',
      roupa: 'tatico',
      acessorio: 'fone',
      cicatriz: false
    },
    gaviao: {
      nome: 'Gavião',
      papel: 'Precisão Longa · Atirador',
      pele: '#ddb08c',
      cabelo: 'curto',
      corCabelo: '#3b2e25',
      barba: null,
      oculos: 'tatico',
      roupa: 'tatico',
      acessorio: 'boina',
      cicatriz: false
    },
    tatu: {
      nome: 'Tatu',
      papel: 'Brechador Blindado · Escudo',
      pele: '#c68b63',
      cabelo: 'raspado',
      corCabelo: '#222',
      barba: 'curta',
      oculos: 'tatico',
      roupa: 'tatico',
      acessorio: 'capacete',
      cicatriz: true
    },
    raposa: {
      nome: 'Raposa',
      papel: 'Infiltração Noturna · Batedor',
      pele: '#e2b494',
      cabelo: 'curto',
      corCabelo: '#603218',
      barba: null,
      oculos: null,
      roupa: 'tatico',
      acessorio: 'balaclava',
      cicatriz: false
    },

    // Personagens da campanha
    rocha: {
      nome: 'Sgt. Rocha',
      papel: 'Instrutor-Chefe · Avaliador',
      pele: '#bf855e',
      cabelo: 'curto',
      corCabelo: '#3c3c3c',
      barba: 'bigode',
      oculos: null,
      roupa: 'tatico',
      acessorio: 'boina',
      cicatriz: true
    },
    instrutor: {
      nome: 'Instrutor OpFor',
      papel: 'Colete Vermelho · Treino',
      pele: '#d09b74',
      cabelo: 'curto',
      corCabelo: '#2a2421',
      barba: null,
      oculos: 'tatico',
      roupa: 'camiseta',
      acessorio: 'bone',
      cicatriz: false
    },
    almeida: {
      nome: 'Sr. Almeida',
      papel: 'Gerente do Banco · RESGATAR VIVO',
      pele: '#e6be9e',
      cabelo: 'curto',
      corCabelo: '#9aa0a6',
      barba: null,
      oculos: 'grau',
      roupa: 'terno',
      acessorio: null,
      cicatriz: false
    },
    corvo: {
      nome: '"Corvo"',
      papel: 'Financeiro da Quadrilha · CAPTURAR VIVO',
      pele: '#c99470',
      cabelo: 'curto',
      corCabelo: '#1c1917',
      barba: 'cheia',
      oculos: null,
      roupa: 'camiseta',
      acessorio: 'bone',
      cicatriz: true
    },
    helena: {
      nome: 'Dra. Helena',
      papel: 'Contadora e Testemunha · PROTEGER',
      pele: '#ecc6a9',
      cabelo: 'preso',
      corCabelo: '#3d2314',
      barba: null,
      oculos: 'grau',
      roupa: 'jaleco',
      acessorio: null,
      cicatriz: false
    },
    coronel: {
      nome: '"Coronel"',
      papel: 'Ex-Militar Chefe · CAPTURAR VIVO',
      pele: '#b87e58',
      cabelo: 'raspado',
      corCabelo: '#555555',
      barba: 'curta',
      oculos: 'escuro',
      roupa: 'tatico',
      acessorio: 'boina',
      cicatriz: true
    },
    hostil: {
      nome: 'Mercenário',
      papel: 'Guarda Armado · HOSTIL',
      pele: '#c48f6b',
      cabelo: 'raspado',
      corCabelo: '#1a1a1a',
      barba: 'curta',
      oculos: null,
      roupa: 'camiseta',
      acessorio: 'balaclava',
      cicatriz: false
    },
    capanga: {
      nome: 'Tenente da Ala',
      papel: 'Informante · CAPTURAR VIVO',
      pele: '#d7a17c',
      cabelo: 'curto',
      corCabelo: '#2b2118',
      barba: 'bigode',
      oculos: 'escuro',
      roupa: 'terno',
      acessorio: null,
      cicatriz: true
    }
  };

  const OPERADORES = [
    { num: 1, id: 'lobo', nome: 'Lobo', classe: 'fuzileiro' },
    { num: 2, id: 'onca', nome: 'Onça', classe: 'batedor' },
    { num: 3, id: 'coruja', nome: 'Coruja', classe: 'fuzileiro' },
    { num: 4, id: 'urso', nome: 'Urso', classe: 'medico' },
    { num: 5, id: 'touro', nome: 'Touro', classe: 'apoio' },
    { num: 6, id: 'gaviao', nome: 'Gavião', classe: 'atirador' },
    { num: 7, id: 'tatu', nome: 'Tatu', classe: 'escudo' },
    { num: 8, id: 'raposa', nome: 'Raposa', classe: 'batedor' }
  ];

  function desenha(ctx, cfgInput, tamanho) {
    const cfg = typeof cfgInput === 'string'
      ? (PERSONAGENS[cfgInput] || PERSONAGENS.lobo)
      : (cfgInput || PERSONAGENS.lobo);
    const S = tamanho || 64;
    ctx.save();
    ctx.scale(S / 64, S / 64);

    // Fundo tático escuro
    ctx.fillStyle = '#14191f';
    ctx.fillRect(0, 0, 64, 64);

    // Grade sutil no fundo
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let i = 16; i < 64; i += 16) {
      ctx.beginPath();
      ctx.moveTo(i, 0); ctx.lineTo(i, 64);
      ctx.moveTo(0, i); ctx.lineTo(64, i);
      ctx.stroke();
    }

    // Ombros / Roupa
    const roupa = cfg.roupa || 'tatico';
    if (roupa === 'terno') {
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.moveTo(8, 64);
      ctx.quadraticCurveTo(10, 44, 24, 42);
      ctx.lineTo(40, 42);
      ctx.quadraticCurveTo(54, 44, 56, 64);
      ctx.closePath();
      ctx.fill();
      // Camisa branca e gravata vermelha
      ctx.fillStyle = '#f3f4f6';
      ctx.beginPath();
      ctx.moveTo(26, 42); ctx.lineTo(38, 42); ctx.lineTo(32, 56);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(30.5, 45, 3, 15);
    } else if (roupa === 'jaleco') {
      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(8, 64);
      ctx.quadraticCurveTo(10, 44, 24, 42);
      ctx.lineTo(40, 42);
      ctx.quadraticCurveTo(54, 44, 56, 64);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(27, 42); ctx.lineTo(37, 42); ctx.lineTo(32, 58);
      ctx.closePath();
      ctx.fill();
    } else if (roupa === 'camiseta') {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(8, 64);
      ctx.quadraticCurveTo(10, 44, 24, 42);
      ctx.lineTo(40, 42);
      ctx.quadraticCurveTo(54, 44, 56, 64);
      ctx.closePath();
      ctx.fill();
      // Alças de colete
      ctx.fillStyle = '#1f2421';
      ctx.fillRect(18, 44, 6, 20);
      ctx.fillRect(40, 44, 6, 20);
    } else {
      // Tático
      ctx.fillStyle = '#2b372c';
      ctx.beginPath();
      ctx.moveTo(6, 64);
      ctx.quadraticCurveTo(8, 43, 23, 41);
      ctx.lineTo(41, 41);
      ctx.quadraticCurveTo(56, 43, 58, 64);
      ctx.closePath();
      ctx.fill();
      // Placa balística
      ctx.fillStyle = '#1e2620';
      ctx.fillRect(19, 46, 26, 18);
      ctx.strokeStyle = '#475949';
      ctx.lineWidth = 1;
      ctx.strokeRect(19, 46, 26, 18);
    }

    // Pescoço
    ctx.fillStyle = cfg.pele || '#d8a47f';
    ctx.fillRect(26, 35, 12, 10);

    // Cabeça
    ctx.fillStyle = cfg.pele || '#d8a47f';
    ctx.beginPath();
    ctx.arc(32, 26, 13, 0, Math.PI * 2);
    ctx.fill();

    // Orelhas
    ctx.beginPath();
    ctx.arc(18.5, 27, 2.5, 0, Math.PI * 2);
    ctx.arc(45.5, 27, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Cicatriz
    if (cfg.cicatriz) {
      ctx.strokeStyle = 'rgba(130, 40, 40, 0.75)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(36, 21);
      ctx.lineTo(40, 31);
      ctx.stroke();
    }

    // Cabelo (se não estiver coberto por balaclava)
    if (cfg.acessorio !== 'balaclava') {
      ctx.fillStyle = cfg.corCabelo || '#221e1d';
      if (cfg.cabelo === 'curto') {
        ctx.beginPath();
        ctx.arc(32, 23, 13.5, Math.PI, Math.PI * 2);
        ctx.fill();
      } else if (cfg.cabelo === 'preso') {
        ctx.beginPath();
        ctx.arc(32, 23, 13.5, Math.PI * 0.95, Math.PI * 2.05);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(32, 11, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (cfg.cabelo === 'raspado') {
        ctx.fillStyle = 'rgba(30,30,30,0.28)';
        ctx.beginPath();
        ctx.arc(32, 23, 13.2, Math.PI, Math.PI * 2);
        ctx.fill();
      }
    }

    // Barba
    if (cfg.barba && cfg.acessorio !== 'balaclava') {
      ctx.fillStyle = cfg.corCabelo || '#221e1d';
      if (cfg.barba === 'bigode') {
        ctx.fillRect(27, 31.5, 10, 2.5);
      } else if (cfg.barba === 'curta') {
        ctx.beginPath();
        ctx.arc(32, 27, 13, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.fill();
        ctx.fillStyle = cfg.pele || '#d8a47f';
        ctx.fillRect(29, 32, 6, 2);
      } else if (cfg.barba === 'cheia') {
        ctx.beginPath();
        ctx.arc(32, 28, 13.5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.fill();
      }
    }

    // Balaclava
    if (cfg.acessorio === 'balaclava') {
      ctx.fillStyle = '#1c2126';
      ctx.beginPath();
      ctx.arc(32, 26, 13.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(25, 34, 14, 9);
      // Abertura dos olhos
      ctx.fillStyle = cfg.pele || '#d8a47f';
      ctx.fillRect(22, 22, 20, 6);
    }

    // Olhos e sobrancelhas
    ctx.fillStyle = '#111';
    ctx.fillRect(25.5, 24.5, 2.5, 2.5);
    ctx.fillRect(36, 24.5, 2.5, 2.5);
    ctx.fillStyle = cfg.corCabelo || '#222';
    ctx.fillRect(24.5, 22.5, 4.5, 1.3);
    ctx.fillRect(35, 22.5, 4.5, 1.3);

    // Boca (se sem balaclava e sem barba cheia)
    if (cfg.acessorio !== 'balaclava' && cfg.barba !== 'cheia') {
      ctx.fillStyle = '#6e3b2b';
      ctx.fillRect(29.5, 34, 5, 1.4);
    }

    // Óculos
    if (cfg.oculos === 'tatico') {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.55)';
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1.5;
      ctx.fillRect(22, 22.5, 8.5, 5.5);
      ctx.strokeRect(22, 22.5, 8.5, 5.5);
      ctx.fillRect(33.5, 22.5, 8.5, 5.5);
      ctx.strokeRect(33.5, 22.5, 8.5, 5.5);
      ctx.beginPath();
      ctx.moveTo(30.5, 24.5); ctx.lineTo(33.5, 24.5);
      ctx.stroke();
    } else if (cfg.oculos === 'escuro') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(22, 22.5, 8.5, 5.5);
      ctx.fillRect(33.5, 22.5, 8.5, 5.5);
      ctx.fillRect(30.5, 23.5, 3, 1.5);
    } else if (cfg.oculos === 'grau') {
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1.3;
      ctx.strokeRect(23, 23, 7.5, 5);
      ctx.strokeRect(33.5, 23, 7.5, 5);
      ctx.beginPath();
      ctx.moveTo(30.5, 25); ctx.lineTo(33.5, 25);
      ctx.stroke();
    }

    // Acessórios de cabeça
    if (cfg.acessorio === 'capacete') {
      ctx.fillStyle = '#334139';
      ctx.beginPath();
      ctx.arc(32, 22, 14.8, Math.PI * 0.98, Math.PI * 2.02);
      ctx.fill();
      ctx.fillStyle = '#1f2923';
      ctx.fillRect(17, 19, 30, 3.5);
      // Trilho NVG
      ctx.fillStyle = '#111';
      ctx.fillRect(29, 13, 6, 5);
    } else if (cfg.acessorio === 'boina') {
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(33, 15, 15, 6, -0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.fillRect(19, 18, 26, 2.5);
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(25, 15, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.acessorio === 'bone') {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(32, 21, 13.8, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(17, 19, 32, 3);
    } else if (cfg.acessorio === 'fone') {
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(32, 25, 15, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
      ctx.fillStyle = '#374151';
      ctx.fillRect(15.5, 22, 4, 9);
      ctx.fillRect(44.5, 22, 4, 9);
    }

    ctx.restore();
  }

  return {
    PERSONAGENS,
    OPERADORES,
    desenha
  };
});
