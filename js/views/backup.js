// js/views/backup.js — local-only JSON export/import (no cloud sync in brute)
import { exportAllData, importAllData } from '../db.js';

export function renderBackup() {
  return `
    <div style="background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px">
      <div style="font-size:13px;font-weight:700;color:var(--text);margin-bottom:4px">💾 Respaldo local</div>
      <div style="font-size:11px;color:var(--dim);margin-bottom:12px">Sin nube — descarga tu progreso o restáuralo desde un archivo.</div>
      <div style="display:flex;gap:10px;">
        <button id="export-data" style="flex:1;padding:10px;background:transparent;border:1px solid var(--cyan);border-radius:10px;color:var(--cyan);font-size:13px;font-weight:700;cursor:pointer">Exportar</button>
        <label style="flex:1;padding:10px;background:transparent;border:1px solid var(--purple);border-radius:10px;color:var(--purple);font-size:13px;font-weight:700;cursor:pointer;text-align:center">
          Importar
          <input id="import-data" type="file" accept="application/json" style="display:none">
        </label>
      </div>
      <div id="backup-status" style="font-size:11px;color:var(--dim);margin-top:8px;"></div>
    </div>`;
}

export function bindBackup() {
  document.getElementById('export-data')?.addEventListener('click', async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `brute-backup-${data.exportedAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('import-data')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const status = document.getElementById('backup-status');
    try {
      const data = JSON.parse(await file.text());
      await importAllData(data);
      status.textContent = `✓ Importado — ${data.sessions?.length || 0} sesiones restauradas.`;
      setTimeout(() => location.reload(), 1000);
    } catch (err) {
      status.textContent = err?.message === 'Invalid backup file'
        ? 'Error al importar: el archivo no es un respaldo válido de Brute.'
        : 'Error al importar: archivo inválido.';
    }
  });
}
