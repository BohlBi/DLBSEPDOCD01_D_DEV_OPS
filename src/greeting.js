/**
 * Liefert eine Begrüßung passend zur Tageszeit.
 * @param {number} hour Stunde des Tages (0–23)
 * @returns {string}
 */
export function getGreeting(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError(`Ungültige Stunde: ${hour}`);
  }
  if (hour < 5) return 'Gute Nacht';
  if (hour < 12) return 'Guten Morgen';
  if (hour < 18) return 'Guten Tag';
  return 'Guten Abend';
}

/**
 * Baut den Text für die Versionsanzeige aus /version.json.
 * @param {{version?: string, environment?: string, commit?: string}} info
 * @returns {string}
 */
export function formatVersion(info) {
  const version = info?.version || 'unbekannt';
  const env = info?.environment ? ` (${info.environment})` : '';
  const commit = info?.commit ? ` · ${info.commit.slice(0, 7)}` : '';
  return `Version ${version}${env}${commit}`;
}

/**
 * Formatiert ein Datum für die Anzeige, z. B. "Donnerstag, 29. Oktober 2026".
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('Ungültiges Datum');
  }
  return date.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Formatiert eine Uhrzeit als "HH:MM:SS".
 * @param {Date} date
 * @returns {string}
 */
export function formatTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new TypeError('Ungültiges Datum');
  }
  return [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}
