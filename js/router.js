// js/router.js
import { renderDashboard, bindDashboard } from './views/dashboard.js';
import { renderWorkout, bindWorkout }     from './views/workout.js';
import { renderProgress, bindProgress }   from './views/progress.js';

function main() { return document.getElementById('main'); }

async function route() {
  const hash  = location.hash || '#/dashboard';
  const parts = hash.replace('#/', '').split('/');
  const root  = parts[0];

  if (root === 'workout' && parts[1]) {
    main().innerHTML = renderWorkout(parts[1]);
    bindWorkout(parts[1]);
    return;
  }

  if (root === 'progress') {
    main().innerHTML = renderProgress();
    bindProgress();
    return;
  }

  // Default — dashboard
  main().innerHTML = renderDashboard();
  bindDashboard();
}

export function initRouter() {
  window.addEventListener('hashchange', route);
  route();
}
