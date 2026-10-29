import { getGreeting, formatVersion, formatDate, formatTime } from './greeting.js';

document.getElementById('greeting').textContent =
  `${getGreeting(new Date().getHours())}, Welt!`;

document.getElementById('date').textContent = formatDate(new Date());

const clock = document.getElementById('clock');
const tick = () => { clock.textContent = formatTime(new Date()); };
tick();
setInterval(tick, 1000);

fetch('version.json', { cache: 'no-store' })
  .then((res) => (res.ok ? res.json() : {}))
  .catch(() => ({}))
  .then((info) => {
    document.getElementById('version').textContent = formatVersion(info);
  });
