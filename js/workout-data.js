// js/workout-data.js
// GZCL: The Rippler — programa de 12 semanas, 5 días. Static, never modified by the app.
// T1: olas de % sobre 2RM · T2: olas de % sobre 5RM (Cody Lefever, GZCL Applications & Adaptations).
// Días de pierna (S2/S4) y bloques kine: receta del kinesiólogo (julio 2026), por RPE — sin olas.
//
// Bases estimadas (Epley, julio 2026, en déficit — PC 105 kg):
//   Press Banca   2RM 110 kg   (de 3×5 @ 100)      → e1RM ~117
//   Peso Muerto   2RM 177.5 kg (de 4 @ 170)         → e1RM ~190
//   Dominadas     2RM 115 kg TOTAL (de 5 @ PC 105)  → e1RM total ~122
//   Press Militar 5RM 42.5 kg  (de 8 @ 40)
//   Remo Pendlay  5RM 65 kg    (de 5×5 @ 60)

export const PROGRAM_WEEKS = 12;

export const PHASES = [
  { weeks: [1, 2, 3, 4], name: 'bloque1', label: 'Bloque 1 — Base',       color: 'pink'   },
  { weeks: [5, 6, 7, 8], name: 'bloque2', label: 'Bloque 2 — Intensidad', color: 'orange' },
  { weeks: [9, 10],      name: 'bloque3', label: 'Bloque 3 — Máximos',    color: 'gold'   },
  { weeks: [11, 12],     name: 'peaking', label: 'Peaking ★',             color: 'purple' },
];

export function getPhaseForWeek(week) {
  return PHASES.find(p => p.weeks.includes(week)) ?? PHASES[0];
}

// ── Recetas Rippler ─────────────────────────────────────────────────────────
// T1: % del 2RM. amrap = serie extra a máximas reps con técnica sólida (no fallo).
const T1_WAVE = [
  { week: 1,  pct: 0.80,  sets: 3, reps: 5 },
  { week: 2,  pct: 0.85,  sets: 3, reps: 3, amrap: true },
  { week: 3,  pct: 0.825, sets: 3, reps: 4 },
  { week: 4,  pct: 0.875, sets: 5, reps: 2 },
  { week: 5,  pct: 0.85,  sets: 2, reps: 4, amrap: true },
  { week: 6,  pct: 0.90,  sets: 4, reps: 2 },
  { week: 7,  pct: 0.875, sets: 3, reps: 3 },
  { week: 8,  pct: 0.925, sets: 8, reps: 1, amrap: true },
  { week: 9,  pct: 0.90,  sets: 2, reps: 2, amrap: true },
  { week: 10, pct: 0.95,  sets: 1, reps: 1 },
  { week: 11, pct: 0.85,  sets: 3, reps: 2, amrap: true },
  { week: 12, pct: 0.95,  sets: 1, reps: 1 },
];

// T2: % del 5RM en 3 olas de 3 semanas + semana 10 pesada. Se elimina en semanas 11-12.
const T2_WAVE = [
  { week: 1,  pct: 0.68, scheme: '5×6' },
  { week: 2,  pct: 0.72, scheme: '5×5' },
  { week: 3,  pct: 0.76, scheme: '4×4 + 1×4+' },
  { week: 4,  pct: 0.70, scheme: '4×6' },
  { week: 5,  pct: 0.74, scheme: '4×5' },
  { week: 6,  pct: 0.78, scheme: '3×4 + 1×4+' },
  { week: 7,  pct: 0.72, scheme: '3×6' },
  { week: 8,  pct: 0.76, scheme: '3×5' },
  { week: 9,  pct: 0.80, scheme: '2×4 + 1×4+' },
  { week: 10, pct: 0.85, scheme: '4×3 + 1×3+' },
];

const r1  = kg => Math.round(kg);
const r25 = kg => Math.round(kg / 2.5) * 2.5;

