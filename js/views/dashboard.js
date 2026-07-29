// js/views/dashboard.js
import { getCurrentWeek } from '../load-calculator.js';
import { SESSIONS, PROGRAM_WEEKS, getPhaseForWeek } from '../workout-data.js';

export function renderDashboard() {
  const startDate = localStorage.getItem('gzclp_program_start') || new Date().toISOString().slice(0,10);
  const week      = getCurrentWeek(startDate);
  const storedPRs = JSON.parse(localStorage.getItem('brute_prs') || '{}');
  const prBanca   = storedPRs['upperA:0'] ?? SESSIONS.upperA?.T1?.[0]?.prBase;
  const prDL      = storedPRs['lowerB:0'] ?? SESSIONS.lowerB?.T1?.[0]?.prBase;
  const prPull    = storedPRs['upperB:1'] ?? SESSIONS.upperB?.T1?.[1]?.prBase;

  return `
    <div style="padding:20px 14px;">
      <div class="hero" style="border-radius:14px;margin-bottom:16px;">
        <div class="hero-eyebrow">▸ PRIDE EDITION ▸</div>
        <h1>🏋️ S${week}/${PROGRAM_WEEKS}</h1>
        <p class="hero-sub">GZCL The Rippler — ${getPhaseForWeek(week).label}</p>
      </div>

      <div class="pr-strip" style="padding:0;margin-bottom:16px;">
        <div class="pr-card">
          <div class="pr-lbl">Press Banca</div>
          <div class="pr-val">${prBanca||'—'} ${prBanca?'kg':''}</div>
        </div>
        <div class="pr-card">
          <div class="pr-lbl">DL Conv.</div>
          <div class="pr-val">${prDL||'—'} ${prDL?'kg':''}</div>
        </div>
        <div class="pr-card">
          <div class="pr-lbl">Dominadas</div>
          <div class="pr-val">${prPull||'—'} ${prPull?'kg':''}</div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:10px;">
        ${Object.entries(SESSIONS).map(([key, s]) => `
          <a href="#/workout/${key}" style="display:block;padding:16px;background:var(--card);border:1px solid var(--${s.color});border-radius:14px;color:var(--${s.color});font-weight:800;text-decoration:none;text-align:center;">
            ${s.icon} ${s.dayLabel} — ${s.name}
          </a>
        `).join('')}
        <a href="#/progress" style="display:block;padding:16px;background:var(--card);border:1px solid var(--purple);border-radius:14px;color:var(--purple);font-weight:800;text-decoration:none;text-align:center;">
          📈 Ver Progresión
        </a>
      </div>

      ${gzclpInfo()}
    </div>
  `;
}

