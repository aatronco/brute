// js/load-calculator.js
import { SESSIONS, PROGRAM_WEEKS } from './workout-data.js';

export function getT1Sets(session, week, t1Index = 0) {
  const s = SESSIONS[session];
  if (!s || !Array.isArray(s.T1) || !s.T1[t1Index]?.byWeek) return [];
  const weekData = s.T1[t1Index].byWeek[week];
  if (!weekData) return [];
  return [...(weekData.warmup || []), ...(weekData.work || [])];
}

export function getProgramStart() {
  const stored = localStorage.getItem('brute_program_start');
  if (stored) return stored;
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem('brute_program_start', today);
  return today;
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