// Genera byWeek para un T1 con barra: calentamiento en rampa + trabajo según la ola.
function barbellByWeek(base2RM, { warmupReps = [8, 5, 2], prAttempts = [] } = {}) {
  const byWeek = {};
  for (const w of T1_WAVE) {
    const kg = r1(base2RM * w.pct);
    const warmup = [0.5, 0.7, 0.85].map((pct, i) => ({
      label: `C${i + 1}`, reps: warmupReps[i], kg: r25(kg * pct),
      rest: i === 2 ? 120 : 90, type: 'warmup',
    }));
    const work = [{
      label: `${w.sets}×${w.reps}`, reps: w.reps, kg,
      rest: w.pct >= 0.90 ? 240 : 180, type: 'work',
      note: `${Math.round(w.pct * 1000) / 10}% del 2RM`,
    }];
    if (w.amrap) work.push({
      label: 'AMRAP', reps: `${w.reps}+`, kg, rest: 0, type: 'work',
      note: 'Serie extra a máximas reps con técnica sólida — no al fallo',
    });
    byWeek[w.week] = { warmup, work };
  }
  byWeek[12].work.push(...prAttempts); // Peaking: intentos 1RM OPT-IN tras el single al 95%
  return byWeek;
}

// Dominadas: el % se aplica al peso TOTAL (cuerpo + lastre). Bajo el PC → asistida.
const PULLUP = { total2RM: 115, bodyweight: 105 };

function pullupLoad(pct) {
  const diff = PULLUP.total2RM * pct - PULLUP.bodyweight;
  if (Math.abs(diff) < 2.5) return 'Peso corporal';
  return diff < 0 ? `Asistida −${Math.abs(r25(diff))} kg` : `Lastre +${r25(diff)} kg`;
}

function pullupByWeek() {
  const byWeek = {};
  for (const w of T1_WAVE) {
    byWeek[w.week] = {
      warmup: [
        { label: 'Escapulares', reps: 10, kg: 'Peso corporal', rest: 30, type: 'warmup' },
      ],
      work: (() => {
        const work = [{
          label: `${w.sets}×${w.reps}`, reps: w.reps, kg: pullupLoad(w.pct),
          rest: w.pct >= 0.90 ? 240 : 180, type: 'work',
          note: `${Math.round(w.pct * 1000) / 10}% del 2RM total (${PULLUP.total2RM} kg)`,
        }];
        if (w.amrap) work.push({
          label: 'AMRAP', reps: `${w.reps}+`, kg: pullupLoad(w.pct), rest: 0, type: 'work',
          note: 'Serie extra a máximas reps con técnica sólida — no al fallo',
        });
        return work;
      })(),
    };
  }
  byWeek[12].work.push({
    label: 'PR 1RM ★', reps: 1, kg: 'Lastre +15 kg', rest: 0, type: 'pr',
    note: 'OPT-IN — solo si el single anterior subió sólido',
  });
  return byWeek;
}

// T2 con ola Rippler: {semana: {setsReps, kg}}
function t2ByWeek(base5RM) {
  const byWeek = {};
  for (const w of T2_WAVE) {
    byWeek[w.week] = { setsReps: w.scheme, kg: r1(base5RM * w.pct) };
  }
  return byWeek;
}

// ── Upper A — Press Banca + Pendlay Row ─────────────────────────────────────
export const UPPER_A = {
  name: 'Upper A — Empuje/Tirón horizontal',
  color: 'pink',
  icon: '💪',
  dayLabel: 'Día 1',

  T1: [
    {
      exercise: 'Press Banca',
      base2RM: 110,
      prBase: 117,
      byWeek: barbellByWeek(110, {
        warmupReps: [8, 5, 2],
        prAttempts: [
          { label: 'Intento 1RM', reps: 1, kg: 112, rest: 300, type: 'pr', note: 'OPT-IN — solo si el single al 95% subió rápido y limpio' },
          { label: 'PR ★',        reps: 1, kg: 117, rest: 0,   type: 'pr', note: 'e1RM actual — en déficit, superar 110×2 ya es progreso' },
        ],
      }),
    },
    {
      exercise: 'Pendlay Row',
      base2RM: 70,
      prBase: 75,
      note: 'Base 2RM estimada por Epley desde 5RM 65 kg. Espalda plana, desde el suelo.',
      byWeek: barbellByWeek(70, {
        warmupReps: [8, 5, 2],
        prAttempts: [
          { label: 'Intento 1RM', reps: 1, kg: 72.5, rest: 300, type: 'pr', note: 'OPT-IN — técnica intacta, espalda plana todo el recorrido' },
          { label: 'PR ★',        reps: 1, kg: 75,   rest: 0,   type: 'pr', note: 'e1RM actual' },
        ],
      }),
    },
  ],

  T2: [
    {
      name: 'Press militar barra',
      byWeek: t2ByWeek(42.5), rest: 120,
      note: 'Ola Rippler sobre 5RM 42.5 kg. Codos adelante, agarre más ancho.',
      removeWeeks: [11, 12],
    },
  ],

  T3: [
    { name: 'Face pull polea', setsReps: '3×15', rest: 60, note: 'OBLIGATORIO — salud escapular.', obligatorio: true },
  ],

  kineBlock: {
    label: '— Hombro Kine · Empuje —',
    note: 'PARTE ESTRUCTURAL DEL PROGRAMA — actualización kine julio 2026',
    exercises: [
      { name: 'Chaos push up (pelota)',   load: 'Bandas gruesas',       setsReps: '2×máx',    rest: 30 },
      { name: 'Press serrato unilateral', load: 'Barra o mancuerna @8', setsReps: '2×20',     rest: 30 },
      { name: 'Dead bug con disco',       load: '25 kg',                setsReps: '2×10/lado', rest: 30 },
    ],
  },
};

