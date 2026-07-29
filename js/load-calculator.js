// js/load-calculator.js
import { SESSIONS, PROGRAM_WEEKS } from './workout-data.js';

export function getT1Sets(session, week) {
  const s = SESSIONS[session];
  if (!s || !s.T1) return [];

  // T1 is now an array of objects
  const t1Array = Array.isArray(s.T1) ? s.T1 : [s.T1];

  // Collect all sets from all T1 lifts for the given week
  const allSets = [];
  for (const t1 of t1Array) {
    if (t1.byWeek && t1.byWeek[week]) {
      const weekData = t1.byWeek[week];
      allSets.push(...(weekData.warmup || []), ...(weekData.work || []));
    }
  }
  return allSets;
}

export function getCurrentWeek(programStartDate, weekOverride) {
  if (weekOverride != null) {
    return Math.min(Math.max(parseInt(weekOverride, 10), 1), PROGRAM_WEEKS);
  }
  const start = new Date(programStartDate);
  const now   = new Date();
  const days  = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const week  = Math.floor(days / 7) + 1;
  return Math.min(Math.max(week, 1), PROGRAM_WEEKS);
}