function gzclpInfo() {
  const PRO = [
    ['Olas que perdonan',        'La carga sube "dos pasos adelante, uno atrás" en bloques de 4 semanas. Un mal día no rompe el programa — la ola vuelve a pasar por ahí. Clave en déficit calórico.'],
    ['Intensidad sin desgaste',  'T1 trabaja al 80–95% del 2RM con pocas reps: máximo estímulo neural para retener fuerza mientras bajas de peso, con volumen controlado.'],
    ['Autoregulado',             'Las series AMRAP son "máximas reps con técnica sólida", no al fallo. Y los intentos de 1RM en semana 12 son OPT-IN — si el cuerpo no está, no se hacen.'],
    ['12 semanas de horizonte',  'Tres bloques + peaking dan margen para absorber una semana mala de sueño o estrés sin descarrilar el ciclo completo.'],
  ];
  const CON = [
    ['Requiere RMs decentes',    'Los porcentajes se calculan desde 2RM y 5RM. Con estimados (Epley) las primeras semanas calibran: si una ola se siente @6 o menos, el RM base está bajo.'],
    ['Singles demandantes',      'Desde la semana 8 aparecen singles al 92.5%+. Exigen técnica consolidada y buena entrada en calor — no saltarse la rampa de calentamiento.'],
    ['Testear 1RM en déficit',   'El test de semana 12 en déficit puede quedar corto vs tu fuerza real. Superar el 2RM base ya es progreso; el PR absoluto llegará en mantenimiento.'],
    ['No es hipertrofia pura',   'El volumen total es moderado. La retención muscular en déficit la sostienen los T2/T3 y los días de pierna — no los saltes.'],
  ];

  const row = ([title, text], color) => `
    <div style="display:flex;gap:10px;margin-bottom:10px">
      <div style="flex-shrink:0;margin-top:3px;width:6px;height:6px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color}"></div>
      <div>
        <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:2px">${title}</div>
        <div style="font-size:11px;color:var(--dim);line-height:1.55">${text}</div>
      </div>
    </div>`;

  return `
    <div style="margin-top:20px;border:1px solid var(--border);border-radius:14px;overflow:hidden">
      <button id="gzclp-toggle" style="width:100%;background:transparent;border:none;padding:14px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;text-align:left">
        <div>
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);font-family:'JetBrains Mono',monospace;margin-bottom:3px">MÉTODO</div>
          <div style="font-size:14px;font-weight:800;color:var(--cyan);font-family:'Orbitron',sans-serif;letter-spacing:.05em">¿Qué es The Rippler?</div>
        </div>
        <span id="gzclp-arrow" style="font-size:18px;color:var(--dim);transition:transform .2s">▸</span>
      </button>

      <div id="gzclp-body" style="display:none;padding:0 16px 20px">

        <!-- Origen -->
        <div style="background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.15);border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--cyan);margin-bottom:8px;font-family:'JetBrains Mono',monospace">ORIGEN</div>
          <div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:8px">
            <strong style="color:var(--cyan)">GZCL</strong> son las iniciales de <strong>Cody Lefever</strong> (usuario <em>u/gzcl</em> en Reddit), soldado del ejército estadounidense y powerlifter de élite.
            <strong style="color:var(--cyan)">The Rippler</strong> es su programa intermedio (de <em>GZCL Applications &amp; Adaptations</em>, 2016) — el paso siguiente cuando la progresión lineal de GZCLP se estanca.
          </div>
          <div style="font-size:12px;color:var(--text);line-height:1.6">
            El nombre viene del patrón de <em>ondas</em> ("ripples"): la intensidad del T1 sube y baja semana a semana en bloques de 4, acumulando cada vez más alto. T1 se calcula desde tu <strong>2RM</strong> y T2 desde tu <strong>5RM</strong>, en 12 semanas que culminan con 2RM pesados (sem 11) y test de 1RM opcional (sem 12).
          </div>
        </div>

        <!-- Estructura -->
        <div style="background:rgba(255,255,255,.03);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:16px">
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);margin-bottom:10px;font-family:'JetBrains Mono',monospace">ESTRUCTURA DE TIERS</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">
            <div style="background:rgba(255,0,128,.08);border:1px solid rgba(255,0,128,.2);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:16px;font-weight:900;color:var(--pink);font-family:'Orbitron',sans-serif">T1</div>
              <div style="font-size:10px;color:var(--dim);margin-top:4px;line-height:1.4">Olas de 2RM<br>1–5 reps<br>80–95% 2RM</div>
            </div>
            <div style="background:rgba(0,255,159,.08);border:1px solid rgba(0,255,159,.2);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:16px;font-weight:900;color:var(--mint);font-family:'Orbitron',sans-serif">T2</div>
              <div style="font-size:10px;color:var(--dim);margin-top:4px;line-height:1.4">Olas de 5RM<br>3–6 reps<br>68–85% 5RM</div>
            </div>
            <div style="background:rgba(255,230,0,.08);border:1px solid rgba(255,230,0,.2);border-radius:8px;padding:10px;text-align:center">
              <div style="font-size:16px;font-weight:900;color:var(--gold);font-family:'Orbitron',sans-serif">T3</div>
              <div style="font-size:10px;color:var(--dim);margin-top:4px;line-height:1.4">Aislamiento<br>reps altas<br>AMRAP flexible</div>
            </div>
          </div>
        </div>

        <!-- Ventajas -->
        <div style="margin-bottom:16px">
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--mint);margin-bottom:10px;font-family:'JetBrains Mono',monospace">✓ VENTAJAS</div>
          ${PRO.map(r => row(r,'var(--mint)')).join('')}
        </div>

        <!-- Desventajas -->
        <div style="margin-bottom:16px">
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--pink);margin-bottom:10px;font-family:'JetBrains Mono',monospace">✗ LIMITACIONES</div>
          ${CON.map(r => row(r,'var(--pink)')).join('')}
        </div>

        <!-- Modificaciones -->
        <div style="background:rgba(160,100,255,.06);border:1px solid rgba(160,100,255,.25);border-radius:10px;padding:14px;margin-bottom:4px">
          <div style="font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:var(--purple);margin-bottom:10px;font-family:'JetBrains Mono',monospace">⚡ MODIFICACIONES — RIPPLER × KINE</div>
          <div style="font-size:12px;color:var(--text);line-height:1.6;margin-bottom:12px">
            Esta versión adapta el Rippler clásico de 4 días a una <strong style="color:var(--purple)">semana de 6 días con el programa del kinesiólogo integrado</strong> (actualización julio 2026).
          </div>
          ${[
            ['6 T1 con ola Rippler',          'Banca, Peso Muerto, Sentadilla, Dominadas, Press Inclinado y Pendlay Row — los 6 llevan la misma ola de 12 semanas sobre 2RM, con PR opcional en la semana 12.'],
            ['Brazo y cuádriceps con carga propia', 'Upper C y Lower C no siguen ola — la app sugiere el peso y lo sube solo cuando llegas al techo del rango de reps en ambas series.'],
            ['Hombro terapéutico repartido',  'El bloque de hombro del kine vive en Upper A (empuje: chaos push up, serrato, dead bug) y Upper B (rehabilitación: escapular, isométrico, péndulo). Es parte estructural, no accesorio.'],
            ['Sin restricción EVA en cuádriceps', 'A diferencia del resto de pierna, Lower C no tiene tope de dolor EVA — es el único día donde se busca progresión agresiva de carga en pierna.'],
          ].map(r => row(r, 'var(--purple)')).join('')}
        </div>

        <div style="font-size:10px;color:rgba(255,255,255,.2);text-align:right;margin-top:12px;font-family:'JetBrains Mono',monospace">
          Fuente: u/gzcl · reddit.com/r/gzcl · Lefever (2016) <em>GZCL Applications &amp; Adaptations</em>
        </div>
      </div>
    </div>`;
}

export function bindDashboard() {
  // GZCLP info toggle
  document.getElementById('gzclp-toggle')?.addEventListener('click', () => {
    const body  = document.getElementById('gzclp-body');
    const arrow = document.getElementById('gzclp-arrow');
    const open  = body.style.display === 'none';
    body.style.display  = open ? 'block' : 'none';
    arrow.textContent   = open ? '▾' : '▸';
    arrow.style.transform = open ? 'rotate(0deg)' : '';
  });
}