// ── Lower A — Sentadilla ─────────────────────────────────────────────────────
export const LOWER_A = {
  name: 'Lower A — Sentadilla',
  color: 'cyan',
  icon: '🏔️',
  dayLabel: 'Día 2',

  T1: [
    {
      exercise: 'Sentadilla',
      base2RM: 117.5,
      prBase: 125,
      note: 'Base 2RM por Epley desde 100 kg × 8 (e1RM 126.7 → e2RM 118.75, redondeado a 117.5).',
      byWeek: barbellByWeek(117.5, {
        warmupReps: [8, 5, 2],
        prAttempts: [
          { label: 'Intento 1RM', reps: 1, kg: 120, rest: 300, type: 'pr', note: 'OPT-IN — rodilla y espalda baja OK antes de intentar.' },
          { label: 'PR ★',        reps: 1, kg: 125, rest: 0,   type: 'pr', note: 'e1RM actual' },
        ],
      }),
    },
  ],

  T2: [],
  T3: [],

  kineBlock: {
    label: '— Pierna Kine —',
    note: 'Cuádriceps libre de restricción EVA — este bloque es mantenimiento, no el estímulo principal del día.',
    exercises: [
      { name: 'Extensión de cuádriceps', load: '@8', setsReps: '2×15', rest: 30 },
    ],
  },
};

// ── Upper B — Press Inclinado + Dominadas ───────────────────────────────────
export const UPPER_B = {
  name: 'Upper B — Empuje inclinado/Tirón vertical',
  color: 'orange',
  icon: '💪',
  dayLabel: 'Día 3',

  T1: [
    {
      exercise: 'Press Inclinado',
      base2RM: 75,
      prBase: 80,
      note: 'Base 2RM por Epley desde 60 kg × 10 (e1RM 80 → e2RM 75).',
      byWeek: barbellByWeek(75, {
        warmupReps: [8, 5, 2],
        prAttempts: [
          { label: 'Intento 1RM', reps: 1, kg: 77.5, rest: 300, type: 'pr', note: 'OPT-IN' },
          { label: 'PR ★',        reps: 1, kg: 80,   rest: 0,   type: 'pr', note: 'e1RM actual' },
        ],
      }),
    },
    {
      exercise: 'Dominadas (ola 2RM)',
      base2RMTotal: PULLUP.total2RM,
      bodyweight: PULLUP.bodyweight,
      prBase: 122,
      note: `Ola sobre 2RM total (cuerpo + lastre) = ${PULLUP.total2RM} kg con PC ${PULLUP.bodyweight} kg. ` +
            'Al bajar de peso en el déficit, reduce la asistencia ~2.5 kg por cada 2 kg de PC perdidos.',
      byWeek: pullupByWeek(),
    },
  ],

  T2: [
    { name: 'Remo mancuerna unilateral', setsReps: '3×8-12/lado', rest: 90, removeWeeks: [11, 12] },
  ],
  T3: [],

  kineBlock: {
    label: '— Hombro Kine · Rehabilitación —',
    note: 'PARTE ESTRUCTURAL DEL PROGRAMA — actualización kine julio 2026',
    exercises: [
      { name: 'Retracción y depresión escapular colgado en barra', load: 'Peso corporal',    setsReps: '2×10',      rest: 30 },
      { name: 'Isométrico de hombro acostado o en pared',          load: '5 kg (progresar)', setsReps: '3×12',      rest: 60 },
      { name: 'Nadador con bandas',                                load: 'Banda tensa',      setsReps: '2×12/brazo', rest: 60 },
      { name: 'Péndulo de Codman',                                 load: 'Sin carga',        setsReps: '30-60"' },
    ],
  },
};

