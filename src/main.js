import { getGreeting, formatVersion, formatDate } from './greeting.js';

document.getElementById('greeting').textContent =
  `${getGreeting(new Date().getHours())}, Welt!`;

document.getElementById('date').textContent = formatDate(new Date());

fetch('version.json', { cache: 'no-store' })
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}))
  .then((info) => {
    document.getElementById('version').textContent = formatVersion(info);
  });
