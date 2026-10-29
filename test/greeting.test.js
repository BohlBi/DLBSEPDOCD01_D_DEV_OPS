import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getGreeting, formatVersion, formatDate } from '../src/greeting.js';

test('getGreeting liefert die Begrüßung passend zur Tageszeit', () => {
  assert.equal(getGreeting(3), 'Gute Nacht');
  assert.equal(getGreeting(5), 'Guten Morgen');
  assert.equal(getGreeting(11), 'Guten Morgen');
  assert.equal(getGreeting(12), 'Guten Tag');
  assert.equal(getGreeting(17), 'Guten Tag');
  assert.equal(getGreeting(18), 'Guten Abend');
  assert.equal(getGreeting(23), 'Guten Abend');
});

test('getGreeting lehnt ungültige Stunden ab', () => {
  for (const hour of [-1, 24, 1.5, '8', null]) {
    assert.throws(() => getGreeting(hour), RangeError);
  }
});

test('formatVersion zeigt Version, Umgebung und kurzen Commit', () => {
  assert.equal(
    formatVersion({ version: '1.5.0', environment: 'production', commit: 'a1b2c3d4e5f6' }),
    'Version 1.5.0 (production) · a1b2c3d',
  );
});

test('formatVersion kommt mit fehlenden Angaben zurecht', () => {
  assert.equal(formatVersion({}), 'Version unbekannt');
  assert.equal(formatVersion(undefined), 'Version unbekannt');
});

test('formatVersion blendet einen unbekannten Commit aus', () => {
  assert.equal(
    formatVersion({ version: 'dev', environment: 'local', commit: 'unknown' }),
    'Version dev (local)',
  );
});

test('formatDate gibt das Datum ausgeschrieben auf Deutsch aus', () => {
  assert.equal(formatDate(new Date(2026, 9, 29)), 'Donnerstag, 29. Oktober 2026');
});

test('formatDate lehnt ungültige Werte ab', () => {
  assert.throws(() => formatDate(new Date('kein Datum')), TypeError);
  assert.throws(() => formatDate('2026-10-29'), TypeError);
});