// ── Lower B — Peso Muerto ────────────────────────────────────────────────────
export const LOWER_B = {
  name: 'Lower B — Cadena Posterior',
  color: 'gold',
  icon: '⛓️',
  dayLabel: 'Día 4',

  T1: [
    {
      exercise: 'Peso Muerto Convencional',
      base2RM: 177.5,
      prBase: 190,
      technicalCues: [
        'Pies a ancho de cadera, barra sobre mediopiés',
        'Caderas atrás, espalda neutra',
        'Empuja el suelo — no jales la barra',
        'Si la espalda baja se redondea, para la serie',
      ],
      byWeek: barbellByWeek(177.5, {
        warmupReps: [5, 3, 2],
        prAttempts: [
          { label: 'Intento 1RM', reps: 1, kg: 182, rest: 300, type: 'pr', note: 'OPT-IN — evalúa rodilla antes.' },
          { label: 'PR ★',        reps: 1, kg: 190, rest: 0,   type: 'pr', note: 'e1RM actual' },
        ],
      }),
    },
  ],

  T2: [
    { name: 'Leg curl acostado', setsReps: '4×8-12', rest: 90, removeWeeks: [11, 12] },
  ],
  T3: [],

  kineBlock: {
    label: '— Pierna Kine · Bloque E —',
    note: 'Tercer estímulo de pierna de la semana — cargas moderadas.',
    exercises: [
      { name: 'Single leg RDL', load: '45 kg totales', setsReps: '2×12/pierna', rest: 30 },
    ],
  },
};

// ── Upper C — Brazo estético ─────────────────────────────────────────────────
export const UPPER_C = {
  name: 'Upper C — Bíceps + Tríceps',
  color: 'mint',
  icon: '💪',
  dayLabel: 'Día 5',

  T1: [],
  T2: [],
  T3: [],

  accessories: [
    { name: 'Curl bíceps mancuerna 45°', sets: 3, repRange: [8, 12],  startKg: 14, incrementKg: 2,   rest: 75, note: 'Supinación completa.' },
    { name: 'Curl martillo',             sets: 3, repRange: [8, 12],  startKg: 14, incrementKg: 2,   rest: 75, note: 'Braquial y braquiorradial.' },
    { name: 'Curl concentrado',          sets: 3, repRange: [10, 15], startKg: 10, incrementKg: 2,   rest: 60, note: 'Contracción peak.' },
    { name: 'Tríceps francés polea',     sets: 3, repRange: [10, 15], startKg: 20, incrementKg: 2.5, rest: 75 },
    { name: 'Tríceps pushdown',          sets: 3, repRange: [10, 15], startKg: 25, incrementKg: 2.5, rest: 75 },
    { name: 'Fondos en paralelas',       sets: 3, repRange: [8, 12],  startKg: 0,  incrementKg: 5,   rest: 90, note: 'Peso corporal primero, luego lastre.' },
  ],
};

// ── Lower C — Cuádriceps libre ───────────────────────────────────────────────
export const LOWER_C = {
  name: 'Lower C — Cuádriceps',
  color: 'purple',
  icon: '🦵',
  dayLabel: 'Día 6',

  T1: [],
  T2: [],
  T3: [],

  accessories: [
    { name: 'Prensa',                  sets: 3, repRange: [8, 12],  startKg: 180, incrementKg: 10,  rest: 90 },
    { name: 'Squat low back bar',      sets: 3, repRange: [6, 10],  startKg: 100, incrementKg: 2.5,  rest: 120, note: 'Ya libre de tope EVA — puede correr como estímulo principal de cuádriceps.' },
    { name: 'Extensión de cuádriceps', sets: 3, repRange: [12, 15], startKg: 40,  incrementKg: 2.5,  rest: 60 },
    { name: 'Pistol SQ excéntrico',    sets: 2, repRange: [6, 10],  startKg: 0,   incrementKg: 2.5,  rest: 60, note: 'Añadir mancuerna cuando el corporal se sienta @7.' },
  ],
};

export const SESSIONS = { upperA: UPPER_A, lowerA: LOWER_A, upperB: UPPER_B, lowerB: LOWER_B, upperC: UPPER_C, lowerC: LOWER_C };
